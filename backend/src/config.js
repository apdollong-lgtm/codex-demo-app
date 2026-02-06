import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  demoMode: String(process.env.DEMO_MODE || 'true').toLowerCase() === 'true',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  google: {
    sheetId: process.env.GOOGLE_SHEET_ID || '',
    sheetName: process.env.GOOGLE_SHEET_NAME || 'expiry_items',
    credentialsJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
  },
  lineNotifyToken: process.env.LINE_NOTIFY_TOKEN || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
    to: process.env.ALERT_EMAIL_TO || ''
  },
  reminderRules: [30, 7, 0]
};

export function validateRealModeConfig() {
  const missing = [];
  if (!config.google.sheetId) missing.push('GOOGLE_SHEET_ID');
  if (!config.google.credentialsJson) missing.push('GOOGLE_SERVICE_ACCOUNT_JSON');
  return missing;
}
