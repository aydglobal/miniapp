import { adminFetch } from '../../lib/adminApi';

export function UserActionButtons({
  userId,
  onChanged
}: {
  userId: string;
  onChanged: () => void | Promise<void>;
}) {
  async function run(path: string, reason: string) {
    await adminFetch(path, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    await onChanged();
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button style={dangerStyle} onClick={() => run(`/api/admin/users/${userId}/ban`, 'Yonetici tarafindan engellendi')}>Engelle</button>
      <button style={warnStyle} onClick={() => run(`/api/admin/users/${userId}/fraud-lock`, 'Risk nedeniyle kilitlendi')}>Kilitle</button>
      <button style={okStyle} onClick={() => run(`/api/admin/users/${userId}/unban`, 'Yonetici tarafindan acildi')}>Ac</button>
    </div>
  );
}

const baseStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 10,
  padding: '8px 10px',
  color: 'white',
  cursor: 'pointer'
};

const dangerStyle: React.CSSProperties = { ...baseStyle, background: '#dc2626' };
const warnStyle: React.CSSProperties = { ...baseStyle, background: '#d97706' };
const okStyle: React.CSSProperties = { ...baseStyle, background: '#059669' };
