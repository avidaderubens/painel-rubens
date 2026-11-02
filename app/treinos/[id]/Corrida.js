'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { salvarCorrida } from '../../actions';

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const ddmm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');

function bip() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const ctx = new C(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.value = 0.2;
    o.start(); o.stop(ctx.currentTime + 0.35);
    if (navigator.vibrate) navigator.vibrate(300);
  } catch { /* sem áudio */ }
}

export default function Corrida({ treino, etapas, feito, historico }) {
  const [idx, setIdx] = useState(0);
  const [resta, setResta] = useState(etapas[0] ? etapas[0].duracao : 0);
  const [rodando, setRodando] = useState(false);
  const [fim, setFim] = useState(feito);
  const [pending, start] = useTransition();
  const alvo = useRef(null);
  const total = etapas.reduce((s, e) => s + (e.duracao || 0), 0);
  const tiros = etapas.filter((e) => e.etapa === 'Tiro');

  useEffect(() => {
    if (!rodando) return undefined;
    alvo.current = Date.now() + resta * 1000;
    const t = setInterval(() => {
      const r = Math.round((alvo.current - Date.now()) / 1000);
      if (r > 0) { setResta(r); return; }
      bip();
      setIdx((i) => {
        const n = i + 1;
        if (n >= etapas.length) { setRodando(false); setResta(0); return i; }
        alvo.current = Date.now() + etapas[n].duracao * 1000;
        setResta(etapas[n].duracao);
        return n;
      });
    }, 250);
    return () => clearInterval(t);
  }, [rodando]); // eslint-disable-line react-hooks/exhaustive-deps

  const atual = etapas[idx];
  const iniciado = rodando || idx > 0 || (atual && resta !== atual.duracao);
  const acabou = idx === etapas.length - 1 && resta === 0;
  const nTiro = atual && atual.etapa === 'Tiro' ? tiros.indexOf(atual) + 1 : 0;

  const enviar = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const dados = Object.fromEntries(['tiros', 'pse', 'km', 'fc', 'notas'].map((k) => [k, f.get(k)]));
    start(async () => { setFim(true); await salvarCorrida(treino.id, dados); });
  };

  return (
    <main className="page">
      <header className="head">
        <Link href="/treinos" className="icon-btn" aria-label="Voltar para treinos">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow"><h1>{treino.nome}</h1><p>{treino.foco}</p></div>
      </header>

      <section className="card" aria-label="Cronômetro" style={{ alignItems: 'center', gap: 6 }} aria-live="polite">
        <span className="label" style={{ color: iniciado ? 'var(--acc)' : 'var(--muted)', fontWeight: 700 }}>
          {acabou ? 'Fim' : !iniciado ? `Total ~${Math.round(total / 60)} min` : nTiro ? `Tiro ${nTiro} de ${tiros.length}` : atual.nome}
        </span>
        <span className="timer">{mmss(resta)}</span>
        <span className="note" style={{ fontSize: 13 }}>
          {acabou ? 'Protocolo completo.' : !iniciado ? 'Começa pelo aquecimento' : etapas[idx + 1] ? `Depois: ${etapas[idx + 1].nome} ${mmss(etapas[idx + 1].duracao)}` : 'Última etapa'}
        </span>
        <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 8 }}>
          <button type="button" className="btn" style={{ flex: 2 }} disabled={acabou} onClick={() => setRodando(!rodando)}>{rodando ? 'Pausar' : iniciado ? 'Continuar' : 'Iniciar'}</button>
          {iniciado && !rodando && (
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setIdx(0); setResta(etapas[0].duracao); }}>Zerar</button>
          )}
        </div>
      </section>

      <section className="card list" aria-label="Etapas">
        {etapas.map((e, i) => (
          <div key={e.id} className="row" style={{ minHeight: 48 }}>
            <span className={`dot${e.etapa === 'Tiro' ? ' tiro' : e.etapa === 'Recuperação' ? ' rec' : ''}`} />
            <span className="grow" style={{ fontSize: 15, fontWeight: i === idx && iniciado ? 700 : e.etapa === 'Tiro' ? 700 : 500, color: i === idx && iniciado ? 'var(--acc)' : i < idx ? 'var(--dim)' : 'var(--fg)' }}>{e.nome}</span>
            <span className="note" style={{ fontSize: 14 }}>{mmss(e.duracao)}</span>
          </div>
        ))}
      </section>

      {treino.notas && <p className="note" style={{ fontSize: 13, lineHeight: 1.4 }}>{treino.notas}</p>}

      {fim ? (
        <div className="callout"><b>Corrida registrada.</b> Corrida está marcada no Registrar o dia.</div>
      ) : (
        <form onSubmit={enviar} className="card">
          <h2>Registro</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            {[['tiros', 'Tiros completos', '4'], ['pse', 'Esforço (1–10)', '8'], ['km', 'Distância (km)', ''], ['fc', 'FC média (bpm)', '']].map(([k, l, ph]) => (
              <div key={k} className="field" style={{ gap: 4 }}>
                <label htmlFor={`c-${k}`} style={{ fontSize: 12, textTransform: 'none', letterSpacing: 0 }}>{l}</label>
                <input id={`c-${k}`} name={k} className="input num" type="number" step="0.1" inputMode="decimal" placeholder={ph} />
              </div>
            ))}
          </div>
          <div className="field" style={{ gap: 4 }}>
            <label htmlFor="c-notas" style={{ fontSize: 12, textTransform: 'none', letterSpacing: 0 }}>Nota</label>
            <textarea id="c-notas" name="notas" className="input" rows={2} placeholder="Local, vento, como as pernas responderam." />
          </div>
          <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : 'Concluir corrida'}</button>
          <p className="note" style={{ textAlign: 'center' }}>Ao concluir, Corrida fica marcada no Registrar o dia.</p>
        </form>
      )}

      {historico.length > 0 && (
        <section className="card list" aria-label="Últimas corridas">
          <h2 style={{ margin: '12px 0 4px', fontSize: 16 }}>Últimas</h2>
          {historico.map((h) => (
            <div key={h.id} className="row" style={{ minHeight: 48 }}>
              <span className="acc" style={{ width: 52, fontWeight: 700 }}>{ddmm(h.data)}</span>
              <span className="grow note" style={{ fontSize: 14 }}>{[h.tiros != null ? `${h.tiros}/${tiros.length} tiros` : '', h.pse != null ? `PSE ${h.pse}` : '', h.km != null ? `${String(h.km).replace('.', ',')} km` : '', h.fc != null ? `${h.fc} bpm` : ''].filter(Boolean).join(' · ')}</span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
