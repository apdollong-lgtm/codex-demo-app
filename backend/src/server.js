import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config.js';
import { enrichItem, toCsv } from './utils.js';
import { addLog, getItems, getLogs, isDemoMode, resetDemoItems, saveItems } from './dataLayer.js';
import { demoSimulatedItems } from './demoData.js';
import { sendAlert } from './alerts.js';

const app = express();
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

function shouldTrigger(daysLeft) {
  return config.reminderRules.includes(daysLeft) || daysLeft < 0;
}

async function runAlertCheck(trigger = 'cron-daily') {
  const items = (await getItems()).map(enrichItem);
  for (const item of items) {
    if (item.status === 'DONE') continue;
    if (shouldTrigger(item.daysLeft)) {
      await sendAlert(item, trigger);
      item.lastNotifiedAt = new Date().toISOString();
      item.status = 'NOTIFIED';
      addLog({ type: 'STATUS', action: 'AUTO_NOTIFIED', itemId: item.itemId, itemName: item.itemName, details: `Triggered at ${item.daysLeft} day(s)` });
    }
  }
  await saveItems(items.map(({ daysLeft, severity, ...rest }) => rest));
}

app.get('/api/items', async (_req, res) => {
  try {
    const items = (await getItems()).map(enrichItem);
    const kpis = {
      expiring7: items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 7 && i.status !== 'DONE').length,
      expiring30: items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30 && i.status !== 'DONE').length,
      overdue: items.filter((i) => i.daysLeft < 0 && i.status !== 'DONE').length,
      notifiedToday: items.filter((i) => i.lastNotifiedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length
    };
    res.json({ demoMode: isDemoMode(), items, kpis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items/notify', async (req, res) => {
  const { itemId } = req.body;
  const items = await getItems();
  const idx = items.findIndex((i) => i.itemId === itemId);
  if (idx < 0) return res.status(404).json({ error: 'Item not found' });
  const enriched = enrichItem(items[idx]);
  await sendAlert(enriched, 'manual-test');
  items[idx].status = 'NOTIFIED';
  items[idx].lastNotifiedAt = new Date().toISOString();
  await saveItems(items);
  addLog({ type: 'STATUS', action: 'MANUAL_NOTIFY', itemId, itemName: items[idx].itemName, details: 'Manual test alert sent' });
  res.json({ ok: true });
});

app.post('/api/items/done', async (req, res) => {
  const { itemId } = req.body;
  const items = await getItems();
  const idx = items.findIndex((i) => i.itemId === itemId);
  if (idx < 0) return res.status(404).json({ error: 'Item not found' });
  items[idx].status = 'DONE';
  await saveItems(items);
  addLog({ type: 'STATUS', action: 'MARK_DONE', itemId, itemName: items[idx].itemName, details: 'Item completed' });
  res.json({ ok: true });
});

app.post('/api/items/simulate', async (_req, res) => {
  const items = await getItems();
  const newItems = demoSimulatedItems.map((x) => ({ ...x, itemId: `${x.itemId}-${Math.floor(Math.random() * 900 + 100)}` }));
  const updated = [...newItems, ...items];
  await saveItems(updated);
  addLog({ type: 'DATA', action: 'SIMULATE_ITEMS', itemId: '-', itemName: '-', details: `${newItems.length} records appended` });
  res.json({ ok: true, count: newItems.length });
});

app.get('/api/logs', (_req, res) => {
  const data = getLogs();
  if (_req.query.format === 'csv') {
    res.header('Content-Type', 'text/csv');
    return res.send(toCsv(data));
  }
  return res.json({ logs: data });
});

app.post('/api/reset', (_req, res) => {
  if (!isDemoMode()) return res.status(403).json({ error: 'Reset only allowed in DEMO_MODE' });
  resetDemoItems();
  addLog({ type: 'DATA', action: 'RESET_DEMO', itemId: '-', itemName: '-', details: 'Demo data reset' });
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: isDemoMode() ? 'DEMO_MODE' : 'REAL_MODE', timestamp: new Date().toISOString() });
});

app.get('/api/settings', (_req, res) => {
  res.json({
    demoMode: isDemoMode(),
    googleSheetId: config.google.sheetId || '(not configured)',
    sheetName: config.google.sheetName,
    reminderRules: config.reminderRules,
    alertChannels: ['LINE Notify', 'Email']
  });
});

cron.schedule('0 9 * * *', async () => {
  await runAlertCheck();
});

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
