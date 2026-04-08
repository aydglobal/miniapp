import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

export function AdminRevenuePage() {
  const [summary, setSummary] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [s, p] = await Promise.all([
      adminFetch<{ success: boolean; data: any }>('/api/admin/revenue/summary'),
      adminFetch<{ success: boolean; data: any }>('/api/admin/revenue/payouts')
    ]);
    setSummary(s.data);
    setPayouts(p.data?.items || []);
  }

  useEffect(() => {
    load().catch((e) => setMessage(e instanceof Error ? e.message : 'Yuklenemedi.'));
  }, []);

  if (!summary) return <div style={{ color: 'white' }}>Gelir verileri yukleniyor...</div>;

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Gelir & Odeme</h1>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <div style={metaStyle}>Toplam Stars Geliri</div>
          <div style={bigNumStyle}>{summary.grossPaidStars} XTR</div>
        </section>
        <section style={cardStyle}>
          <div style={metaStyle}>Odenen Islem</div>
          <div style={bigNumStyle}>{summary.paidPayments}</div>
        </section>
        <section style={cardStyle}>
          <div style={metaStyle}>Bekleyen Cekim</div>
          <div style={bigNumStyle}>{summary.pendingWithdrawals}</div>
        </section>
        <section style={cardStyle}>
          <div style={metaStyle}>Gonderilen Cekim</div>
          <div style={bigNumStyle}>{summary.sentWithdrawals}</div>
        </section>
      </div>

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <h2 style={sectionTitleStyle}>Son Cekim Talepleri</h2>
        {payouts.length === 0 ? (
          <div style={metaStyle}>Kayit yok.</div>
        ) : (
          <div style={tableStyle}>
            {payouts.map((p: any) => (
              <div key={p.id} style={rowStyle}>
                <span style={metaStyle}>{p.user?.username || p.userId}</span>
                <span style={metaStyle}>{p.method}</span>
                <span style={{ fontWeight: 700 }}>{p.amountCoins} ADN</span>
                <span style={badgeStyle(p.status)}>{p.status}</span>
                <span style={metaStyle}>{new Date(p.createdAt).toLocaleDateString('tr-TR')}</span>
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
const tableStyle: React.CSSProperties = { display: 'grid', gap: 8 };
const rowStyle: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', flexWrap: 'wrap' };
const msgStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104,232,166,0.12)', color: '#b6ffd6' };
function badgeStyle(status: string): React.CSSProperties {
  const ok = status === 'paid' || status === 'approved';
  return { padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: ok ? 'rgba(104,232,166,0.16)' : 'rgba(255,255,255,0.08)', color: ok ? '#b6ffd6' : 'rgba(255,255,255,0.68)' };
}
