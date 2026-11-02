'use client';

import { useState } from 'react';

const METRICAS = [
  { k: 'paMax', label: 'PA máx.', un: 'mmHg', ref: 120, refTxt: 'Referência 12/8' },
  { k: 'paMin', label: 'PA mín.', un: 'mmHg', ref: 80, refTxt: 'Referência 12/8' },
  { k: 'peso', label: 'Peso', un: 'kg', dec: 1 },
  { k: 'sono', label: 'Sono', un: 'h', dec: 1 },
  { k: 'score', label: 'Score', un: '%', ref: 80, refTxt: 'Meta 80%' }
];

const fmt = (v, dec) => (v == null ? '—' : v.toFixed(dec || 0).replace('.', ','));
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export default function Trend({ dias }) {
  const [m, setM] = useState(METRICAS[0]);
  const [hover, setHover] = useState(null);
  const pts = dias.filter((d) => typeof d[m.k] === 'number').slice(-30);
  const W = 340, H = 190, L = 34, R = 8, T = 12, B = 26;

  let chart = <div className="empty" style={{ height: H }}>Sem registros de {m.label.toLowerCase()} ainda. Registre o dia para ver a curva.</div>;
  if (pts.length) {
    const ys = pts.map((p) => p[m.k]).concat(m.ref != null ? [m.ref] : []);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.1; lo -= pad; hi += pad;
    const x = (i) => (pts.length === 1 ? (L + W - R) / 2 : L + (i / (pts.length - 1)) * (W - L - R));
    const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
    const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p[m.k]).toFixed(1)}`).join(' L');
    const ticks = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3);
    const xs = pts.length > 1 ? [0, Math.floor((pts.length - 1) / 2), pts.length - 1] : [0];
    const h = hover != null ? pts[hover] : null;
    const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      let best = 0;
      pts.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
      setHover(best);
    };
    chart = (
      <div style={{ position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${m.label} dos últimos ${pts.length} registros`}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: 'pan-y', display: 'block' }}>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#222227" />
              <text x={L - 6} y={y(t) + 4} textAnchor="end" fill="#9a9aa2" fontSize="11">{fmt(t, m.dec)}</text>
            </g>
          ))}
          {m.ref != null && <line x1={L} x2={W - R} y1={y(m.ref)} y2={y(m.ref)} stroke="#9a9aa2" strokeDasharray="5 4" />}
          <path d={`M${line} L${x(pts.length - 1)},${H - B} L${x(0)},${H - B} Z`} fill="#ff7a1a" fillOpacity="0.16" />
          <path d={`M${line}`} fill="none" stroke="#ff7a1a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {xs.map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 && pts.length > 1 ? 'start' : i === pts.length - 1 && pts.length > 1 ? 'end' : 'middle'} fill="#9a9aa2" fontSize="11">{ddmm(pts[i].dia)}</text>
          ))}
          {h && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#ff7a1a" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(h[m.k])} r="6" fill="#ff7a1a" stroke="#151518" strokeWidth="2" />
            </g>
          )}
        </svg>
        {h && (
          <div className="tip" style={{ left: `${Math.min(70, Math.max(0, (x(hover) / W) * 100 - (x(hover) > W / 2 ? 38 : -4)))}%` }}>
            <span>{ddmm(h.dia)}</span>
            <strong>{fmt(h[m.k], m.dec)} {m.un}</strong>
            <span>Máx.: {fmt(Math.max(...pts.map((p) => p[m.k])), m.dec)} · Mín.: {fmt(Math.min(...pts.map((p) => p[m.k])), m.dec)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="card" aria-label="Tendência de saúde">
      <div className="card-head"><h2>Tendência de saúde</h2><span className="note">últimos 30 registros</span></div>
      <div className="chips" role="group" aria-label="Indicador do gráfico">
        {METRICAS.map((x) => (
          <button key={x.k} type="button" className="chip" aria-pressed={m.k === x.k} onClick={() => { setM(x); setHover(null); }}>{x.label}</button>
        ))}
      </div>
      {chart}
      {m.ref != null && pts.length > 0 && (
        <div className="note" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <span>— Valor do dia</span><span>- - {m.refTxt}</span>
        </div>
      )}
    </section>
  );
}
