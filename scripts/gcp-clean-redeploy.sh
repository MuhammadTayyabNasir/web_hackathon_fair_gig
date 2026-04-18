#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/web_hackathon_fair_gig}"
DOMAIN="${DOMAIN:-}"
RESET_DB="${RESET_DB:-0}"
FIREBASE_API_KEY_INPUT="${VITE_FIREBASE_API_KEY:-}"

if [ ! -d "$APP_DIR" ]; then
  echo "APP_DIR does not exist: $APP_DIR"
  echo "Clone repo first, e.g. git clone <repo-url> $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

resolve_firebase_api_key() {
  local key_from_file=""
  if [ -f "frontend/.env.production" ]; then
    key_from_file="$(grep -E '^VITE_FIREBASE_API_KEY=' frontend/.env.production | head -1 | cut -d'=' -f2-)"
  fi

  if [ -n "$FIREBASE_API_KEY_INPUT" ]; then
    echo "$FIREBASE_API_KEY_INPUT"
    return
  fi

  if [ -n "$key_from_file" ]; then
    echo "$key_from_file"
    return
  fi

  echo ""
}

FIREBASE_API_KEY="$(resolve_firebase_api_key)"

if [ -z "$FIREBASE_API_KEY" ]; then
  echo "ERROR: Firebase API key is missing."
  echo "Set it before deploy, for example:"
  echo "  export VITE_FIREBASE_API_KEY='AIza...'
  "
  echo "or add VITE_FIREBASE_API_KEY=... in frontend/.env.production"
  exit 1
fi

echo "[1/8] Installing Docker + compose plugin if missing..."
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER" || true
fi

echo "[2/8] Cleaning previous failed deployment state..."
docker compose down --remove-orphans || true
docker compose -f docker-compose.yml -f docker-compose.gcp.yml down --remove-orphans || true

if [ "$RESET_DB" = "1" ]; then
  echo "[3/8] Resetting database and reapplying schema/seed..."
  docker compose up -d postgres
  docker compose exec -T postgres psql -U fairgig -d fairgig -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  docker compose exec -T postgres psql -U fairgig -d fairgig < schema.sql
  docker compose exec -T postgres psql -U fairgig -d fairgig < seed.sql
else
  echo "[3/8] Starting DB/cache only..."
  docker compose up -d postgres redis
fi

echo "[4/8] Building frontend for same-origin deployment..."
cat > frontend/.env.production <<EOF
VITE_API_URL=/
VITE_AUTH_API_URL=/
VITE_CERT_URL=
VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=softec-webhackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=softec-webhackathon
VITE_FIREBASE_STORAGE_BUCKET=softec-webhackathon.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=637288641249
VITE_FIREBASE_APP_ID=1:637288641249:web:aa7a3608fd415f22bdbda0
EOF

docker run --rm -v "$APP_DIR/frontend:/app" -w /app node:20-alpine sh -lc "npm ci && npm run build"

echo "[5/8] Preparing reverse proxy config..."
mkdir -p deploy
if [ -n "$DOMAIN" ]; then
  cat > deploy/Caddyfile <<EOF
$DOMAIN {
  encode zstd gzip
  root * /srv

  handle /api/* {
    reverse_proxy api-gateway:3000
  }

  handle /cert/* {
    reverse_proxy api-gateway:3000
  }

  handle {
    try_files {path} /index.html
    file_server
  }
}
EOF
else
  cat > deploy/Caddyfile <<EOF
:80 {
  encode zstd gzip
  root * /srv

  handle /api/* {
    reverse_proxy api-gateway:3000
  }

  handle /cert/* {
    reverse_proxy api-gateway:3000
  }

  handle {
    try_files {path} /index.html
    file_server
  }
}
EOF
fi

echo "[6/8] Starting backend services..."
docker compose up -d --build auth-service earnings-service grievance-service analytics-service notification-service anomaly-service certificate-service api-gateway

echo "[7/8] Starting Caddy (frontend + proxy)..."
docker compose -f docker-compose.yml -f docker-compose.gcp.yml up -d caddy

echo "[8/8] Health checks..."
for url in \
  "http://localhost:3000/health" \
  "http://localhost:8001/api/v1/anomaly/health"; do
  echo "Checking $url"
  curl -fsS "$url" >/dev/null
  echo "OK: $url"
done

echo ""
echo "Deployment complete."
if [ -n "$DOMAIN" ]; then
  echo "Open: https://$DOMAIN"
else
  echo "Open: http://$(curl -s ifconfig.me)"
fi
