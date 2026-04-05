# Pander Game Server

Lightweight coordination server for multiplayer rap battles.

## Local Development

```bash
cd server
npm install
npm run dev
```

Server runs on http://localhost:3100

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 3100 local, 8080 on Cloud Run) | No |
| `DISCORD_BOT_TOKEN` | Discord bot token for posting challenge links | For Discord |
| `DISCORD_CHANNEL_ID` | Discord channel ID for the "turkey" channel | For Discord |
| `CLIENT_ORIGIN` | Allowed CORS origin (default: http://localhost:3000) | For production |

## Deploy to GCP Cloud Run (Free Tier)

```bash
# One-time setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
cd server
gcloud run deploy pander-server \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "CLIENT_ORIGIN=https://your-app-domain.com" \
  --set-env-vars "DISCORD_BOT_TOKEN=your-bot-token" \
  --set-env-vars "DISCORD_CHANNEL_ID=your-channel-id"
```

Then set `VITE_SERVER_URL` in the client's `.env` to the Cloud Run URL.

## Discord Bot Setup

1. Go to https://discord.com/developers/applications/1490086176864993471
2. Click "Bot" in the sidebar → "Add Bot"
3. Copy the bot token → set as `DISCORD_BOT_TOKEN`
4. Under OAuth2 → URL Generator, select `bot` scope with `Send Messages` permission
5. Use the generated URL to invite the bot to your server
6. Get the "turkey" channel ID (right-click channel → Copy Channel ID with developer mode on)
