# GCP VM Deploy (Clean + Rebuild)

This guide is for Compute Engine VM deployment on Debian 12.

## Why this setup

- Frontend and backend are served from the same origin through Caddy.
- This avoids browser mixed-content problems when frontend is HTTPS.
- API calls use `/api/...` and cert links use `/cert/...` via reverse proxy.

## 1. Open required firewall ports

In GCP VPC firewall, allow inbound:

- TCP `80`
- TCP `443` (if you set a domain and want HTTPS)

## 2. SSH into VM and clone repo (if needed)

```bash
git clone <YOUR_REPO_URL> ~/web_hackathon_fair_gig
cd ~/web_hackathon_fair_gig
```

## 3. Run one command to clean failed state and redeploy

HTTP-only (works immediately with VM IP):

```bash
cd ~/web_hackathon_fair_gig
chmod +x scripts/gcp-clean-redeploy.sh
APP_DIR=~/web_hackathon_fair_gig RESET_DB=0 ./scripts/gcp-clean-redeploy.sh
```

Reset database too (fresh schema + seed):

```bash
cd ~/web_hackathon_fair_gig
APP_DIR=~/web_hackathon_fair_gig RESET_DB=1 ./scripts/gcp-clean-redeploy.sh
```

## 4. Optional HTTPS with domain (recommended)

If you have a DNS name pointing to VM, run:

```bash
cd ~/web_hackathon_fair_gig
APP_DIR=~/web_hackathon_fair_gig DOMAIN=your.domain.com ./scripts/gcp-clean-redeploy.sh
```

Caddy will auto-provision TLS certificates.

## 5. No domain yet? Use HTTP now

Use `http://<VM_EXTERNAL_IP>` until domain is ready.

## 6. Verify services

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:8001/api/v1/anomaly/health
```

## 7. Run anomaly smoke test on VM

```bash
powershell -ExecutionPolicy Bypass -File .\scripts\run-anomaly-smoke.ps1
```

Or from bash, call endpoint directly:

```bash
curl -X POST http://localhost:8001/api/v1/anomaly/detect \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## Notes

- Frontend build gets `VITE_API_URL=/` so API calls are same-origin.
- Certificate links now use `VITE_CERT_URL` or current browser origin (no hardcoded localhost).
- If frontend is hosted elsewhere (e.g. Firebase HTTPS), backend should also be HTTPS to avoid mixed content.
