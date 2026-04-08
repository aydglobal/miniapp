import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import { UserActionButtons } from '../components/UserActionButtons';

export function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    const data = await adminFetch(`/api/admin/users?${params.toString()}`);
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Kullanicilar</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara" style={inputStyle} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
          <option value="">tum durumlar</option>
          <option value="active">aktif</option>
          <option value="locked">kilitli</option>
          <option value="banned">engelli</option>
        </select>
        <button style={buttonStyle} onClick={load}>Getir</button>
      </div>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Kullanici</th>
              <th>Durum</th>
              <th>Coins</th>
              <th>Suphe</th>
              <th>Guven</th>
              <th>Son gorulme</th>
              <th>Islemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td>{user.displayName || user.username || '-'}</td>
                <td>{user.status}</td>
                <td>{user.coins}</td>
                <td>{user.suspiciousScore}</td>
                <td>{user.trustScore}</td>
                <td>{user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : '-'}</td>
                <td><UserActionButtons userId={user.id} onChanged={load} /></td>
              </tr>
            ))}
          </tbody>
        </table>
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

const tableWrapStyle: React.CSSProperties = {
  overflow: 'auto',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: 'white'
};
