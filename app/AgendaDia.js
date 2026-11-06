'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { marcarRefeicao, registrarAplicacao } from './actions';

const H = 56;
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`);

function agoraSP() {
  const s = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const [h, m] = s.split(':').map(Number);
  return (h % 24) * 60 + m;
}

export function Abas({ ativa, d }) {
  return (
    <div className="seg" role="tablist" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <Link href={`/?d=${d}`} role="tab" aria-selected={ativa === 'dia'} className="seg-a">Dia</Link>
      <Link href={`/agenda/semana?d=${d}`} role="tab" aria-selected={ativa === 'semana'} className="seg-a">Semana</Link>
    </div>
  );
}

export default function AgendaDia({ d, hoje, blocos, semana, legenda }) {
  const [agora, setAgora] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [feitos, setFeitos] = useState({});
  const [pend, start] = useTransition();
  const grade = useRef(null);
  const ehHoje = d === hoje;

  const ini = Math.min(5, ...blocos.map((b) => Math.floor(b.s / 60)));
  const fim = Math.max(23, ...blocos.map((b) => Math.ceil(b.e / 60)));
  const horas = Array.from({ length: fim - ini + 1 }, (_, i) => ini + i);

  useEffect(() => {
    if (!ehHoje) return undefined;
    const tick = () => setAgora(agoraSP());
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [ehHoje]);

  useEffect(() => {
    const alvo = ehHoje ? agoraSP() - 60 : (blocos[0] ? blocos[0].s - 30 : 6 * 60);
    const el = grade.current;
    if (el) window.scrollTo({ top: Math.max(0, el.offsetTop + ((alvo / 60) - ini) * H - 120) });
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  const feito = (b) => (b.id in feitos ? feitos[b.id] : b.feito);
  const atual = agora == null ? null : blocos.find((b) => b.s <= agora && b.e > agora);
  const proximo = agora == null ? null : blocos.find((b) => b.s > agora);

  function agir(b) {
    const a = b.acao;
    if (a.tipo === 'refeicao') {
      const novo = !feito(b);
      setFeitos((f) => ({ ...f, [b.id]: novo }));
      start(() => marcarRefeicao(a.nome, novo, a.total));
      setAberto(null);
    } else if (a.tipo === 'aplicacao') {
      setFeitos((f) => ({ ...f, [b.id]: true }));
      start(() => registrarAplicacao(a.id));
      setAberto(null);
    }
  }

  return (
    <>
      <Abas ativa="dia" d={d} />

      <nav className="ag-strip" aria-label="Dias da semana">
        {semana.map((s) => (
          <Link key={s.dia} href={`/?d=${s.dia}`} aria-current={s.dia === d ? 'date' : undefined} className={s.dia === hoje ? 'hoje' : undefined}>
            <span>{s.sigla}</span>
            <b>{s.num}</b>
            <i>{s.cores.map((c) => <em key={c} style={{ background: c }} />)}</i>
          </Link>
        ))}
      </nav>

      {ehHoje && agora != null && (atual || proximo) && (
        <section className="card ag-agora" aria-label="Agora">
          <div>
            <div className="note">Agora · {hhmm(agora)}</div>
            <b>{atual ? atual.titulo : 'Livre'}</b>
            {atual && <small>até {atual.fim} · faltam {dur(atual.e - agora)}</small>}
          </div>
          {proximo && (
            <div className="prox">
              <div className="note">Próximo</div>
              <b>{proximo.titulo}</b>
              <small>{proximo.ini} · em {dur(proximo.s - agora)}</small>
            </div>
          )}
        </section>
      )}

      {legenda.length > 0 && (
        <div className="ag-leg">
          {legenda.map((l) => <span key={l.tipo}><em style={{ background: l.cor }} />{l.tipo}</span>)}
        </div>
      )}

      {blocos.length === 0 && <p className="note" style={{ textAlign: 'center' }}>Nada marcado neste dia.</p>}

      <div className="ag-grade" ref={grade} style={{ height: (fim - ini) * H + 12 }}>
        {horas.map((h) => (
          <div key={h} className="ag-hora" style={{ top: (h - ini) * H }}><span>{String(h).padStart(2, '0')}h</span></div>
        ))}
        <div className="ag-col">
          {blocos.map((b) => {
            const top = ((b.s / 60) - ini) * H;
            const alt = Math.max(22, ((b.e - b.s) / 60) * H - 3);
            const ok = feito(b);
            return (
              <button
                key={b.id} type="button" className={`ag-bloco${ok ? ' feito' : ''}${alt < 40 ? ' curto' : ''}`}
                style={{ top, height: alt, left: `calc(${(b.col / b.cols) * 100}% + ${b.col ? 3 : 0}px)`, width: `calc(${100 / b.cols}% - ${b.cols > 1 ? 3 : 0}px)`, borderColor: b.cor, background: `linear-gradient(${b.bg}, ${b.bg}), var(--bg)` }}
                onClick={() => setAberto(b)}
              >
                <span className="t">{ok && '✓ '}{b.titulo}</span>
                <span className="h">{b.ini}–{b.fim}{b.auto && <i>auto</i>}</span>
              </button>
            );
          })}
          {ehHoje && agora != null && agora >= ini * 60 && agora <= fim * 60 && (
            <div className="ag-agora-linha" style={{ top: ((agora / 60) - ini) * H }} aria-hidden="true" />
          )}
        </div>
      </div>

      <Link href={`/agenda/novo?d=${d}`} className="ag-fab" aria-label="Novo bloco">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </Link>

      {aberto && (
        <div className="sheet-wrap">
          <button type="button" className="drawer-bg" aria-label="Fechar" onClick={() => setAberto(null)} />
          <section className="sheet" role="dialog" aria-label={aberto.titulo}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: '#3a3a42', alignSelf: 'center' }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, background: aberto.cor }} />
              <div className="grow">
                <div className="note">{aberto.tipo}{aberto.auto ? ' · automático' : ''}</div>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: 24, fontWeight: 700, lineHeight: 1.15 }}>{aberto.titulo}</div>
                <div style={{ color: '#c9c9ce', fontSize: 15, marginTop: 2 }}>{aberto.ini}–{aberto.fim} · {dur(aberto.e - aberto.s)} · {aberto.repetir === 'Não' ? 'só hoje' : aberto.repetir === 'Dias específicos' ? aberto.dias.join(', ') : aberto.repetir}</div>
              </div>
              <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => setAberto(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {aberto.nota && <p style={{ margin: 0, color: '#c9c9ce', fontSize: 15, lineHeight: 1.45 }}>{aberto.nota}</p>}
            {feito(aberto) && aberto.acao?.tipo !== 'refeicao' && <p className="note" style={{ color: 'var(--ok)' }}>✓ Feito hoje</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              {aberto.acao && aberto.acao.tipo === 'link' && <Link href={aberto.acao.href} className="btn">{aberto.acao.texto}</Link>}
              {aberto.acao && aberto.acao.tipo !== 'link' && d === hoje && (
                <button type="button" className="btn" disabled={pend} onClick={() => agir(aberto)}>
                  {aberto.acao.tipo === 'refeicao' ? (feito(aberto) ? 'Desmarcar' : 'Marcar feito') : aberto.acao.texto}
                </button>
              )}
              <Link href={`/agenda/${aberto.id}?d=${d}`} className="btn btn-ghost" style={{ width: aberto.acao ? 120 : '100%', flexShrink: 0 }}>Editar</Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
