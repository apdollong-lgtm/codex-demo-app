# ExpiryGuard Web App (Demo + Real Mode)

Production-ready full-stack expiry alert platform with a SaaS-style UI.

## One-command local run

```bash
npm install
npm run install:all
cp .env.example backend/.env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/health`

## Demo Mode (default)

- `DEMO_MODE=true` (already in `.env.example`)
- Uses in-memory mock dataset
- Supports simulate data + reset demo
- Settings are read-only for safe demos

## Real Mode Setup

1. Set `DEMO_MODE=false` in `backend/.env`
2. Fill Google Sheets credentials:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_NAME`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
3. Configure alert channels:
   - `LINE_NOTIFY_TOKEN` for LINE Notify
   - SMTP values for email
4. Ensure your Google Sheet columns `A:G` contain:
   `itemId,itemName,category,owner,dueDate,status,lastNotifiedAt`

If required config is missing in Real Mode, API returns clear error messages.

## API Endpoints

- `GET /api/items`
- `POST /api/items/notify`
- `POST /api/items/done`
- `POST /api/items/simulate`
- `GET /api/logs`
- `POST /api/reset`
- `GET /api/health`

## Alert Engine

- Daily cron-like scheduler (`0 9 * * *`)
- Triggers alerts at `DaysLeft = 30, 7, 0` and overdue
- Full audit events available in Activity Log

## Deployment readiness

- Frontend/backend separated projects
- Root scripts include `npm run install:all` and `npm run dev`
- Compatible with container/cloud deployment (set env vars per environment)
