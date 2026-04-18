# FairGig — Setup Guide

## Prerequisites
- Docker Desktop (for local DB + Redis)
- Node.js 20+
- Python 3.11+
- Firebase CLI (`npm install -g firebase-tools`)
- Railway CLI (`npm install -g @railway/cli`) — for backend deployment

---

## Local Development (fastest path)

### 1 — Start infrastructure
```bash
docker compose up -d postgres redis
```

### 2 — Apply schema + seed
```bash
export DATABASE_URL=postgresql://fairgig:fairgig@localhost:5432/fairgig
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

### 3 — Install all dependencies (one command)
```bash
bash setup.sh
```

### 4 — Start all backend services (8 terminals, or use Docker)
```bash
# Option A — individual terminals
cd services/api-gateway       && npm start        # :3000
cd services/auth-service      && npm start        # :3001
cd services/earnings-service  && npm start        # :3002
cd services/grievance-service && npm start        # :3003
cd services/analytics-service && npm start        # :3004
cd services/notification-service && npm start     # :3005
cd services/anomaly-service   && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
cd services/certificate-service && uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# Option B — full Docker Compose
docker compose up --build
```

### 5 — Start frontend
```bash
cd frontend && npm run dev     # http://localhost:5173
```

---

## Ports Reference
| Service             | Port |
|---------------------|------|
| API Gateway         | 3000 |
| Auth Service        | 3001 |
| Earnings Service    | 3002 |
| Grievance Service   | 3003 |
| Analytics Service   | 3004 |
| Notification Service| 3005 |
| Anomaly Service     | 8001 |
| Certificate Service | 8002 |
| Frontend            | 5173 |

---

## Production Deployment

### Frontend → Firebase Hosting (already deployed)
```bash
# Build and deploy
cd frontend && npm run build
firebase deploy --only hosting
# Live at: https://softec-webhackathon.web.app
```

### Backend → Railway (free tier)
```bash
# 1. Login to Railway (opens browser)
railway login

# 2. Run automated deploy script
bash deploy-railway.sh
# This creates all services, provisions PostgreSQL + Redis,
# runs schema/seed, deploys all 8 services, then rebuilds
# the frontend with production URLs and re-deploys to Firebase.
```

#### Manual Railway deploy (per service)
```bash
cd services/api-gateway
railway init          # link to project
railway up            # deploy
railway variables set JWT_ACCESS_SECRET=xxx CORS_ORIGIN=https://softec-webhackathon.web.app ...
```

---

## Environment Variables

Every service has a `.env.example`. Copy to `.env` and fill in secrets.
The `setup.sh` script does this automatically for local dev.

### Critical secrets (change before production)
| Variable | Used In |
|---|---|
| `JWT_ACCESS_SECRET` | gateway, auth, earnings, grievance, analytics, notification, certificate |
| `JWT_REFRESH_SECRET` | auth |
| `DATABASE_URL` | auth, earnings, grievance, analytics, anomaly, certificate |
| `REDIS_URL` | earnings, analytics |

---

## Judge Demo Payload (anomaly endpoint)

```bash
curl -X POST http://localhost:8001/api/v1/anomaly/detect \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "22000000-0000-4000-8000-000000000001",
    "earnings": [
      {
        "id": "a0000000-0000-4000-8000-000000000001",
        "date": "2026-03-15",
        "platform": "Careem",
        "hours": 8.0,
        "gross": 2400.00,
        "deductions": 1056.00,
        "net": 1344.00,
        "shift_start": "09:00",
        "shift_end": "17:30"
      }
    ],
    "context": { "city": "Lahore", "category": "ride_hailing" }
  }'
```

---

## Seeded Demo Accounts
All passwords: `password`

| Role | Email |
|---|---|
| Worker (Lahore) | worker.l1@fairgig.pk |
| Worker (Karachi) | worker.k1@fairgig.pk |
| Verifier | verifier.a@fairgig.pk |
| Advocate | advocate.lahore@fairgig.pk |
