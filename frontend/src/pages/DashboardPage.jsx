import { useEffect, useMemo, useState } from 'react';
import KpiCards from '../components/KpiCards';
import Toast from '../components/Toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState({});
  const [filters, setFilters] = useState({ category: '', severity: '', status: '', search: '', from: '', to: '' });
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/items`);
    const data = await res.json();
    setRows(data.items || []);
    setKpis(data.kpis || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filters.category && r.category !== filters.category) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.search && !`${r.itemId} ${r.itemName} ${r.owner}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.from && r.dueDate < filters.from) return false;
    if (filters.to && r.dueDate > filters.to) return false;
    return true;
  }), [rows, filters]);

  const doAction = async (url, body, message) => {
    await fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    setToast({ type: 'info', message });
    setTimeout(() => setToast(null), 2500);
    load();
  };

  const categories = [...new Set(rows.map((r) => r.category))];

  return <section>
    <h2>Expiry Dashboard</h2>
    <KpiCards kpis={kpis} />
    <div className="actions-row">
      <button onClick={() => doAction('/api/items/simulate', {}, 'Simulated items added')}>Simulate New Items</button>
      <button onClick={() => doAction('/api/reset', {}, 'Demo reset done')}>Reset Demo</button>
    </div>
    <div className="filters">
      <input placeholder="Search" onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
      <select onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
      <select onChange={(e) => setFilters({ ...filters, severity: e.target.value })}><option value="">All severity</option>{['OK', 'Warning', 'Critical', 'Overdue'].map((s) => <option key={s}>{s}</option>)}</select>
      <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All status</option>{['OPEN', 'NOTIFIED', 'DONE'].map((s) => <option key={s}>{s}</option>)}</select>
      <input type="date" onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
      <input type="date" onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
    </div>
    {loading ? <div className="skeleton">Loading dashboard data…</div> : <div className="table-wrap"><table><thead><tr><th>ItemID</th><th>ItemName</th><th>Category</th><th>Owner</th><th>DueDate</th><th>DaysLeft</th><th>Severity</th><th>Status</th><th>LastNotifiedAt</th><th>Actions</th></tr></thead>
      <tbody>{filtered.map((r) => <tr key={r.itemId}><td>{r.itemId}</td><td>{r.itemName}</td><td>{r.category}</td><td>{r.owner}</td><td>{r.dueDate}</td><td>{r.daysLeft}</td><td><span className={`badge ${r.severity.toLowerCase()}`}>{r.severity}</span></td><td>{r.status}</td><td>{r.lastNotifiedAt ? new Date(r.lastNotifiedAt).toLocaleString() : '-'}</td><td><button onClick={() => doAction('/api/items/notify', { itemId: r.itemId }, `Alert sent for ${r.itemId}`)}>Send Test Alert</button><button onClick={() => doAction('/api/items/done', { itemId: r.itemId }, `Marked ${r.itemId} done`)}>Mark Done</button></td></tr>)}</tbody></table></div>}
    <Toast toast={toast} />
  </section>;
}
