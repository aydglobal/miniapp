import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

type BoostLogItem = {
  id: string;
  boostType: string;
  action: string;
  source: string;
  levelBefore?: number | null;
  levelAfter?: number | null;
  coinsSpent?: number | null;
  coinsAwarded?: number | null;
  createdAt: string;
  user: {
    username?: string | null;
    telegramId: string;
    displayName: string;
  };
};

export function BoostLogsPage() {
  const [items, setItems] = useState<BoostLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/logs/boost-logs')
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Yukleniyor...</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Guclendirme kayitlari</h1>
      <div style={listStyle}>
        {items.map((item) => (
          <div key={item.id} style={cardStyle}>
            <div style={topStyle}>
              <strong>{item.user.displayName}</strong>
              <span>{new Date(item.createdAt).toLocaleString('tr-TR')}</span>
            </div>
            <div style={metaStyle}>@{item.user.username || item.user.telegramId}</div>
            <div style={metaStyle}>Guclendirme: {item.boostType}</div>
            <div style={metaStyle}>Islem: {item.action} / Kaynak: {item.source}</div>
            <div style={metaStyle}>Seviye: {item.levelBefore ?? '-'} {'->'} {item.levelAfter ?? '-'}</div>
            <div style={metaStyle}>Coin: harcanan {item.coinsSpent ?? 0} / kazanilan {item.coinsAwarded ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const listStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12
};

const cardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#121a24',
  border: '1px solid rgba(255,255,255,0.08)'
};

const topStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12
};

const metaStyle: React.CSSProperties = {
  marginTop: 6,
  color: 'rgba(255,255,255,0.72)'
};
