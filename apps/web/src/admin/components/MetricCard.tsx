export function MetricCard({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  background: '#0f1722',
  padding: 16
};
