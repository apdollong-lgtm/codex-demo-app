# Production Management System (SoT Architecture)

A full-stack demo + production-ready template that follows Source of Truth architecture:

- Each process has dedicated SoT table
- Ledger-style stock movements
- Derived calculations only from SoT records
- Full audit trail per transaction

## Project structure

- `backend/` Express API + calculation engine + SoT storage
- `frontend/` React + responsive dashboard UI
- `backend/src/data/demoSeed.js` mock factory data for demo mode
- `backend/src/services/storage.js` demo mode (in-memory) and real mode (SQLite)

## Core SoT tables

- Rawfish_SoT
- Rawfish_Inventory_Ledger
- MixingBatch_SoT
- MX_Inventory_Ledger
- Recipe_Master
- Production_Issue
- Cooking_Batch
- Finished_Goods_Ledger
- Orders
- Alerts_Log
- Audit_Log

## Workflows implemented

### 1) Upstream
Rawfish receiving -> Mixing batch -> MX inventory ledger

Auto-calc:
- cost/kg = total cost / weight
- weighted average cost from mixing lines
- yield% and loss kg

### 2) Midstream
Recipe master -> Production issue -> Cooking batch

Auto-calc:
- planned vs actual requirements
- yield%
- loss kg
- real production cost/kg

### 3) Finished goods
- IN from cooking
- OUT from orders
- running balance in Finished_Goods_Ledger

### 4) Alert system
- expiry alert
- low stock alert
- abnormal yield alert (< 85%)

### 5) Dashboard
- inventory balance by process
- real cost per product/batch
- yield trend
- loss analysis
- overdue/open alerts

## Modes

### Demo mode (default)
- Uses in-memory seed data from `demoSeed.js`
- No setup needed

### Real mode
- Uses SQLite persistence
- Set env:

```bash
APP_MODE=real
DB_FILE=./backend/data/production.db
```

## Run

```bash
npm install
npm run dev
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## API highlights

- `GET /api/dashboard`
- `GET /api/tables/:name`
- `POST /api/rawfish`
- `POST /api/mixing-batches`
- `POST /api/production-issues`
- `POST /api/cooking-batches`
- `POST /api/orders`
- `POST /api/alerts/refresh`
- `GET /api/reports/export.xlsx`

## Audit logging

Every transactional endpoint writes to `Audit_Log` with timestamp, action, and payload.

## Excel export

`GET /api/reports/export.xlsx` exports all SoT and ledger tables into workbook sheets.
