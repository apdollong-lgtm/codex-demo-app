# Expiry Alert System — Sales Demo

A client-ready sales demo with a polished UI and a self-contained `DEMO_MODE` backend.

## One-command local run
```bash
npm run install:all
npm run dev
```
- App + API: http://localhost:4000

## Demo mode (default)
`DEMO_MODE=true` is the default. In demo mode:
- Uses in-memory mock dataset and activity logs
- No Google Sheets or LINE token required
- Supports simulation/reset and test alert actions safely

## Real mode setup (placeholders)
Run in real mode by providing environment variables:
```bash
DEMO_MODE=false \
GOOGLE_SHEET_ID=your-google-sheet-id \
GOOGLE_SHEET_NAME=ExpiryTracker \
LINE_NOTIFY_TOKEN=your-line-notify-token \
npm run dev
```

If `DEMO_MODE=false` and required env vars are missing, APIs return clear configuration errors. Real connectors remain placeholders and should be implemented in backend service logic.

## Available endpoints
- `GET /api/items`
- `POST /api/items/simulate`
- `POST /api/items/:id/notify`
- `POST /api/items/:id/done`
- `POST /api/reset`
- `GET /api/logs`
- `GET /api/health`
