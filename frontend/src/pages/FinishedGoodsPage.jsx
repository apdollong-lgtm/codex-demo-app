import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function FinishedGoodsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/tables/Finished_Goods_Ledger').then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h1>Finished Goods Ledger</h1>
      <table>
        <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Balance</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td>{r.productCode}</td>
              <td>{r.eventType}</td>
              <td>{r.qtyKg}</td>
              <td>{r.balanceKg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
