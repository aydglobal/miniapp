import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/adminApi';

interface ABTest {
  id: string;
  key: string;
  title: string;
  variantCount: number;
  status: string;
  winnerVariant: number | null;
  startedAt: string;
  concludedAt: string | null;
}

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: '', title: '', variantCount: 2 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: ABTest[] }>('/admin/ab-tests');
      setTests(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch('/admin/ab-tests', { method: 'POST', body: JSON.stringify(form) });
    setForm({ key: '', title: '', variantCount: 2 });
    load();
  };

  const handleConclude = async (id: string, winnerVariant: number) => {
    await adminFetch(`/admin/ab-tests/${id}/conclude`, { method: 'POST', body: JSON.stringify({ winnerVariant }) });
    load();
  };

  const handleRollout = async (id: string) => {
    await adminFetch(`/admin/ab-tests/${id}/rollout`, { method: 'POST' });
    load();
  };

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2>A/B Testler</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Key" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} required />
        <input placeholder="Başlık" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <input type="number" min={2} max={10} value={form.variantCount} onChange={e => setForm(f => ({ ...f, variantCount: Number(e.target.value) }))} />
        <button type="submit">Oluştur</button>
      </form>

      {loading ? <p>Yükleniyor...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Başlık</th><th>Variant</th><th>Durum</th><th>Kazanan</th><th>İşlem</th></tr>
          </thead>
          <tbody>
            {tests.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.variantCount}</td>
                <td>{t.status}</td>
                <td>{t.winnerVariant ?? '-'}</td>
                <td>
                  {t.status === 'active' && (
                    <button onClick={() => handleConclude(t.id, 0)}>Sonuçlandır (V0)</button>
                  )}
                  {t.status === 'concluded' && t.winnerVariant !== null && (
                    <button onClick={() => handleRollout(t.id)}>Rollout</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
