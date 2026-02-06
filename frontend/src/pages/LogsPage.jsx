import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetch(`${API}/api/logs`).then((r) => r.json()).then((d) => setLogs(d.logs || []));
  }, []);

  const filtered = logs.filter((l) => JSON.stringify(l).toLowerCase().includes(keyword.toLowerCase()));

  return <section>
    <h2>Activity Log</h2>
    <div className="actions-row">
      <input placeholder="Filter logs" onChange={(e) => setKeyword(e.target.value)} />
      <a href={`${API}/api/logs?format=csv`} target="_blank">Export CSV</a>
    </div>
    <div className="table-wrap"><table><thead><tr><th>Time</th><th>Type</th><th>Action</th><th>ItemID</th><th>ItemName</th><th>Details</th></tr></thead>
    <tbody>{filtered.map((l) => <tr key={l.id}><td>{new Date(l.at).toLocaleString()}</td><td>{l.type}</td><td>{l.action}</td><td>{l.itemId}</td><td>{l.itemName}</td><td>{l.details}</td></tr>)}</tbody></table></div>
  </section>;
}
