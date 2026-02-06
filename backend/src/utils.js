export function calculateDaysLeft(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

export function getSeverity(daysLeft) {
  if (daysLeft < 0) return 'Overdue';
  if (daysLeft <= 0) return 'Critical';
  if (daysLeft <= 7) return 'Critical';
  if (daysLeft <= 30) return 'Warning';
  return 'OK';
}

export function enrichItem(item) {
  const daysLeft = calculateDaysLeft(item.dueDate);
  return { ...item, daysLeft, severity: getSeverity(daysLeft) };
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((h) => esc(row[h])).join(','))].join('\n');
}
