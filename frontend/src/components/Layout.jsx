import { Link, Outlet } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/upstream', 'Upstream'],
  ['/midstream', 'Midstream'],
  ['/finished-goods', 'Finished Goods'],
  ['/alerts', 'Alerts']
];

export default function Layout() {
  return (
    <div className="layout">
      <aside>
        <h2>SoT Factory</h2>
        <nav>
          {links.map(([to, label]) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
          <a href="/api/reports/export.xlsx">Export Excel</a>
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
