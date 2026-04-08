import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import { MetricCard } from '../components/MetricCard';
import { LineChartCard } from '../components/LineChartCard';
import { RevenueChartCard } from '../components/RevenueChartCard';

export function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  async function load() {
    const [summaryData, chartsData, analyticsData] = await Promise.all([
      adminFetch('/api/admin/dashboard/summary'),
      adminFetch('/api/admin/dashboard/charts'),
      adminFetch('/api/admin/analytics/summary')
    ]);
    setSummary(summaryData);
    setCharts(chartsData);
    setAnalytics(analyticsData.data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  if (!summary) return <div style={{ color: 'white' }}>Panel yukleniyor...</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Yonetim paneli</h1>
      <div style={gridStyle}>
        <MetricCard label="Toplam kullanici" value={summary.totalUsers} />
        <MetricCard label="Son 24 saat aktif" value={summary.activeUsers24h} />
        <MetricCard label="Acik risk kaydi" value={summary.openFraudCases} />
        <MetricCard label="Supheli kullanici" value={summary.suspiciousUsers} />
        <MetricCard label="Engelli hesap" value={summary.bannedUsers} />
        <MetricCard label="30 gunluk gelir" value={summary.last30dRevenue} />
      </div>
      <div style={chartGridStyle}>
        <LineChartCard
          title="Buyume / risk / satin alim"
          data={charts}
          metricKeys={[
            { key: 'newUsers', color: '#60a5fa' },
            { key: 'fraudCases', color: '#f97316' },
            { key: 'boostPurchases', color: '#34d399' }
          ]}
        />
        <RevenueChartCard data={charts} />
      </div>

      {analytics ? (
        <div style={analyticsWrapStyle}>
          <div style={analyticsGridStyle}>
            <MetricCard label="DAU" value={analytics.totals.dau} />
            <MetricCard label="Yeni kullanici" value={analytics.totals.newUsers} />
            <MetricCard label="Tap" value={analytics.totals.taps} />
            <MetricCard label="Chest open" value={analytics.totals.chestOpens} />
            <MetricCard label="Reboot" value={analytics.totals.prestigeCount} />
            <MetricCard label="D30 gelir" value={analytics.totals.revenueUsd} />
          </div>

          <div style={funnelGridStyle}>
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Retention</h3>
              <div style={panelLineStyle}>D1: %{analytics.retention.d1}</div>
              <div style={panelLineStyle}>D7: %{analytics.retention.d7}</div>
            </div>
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Top funnel</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {analytics.topFunnels.map((item: any) => (
                  <div key={item.key} style={funnelRowStyle}>
                    <span>{item.key}</span>
                    <strong>%{item.conversionRate}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
};

const chartGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  marginTop: 22,
  gridTemplateColumns: '1.3fr 1fr'
};

const analyticsWrapStyle: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  marginTop: 22
};

const analyticsGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
};

const funnelGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
};

const panelStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: '#0f1822',
  border: '1px solid rgba(255,255,255,0.08)'
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12
};

const panelLineStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.76)',
  marginTop: 8
};

const funnelRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  padding: '12px 14px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.04)'
};
