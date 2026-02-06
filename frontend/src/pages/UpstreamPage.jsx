import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function UpstreamPage() {
  const [rawfish, setRawfish] = useState([]);
  const [mixing, setMixing] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tables/Rawfish_SoT'),
      api.get('/tables/MixingBatch_SoT')
    ]).then(([rf, mx]) => {
      setRawfish(rf.data);
      setMixing(mx.data);
    });
  }, []);

  return (
    <div>
      <h1>Upstream Flow</h1>
      <h3>Rawfish SoT</h3>
      <ul>{rawfish.map((r) => <li key={r.id}>{r.lotCode} · {r.weightKg}kg · cost/kg {r.costPerKg.toFixed(2)}</li>)}</ul>
      <h3>Mixing Batches</h3>
      <ul>{mixing.map((m) => <li key={m.id}>{m.mxLotCode} · yield {m.yieldPercent.toFixed(1)}% · WAC {m.weightedAvgCost.toFixed(2)}</li>)}</ul>
    </div>
  );
}
