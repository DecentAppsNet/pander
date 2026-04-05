#!/usr/bin/env bash
set -euo pipefail

# Load bot token from root .env if available
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

if [ -z "${DISCORD_BOT_TOKEN:-}" ]; then
  echo "Error: DISCORD_BOT_TOKEN not set. Add it to .env or export it."
  exit 1
fi

DISCORD_CHANNEL_ID="1490106415472443584"
CLIENT_ORIGIN="https://santyx.co,https://storage.googleapis.com"
PROJECT="turkey-666"
REGION="us-central1"
SERVICE_NAME="pander-server"

echo "Deploying $SERVICE_NAME to Cloud Run ($REGION)..."

cd "$SCRIPT_DIR"
gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "^|^CLIENT_ORIGIN=$CLIENT_ORIGIN|DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN|DISCORD_CHANNEL_ID=$DISCORD_CHANNEL_ID" \
  --timeout=3600 \
  --session-affinity

echo ""
echo "Done! Update VITE_SERVER_URL in .env with the Cloud Run URL above."
