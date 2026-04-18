import os
import secrets
import psycopg2
import psycopg2.extras
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
import jwt as pyjwt

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://fairgig:fairgig@localhost:5432/fairgig")
JWT_SECRET = os.getenv("JWT_ACCESS_SECRET", "dev-access-secret-change-me")
CERT_EXPIRES_DAYS = int(os.getenv("CERT_EXPIRES_DAYS", "365"))

app = FastAPI(title="FairGig Certificate Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_conn():
    return psycopg2.connect(DATABASE_URL)


def _ts():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _verify_jwt(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "UNAUTHORIZED", "message": "Access token required"})
    token = authorization[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "TOKEN_EXPIRED", "message": "Token expired"})
    except Exception:
        raise HTTPException(status_code=401, detail={"success": False, "error": "UNAUTHORIZED", "message": "Invalid token"})


def _render_certificate(cert: dict, worker: dict, profile: dict) -> str:
    from_date = cert["from_date"].strftime("%d %B %Y") if hasattr(cert["from_date"], "strftime") else cert["from_date"]
    to_date = cert["to_date"].strftime("%d %B %Y") if hasattr(cert["to_date"], "strftime") else cert["to_date"]
    generated_at = cert["generated_at"].strftime("%d %B %Y") if hasattr(cert["generated_at"], "strftime") else cert["generated_at"]
    total_earnings = f"PKR {float(cert['total_verified_earnings'] or 0):,.0f}"
    avg_monthly = f"PKR {float(cert['avg_monthly_income'] or 0):,.0f}"
    verified_shifts = cert.get("total_verified_shifts", 0) or 0
    cnic_last4 = profile.get("cnic_last4") or "XXXX"
    masked_cnic = f"****-{cnic_last4}"
    category = (profile.get("category") or "N/A").replace("_", " ").title()
    platform_name = profile.get("platform_name") or "Multiple Platforms"
    verification_pct = (verified_shifts / max(verified_shifts, 1)) * 100
    badge_color = "#16a34a" if verification_pct >= 90 else "#d97706"
    badge_text = "Fully Verified" if verification_pct >= 90 else "Partially Verified"
    cert_id = str(cert["id"])[:8].upper()

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FairGig Income Certificate — {worker['name']}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px 20px;
    }}
    .page {{
      max-width: 750px;
      margin: 0 auto;
      background: #fff;
      border: 2px solid #1e40af;
      border-radius: 8px;
      padding: 48px;
      box-shadow: 0 4px 24px rgba(30,64,175,0.1);
    }}
    .header {{
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }}
    .logo {{
      font-size: 32px;
      font-weight: 900;
      color: #1e40af;
      letter-spacing: -1px;
    }}
    .logo span {{ color: #16a34a; }}
    .tagline {{
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }}
    .cert-title {{
      font-size: 22px;
      font-weight: 700;
      color: #1e40af;
      margin-top: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }}
    .cert-subtitle {{
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }}
    .badge {{
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      margin-top: 12px;
      background: {badge_color};
    }}
    .section {{ margin-bottom: 28px; }}
    .section-title {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #64748b;
      font-family: sans-serif;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }}
    .row {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6px 0;
      border-bottom: 1px dotted #e2e8f0;
    }}
    .row:last-child {{ border-bottom: none; }}
    .label {{
      font-size: 13px;
      color: #64748b;
      font-family: sans-serif;
    }}
    .value {{
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      font-family: sans-serif;
    }}
    .highlight-box {{
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }}
    .highlight-amount {{
      font-size: 36px;
      font-weight: 800;
      color: #1e40af;
      font-family: sans-serif;
    }}
    .highlight-label {{
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: sans-serif;
      margin-top: 2px;
    }}
    .stats-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }}
    .stat-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }}
    .stat-value {{
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      font-family: sans-serif;
    }}
    .stat-label {{
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
      font-family: sans-serif;
    }}
    .qr-placeholder {{
      width: 80px;
      height: 80px;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      font-family: sans-serif;
    }}
    .footer-row {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #1e40af;
    }}
    .disclaimer {{
      font-size: 11px;
      color: #94a3b8;
      max-width: 480px;
      line-height: 1.5;
      font-family: sans-serif;
    }}
    .cert-meta {{
      font-size: 11px;
      color: #64748b;
      text-align: right;
      font-family: sans-serif;
    }}
    .cert-id {{
      font-weight: 700;
      font-family: monospace;
      letter-spacing: 1px;
    }}
    .no-print {{ display: block; }}
    .print-btn {{
      display: inline-block;
      margin: 24px auto;
      padding: 12px 32px;
      background: #1e40af;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      font-family: sans-serif;
    }}
    .print-bar {{
      text-align: center;
      padding: 16px 0;
    }}
    @media print {{
      .no-print {{ display: none !important; }}
      body {{ background: #fff; padding: 0; }}
      .page {{
        border: 1px solid #000;
        box-shadow: none;
        padding: 32px;
        max-width: 100%;
        border-radius: 0;
      }}
      .badge {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
      .highlight-box {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
      @page {{ size: A4; margin: 15mm; }}
    }}
  </style>
</head>
<body>
  <div class="no-print print-bar">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="page">
    <div class="header">
      <div class="logo">Fair<span>Gig</span></div>
      <div class="tagline">Gig Worker Income &amp; Rights Platform</div>
      <div class="cert-title">Income Verification Certificate</div>
      <div class="cert-subtitle">This document certifies the gig earnings of the worker named below</div>
      <div class="badge">{badge_text}</div>
    </div>

    <div class="section">
      <div class="section-title">Worker Details</div>
      <div class="row"><span class="label">Full Name</span><span class="value">{worker['name']}</span></div>
      <div class="row"><span class="label">CNIC (masked)</span><span class="value">{masked_cnic}</span></div>
      <div class="row"><span class="label">Work Category</span><span class="value">{category}</span></div>
      <div class="row"><span class="label">Primary Platform</span><span class="value">{platform_name}</span></div>
      <div class="row"><span class="label">Coverage Period</span><span class="value">{from_date} — {to_date}</span></div>
    </div>

    <div class="highlight-box">
      <div class="highlight-amount">{total_earnings}</div>
      <div class="highlight-label">Total Verified Earnings</div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">{avg_monthly}</div>
        <div class="stat-label">Avg Monthly Income</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">{verified_shifts}</div>
        <div class="stat-label">Verified Shifts</div>
      </div>
    </div>

    <div class="footer-row">
      <div>
        <div class="qr-placeholder">QR<br/>Verify</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;font-family:sans-serif;">{cert["token"][:16]}...</div>
      </div>
      <div class="cert-meta">
        <div>Generated: {generated_at}</div>
        <div>Certificate ID: <span class="cert-id">{cert_id}</span></div>
        <div style="margin-top:8px;">
          <span style="background:{badge_color};color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;">{badge_text}</span>
        </div>
      </div>
    </div>

    <div class="disclaimer" style="margin-top:16px;">
      <strong>Disclaimer:</strong> This certificate reflects self-reported and community-verified earnings.
      It is not a government document. FairGig makes no guarantee of accuracy beyond the data submitted by the worker.
    </div>
  </div>
  <div class="no-print print-bar">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>"""


@app.get("/api/v1/certificate/health")
def health():
    return {"status": "ok", "service": "certificate-service", "timestamp": _ts()}


@app.get("/api/v1/certificate/generate")
def generate(
    from_date: str,
    to_date: str,
    user: dict = Depends(_verify_jwt),
):
    worker_id = user["sub"]
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=CERT_EXPIRES_DAYS)
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """
                    SELECT
                      COALESCE(SUM(s.net_received), 0) AS total_earnings,
                      COUNT(v.id) FILTER (WHERE v.status = 'verified') AS verified_shifts
                    FROM shifts s
                    LEFT JOIN verifications v ON v.shift_id = s.id
                    WHERE s.worker_id = %s
                      AND s.work_date BETWEEN %s AND %s
                    """,
                    (worker_id, from_date, to_date),
                )
                stats = cur.fetchone()
                total = float(stats["total_earnings"] or 0)
                v_shifts = int(stats["verified_shifts"] or 0)

                # Avg monthly income
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                months = max(1, (to_dt.year - from_dt.year) * 12 + to_dt.month - from_dt.month + 1)
                avg_monthly = total / months

                cur.execute(
                    """
                    INSERT INTO income_certificates
                      (worker_id, from_date, to_date, total_verified_earnings,
                       avg_monthly_income, total_verified_shifts, token, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, token, generated_at
                    """,
                    (worker_id, from_date, to_date, total, avg_monthly, v_shifts, token, expires_at),
                )
                row = dict(cur.fetchone())
                conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": "DB_ERROR", "message": str(e)})

    return {
        "success": True,
        "data": {
            "token": row["token"],
            "id": str(row["id"]),
            "generated_at": row["generated_at"].isoformat(),
            "url": f"/cert/{row['token']}",
        },
        "message": "Certificate generated",
        "timestamp": _ts(),
    }


@app.get("/cert/{token}", response_class=HTMLResponse)
@app.get("/api/v1/certificate/{token}", response_class=HTMLResponse)
def view_certificate(token: str):
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """
                    SELECT ic.*, u.name, u.email,
                           wp.cnic_last4, wp.category,
                           p.name AS platform_name
                    FROM income_certificates ic
                    JOIN users u ON u.id = ic.worker_id
                    LEFT JOIN worker_profiles wp ON wp.user_id = ic.worker_id
                    LEFT JOIN platforms p ON p.id = wp.preferred_platform_id
                    WHERE ic.token = %s AND ic.is_revoked = false
                    """,
                    (token,),
                )
                row = cur.fetchone()
    except Exception:
        row = None

    if not row:
        return HTMLResponse(
            content="<html><body><h2>Certificate not found or has been revoked.</h2></body></html>",
            status_code=404,
        )

    cert = dict(row)
    worker = {"name": cert["name"], "email": cert["email"]}
    profile = {"cnic_last4": cert["cnic_last4"], "category": cert["category"], "platform_name": cert["platform_name"]}
    return HTMLResponse(content=_render_certificate(cert, worker, profile))


@app.delete("/api/v1/certificate/{token}/revoke")
def revoke(token: str, user: dict = Depends(_verify_jwt)):
    worker_id = user["sub"]
    try:
        with _get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE income_certificates SET is_revoked = true WHERE token = %s AND worker_id = %s RETURNING id",
                    (token, worker_id),
                )
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail={"success": False, "error": "NOT_FOUND", "message": "Certificate not found"})
                conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": "DB_ERROR", "message": str(e)})
    return {"success": True, "data": {"token": token, "revoked": True}, "timestamp": _ts()}
