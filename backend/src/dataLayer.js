import { google } from 'googleapis';
import { config, validateRealModeConfig } from './config.js';
import { demoSeedItems } from './demoData.js';

let demoItems = structuredClone(demoSeedItems);
let logs = [];

function getSheetsClient() {
  const creds = JSON.parse(config.google.credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

async function readGoogleItems() {
  const missing = validateRealModeConfig();
  if (missing.length) {
    throw new Error(`REAL_MODE config missing: ${missing.join(', ')}`);
  }
  const sheets = getSheetsClient();
  const range = `${config.google.sheetName}!A2:G`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: config.google.sheetId, range });
  const rows = res.data.values || [];
  return rows.map((r) => ({
    itemId: r[0] || '',
    itemName: r[1] || '',
    category: r[2] || '',
    owner: r[3] || '',
    dueDate: r[4] || '',
    status: r[5] || 'OPEN',
    lastNotifiedAt: r[6] || ''
  }));
}

async function writeGoogleItems(items) {
  const sheets = getSheetsClient();
  const range = `${config.google.sheetName}!A2:G`;
  const values = items.map((i) => [i.itemId, i.itemName, i.category, i.owner, i.dueDate, i.status, i.lastNotifiedAt || '']);
  await sheets.spreadsheets.values.clear({ spreadsheetId: config.google.sheetId, range });
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.google.sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

export async function getItems() {
  return config.demoMode ? demoItems : readGoogleItems();
}

export async function saveItems(items) {
  if (config.demoMode) demoItems = items;
  else await writeGoogleItems(items);
}

export function resetDemoItems() {
  demoItems = structuredClone(demoSeedItems);
  logs = [];
}

export function isDemoMode() {
  return config.demoMode;
}

export function addLog(entry) {
  logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), ...entry });
}

export function getLogs() {
  return logs;
}
