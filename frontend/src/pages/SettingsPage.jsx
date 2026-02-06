import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/settings`).then((r) => r.json()).then(setSettings);
  }, []);

  if (!settings) return <div className="skeleton">Loading settings…</div>;

  return <section>
    <h2>Settings</h2>
    {settings.demoMode && <p className="demo-note">DEMO_MODE is enabled. Settings are read-only to keep demos safe and resettable.</p>}
    <div className="settings-grid">
      <label>Google Sheet ID<input disabled value={settings.googleSheetId} /></label>
      <label>Sheet Name<input disabled value={settings.sheetName} /></label>
      <label>Reminder Rules<input disabled value={settings.reminderRules.join(', ')} /></label>
      <label>Alert Channels<input disabled value={settings.alertChannels.join(' + ')} /></label>
    </div>
  </section>;
}
