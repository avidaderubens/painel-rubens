// Gráficos simples em SVG, desenhados no servidor.

export function Ring({ value, max = 100, size = 96, stroke = 9, label, color = '#ff7a1a', text }) {
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const frac = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a30" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(c * frac).toFixed(1)} ${c.toFixed(1)}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + size * 0.075} textAnchor="middle" fill={size > 60 ? color : '#f3f3f4'}
        fontFamily="Barlow Semi Condensed, sans-serif" fontSize={size * 0.24} fontWeight="700">{text}</text>
    </svg>
  );
}

export function Spark({ values, kind = 'line', height = 48 }) {
  const v = values.filter((x) => typeof x === 'number');
  if (v.length < 2) return <div className="spark" style={{ height }} aria-hidden="true" />;
  const W = 140;
  if (kind === 'bar') {
    const max = Math.max(3, ...v);
    const bw = W / v.length;
    return (
      <svg className="spark" width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {v.map((x, i) => {
          const h = Math.max(2, (x / max) * (height - 4));
          return <rect key={i} x={i * bw + bw * 0.15} y={height - h} width={bw * 0.7} height={h} rx="2" fill={x ? '#ff7a1a' : '#3a3a40'} />;
        })}
      </svg>
    );
  }
  const lo = Math.min(...v), hi = Math.max(...v);
  const y = (x) => (hi === lo ? height / 2 : height - 6 - ((x - lo) / (hi - lo)) * (height - 12));
  const pts = v.map((x, i) => `${((i / (v.length - 1)) * W).toFixed(1)},${y(x).toFixed(1)}`);
  return (
    <svg className="spark" width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M${pts.join(' L')} L${W},${height} L0,${height} Z`} fill="#ff7a1a" fillOpacity="0.18" />
      <path d={`M${pts.join(' L')}`} fill="none" stroke="#ff7a1a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
