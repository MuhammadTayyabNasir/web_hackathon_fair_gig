#!/usr/bin/env bash
# FairGig — one-shot dev setup
set -e

echo "=== FairGig Setup ==="

# 1. Install Node.js dependencies for all services
for svc in api-gateway auth-service earnings-service grievance-service analytics-service notification-service; do
  echo ">>> Installing $svc..."
  (cd "services/$svc" && npm install --silent)
done

echo ">>> Installing frontend..."
(cd frontend && npm install --silent)

# 2. Install Python dependencies
for svc in anomaly-service certificate-service; do
  echo ">>> Installing $svc (Python)..."
  (cd "services/$svc" && pip install -r requirements.txt -q)
done

# 3. Create .env files from .env.example if they don't already exist
for dir in services/api-gateway services/auth-service services/earnings-service \
           services/grievance-service services/analytics-service services/notification-service \
           services/anomaly-service services/certificate-service frontend; do
  if [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
    echo ">>> Created $dir/.env from example"
  fi
done

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. docker compose up -d postgres redis"
echo "  2. psql \$DATABASE_URL -f schema.sql"
echo "  3. psql \$DATABASE_URL -f seed.sql"
echo "  4. docker compose up --build   (or run services individually)"
echo "  5. cd frontend && npm run dev"
