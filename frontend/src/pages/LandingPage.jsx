import { Link } from 'react-router-dom';

const useCases = ['Contracts', 'Calibration', 'Visas', 'Training', 'Licenses', 'Stock Expiry'];

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="hero">
        <h2>Never Miss an Expiry Deadline Again</h2>
        <p>ExpiryGuard centralizes all expiry items, runs daily checks, and sends actionable alerts via LINE Notify and Email.</p>
        <Link className="cta" to="/dashboard">Try Demo</Link>
      </section>
      <section>
        <h3>Use Cases</h3>
        <div className="chips">{useCases.map((u) => <span key={u}>{u}</span>)}</div>
      </section>
      <section className="flow">
        <h3>How it Works</h3>
        <div className="flow-grid">
          <div>1. Source of Truth<br/>Google Sheets / Demo Data</div>
          <div>2. Alert Engine<br/>Daily cron checks (30/7/0/overdue)</div>
          <div>3. Action Console<br/>Dashboard + Audit Log + Exports</div>
        </div>
      </section>
    </div>
  );
}
