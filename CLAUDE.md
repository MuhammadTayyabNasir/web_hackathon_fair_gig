# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FairGig** — gig worker income & rights platform built for SOFTEC'26 (24h hackathon, PKR 80,000 prize). Judges are technical: they call the anomaly API directly with a crafted payload, browse advocate seed data, print the income certificate, check `docs/API.md`, and verify that city medians come from seeded DB data (never hardcoded).

## Development Commands

### Infrastructure

```bash
docker compose up -d postgres redis          # start DB + cache only
psql $DATABASE_URL -f schema.sql             # apply canonical schema
psql $DATABASE_URL -f seed.sql               # load demo data (password: `password`)
docker compose up --build                    # full stack
```

### Frontend (port 5173)

```bash
cd frontend && npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview production build
```

### Node Services (ports 3000–3005)

```bash
cd services/<service-name> && npm install
npm start         # production
npm run dev       # watch mode (auth-service only)
```

### Python FastAPI Services (anomaly 8001, certificate 8002)

```bash
cd services/<anomaly|certificate>-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port <8001|8002> --reload
```

### Setup note

Copy each service's `.env.example` to `.env` before starting. Firebase emulators: auth 9099, storage 9199, dataconnect 4000 (project: `softec-webhackathon`).

---

## Architecture

Microservices with an API Gateway. All frontend traffic hits the gateway first; it proxies to downstream services.

```
frontend/ (React+Vite, 5173)
    ↓ port 3000
api-gateway/ (Express)
    ├─→ auth-service/         3001  Node/Express
    ├─→ earnings-service/     3002  Node/Express
    ├─→ grievance-service/    3003  Node/Express
    ├─→ analytics-service/    3004  Node/Express
    ├─→ notification-service/ 3005  Node/Express (FCM)
    ├─→ anomaly-service/      8001  Python FastAPI  ← judges hit directly
    └─→ certificate-service/  8002  Python FastAPI

Data layer:
  PostgreSQL 16  — system of record (schema.sql is canonical; no manual migrations)
  Redis 7        — TTL caching
  Firebase Auth  — client-side auth
  Firebase Storage — shift screenshots (max 5MB, jpeg/png/webp)
  Firebase Data Connect — PostgreSQL-backed SDK (dataconnect/ dir)
```

---

## Service Responsibilities

### auth-service (3001)
Firebase Auth + JWT access (15m) + refresh (7d httpOnly cookie). Roles: `worker | verifier | advocate`. bcrypt 12 rounds. Rate limit: 5 logins/15min/IP.

### earnings-service (3002)
Shifts CRUD, CSV import (papaparse, required columns: date/platform/hours/gross/deductions/net), Firebase screenshot uploads → verifier queue. City-median cached in Redis 1h.

### grievance-service (3003) — REQUIRED
Submit, tag, cluster, upvote, escalate, resolve. **Anonymous grievances: never return `worker_id` in any response.** Advocates see anonymised city/zone only.

### analytics-service (3004)
KPI aggregation with Redis TTLs:

| Endpoint | TTL | Reason |
|---|---|---|
| city-median | 1 hour | Expensive aggregate |
| commission-trends | 30 min | Heavy query |
| vulnerability flags | 15 min | Workers with 20%+ income drop |
| top-complaints | 15 min | Dashboard KPI |
| income-distribution | 30 min | Heavy geo query |
| platform-comparison | 30 min | Cross-join |

**Never cache:** personal worker data, verifier queue, anomaly results.

### anomaly-service (8001, Python) — REQUIRED — judges call directly

Implements all five anomaly types using z-scores against city medians from `commission_snapshots` DB table (never hardcoded values):

| Type | Logic | Threshold |
|---|---|---|
| `HIGH_DEDUCTION` | Z-score on `commission_rate_pct` vs worker history | z > 2.0 |
| `INCOME_DROP` | Current month net vs previous month net | drop > 20% |
| `SUDDEN_COMMISSION_SPIKE` | `commission_rate_pct` vs platform city median from DB | > 1.5× median |
| `HOURS_MISMATCH` | Declared `hours_worked` vs `(shift_end - shift_start)` | diff > 30 min |
| `LOW_HOURLY_RATE` | `net_received / hours_worked` vs city minimum | below PKR 150/hr (env-configurable) |

**Exact judge payload shape:**
```json
{
  "worker_id": "uuid",
  "earnings": [
    {
      "id": "uuid",
      "date": "2026-03-01",
      "platform": "Careem",
      "hours": 8.0,
      "gross": 2400.00,
      "deductions": 960.00,
      "net": 1440.00,
      "shift_start": "09:00",
      "shift_end": "17:30"
    }
  ],
  "context": { "city": "Lahore", "category": "ride_hailing" }
}
```

**Exact response shape:**
```json
{
  "success": true,
  "worker_id": "uuid",
  "total_shifts_analyzed": 10,
  "anomalies_found": 2,
  "anomalies": [
    {
      "shift_id": "uuid",
      "date": "2026-03-01",
      "type": "HIGH_DEDUCTION",
      "severity": "high",
      "z_score": 2.84,
      "expected_value": 26.5,
      "actual_value": 40.0,
      "plain_explanation": "Platform deducted 40% on 1 March 2026. Your usual rate is 26.5%. This is 2.84 standard deviations above your normal — statistically unusual."
    }
  ],
  "summary": "2 anomalies found. 1 high severity, 1 medium severity.",
  "analyzed_at": "2026-04-18T10:30:00Z"
}
```

### certificate-service (8002, Python) — REQUIRED
HTML + print CSS income certificate. Public endpoint `/cert/:token`. Must include: worker name, masked CNIC (`****-1234`), category, platform, date range, total verified earnings (PKR), avg monthly income, verified shift count, verification badge (green = all verified, amber = partial), disclaimer, generated date, certificate ID, QR placeholder. Print CSS hides all nav/buttons; black-and-white safe; clean A4 layout.

### notification-service (3005)
FCM push notification delivery.

---

## API Response Envelope (all services, no exceptions)

```json
// Success
{ "success": true, "data": {}, "message": "...", "timestamp": "ISO-8601" }
// Error
{ "success": false, "error": "ERROR_CODE", "message": "...", "timestamp": "ISO-8601" }
// Paginated: add "pagination": { "page", "limit", "total", "totalPages" }
```

---

## Frontend Routes

```
/                         Landing page
/login                    Login
/register                 Register (with role selection)
/worker/dashboard         Worker home
/worker/shifts            Shift list
/worker/shifts/add        Add shift form
/worker/shifts/import     CSV import
/worker/analytics         Income analytics + charts
/worker/certificate       Generate certificate
/worker/anomalies         Anomaly alerts
/verifier/queue           Verifier dashboard
/verifier/review/:id      Review single shift
/advocate/dashboard       Advocate analytics
/advocate/grievances      Grievance management
/community                Anonymous bulletin board
/cert/:token              Public certificate (print-friendly, no auth)
```

Role guards: `<WorkerRoute>`, `<VerifierRoute>`, `<AdvocateRoute>`, `<PublicRoute>`.

---

## UI/UX Rules

### Loading states — always required
- NProgress bar on every page navigation
- Skeleton loaders for all lists, cards, charts
- Button spinner + disabled when submitting
- "Uploading… X%" for screenshot uploads
- "Importing rows…" for CSV import

### Empty states — always required
- No shifts → illustration + "Log your first shift"
- No anomalies → green checkmark "Your earnings look healthy!"
- No grievances → illustration + "Post a complaint"
- No pending verifications → "Queue is clear — great work!"

### Error states — always required
- API error → toast + retry button
- Form errors → inline red text under each field in real time
- Network offline → top banner
- 403 → redirect with message
- 404 → friendly page with back button

### Color system
- Primary: `#1e40af` | Success: `#16a34a` | Warning: `#d97706` | Danger: `#dc2626` | Background: `#f8fafc`
- Dark mode: fully supported

### Role-based UI tone
- **Worker**: warm, friendly, large text, clear CTAs (phone-readable between deliveries)
- **Verifier**: efficient, queue-focused, fast decisions
- **Advocate**: data-dense, analytical, power-user charts

---

## Security Requirements

- All secrets in `.env` only; Claude API key is server-only (never in frontend)
- Helmet + CORS allowlist on all Node services
- Parameterized SQL only — never string concatenation
- express-validator on all user inputs
- Rate limits: login 5/15min/IP, API 100/15min/token, CSV upload 3/h/user
- Firebase Storage rules: authenticated users, max 5MB
- httpOnly cookies for refresh tokens
- Aggregate endpoints must never return individual worker data

---

## Seed Data Requirements

`seed.sql` must satisfy (judges verify this):
- **Platforms**: Careem, Uber, Bykea, foodpanda, Rozee.pk, Daraz
- **Users**: 2 advocates (Lahore + Karachi), 3 verifiers, 15 workers (5 each in Lahore/Karachi/Islamabad across zones)
- **Shifts**: 300+ records over last 6 months with intentional anomalies — 3 workers with 20%+ income drop, 5 shifts with HIGH_DEDUCTION (>40%), 2 workers with HOURS_MISMATCH
- **Grievances**: 50+ records, mixed categories/statuses, some clustered and escalated
- **Commission snapshots**: 6 months per platform showing gradual rate increases
- **Tags**: urgent, commission-issue, deactivation, payment-delay, verified, needs-review, escalated, resolved

---

## Coding Standards

- `winston` for logging in all Node services — never `console.log`
- `asyncHandler` wrapper or try/catch on every async route
- JSDoc on all exported functions
- Parameterized SQL; snake_case DB columns
- kebab-case route filenames and API paths (`/city-median` not `/cityMedian`)
- PascalCase React components; camelCase functions
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## Judge Demo Script (10 minutes)

1. Register as worker (Lahore, ride_hailing, Careem)
2. Log 2 shifts manually — show deduction breakdown
3. Import CSV — show success/fail count per row
4. Upload screenshot → switch to verifier → approve it
5. Show worker analytics — weekly trends, hourly rate, city median comparison
6. Show anomaly alert on seeded suspicious data → explain z-score methodology
7. Generate income certificate → print preview → confirm print-friendly
8. Post grievance → switch to advocate → tag + cluster it
9. Show advocate analytics — commission trends, vulnerability flags, income distribution by zone
10. `POST http://localhost:8001/api/v1/anomaly/detect` with sample payload directly in browser — show JSON response ← **most impressive to judges**

---

## Docs to Maintain

- `docs/API.md` — inter-service request/response table (judges check this)
- `docs/ARCHITECTURE.md` — system design
- `docs/SETUP.md` — single start command per service
- `docs/DECISIONS.md` — why each tech was chosen
- `docs/DEBUGGING.md` — troubleshooting
