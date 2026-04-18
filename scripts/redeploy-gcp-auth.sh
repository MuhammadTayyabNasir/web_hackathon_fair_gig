#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="${APP_DIR:-$HOME/web_hackathon_fair_gig}"

cd "$APP_DIR"

echo "[1/5] Pulling latest branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[2/5] Building services"
docker compose build auth-service api-gateway

echo "[3/5] Restarting services"
docker compose up -d auth-service api-gateway

echo "[4/5] Running health checks"
if ! curl -fsS "http://localhost:3000/health" >/dev/null; then
  echo "Gateway health check failed on :3000"
  exit 1
fi
if ! curl -fsS "http://localhost:3001/health" >/dev/null; then
  echo "Auth service health check failed on :3001"
  exit 1
fi

echo "[5/5] Running firebase-login smoke test"
status_code="$(curl -sS -o /tmp/firebase-login-smoke.json -w "%{http_code}" \
  -X POST "http://localhost:3000/api/v1/auth/firebase-login" \
  -H "Content-Type: application/json" \
  -d '{"idToken":"smoke-test-invalid-token"}')"

if [[ "$status_code" == "404" ]]; then
  echo "Smoke test failed: /api/v1/auth/firebase-login returned 404"
  cat /tmp/firebase-login-smoke.json || true
  exit 1
fi

echo "Smoke test status: $status_code"
cat /tmp/firebase-login-smoke.json || true

echo "Redeploy complete."
