export function RevenueChartCard({ data }: { data: Array<Record<string, any>> }) {
  const max = Math.max(1, ...data.map((item) => Number(item.paidRevenue || 0)));

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Revenue</div>
      <div style={barsStyle}>
        {data.map((item) => (
          <div key={item.date} style={barColStyle}>
            <div
              style={{
                width: '100%',
                height: `${Math.max(6, (Number(item.paidRevenue || 0) / max) * 160)}px`,
                background: 'linear-gradient(180deg, #8b5cf6, #4f46e5)',
                borderRadius: 8
              }}
            />
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{String(item.date).slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  background: '#0f1722',
  padding: 16
};

const titleStyle: React.CSSProperties = {
  marginBottom: 12,
  fontSize: 18,
  fontWeight: 700
};

const barsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-end',
  minHeight: 180
};

const barColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'center',
  flex: 1
};
