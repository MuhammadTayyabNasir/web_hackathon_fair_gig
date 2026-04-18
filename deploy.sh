#!/usr/bin/env bash
# FairGig — deploy frontend to Firebase Hosting
# Usage: bash deploy.sh [--prod GATEWAY_URL CERT_URL]
set -e

GATEWAY_URL="${2:-http://localhost:3000}"
CERT_URL="${3:-http://localhost:8002}"

echo "=== FairGig Deploy ==="
echo "Gateway : $GATEWAY_URL"
echo "Cert URL: $CERT_URL"

# 1. Write production env
cat > frontend/.env.production <<EOF
VITE_API_URL=$GATEWAY_URL
VITE_CERT_URL=$CERT_URL
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=softec-webhackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=softec-webhackathon
VITE_FIREBASE_STORAGE_BUCKET=softec-webhackathon.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=637288641249
VITE_FIREBASE_APP_ID=1:637288641249:web:aa7a3608fd415f22bdbda0
EOF

# 2. Build frontend
echo ">>> Building frontend..."
(cd frontend && npm run build)

# 3. Deploy to Firebase Hosting
echo ">>> Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Frontend live at: https://softec-webhackathon.web.app"
echo "✅ Also at:          https://softec-webhackathon.firebaseapp.com"
