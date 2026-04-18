# #!/usr/bin/env bash
# # FairGig — deploy all backend services to Railway
# # Prerequisites: railway login (runs browser OAuth)
# # Usage: bash deploy-railway.sh
# set -e

# echo "=== FairGig Railway Deploy ==="
# echo "Make sure you ran: railway login"
# echo ""

# PROJECT_NAME="fairgig-softec26"
# DB_URL=""       # Will be set after postgres deploy
# REDIS_URL=""    # Will be set after redis deploy
# JWT_ACCESS="$(openssl rand -hex 32)"
# JWT_REFRESH="$(openssl rand -hex 32)"

# # ── 1. Create project ──────────────────────────────────────
# echo ">>> Creating Railway project..."
# railway init --name "$PROJECT_NAME" 2>/dev/null || true

# # ── 2. Add PostgreSQL plugin ────────────────────────────────
# echo ">>> Provisioning PostgreSQL..."
# railway add --plugin postgresql
# DB_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
# echo "DB_URL: $DB_URL"

# # ── 3. Add Redis plugin ─────────────────────────────────────
# echo ">>> Provisioning Redis..."
# railway add --plugin redis
# REDIS_URL=$(railway variables get REDIS_URL 2>/dev/null || echo "redis://localhost:6379")

# # ── 4. Run schema + seed via Railway run ────────────────────
# echo ">>> Applying schema and seed..."
# railway run --service postgresql psql "$DB_URL" -f schema.sql 2>/dev/null || \
#   echo "WARN: Could not auto-run schema. Run manually: psql \$DATABASE_URL -f schema.sql"
# railway run --service postgresql psql "$DB_URL" -f seed.sql 2>/dev/null || \
#   echo "WARN: Could not auto-run seed."

# # ── Helper: deploy a service ────────────────────────────────
# deploy_service() {
#   local name=$1
#   local dir=$2
#   shift 2
#   echo ">>> Deploying $name..."
#   (
#     cd "$dir"
#     railway up --service "$name" --detach
#     # Set env vars
#     for kv in "$@"; do
#       railway variables set "$kv" --service "$name"
#     done
#   )
# }

# COMMON_VARS=(
#   "DATABASE_URL=$DB_URL"
#   "JWT_ACCESS_SECRET=$JWT_ACCESS"
#   "JWT_REFRESH_SECRET=$JWT_REFRESH"
#   "NODE_ENV=production"
# )

# # ── 5. Deploy auth-service ──────────────────────────────────
# deploy_service "auth-service" "services/auth-service" \
#   "${COMMON_VARS[@]}" \
#   "PORT=3001"

# AUTH_URL=$(railway service domain --service auth-service 2>/dev/null | head -1)
# AUTH_URL="https://$AUTH_URL"

# # ── 6. Deploy earnings-service ──────────────────────────────
# deploy_service "earnings-service" "services/earnings-service" \
#   "${COMMON_VARS[@]}" \
#   "PORT=3002" "REDIS_URL=$REDIS_URL"

# EARNINGS_URL="https://$(railway service domain --service earnings-service | head -1)"

# # ── 7. Deploy grievance-service ─────────────────────────────
# deploy_service "grievance-service" "services/grievance-service" \
#   "${COMMON_VARS[@]}" \
#   "PORT=3003"

# GRIEVANCE_URL="https://$(railway service domain --service grievance-service | head -1)"

# # ── 8. Deploy analytics-service ─────────────────────────────
# deploy_service "analytics-service" "services/analytics-service" \
#   "${COMMON_VARS[@]}" \
#   "PORT=3004" "REDIS_URL=$REDIS_URL"

# ANALYTICS_URL="https://$(railway service domain --service analytics-service | head -1)"

# # ── 9. Deploy notification-service ──────────────────────────
# deploy_service "notification-service" "services/notification-service" \
#   "${COMMON_VARS[@]}" \
#   "PORT=3005"

# NOTIFY_URL="https://$(railway service domain --service notification-service | head -1)"

# # ── 10. Deploy anomaly-service ──────────────────────────────
# deploy_service "anomaly-service" "services/anomaly-service" \
#   "DATABASE_URL=$DB_URL" \
#   "MIN_HOURLY_RATE_PKR=150"

# ANOMALY_URL="https://$(railway service domain --service anomaly-service | head -1)"

# # ── 11. Deploy certificate-service ─────────────────────────
# deploy_service "certificate-service" "services/certificate-service" \
#   "DATABASE_URL=$DB_URL" \
#   "JWT_ACCESS_SECRET=$JWT_ACCESS" \
#   "CERT_EXPIRES_DAYS=365"

# CERT_URL="https://$(railway service domain --service certificate-service | head -1)"

# # ── 12. Deploy api-gateway (the single public entry point) ──
# FIREBASE_ORIGIN="https://softec-webhackathon.web.app,https://softec-webhackathon.firebaseapp.com"
# deploy_service "api-gateway" "services/api-gateway" \
#   "JWT_ACCESS_SECRET=$JWT_ACCESS" \
#   "CORS_ORIGIN=$FIREBASE_ORIGIN" \
#   "AUTH_SERVICE_URL=$AUTH_URL" \
#   "EARNINGS_SERVICE_URL=$EARNINGS_URL" \
#   "GRIEVANCE_SERVICE_URL=$GRIEVANCE_URL" \
#   "ANALYTICS_SERVICE_URL=$ANALYTICS_URL" \
#   "NOTIFY_SERVICE_URL=$NOTIFY_URL" \
#   "ANOMALY_SERVICE_URL=$ANOMALY_URL" \
#   "CERT_SERVICE_URL=$CERT_URL"

# GATEWAY_URL="https://$(railway service domain --service api-gateway | head -1)"

# echo ""
# echo "=== All services deployed! ==="
# echo "Gateway:     $GATEWAY_URL"
# echo "Anomaly:     $ANOMALY_URL"
# echo "Certificate: $CERT_URL"
# echo ""

# # ── 13. Rebuild frontend with production URLs ────────────────
# echo ">>> Rebuilding frontend with production API URLs..."
# bash deploy.sh --prod "$GATEWAY_URL" "$CERT_URL"

# echo ""
# echo "✅ DONE!"
# echo "   Frontend: https://softec-webhackathon.web.app"
# echo "   Gateway:  $GATEWAY_URL"
# echo "   Anomaly:  $ANOMALY_URL/api/v1/anomaly/detect  ← judges call this"
# echo ""
# echo "   JWT secrets saved (keep these safe):"
# echo "   JWT_ACCESS_SECRET=$JWT_ACCESS"
!/usr/bin/env bash
# FairGig — deploy all backend services to Railway
# Prerequisites: railway login (runs browser OAuth)
# Usage: bash deploy-railway.sh
set -e

echo "=== FairGig Railway Deploy ==="
echo "Make sure you ran: railway login"
echo ""

PROJECT_NAME="fairgig-softec26"
JWT_ACCESS="$(openssl rand -hex 32)"
JWT_REFRESH="$(openssl rand -hex 32)"

# ── 1. Create project ──────────────────────────────────────
echo ">>> Linking to Railway project..."
railway init --name "$PROJECT_NAME" 2>/dev/null || true

# ── 2. Get Database URLs manually ─────────────────────────
echo ""
echo "🚨 MANUAL STEP REQUIRED 🚨"
echo "Because you created the databases manually in the Railway UI, you need to provide the connection URLs."
echo "1. Go to your Railway dashboard: https://railway.com/project/50f0bcfc-0f88-4ab9-9a1b-e2d455290d6c"
echo "2. Click on the PostgreSQL database box."
echo "3. Go to the 'Variables' tab at the top."
echo "4. Copy the value for DATABASE_URL."
echo ""
read -p "Paste the PostgreSQL DATABASE_URL here: " DB_URL

echo ""
echo "1. Now click on the Redis database box."
echo "2. Go to the 'Variables' tab."
echo "3. Copy the value for REDIS_URL."
echo ""
read -p "Paste the REDIS_URL here: " REDIS_URL
echo ""

# ── 3. Run schema + seed via Railway run ────────────────────
echo ">>> Applying schema and seed..."
echo "Running schema.sql..."
psql "$DB_URL" -f schema.sql 2>/dev/null || \
  echo "WARN: Could not auto-run schema. Run manually: psql \$DATABASE_URL -f schema.sql"
echo "Running seed.sql..."
psql "$DB_URL" -f seed.sql 2>/dev/null || \
  echo "WARN: Could not auto-run seed."

# ── Helper: deploy a service ────────────────────────────────
deploy_service() {
  local name=$1
  local dir=$2
  shift 2
  echo ">>> Deploying $name..."
  (
    cd "$dir"
    railway up --service "$name" --detach
    # Set env vars
    for kv in "$@"; do
      railway variables set "$kv" --service "$name"
    done
  )
}

COMMON_VARS=(
  "DATABASE_URL=$DB_URL"
  "JWT_ACCESS_SECRET=$JWT_ACCESS"
  "JWT_REFRESH_SECRET=$JWT_REFRESH"
  "NODE_ENV=production"
)

# ── 4. Deploy auth-service ──────────────────────────────────
deploy_service "auth-service" "services/auth-service" \
  "${COMMON_VARS[@]}" \
  "PORT=3001"

AUTH_URL=$(railway service domain --service auth-service 2>/dev/null | head -1)
AUTH_URL="https://$AUTH_URL"

# ── 5. Deploy earnings-service ──────────────────────────────
deploy_service "earnings-service" "services/earnings-service" \
  "${COMMON_VARS[@]}" \
  "PORT=3002" "REDIS_URL=$REDIS_URL"

EARNINGS_URL="https://$(railway service domain --service earnings-service | head -1)"

# ── 6. Deploy grievance-service ─────────────────────────────
deploy_service "grievance-service" "services/grievance-service" \
  "${COMMON_VARS[@]}" \
  "PORT=3003"

GRIEVANCE_URL="https://$(railway service domain --service grievance-service | head -1)"

# ── 7. Deploy analytics-service ─────────────────────────────
deploy_service "analytics-service" "services/analytics-service" \
  "${COMMON_VARS[@]}" \
  "PORT=3004" "REDIS_URL=$REDIS_URL"

ANALYTICS_URL="https://$(railway service domain --service analytics-service | head -1)"

# ── 8. Deploy notification-service ──────────────────────────
deploy_service "notification-service" "services/notification-service" \
  "${COMMON_VARS[@]}" \
  "PORT=3005"

NOTIFY_URL="https://$(railway service domain --service notification-service | head -1)"

# ── 9. Deploy anomaly-service ──────────────────────────────
deploy_service "anomaly-service" "services/anomaly-service" \
  "DATABASE_URL=$DB_URL" \
  "MIN_HOURLY_RATE_PKR=150"

ANOMALY_URL="https://$(railway service domain --service anomaly-service | head -1)"

# ── 10. Deploy certificate-service ─────────────────────────
deploy_service "certificate-service" "services/certificate-service" \
  "DATABASE_URL=$DB_URL" \
  "JWT_ACCESS_SECRET=$JWT_ACCESS" \
  "CERT_EXPIRES_DAYS=365"

CERT_URL="https://$(railway service domain --service certificate-service | head -1)"

# ── 11. Deploy api-gateway (the single public entry point) ──
FIREBASE_ORIGIN="https://softec-webhackathon.web.app,https://softec-webhackathon.firebaseapp.com"
deploy_service "api-gateway" "services/api-gateway" \
  "JWT_ACCESS_SECRET=$JWT_ACCESS" \
  "CORS_ORIGIN=$FIREBASE_ORIGIN" \
  "AUTH_SERVICE_URL=$AUTH_URL" \
  "EARNINGS_SERVICE_URL=$EARNINGS_URL" \
  "GRIEVANCE_SERVICE_URL=$GRIEVANCE_URL" \
  "ANALYTICS_SERVICE_URL=$ANALYTICS_URL" \
  "NOTIFY_SERVICE_URL=$NOTIFY_URL" \
  "ANOMALY_SERVICE_URL=$ANOMALY_URL" \
  "CERT_SERVICE_URL=$CERT_URL"

GATEWAY_URL="https://$(railway service domain --service api-gateway | head -1)"

echo ""
echo "=== All services deployed! ==="
echo "Gateway:     $GATEWAY_URL"
echo "Anomaly:     $ANOMALY_URL"
echo "Certificate: $CERT_URL"
echo ""

# ── 12. Rebuild frontend with production URLs ────────────────
echo ">>> Rebuilding frontend with production API URLs..."
bash deploy.sh --prod "$GATEWAY_URL" "$CERT_URL"

echo ""
echo "✅ DONE!"
echo "   Frontend: https://softec-webhackathon.web.app"
echo "   Gateway:  $GATEWAY_URL"
echo "   Anomaly:  $ANOMALY_URL/api/v1/anomaly/detect  ← judges call this"
echo ""
echo "   JWT secrets saved (keep these safe):"
echo "   JWT_ACCESS_SECRET=$JWT_ACCESS"