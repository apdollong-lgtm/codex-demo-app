import nodemailer from 'nodemailer';
import { config } from './config.js';
import { addLog } from './dataLayer.js';

async function sendLineNotify(message) {
  if (!config.lineNotifyToken) return { ok: false, reason: 'LINE_NOTIFY_TOKEN missing' };
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.lineNotifyToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ message })
  });
  return { ok: res.ok, reason: res.ok ? 'sent' : `LINE error ${res.status}` };
}

async function sendEmail(subject, text) {
  const { host, port, user, pass, from, to } = config.smtp;
  if (!host || !user || !pass || !from || !to) return { ok: false, reason: 'SMTP config missing' };
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({ from, to, subject, text });
  return { ok: true, reason: 'sent' };
}

export async function sendAlert(item, reason = 'manual-test') {
  const message = `[Expiry Alert] ${item.itemName} (${item.itemId}) is ${item.daysLeft} day(s) left. Due ${item.dueDate}.`;
  const results = await Promise.allSettled([
    sendLineNotify(message),
    sendEmail(`Expiry Alert - ${item.itemId}`, message)
  ]);

  addLog({ type: 'ALERT', action: reason, itemId: item.itemId, itemName: item.itemName, details: JSON.stringify(results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, reason: r.reason?.message || 'unknown' }))) });
  return results;
}
