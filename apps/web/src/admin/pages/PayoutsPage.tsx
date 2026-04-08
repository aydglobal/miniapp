import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

export function PayoutsPage() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const res = await adminFetch('/api/admin/payouts');
    setItems(res.items || []);
  }

  async function act(id: string, action: 'approve' | 'reject' | 'mark-paid') {
    await adminFetch(`/api/admin/payouts/${id}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes: 'Yonetim panelinden incelendi' })
    });
    await load();
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Odeme talepleri</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={cardStyle}>
            <div><strong>{item.user?.username || item.user?.displayName || item.userId}</strong></div>
            <div>Coin: {item.amountCoins}</div>
            <div>Odeme: {item.amountPayout} {item.method}</div>
            <div>Durum: {item.status}</div>
            <div>Adres: {item.payoutAddress}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button style={okStyle} onClick={() => act(item.id, 'approve')}>Onayla</button>
              <button style={warnStyle} onClick={() => act(item.id, 'reject')}>Reddet</button>
              <button style={neutralStyle} onClick={() => act(item.id, 'mark-paid')}>Odendi isaretle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 14,
  background: '#0f1722'
};

const okStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#059669', color: 'white', padding: '10px 12px', cursor: 'pointer' };
const warnStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#dc2626', color: 'white', padding: '10px 12px', cursor: 'pointer' };
const neutralStyle: React.CSSProperties = { border: 'none', borderRadius: 10, background: '#475569', color: 'white', padding: '10px 12px', cursor: 'pointer' };
