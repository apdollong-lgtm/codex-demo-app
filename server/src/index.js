const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { createStore } = require('./dataStore');

const port = Number(process.env.PORT || 4000);
const DEMO_MODE = (process.env.DEMO_MODE || 'true').toLowerCase() === 'true';
const store = createStore();
const webRoot = path.resolve(__dirname, '../../web');

const requiredRealVars = ['GOOGLE_SHEET_ID', 'GOOGLE_SHEET_NAME', 'LINE_NOTIFY_TOKEN'];
const realModeError = () => {
  const missing = requiredRealVars.filter((key) => !process.env[key]);
  return missing.length ? `Real mode misconfigured. Missing: ${missing.join(', ')}` : null;
};

const summarize = (items, logs) => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalItems: items.length,
    expiringIn7Days: items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 7 && i.status !== 'DONE').length,
    expiringIn30Days: items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30 && i.status !== 'DONE').length,
    overdue: items.filter((i) => i.daysLeft < 0 && i.status !== 'DONE').length,
    notifiedToday: logs.filter((l) => l.eventType === 'alert_sent' && l.timestamp.startsWith(today)).length
  };
};

const send = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

const serveFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return send(res, 404, { error: 'Not found' });
    const ext = path.extname(filePath);
    const type = ext === '.css' ? 'text/css' : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    const err = !DEMO_MODE ? realModeError() : null;
    return err ? send(res, 500, { ok: false, mode: 'real', error: err }) : send(res, 200, { ok: true, mode: DEMO_MODE ? 'demo' : 'real' });
  }

  if (pathname === '/api/items' && req.method === 'GET') {
    if (!DEMO_MODE) {
      const err = realModeError();
      return send(res, err ? 500 : 501, { error: err || 'Real mode placeholder: connect Google Sheets retrieval.' });
    }
    const items = store.getItems();
    return send(res, 200, { items, kpis: summarize(items, store.getLogs()) });
  }

  if (pathname === '/api/items/simulate' && req.method === 'POST') return DEMO_MODE ? send(res, 201, { created: store.simulate() }) : send(res, 400, { error: 'Simulation only in DEMO_MODE.' });
  if (pathname === '/api/reset' && req.method === 'POST') return DEMO_MODE ? (store.reset(), send(res, 200, { message: 'Demo reset complete.' })) : send(res, 400, { error: 'Reset only in DEMO_MODE.' });
  if (pathname === '/api/logs' && req.method === 'GET') return send(res, 200, { logs: store.getLogs() });

  const notifyMatch = pathname.match(/^\/api\/items\/([^/]+)\/notify$/);
  if (notifyMatch && req.method === 'POST') {
    if (!DEMO_MODE) return send(res, 501, { error: 'Real notify placeholder.' });
    const item = store.markNotified(notifyMatch[1]);
    if (!item) {
      store.error(`Alert failed for ${notifyMatch[1]}`);
      return send(res, 404, { error: 'Item not found' });
    }
    return send(res, 200, { item });
  }

  const doneMatch = pathname.match(/^\/api\/items\/([^/]+)\/done$/);
  if (doneMatch && req.method === 'POST') {
    const item = store.markDone(doneMatch[1]);
    return item ? send(res, 200, { item }) : send(res, 404, { error: 'Item not found' });
  }

  if (pathname === '/styles.css') return serveFile(res, path.join(webRoot, 'styles.css'));
  if (['/', '/dashboard', '/logs', '/settings'].includes(pathname)) return serveFile(res, path.join(webRoot, 'index.html'));

  send(res, 404, { error: 'Not found' });
});

server.listen(port, () => console.log(`Server running on ${port} in ${DEMO_MODE ? 'DEMO_MODE' : 'REAL_MODE'}`));
