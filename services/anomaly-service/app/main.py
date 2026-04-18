import os
import json
import statistics
from datetime import datetime, timezone, date
from typing import Optional
import psycopg2
import psycopg2.extras
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://fairgig:fairgig@localhost:5432/fairgig")
MIN_HOURLY_RATE = float(os.getenv("MIN_HOURLY_RATE_PKR", "150"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip() or "llama-3.1-8b-instant"

app = FastAPI(title="FairGig Anomaly Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EarningItem(BaseModel):
    id: str
    date: str
    platform: str
    hours: float
    gross: float
    deductions: float
    net: float
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None


class AnomalyContext(BaseModel):
    city: str = "Lahore"
    category: str = "ride_hailing"


class DetectRequest(BaseModel):
    worker_id: str
    earnings: list[EarningItem] = Field(default_factory=list)
    context: AnomalyContext = Field(default_factory=AnomalyContext)


class AnomalyResult(BaseModel):
    shift_id: str
    date: str
    type: str
    severity: str
    z_score: Optional[float] = None
    expected_value: Optional[float] = None
    actual_value: Optional[float] = None
    plain_explanation: str


def _get_conn():
    return psycopg2.connect(DATABASE_URL)


def _get_city_median(city: str, category: str, platform_name: str) -> Optional[float]:
    """Query commission_snapshots for median rate — never hardcoded."""
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """
                    SELECT AVG(cs.reported_rate_pct) AS median_rate
                    FROM commission_snapshots cs
                    JOIN platforms p ON p.id = cs.platform_id
                    WHERE cs.city = %s
                      AND cs.category = %s
                      AND p.name = %s
                      AND cs.snapshot_date >= NOW() - INTERVAL '6 months'
                    """,
                    (city, category, platform_name),
                )
                row = cur.fetchone()
                if row and row["median_rate"] is not None:
                    return float(row["median_rate"])
                # Fallback: any city median for that category
                cur.execute(
                    """
                    SELECT AVG(cs.reported_rate_pct) AS median_rate
                    FROM commission_snapshots cs
                    WHERE cs.city = %s AND cs.category = %s
                      AND cs.snapshot_date >= NOW() - INTERVAL '6 months'
                    """,
                    (city, category),
                )
                row = cur.fetchone()
                return float(row["median_rate"]) if row and row["median_rate"] else None
    except Exception:
        return None


def _get_worker_history(worker_id: str) -> list[float]:
    """Fetch commission rates from worker's DB history (beyond submitted batch)."""
    try:
        with _get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT commission_rate_pct FROM shifts
                    WHERE worker_id = %s AND commission_rate_pct > 0
                    ORDER BY work_date DESC LIMIT 90
                    """,
                    (worker_id,),
                )
                return [float(r[0]) for r in cur.fetchall()]
    except Exception:
        return []


def _parse_time_hours(t: str) -> Optional[float]:
    """Parse HH:MM into fractional hours."""
    try:
        parts = t.strip().split(":")
        return int(parts[0]) + int(parts[1]) / 60.0
    except Exception:
        return None


def _fmt_date(d: str) -> str:
    """Format ISO date string to human-readable."""
    try:
        dt = date.fromisoformat(d)
        return dt.strftime("%-d %B %Y")
    except Exception:
        return d


def _severity_from_z(z: float) -> str:
    if z >= 3.5:
        return "high"
    if z >= 2.5:
        return "medium"
    return "low"


def detect_high_deduction(earnings: list[EarningItem], worker_id: str) -> list[AnomalyResult]:
    """Z-score on commission_rate_pct vs worker history + submitted batch."""
    results = []
    db_history = _get_worker_history(worker_id)
    batch_rates = [e.deductions / e.gross * 100 for e in earnings if e.gross > 0]
    all_rates = db_history + batch_rates
    if len(all_rates) < 3:
        return results
    mean = statistics.mean(all_rates)
    try:
        std = statistics.stdev(all_rates)
    except statistics.StatisticsError:
        return results
    if std < 0.01:
        return results
    for e in earnings:
        if e.gross <= 0:
            continue
        rate = e.deductions / e.gross * 100
        z = (rate - mean) / std
        if z > 2.0:
            sev = _severity_from_z(z)
            results.append(AnomalyResult(
                shift_id=e.id,
                date=e.date,
                type="HIGH_DEDUCTION",
                severity=sev,
                z_score=round(z, 2),
                expected_value=round(mean, 1),
                actual_value=round(rate, 1),
                plain_explanation=(
                    f"Platform deducted {rate:.1f}% on {_fmt_date(e.date)}. "
                    f"Your usual rate is {mean:.1f}%. "
                    f"This is {z:.2f} standard deviations above your normal — statistically unusual."
                ),
            ))
    return results


def detect_income_drop(earnings: list[EarningItem]) -> list[AnomalyResult]:
    """Compare monthly net totals; flag if drop > 20%."""
    results = []
    monthly: dict[str, float] = {}
    for e in earnings:
        try:
            ym = e.date[:7]  # YYYY-MM
            monthly[ym] = monthly.get(ym, 0.0) + e.net
        except Exception:
            continue
    months = sorted(monthly.keys())
    for i in range(1, len(months)):
        prev_ym = months[i - 1]
        curr_ym = months[i]
        prev_net = monthly[prev_ym]
        curr_net = monthly[curr_ym]
        if prev_net <= 0:
            continue
        drop_pct = (prev_net - curr_net) / prev_net * 100
        if drop_pct > 20:
            sev = "high" if drop_pct > 40 else "medium"
            # Use last shift of current month as anchor
            anchor = sorted([e for e in earnings if e.date.startswith(curr_ym)], key=lambda x: x.date)
            shift_id = anchor[-1].id if anchor else earnings[-1].id
            shift_date = anchor[-1].date if anchor else earnings[-1].date
            results.append(AnomalyResult(
                shift_id=shift_id,
                date=shift_date,
                type="INCOME_DROP",
                severity=sev,
                z_score=None,
                expected_value=round(prev_net, 2),
                actual_value=round(curr_net, 2),
                plain_explanation=(
                    f"Your income in {curr_ym} (PKR {curr_net:,.0f}) is "
                    f"{drop_pct:.0f}% lower than {prev_ym} (PKR {prev_net:,.0f}). "
                    f"This may indicate fewer opportunities or a platform rate change."
                ),
            ))
    return results


def detect_commission_spike(
    earnings: list[EarningItem], city: str, category: str
) -> list[AnomalyResult]:
    """Commission rate vs city median from commission_snapshots DB."""
    results = []
    platform_medians: dict[str, Optional[float]] = {}
    for e in earnings:
        if e.platform not in platform_medians:
            platform_medians[e.platform] = _get_city_median(city, category, e.platform)
    for e in earnings:
        if e.gross <= 0:
            continue
        median = platform_medians.get(e.platform)
        if median is None or median <= 0:
            continue
        rate = e.deductions / e.gross * 100
        ratio = rate / median
        if ratio > 1.5:
            sev = "high" if ratio > 2.0 else "medium"
            results.append(AnomalyResult(
                shift_id=e.id,
                date=e.date,
                type="SUDDEN_COMMISSION_SPIKE",
                severity=sev,
                z_score=None,
                expected_value=round(median, 1),
                actual_value=round(rate, 1),
                plain_explanation=(
                    f"{e.platform} charged you {rate:.1f}% commission on {_fmt_date(e.date)}. "
                    f"The city median for {city} {category.replace('_', ' ')} workers is {median:.1f}%. "
                    f"This is {ratio:.1f}× the typical rate."
                ),
            ))
    return results


def detect_hours_mismatch(earnings: list[EarningItem]) -> list[AnomalyResult]:
    """Declared hours_worked vs (shift_end - shift_start); flag if diff > 30 min."""
    results = []
    for e in earnings:
        if e.shift_start is None or e.shift_end is None:
            continue
        start_h = _parse_time_hours(e.shift_start)
        end_h = _parse_time_hours(e.shift_end)
        if start_h is None or end_h is None:
            continue
        scheduled = end_h - start_h
        if scheduled < 0:
            scheduled += 24  # overnight shift
        diff = abs(e.hours - scheduled)
        if diff > 0.5:  # 30 minutes
            sev = "high" if diff > 2.0 else "medium"
            results.append(AnomalyResult(
                shift_id=e.id,
                date=e.date,
                type="HOURS_MISMATCH",
                severity=sev,
                z_score=None,
                expected_value=round(scheduled, 2),
                actual_value=round(e.hours, 2),
                plain_explanation=(
                    f"You logged {e.hours:.1f} hours on {_fmt_date(e.date)} "
                    f"but shift times ({e.shift_start}–{e.shift_end}) show {scheduled:.1f} hours. "
                    f"Discrepancy of {diff * 60:.0f} minutes — this may affect your verified earnings record."
                ),
            ))
    return results


def detect_low_hourly_rate(
    earnings: list[EarningItem], city: str, category: str
) -> list[AnomalyResult]:
    """net/hours vs MIN_HOURLY_RATE env var (default PKR 150/hr)."""
    results = []
    for e in earnings:
        if e.hours <= 0:
            continue
        hourly = e.net / e.hours
        if hourly < MIN_HOURLY_RATE:
            sev = "high" if hourly < MIN_HOURLY_RATE * 0.67 else "medium"
            results.append(AnomalyResult(
                shift_id=e.id,
                date=e.date,
                type="LOW_HOURLY_RATE",
                severity=sev,
                z_score=None,
                expected_value=MIN_HOURLY_RATE,
                actual_value=round(hourly, 2),
                plain_explanation=(
                    f"Your effective hourly rate on {_fmt_date(e.date)} was PKR {hourly:.0f}/hr. "
                    f"This is below the typical minimum of PKR {MIN_HOURLY_RATE:.0f}/hr "
                    f"for {city} {category.replace('_', ' ')} workers."
                ),
            ))
    return results


def _build_groq_payload(payload: DetectRequest, anomalies: list[AnomalyResult], summary: str) -> dict:
    return {
        "worker_id": payload.worker_id,
        "context": payload.context.model_dump(),
        "earnings": [e.model_dump() for e in payload.earnings],
        "anomaly_summary": summary,
        "anomalies": [a.model_dump() for a in anomalies],
    }


def _build_ai_summary(payload: DetectRequest, anomalies: list[AnomalyResult], summary: str) -> tuple[str, bool]:
    """Create an AI explanation using Groq when available; otherwise return a deterministic fallback."""
    no_anomaly_phrase = "AI did not detect any anomaly."
    fallback = (
        f"AI review: {summary} "
        + (no_anomaly_phrase + " " if not anomalies else f"Detected {len(anomalies)} issue(s). ")
        + f"City: {payload.context.city}. Category: {payload.context.category.replace('_', ' ')}."
    )

    if not GROQ_API_KEY:
        return fallback, False

    prompt = (
        "You are FairGig's anomaly assistant. Produce a short, polished verdict for a gig worker. "
        "Use this exact structure with plain text only:\n"
        "Verdict: ...\n"
        "Why: ...\n"
        "Next steps: ...\n\n"
        "Rules:\n"
        "- If there are no anomalies, the Verdict line must start with: AI did not detect any anomaly.\n"
        "- If anomalies exist, the Verdict line must clearly state that anomalies were detected.\n"
        "- Keep the tone direct, helpful, and non-technical.\n"
        "- Mention the city and category when relevant.\n"
        "- Do not mention policy, prompts, JSON, or fallback behavior.\n\n"
        f"INPUT_JSON:\n{json.dumps(_build_groq_payload(payload, anomalies, summary), ensure_ascii=False)}"
    )

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "temperature": 0.2,
                    "messages": [
                        {"role": "system", "content": "You write short, direct AI summaries for an earnings protection app."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()
            return content or fallback, True
    except Exception:
        return fallback, False


@app.get("/api/v1/anomaly/health")
def health():
    return {"status": "ok", "service": "anomaly-service", "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")}


@app.post("/api/v1/anomaly/detect")
def detect(payload: DetectRequest):
    if not payload.earnings:
        ai_summary, ai_enabled = _build_ai_summary(payload, [], "No earnings submitted for analysis.")
        return {
            "success": True,
            "worker_id": payload.worker_id,
            "total_shifts_analyzed": 0,
            "anomalies_found": 0,
            "anomalies": [],
            "summary": "No earnings submitted for analysis.",
            "ai_summary": ai_summary,
            "ai_enabled": ai_enabled,
            "ai_model": GROQ_MODEL if ai_enabled else None,
            "analyzed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

    anomalies: list[AnomalyResult] = []
    anomalies += detect_high_deduction(payload.earnings, payload.worker_id)
    anomalies += detect_income_drop(payload.earnings)
    anomalies += detect_commission_spike(payload.earnings, payload.context.city, payload.context.category)
    anomalies += detect_hours_mismatch(payload.earnings)
    anomalies += detect_low_hourly_rate(payload.earnings, payload.context.city, payload.context.category)

    # Deduplicate: keep highest severity per (shift_id, type)
    seen: dict[tuple, AnomalyResult] = {}
    sev_rank = {"high": 3, "medium": 2, "low": 1}
    for a in anomalies:
        key = (a.shift_id, a.type)
        if key not in seen or sev_rank.get(a.severity, 0) > sev_rank.get(seen[key].severity, 0):
            seen[key] = a
    final = list(seen.values())
    final.sort(key=lambda x: (x.date, x.type))

    high_count = sum(1 for a in final if a.severity == "high")
    med_count = sum(1 for a in final if a.severity == "medium")
    low_count = sum(1 for a in final if a.severity == "low")
    parts = []
    if high_count:
        parts.append(f"{high_count} high severity")
    if med_count:
        parts.append(f"{med_count} medium severity")
    if low_count:
        parts.append(f"{low_count} low severity")
    summary = (
        f"{len(final)} {'anomaly' if len(final) == 1 else 'anomalies'} found. "
        + (", ".join(parts) + "." if parts else "")
    ) if final else "No anomalies detected. Earnings look healthy."

    ai_summary, ai_enabled = _build_ai_summary(payload, final, summary)

    return {
        "success": True,
        "worker_id": payload.worker_id,
        "total_shifts_analyzed": len(payload.earnings),
        "anomalies_found": len(final),
        "anomalies": [a.model_dump() for a in final],
        "summary": summary,
        "ai_summary": ai_summary,
        "ai_enabled": ai_enabled,
        "ai_model": GROQ_MODEL if ai_enabled else None,
        "analyzed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


@app.get("/api/v1/anomaly/worker/{worker_id}")
def worker_history(worker_id: str):
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """
                    SELECT al.id, al.shift_id, al.anomaly_type, al.severity,
                           al.z_score, al.expected_value, al.actual_value,
                           al.plain_explanation, al.is_read, al.is_dismissed,
                           al.detected_at
                    FROM anomaly_logs al
                    WHERE al.worker_id = %s
                    ORDER BY al.detected_at DESC
                    LIMIT 50
                    """,
                    (worker_id,),
                )
                rows = [dict(r) for r in cur.fetchall()]
                for r in rows:
                    if r.get("detected_at"):
                        r["detected_at"] = r["detected_at"].isoformat()
        return {
            "success": True,
            "data": {"worker_id": worker_id, "items": rows, "total": len(rows)},
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
    except Exception as e:
        return {
            "success": True,
            "data": {"worker_id": worker_id, "items": [], "total": 0},
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
