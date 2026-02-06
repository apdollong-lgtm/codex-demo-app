export default function KpiCards({ kpis }) {
  const cards = [
    ['Expiring in 7 days', kpis.expiring7],
    ['Expiring in 30 days', kpis.expiring30],
    ['Overdue', kpis.overdue],
    ['Notified Today', kpis.notifiedToday]
  ];
  return <div className="kpis">{cards.map(([l, v]) => <article key={l} className="card"><h4>{l}</h4><p>{v ?? 0}</p></article>)}</div>;
}
