import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function MidstreamPage() {
  const [issues, setIssues] = useState([]);
  const [cooking, setCooking] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tables/Production_Issue'),
      api.get('/tables/Cooking_Batch')
    ]).then(([pi, cb]) => {
      setIssues(pi.data);
      setCooking(cb.data);
    });
  }, []);

  return (
    <div>
      <h1>Midstream Flow</h1>
      <h3>Production Issues</h3>
      <ul>{issues.map((p) => <li key={p.id}>{p.recipeCode} · planned kettles {p.planKettleCount} · required sugar {p.requiredSugarKg}kg</li>)}</ul>
      <h3>Cooking Batches</h3>
      <ul>{cooking.map((b) => <li key={b.id}>{b.id} · yield {b.yieldPercent.toFixed(1)}% · real cost/kg {b.realCostPerKg.toFixed(2)}</li>)}</ul>
    </div>
  );
}
