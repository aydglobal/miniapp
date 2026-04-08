import { useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

type Bucket = 'coins' | 'adnBalance' | 'eligibleRewardBalance';

export function AdminCorrectionsPage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [bucket, setBucket] = useState<Bucket>('coins');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);

  async function loadLedger() {
    if (!targetUserId) return;
    try {
      const res = await adminFetch<{ success: boolean; items: any[] }>(`/api/admin/corrections/ledger/${targetUserId}`);
      setLedger(res.items);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Ledger yuklenemedi.');
    }
  }

  async function applyAdjustment() {
    if (!targetUserId || !amount || !note) return;
    setBusy(true);
    try {
      await adminFetch('/api/admin/corrections/balance', {
        method: 'POST',
        body: JSON.stringify({ targetUserId, bucket, amount: Number(amount), note })
      });
      setMessage('Bakiye duzeltmesi uygulandı.');
      setAmount('');
      setNote('');
      await loadLedger();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Islem basarisiz.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Bakiye duzeltme</h1>
        <p style={copyStyle}>Admin olarak kullanici bakiyesini manuel duzenle. Tum islemler ledger'a yazilir.</p>
      </div>

      <section style={cardStyle}>
        <div style={fieldRowStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Kullanici ID</span>
            <input style={inputStyle} value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="cuid..." />
          </label>
          <button style={softButtonStyle} onClick={loadLedger}>Ledger Yukle</button>
        </div>

        <div style={fieldRowStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Bucket</span>
            <select style={inputStyle} value={bucket} onChange={(e) => setBucket(e.target.value as Bucket)}>
              <option value="coins">coins</option>
              <option value="adnBalance">adnBalance</option>
              <option value="eligibleRewardBalance">eligibleRewardBalance</option>
            </select>
          </label>
          <label style={fieldStyle}>
            <span style={labelStyle}>Miktar (+ veya -)</span>
            <input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
          </label>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Not</span>
          <input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Neden yapildi?" />
        </label>

        <button style={primaryButtonStyle} onClick={applyAdjustment} disabled={busy}>
          {busy ? 'Uygulanıyor...' : 'Duzeltmeyi Uygula'}
        </button>
      </section>

      {message ? <div style={messageStyle}>{message}</div> : null}

      {ledger.length > 0 ? (
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Son 100 ledger kaydi</h2>
          <div style={tableStyle}>
            {ledger.map((entry) => (
              <div key={entry.id} style={rowStyle}>
                <span style={typeStyle}>{entry.entryType}</span>
                <span style={bucketStyle}>{entry.bucket}</span>
                <span style={amountStyle(entry.amount)}>{entry.amount > 0 ? '+' : ''}{entry.amount}</span>
                <span style={reasonStyle}>{entry.reason}</span>
                <span style={dateStyle}>{new Date(entry.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

const pageStyle: React.CSSProperties = { display: 'grid', gap: 18 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 28 };
const copyStyle: React.CSSProperties = { margin: '8px 0 0', color: 'rgba(255,255,255,0.68)', maxWidth: 720, lineHeight: 1.6 };
const cardStyle: React.CSSProperties = { padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gap: 14 };
const fieldRowStyle: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' };
const fieldStyle: React.CSSProperties = { display: 'grid', gap: 6, flex: 1, minWidth: 180 };
const labelStyle: React.CSSProperties = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.62)' };
const inputStyle: React.CSSProperties = { borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: '#0e1624', color: 'white', padding: '12px 14px' };
const primaryButtonStyle: React.CSSProperties = { border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #ffd35f, #ff8a4c)', color: '#160c03', padding: '14px 18px', fontWeight: 800, cursor: 'pointer' };
const softButtonStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'white', padding: '12px 14px', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' };
const messageStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104, 232, 166, 0.12)', border: '1px solid rgba(104, 232, 166, 0.2)', color: '#b6ffd6' };
const sectionTitleStyle: React.CSSProperties = { margin: '0 0 10px', fontSize: 18 };
const tableStyle: React.CSSProperties = { display: 'grid', gap: 8 };
const rowStyle: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', flexWrap: 'wrap' };
const typeStyle: React.CSSProperties = { fontSize: 12, color: '#a8b3cf', minWidth: 120 };
const bucketStyle: React.CSSProperties = { fontSize: 12, color: '#64e8ff', minWidth: 100 };
const reasonStyle: React.CSSProperties = { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.72)' };
const dateStyle: React.CSSProperties = { fontSize: 11, color: 'rgba(255,255,255,0.45)' };
function amountStyle(amount: number): React.CSSProperties {
  return { fontWeight: 700, color: amount >= 0 ? '#68e8a6' : '#ff6b6b', minWidth: 70 };
}
