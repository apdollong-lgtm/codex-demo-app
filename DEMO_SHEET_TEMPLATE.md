# Recommended Google Sheet Template

Use one worksheet (e.g., `ExpiryTracker`) with these columns:

| Column | Required | Description | Example |
|---|---|---|---|
| ItemID | Yes | Unique identifier | CTR-1001 |
| ItemName | Yes | Name of contract/certificate/license | Global Logistics Contract Renewal |
| Category | Yes | Contract, Visa/Work Permit, Calibration, Training, etc. | Training |
| Owner | Yes | Team/person responsible | HR Operations |
| DueDate | Yes | ISO date (`YYYY-MM-DD`) | 2026-02-28 |
| Status | Yes | OPEN / NOTIFIED / DONE | OPEN |
| LastNotifiedAt | No | Last alert timestamp (ISO datetime) | 2026-02-01T08:30:00Z |

Backend computes:
- `DaysLeft`
- `Severity` (OK / Warning / Critical / Overdue)
