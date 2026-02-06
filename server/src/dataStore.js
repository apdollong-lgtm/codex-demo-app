const DAY_MS = 24 * 60 * 60 * 1000;
const nowIso = () => new Date().toISOString();

const mkDate = (offsetDays) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

const baseItems = () => [
  { itemId: 'CTR-1001', itemName: 'Global Logistics Contract Renewal', category: 'Contract', owner: 'Procurement Team', dueDate: mkDate(-12), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'VISA-2042', itemName: 'Employee Work Permit - Ananya Singh', category: 'Visa/Work Permit', owner: 'HR Operations', dueDate: mkDate(2), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'CAL-7710', itemName: 'Torque Wrench Calibration', category: 'Calibration', owner: 'Quality Assurance', dueDate: mkDate(6), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'TRN-3005', itemName: 'Forklift Safety Training Certificate', category: 'Training', owner: 'EHS Coordinator', dueDate: mkDate(15), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'AUD-5588', itemName: 'Supplier ISO Audit Follow-up', category: 'Supplier Audit', owner: 'Vendor Management', dueDate: mkDate(28), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'FIRE-1180', itemName: 'Fire Extinguisher Inspection', category: 'Inspection', owner: 'Facility Manager', dueDate: mkDate(45), status: 'OPEN', lastNotifiedAt: null },
  { itemId: 'LIC-9009', itemName: 'Hazardous Material Handling License Renewal', category: 'License', owner: 'Compliance Lead', dueDate: mkDate(92), status: 'OPEN', lastNotifiedAt: null }
];

const severityFromDays = (daysLeft) => (daysLeft < 0 ? 'Overdue' : daysLeft <= 7 ? 'Critical' : daysLeft <= 30 ? 'Warning' : 'OK');
const withComputedFields = (item) => {
  const due = new Date(item.dueDate);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((due.getTime() - start.getTime()) / DAY_MS);
  return { ...item, daysLeft, severity: severityFromDays(daysLeft) };
};

const createStore = () => {
  const seed = () => {
    const seeded = baseItems();
    items = seeded.map(withComputedFields);
    logs = seeded.map((it) => ({ id: `${Date.now()}-${Math.random()}`, timestamp: nowIso(), itemId: it.itemId, itemName: it.itemName, eventType: 'created', message: `Item ${it.itemId} loaded in demo dataset`, status: 'success' }));
  };

  let items = [];
  let logs = [];
  seed();

  const appendLog = (entry) => logs.unshift({ id: `${Date.now()}-${Math.random()}`, timestamp: nowIso(), ...entry });
  const find = (id) => items.find((i) => i.itemId === id);

  return {
    getItems: () => items.map(withComputedFields),
    getLogs: () => logs,
    reset: seed,
    markNotified: (id) => {
      const item = find(id);
      if (!item) return null;
      item.status = 'NOTIFIED';
      item.lastNotifiedAt = nowIso();
      appendLog({ itemId: item.itemId, itemName: item.itemName, eventType: 'alert_sent', message: `Test alert sent for ${item.itemId}`, status: 'success' });
      return withComputedFields(item);
    },
    markDone: (id) => {
      const item = find(id);
      if (!item) return null;
      item.status = 'DONE';
      appendLog({ itemId: item.itemId, itemName: item.itemName, eventType: 'status_changed', message: `${item.itemId} marked as DONE`, status: 'success' });
      return withComputedFields(item);
    },
    simulate: () => {
      const sample = { itemId: `SIM-${Math.floor(Math.random() * 9000 + 1000)}`, itemName: 'Temporary Contractor Badge Renewal', category: 'License', owner: 'Site Security', dueDate: mkDate(5), status: 'OPEN', lastNotifiedAt: null };
      const item = withComputedFields(sample);
      items.unshift(item);
      appendLog({ itemId: item.itemId, itemName: item.itemName, eventType: 'created', message: `${item.itemId} added via simulation`, status: 'success' });
      return [item];
    },
    error: (msg) => appendLog({ itemId: 'SYSTEM', itemName: 'System', eventType: 'error', message: msg, status: 'error' })
  };
};

module.exports = { createStore };
