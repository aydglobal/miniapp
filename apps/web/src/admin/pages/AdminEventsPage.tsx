import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

type LiveEvent = {
  key: string;
  title: string;
  isEnabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  modifiers: Record<string, number>;
};

export function AdminEventsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await adminFetch<{ success: true; data: LiveEvent[] }>('/api/admin/events');
    setEvents(response.data);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Event listesi yuklenemedi.'));
  }, []);

  async function mutate(key: string, action: 'start' | 'stop') {
    try {
      await adminFetch(`/api/admin/events/${key}/${action}`, { method: 'POST' });
      setMessage(action === 'start' ? 'Event baslatildi.' : 'Event durduruldu.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Event islemi basarisiz.');
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Live events</h1>
        <p style={copyStyle}>Oyundaki ritmi canli event’lerle yonet. Cache, network ve reboot pencereleri buradan acilir.</p>
      </div>

      <div style={gridStyle}>
        {events.map((event) => (
          <section key={event.key} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h2 style={cardTitleStyle}>{event.title}</h2>
                <div style={cardKeyStyle}>{event.key}</div>
              </div>
              <span style={badgeStyle(event.isEnabled)}>{event.isEnabled ? 'Canli' : 'Pasif'}</span>
            </div>
            <div style={metaStyle}>Baslangic: {event.startsAt ? new Date(event.startsAt).toLocaleString('tr-TR') : '-'}</div>
            <div style={metaStyle}>Bitis: {event.endsAt ? new Date(event.endsAt).toLocaleString('tr-TR') : '-'}</div>
            <div style={modifierWrapStyle}>
              {Object.entries(event.modifiers).map(([key, value]) => (
                <span key={key} style={pillStyle}>{key}: x{value}</span>
              ))}
            </div>
            <div style={actionRowStyle}>
              <button style={secondaryButtonStyle} onClick={() => mutate(event.key, 'start')}>Baslat</button>
              <button style={softButtonStyle} onClick={() => mutate(event.key, 'stop')}>Durdur</button>
            </div>
          </section>
        ))}
      </div>

      {message ? <div style={messageStyle}>{message}</div> : null}
    </div>
  );
}

const pageStyle: React.CSSProperties = { display: 'grid', gap: 18 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 28 };
const copyStyle: React.CSSProperties = { margin: '8px 0 0', color: 'rgba(255,255,255,0.68)', maxWidth: 720, lineHeight: 1.6 };
const gridStyle: React.CSSProperties = { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' };
const cardStyle: React.CSSProperties = { padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
const cardHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' };
const cardTitleStyle: React.CSSProperties = { margin: 0, fontSize: 20 };
const cardKeyStyle: React.CSSProperties = { marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.58)', textTransform: 'uppercase', letterSpacing: 1 };
const metaStyle: React.CSSProperties = { marginTop: 10, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 };
const modifierWrapStyle: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 };
const pillStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontSize: 12, color: '#ffe6a5' };
const actionRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginTop: 18 };
const secondaryButtonStyle: React.CSSProperties = { border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #64e8ff, #4e8dff)', color: '#061322', padding: '12px 14px', fontWeight: 800, cursor: 'pointer' };
const softButtonStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'white', padding: '12px 14px', fontWeight: 700, cursor: 'pointer' };
const messageStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104, 232, 166, 0.12)', border: '1px solid rgba(104, 232, 166, 0.2)', color: '#b6ffd6' };

function badgeStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: 999,
    background: active ? 'rgba(104, 232, 166, 0.16)' : 'rgba(255,255,255,0.08)',
    color: active ? '#b6ffd6' : 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: 800
  };
}
