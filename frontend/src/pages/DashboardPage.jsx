import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Production Dashboard</h1>
      <div className="card-grid">
        <article className="card"><h3>MX Inventory</h3><p>{data.inventoryByProcess.mx.toFixed(2)} kg</p></article>
        <article className="card"><h3>Finished Goods</h3><p>{data.inventoryByProcess.finishedGoods.toFixed(2)} kg</p></article>
        <article className="card"><h3>Open Alerts</h3><p>{data.overdueAlerts.length}</p></article>
      </div>
      <section className="table-wrap">
        <h3>Yield Trend</h3>
        <table><thead><tr><th>Date</th><th>Yield %</th></tr></thead><tbody>{data.yieldTrend.map((y, i) => <tr key={i}><td>{new Date(y.date).toLocaleDateString()}</td><td>{y.yieldPercent.toFixed(2)}</td></tr>)}</tbody></table>
      </section>
      <section className="table-wrap">
        <h3>Loss Analysis</h3>
        <table><thead><tr><th>Batch</th><th>Loss kg</th></tr></thead><tbody>{data.lossAnalysis.map((l) => <tr key={l.batchId}><td>{l.batchId}</td><td>{l.lossKg.toFixed(2)}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
