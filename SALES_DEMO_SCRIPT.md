# 2-Minute Sales Demo Script

1. **Landing page** (`/`)
   - Introduce: "Expiry Alert System"
   - Highlight pain point and sections (Problem → Solution → How it works → Use cases).
   - Click **Try Demo**.

2. **Dashboard overview** (`/dashboard`)
   - Show KPI cards: total items, expiring soon, overdue, notified today.
   - Apply quick filters (e.g., Category = Visa/Work Permit, Severity = Critical).
   - Use Search to find an owner.

3. **Operational actions**
   - Click **Send test alert** on an item (shows toast + status updates to NOTIFIED).
   - Click **Mark as DONE** for completed compliance tasks.
   - Click **Simulate new items** to show live incoming records.

4. **Governance & auditability** (`/logs`)
   - Open Activity Log and show created/status_changed/alert_sent/error records.
   - Filter by Success/Error and export CSV for reporting.

5. **Deployment readiness** (`/settings`)
   - Show read-only integration settings in DEMO_MODE.
   - Click **Copy sample config** to show easy real-mode handoff.

Close with: "This demo works out-of-the-box today; production mode simply plugs into your Google Sheet and alert channel."
