import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

type Campaign = {
  key: string;
  title: string;
  audienceSegment: string;
  status: 'idle' | 'triggered';
  body: string;
  lastTriggeredAt: string | null;
};

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await adminFetch<{ success: true; data: Campaign[] }>('/api/admin/campaigns');
    setCampaigns(response.data);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Campaign listesi yuklenemedi.'));
  }, []);

  async function trigger(key: string) {
    try {
      await adminFetch(`/api/admin/campaigns/${key}/trigger`, { method: 'POST' });
      setMessage('Campaign tetiklendi.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Campaign tetiklenemedi.');
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Campaign control</h1>
        <p style={copyStyle}>Oyuncu segmentlerine giden geri donus kampanyalarini buradan atesle.</p>
      </div>

      <div style={gridStyle}>
        {campaigns.map((campaign) => (
          <section key={campaign.key} style={cardStyle}>
            <div style={campaignTopStyle}>
              <div>
                <h2 style={cardTitleStyle}>{campaign.title}</h2>
                <div style={metaStyle}>Segment: {campaign.audienceSegment}</div>
              </div>
              <span style={badgeStyle(campaign.status)}>{campaign.status}</span>
            </div>
            <p style={bodyStyle}>{campaign.body}</p>
            <div style={metaStyle}>Son tetikleme: {campaign.lastTriggeredAt ? new Date(campaign.lastTriggeredAt).toLocaleString('tr-TR') : '-'}</div>
            <button style={primaryButtonStyle} onClick={() => trigger(campaign.key)}>Trigger</button>
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
const campaignTopStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' };
const cardTitleStyle: React.CSSProperties = { margin: 0, fontSize: 20 };
const metaStyle: React.CSSProperties = { marginTop: 8, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 };
const bodyStyle: React.CSSProperties = { margin: '14px 0 0', color: 'rgba(255,255,255,0.84)', lineHeight: 1.6 };
const primaryButtonStyle: React.CSSProperties = { marginTop: 16, border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #ffd35f, #ff8a4c)', color: '#160c03', padding: '12px 14px', fontWeight: 800, cursor: 'pointer' };
const messageStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104, 232, 166, 0.12)', border: '1px solid rgba(104, 232, 166, 0.2)', color: '#b6ffd6' };

function badgeStyle(status: string): React.CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: 999,
    background: status === 'triggered' ? 'rgba(104, 232, 166, 0.16)' : 'rgba(255,255,255,0.08)',
    color: status === 'triggered' ? '#b6ffd6' : 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase'
  };
}
