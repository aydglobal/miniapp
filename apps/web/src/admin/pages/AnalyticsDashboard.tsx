import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/adminApi';

interface MetricPoint { date: string; dau: number; newUsers: number; revenue: number; arpu: number; }
interface Anomaly { metric: string; drop: number; alert: string; }

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(7);
  const [trend, setTrend] = useState<MetricPoint[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [trendRes, anomalyRes] = await Promise.all([
        adminFetch<{ data: MetricPoint[] }>(`/admin/analytics/metrics?days=${days}`),
        adminFetch<{ data: Anomaly[] }>('/admin/analytics/anomalies')
      ]);
      setTrend(trendRes.data);
      setAnomalies(anomalyRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2>Analytics Dashboard</h2>

      <div style={{ marginBottom: 16 }}>
        <label>Son </label>
        <select value={days} onChange={e => setDays(Number(e.target.value))}>
          {[7, 14, 30].map(d => <option key={d} value={d}>{d} gün</option>)}
        </select>
      </div>

      {anomalies.length > 0 && (
        <div style={{ background: '#ff3c0033', border: '1px solid #ff3c00', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <strong>⚠️ Anomali Uyarıları</strong>
          {anomalies.map((a, i) => <p key={i}>{a.alert}</p>)}
        </div>
      )}

      {loading ? <p>Yükleniyor...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Tarih</th><th>DAU</th><th>Yeni Kullanıcı</th><th>Gelir</th><th>ARPU</th></tr>
          </thead>
          <tbody>
            {trend.map(row => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.dau}</td>
                <td>{row.newUsers}</td>
                <td>{row.revenue}</td>
                <td>{row.arpu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
