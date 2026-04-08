import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

export function AdminNotificationsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [s, l] = await Promise.all([
      adminFetch<{ success: boolean; data: any }>('/api/admin/notifications/summary'),
      adminFetch<{ success: boolean; items: any[] }>('/api/admin/notifications/logs')
    ]);
    setSummary(s.data);
    setLogs(l.items || []);
  }

  useEffect(() => {
    load().catch((e) => setMessage(e instanceof Error ? e.message : 'Yuklenemedi.'));
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Bildirim Merkezi</h1>

      {summary ? (
        <div style={gridStyle}>
          <section style={cardStyle}>
            <div style={metaStyle}>Kuyrukta</div>
            <div style={bigNumStyle}>{summary.queued}</div>
          </section>
          <section style={cardStyle}>
            <div style={metaStyle}>Bugun Gonderilen</div>
            <div style={bigNumStyle}>{summary.sentToday}</div>
          </section>
        </div>
      ) : null}

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <h2 style={sectionTitleStyle}>Son Bildirimler</h2>
        {logs.length === 0 ? (
          <div style={metaStyle}>Kayit yok.</div>
        ) : (
          <div style={tableStyle}>
            {logs.map((log: any) => (
              <div key={log.id} style={rowStyle}>
                <span style={typeStyle}>{log.type}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.84)' }}>{log.messageText}</span>
                <span style={badgeStyle(log.status)}>{log.status}</span>
                <span style={metaStyle}>{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {message ? <div style={msgStyle}>{message}</div> : null}
    </div>
  );
}

const pageStyle: React.CSSProperties = { display: 'grid', gap: 18 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 28 };
const gridStyle: React.CSSProperties = { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' };
const cardStyle: React.CSSProperties = { padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
const sectionTitleStyle: React.CSSProperties = { margin: '0 0 14px', fontSize: 18 };
const bigNumStyle: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginTop: 8 };
const metaStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.68)', fontSize: 13 };
const typeStyle: React.CSSProperties = { fontSize: 12, color: '#64e8ff', minWidth: 120 };
const tableStyle: React.CSSProperties = { display: 'grid', gap: 8 };
const rowStyle: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', flexWrap: 'wrap' };
const msgStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104,232,166,0.12)', color: '#b6ffd6' };
function badgeStyle(status: string): React.CSSProperties {
  const ok = status === 'sent';
  return { padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: ok ? 'rgba(104,232,166,0.16)' : 'rgba(255,255,255,0.08)', color: ok ? '#b6ffd6' : 'rgba(255,255,255,0.68)' };
}
