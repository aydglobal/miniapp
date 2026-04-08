import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/adminApi';

interface FraudCase {
  id: string;
  userId: string;
  riskType: string;
  score: number;
  status: string;
  title: string;
  detectedAt: string;
}

export default function FraudManagementPage() {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ cases: FraudCase[] }>('/admin/fraud/cases');
      setCases(res.cases ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Askıya alma sebebi:');
    if (!reason) return;
    await adminFetch(`/admin/fraud/suspend/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    load();
  };

  const handleResolve = async (id: string) => {
    await adminFetch(`/admin/fraud/cases/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status: 'resolved' })
    });
    load();
  };

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2>Fraud Yönetimi</h2>

      {loading ? <p>Yükleniyor...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Başlık</th><th>Risk Tipi</th><th>Skor</th><th>Durum</th><th>Tarih</th><th>İşlem</th></tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.riskType}</td>
                <td>{c.score}</td>
                <td>{c.status}</td>
                <td>{new Date(c.detectedAt).toLocaleDateString('tr-TR')}</td>
                <td>
                  <button onClick={() => handleSuspend(c.userId)}>Askıya Al</button>
                  {' '}
                  <button onClick={() => handleResolve(c.id)}>Çözüldü</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
