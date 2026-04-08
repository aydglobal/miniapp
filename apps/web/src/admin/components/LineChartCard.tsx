export function LineChartCard({
  title,
  data,
  metricKeys
}: {
  title: string;
  data: Array<Record<string, any>>;
  metricKeys: Array<{ key: string; color: string }>;
}) {
  const width = 520;
  const height = 220;
  const max = Math.max(
    1,
    ...data.flatMap((item) => metricKeys.map((metric) => Number(item[metric.key] || 0)))
  );

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 220 }}>
        {metricKeys.map((metric) => (
          <polyline
            key={metric.key}
            fill="none"
            stroke={metric.color}
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x = (index / Math.max(1, data.length - 1)) * (width - 20) + 10;
                const y = height - (Number(item[metric.key] || 0) / max) * (height - 30) - 10;
                return `${x},${y}`;
              })
              .join(' ')}
          />
        ))}
      </svg>
      <div style={legendStyle}>
        {metricKeys.map((metric) => (
          <div key={metric.key} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: metric.color, display: 'inline-block' }} />
            <span>{metric.key}</span>
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

const legendStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  color: '#94a3b8',
  fontSize: 12
};
