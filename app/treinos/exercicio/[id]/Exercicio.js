'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { salvarSerie } from '../../../actions';

const tagCls = { 'Força': 'tag forca', 'Potência': 'tag potencia', 'Atlético': 'tag atletico' };
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const ddmm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
const fmt = (n) => (n == null ? '–' : String(n).replace('.', ','));
const num = (v) => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };

function bip() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const ctx = new C(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.value = 0.2;
    o.start(); o.stop(ctx.currentTime + 0.35);
    if (navigator.vibrate) navigator.vibrate(300);
  } catch { /* sem áudio */ }
}

// Mesma regra do plano: fechou o topo da faixa em todas as séries, sobe a carga.
function sugestao(item, ultima) {
  if (!ultima || !ultima.series.length) return null;
  if (item.repsMax == null) return ['hold', 'Tente passar do último tempo'];
  const forca = item.categoria === 'Força' || item.repsMax <= 8;
  const feitas = ultima.series.filter((s) => s.reps != null);
  if (feitas.length >= item.series && feitas.every((s) => s.reps >= item.repsMax)) {
    if (item.categoria === 'Potência') return ['up', 'Subir um pouco, mantendo a velocidade'];
    if (forca) return ['up', 'Subir 2,5–5 kg'];
    return ['up', 'Subir a carga'];
  }
  return ['hold', forca ? 'Mesma carga, busque +1 rep' : 'Mesma carga, +1 rep · 1–2 na reserva'];
}

export default function Exercicio({ treino, item, exercicio, posicao, proximo, hoje, ultima }) {
  const ini = Array.from({ length: item.series }, (_, i) => {
    const h = hoje.find((s) => s.serie === i + 1);
    return { carga: h && h.carga != null ? String(h.carga) : '', reps: h && h.reps != null ? String(h.reps) : '', ok: !!h };
  });
  const [series, setSeries] = useState(ini);
  const [erro, setErro] = useState('');
  const [, start] = useTransition();
  const [resta, setResta] = useState(null);
  const alvo = useRef(null);

  useEffect(() => {
    if (resta == null) return undefined;
    const t = setInterval(() => {
      const r = Math.round((alvo.current - Date.now()) / 1000);
      if (r <= 0) { bip(); setResta(null); } else setResta(r);
    }, 250);
    return () => clearInterval(t);
  }, [resta == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const descansar = () => {
    if (resta != null) { setResta(null); return; }
    const s = item.descansoSeg || 60;
    alvo.current = Date.now() + s * 1000;
    setResta(s);
  };

  const set = (i, k, v) => setSeries((arr) => arr.map((s, j) => (j === i ? { ...s, [k]: v, ok: k === 'ok' ? v : s.ok } : s)));
  const ultimaCarga = ultima ? (ultima.series.find((s) => s.carga != null) || {}).carga : null;
  const faixa = item.repsMin === item.repsMax || item.repsMax == null ? `${item.repsMin ?? ''}` : `${item.repsMin}–${item.repsMax}`;

  const marcar = (i) => {
    const s = series[i];
    if (s.ok) { set(i, 'ok', false); return; }
    const carga = num(s.carga);
    const reps = num(s.reps) ?? item.repsMin;
    set(i, 'ok', true);
    if (s.reps === '' && reps != null) set(i, 'reps', String(reps));
    setErro('');
    if (item.descansoSeg) { alvo.current = Date.now() + item.descansoSeg * 1000; setResta(item.descansoSeg); }
    start(async () => {
      try {
        await salvarSerie({ exercicioId: item.exercicioId, treinoId: treino.id, nome: item.nome, serie: i + 1, carga, reps });
      } catch {
        set(i, 'ok', false);
        setErro('Não salvou. Confira a conexão e toque de novo.');
      }
    });
  };

  const sug = sugestao(item, ultima);
  const passos = exercicio.execucao.split('\n').map((x) => x.trim()).filter(Boolean);

  return (
    <main className="page">
      <header className="head">
        <Link href={`/treinos/${treino.id}`} className="icon-btn" aria-label={`Voltar para ${treino.nome}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow">
          <p style={{ margin: 0, fontSize: 12 }}>{treino.nome} · {posicao.n} de {posicao.total}</p>
          <h1 style={{ fontSize: 26 }}>{item.nome}</h1>
        </div>
        {item.categoria && item.categoria !== 'Mobilidade' && <span className={tagCls[item.categoria] || 'tag'}>{item.categoria}</span>}
      </header>

      {exercicio.embed ? (
        <div className="video"><iframe src={exercicio.embed} title={`Vídeo: ${item.nome}`} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div>
      ) : exercicio.video ? (
        <a href={exercicio.video} target="_blank" rel="noreferrer" className="btn btn-ghost">Abrir vídeo</a>
      ) : (
        <div className="video-vazio">Sem vídeo. Cole o link do YouTube no campo Vídeo deste exercício no Notion (Saúde › Exercícios).</div>
      )}

      <section className="presc" aria-label="Prescrição">
        <div><span className="note">Séries</span><b>{item.series}</b></div>
        <div><span className="note">{item.unidadeReps === 'reps' ? 'Reps' : item.unidadeReps}</span><b>{faixa}</b></div>
        <div><span className="note">Descanso</span><b style={{ fontSize: 18, lineHeight: '26px' }}>{item.descanso || '—'}</b></div>
      </section>
      {item.obs && <p className="note" style={{ fontSize: 13 }}>{item.obs}</p>}

      <section className="card" aria-label="Séries" style={{ gap: 10 }}>
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16 }}>Séries de hoje</h2>
          <span className="note">{ultima ? `Último (${ddmm(ultima.data)}): ${ultima.series.map((s) => `${fmt(s.carga)}×${fmt(s.reps)}`).join('  ')}` : 'Sem registro anterior. Calibre a carga.'}</span>
        </div>
        {sug && <span className={`sug ${sug[0]}`} style={{ alignSelf: 'flex-start' }}>{sug[1]}</span>}
        <div className="sets">
          <span className="h">#</span><span className="h">{item.unidadeCarga}</span><span className="h">{item.unidadeReps}</span><span />
          {series.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <span className="n">{i + 1}</span>
              <input className="input" type="number" inputMode="decimal" step="0.5" aria-label={`Carga série ${i + 1}`} placeholder={ultimaCarga != null ? fmt(ultimaCarga) : '—'} value={s.carga} onChange={(e) => set(i, 'carga', e.target.value)} />
              <input className="input" type="number" inputMode="numeric" aria-label={`Repetições série ${i + 1}`} placeholder={faixa} value={s.reps} onChange={(e) => set(i, 'reps', e.target.value)} />
              <button type="button" className="check" role="checkbox" aria-checked={s.ok} aria-label={`Série ${i + 1} feita`} onClick={() => marcar(i)} style={{ width: 48, height: 48, marginLeft: 0 }}>
                <span style={{ width: 28, height: 28 }}>{s.ok ? '✓' : ''}</span>
              </button>
            </div>
          ))}
        </div>
        {erro && <div className="error" role="alert">{erro}</div>}
        <p className="note">Marcar a série salva carga e reps no Notion e inicia o descanso.</p>
      </section>

      <button type="button" className={`btn${resta == null ? ' btn-ghost' : ''}`} onClick={descansar} aria-live="polite"
        style={resta != null ? { background: 'var(--acc-soft)', color: 'var(--acc)', border: '1px solid var(--acc-line)' } : undefined}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
        {resta != null ? `Descansando · ${mmss(resta)}` : `Iniciar descanso · ${mmss(item.descansoSeg || 60)}`}
      </button>

      {(passos.length > 0 || exercicio.erros) && (
        <section className="card prose" aria-label="Como executar">
          {passos.length > 0 && <>
            <h2 style={{ fontSize: 16, margin: 0 }}>Como executar</h2>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#c9c9ce' }}>
              {passos.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          </>}
          {exercicio.erros && <>
            <h3 style={{ margin: '4px 0 0', fontSize: 14, color: '#ffb37a' }}>Erros comuns</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#c9c9ce' }}>{exercicio.erros}</p>
          </>}
        </section>
      )}

      {proximo
        ? <Link href={`/treinos/exercicio/${proximo.id}`} className="btn">Próximo: {proximo.nome}</Link>
        : <Link href={`/treinos/${treino.id}`} className="btn">Voltar ao treino e concluir</Link>}
    </main>
  );
}
