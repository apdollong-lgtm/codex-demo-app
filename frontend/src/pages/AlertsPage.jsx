import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  const refresh = () => api.post('/alerts/refresh').then(() => api.get('/tables/Alerts_Log').then((res) => setAlerts(res.data)));

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <h1>Alerts</h1>
      <button onClick={refresh}>Refresh Alerts</button>
      <ul>
        {alerts.map((a) => (
          <li key={a.id || a.message}><strong>{a.type}</strong> - {a.message} ({a.level})</li>
        ))}
      </ul>
    </div>
  );
}
