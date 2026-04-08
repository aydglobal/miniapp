import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

export function FraudReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('open');
  const [q, setQ] = useState('');

  async function load() {
    const data = await adminFetch(`/api/admin/fraud/cases?status=${status}&q=${encodeURIComponent(q)}`);
    setItems(data.items || []);
  }

  async function review(id: string, nextStatus: string) {
    await adminFetch(`/api/admin/fraud/cases/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status: nextStatus, note: `Inceleme durumu: ${nextStatus}` })
    });
    await load();
  }

  useEffect(() => {
    load().catch(console.error);
  }, [status]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Risk inceleme</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara" style={inputStyle} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
          <option value="open">acik</option>
          <option value="reviewing">inceleniyor</option>
          <option value="resolved">cozuldu</option>
          <option value="false_positive">yanlis alarm</option>
        </select>
        <button style={buttonStyle} onClick={load}>Filtrele</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={caseStyle}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{item.title}</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>
                Risk: {item.riskType} | Skor: {item.score} | Durum: {item.status}
              </div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Kullanici: {item.user?.username || '-'} ({item.user?.telegramId})
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={warnStyle} onClick={() => review(item.id, 'reviewing')}>Incele</button>
              <button style={okStyle} onClick={() => review(item.id, 'resolved')}>Kapat</button>
              <button style={neutralStyle} onClick={() => review(item.id, 'false_positive')}>Yanlis alarm</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0f1722',
  color: 'white',
  padding: '10px 12px'
};

const buttonStyle: React.CSSProperties = {
  borderRadius: 10,
  border: 'none',
  background: '#1d4ed8',
  color: 'white',
  padding: '10px 14px',
  cursor: 'pointer'
};

const caseStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  background: '#0f1722',
  padding: 16,
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16
};

const warnStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#d97706', color: 'white', padding: '10px 12px', cursor: 'pointer' };
const okStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#059669', color: 'white', padding: '10px 12px', cursor: 'pointer' };
const neutralStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#475569', color: 'white', padding: '10px 12px', cursor: 'pointer' };
