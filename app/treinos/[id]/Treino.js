'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { concluirTreino } from '../../actions';

const tagCls = { 'Força': 'tag forca', 'Potência': 'tag potencia', 'Atlético': 'tag atletico' };
const Voltar = () => (
  <Link href="/treinos" className="icon-btn" aria-label="Voltar para treinos">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
  </Link>
);

function chave(id) {
  const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return `treino-${id}-${d}`;
}
function ler(id) { try { return JSON.parse(localStorage.getItem(chave(id)) || '{}'); } catch { return {}; } }
function gravar(id, v) { try { localStorage.setItem(chave(id), JSON.stringify(v)); } catch { /* sem armazenamento */ } }

export default function Treino({ treino, itens, mobilidade, calibracao, deload, concluido }) {
  const [marcados, setMarcados] = useState({});
  useEffect(() => { setMarcados(ler(treino.id)); }, [treino.id]);
  const [mobAberta, setMobAberta] = useState(false);
  const [fim, setFim] = useState(concluido);
  const [pending, start] = useTransition();
  const feito = (i) => i.feito || !!marcados[i.id];
  const toggle = (i) => { const n = { ...marcados, [i.id]: !marcados[i.id] }; setMarcados(n); gravar(treino.id, n); };
  const qtd = itens.filter(feito).length;
  const pct = itens.length ? Math.round((qtd / itens.length) * 100) : 0;
  const blocos = [];
  itens.forEach((i) => {
    const b = blocos.find((x) => x.nome === (i.bloco || 'Exercícios'));
    if (b) b.itens.push(i); else blocos.push({ nome: i.bloco || 'Exercícios', itens: [i] });
  });
  const duplas = Object.values(mobilidade.reduce((acc, i) => { (acc[i.bloco] = acc[i.bloco] || []).push(i); return acc; }, {}));
  const ehAcademia = treino.tipo === 'Academia';

  return (
    <main className="page">
      <header className="head">
        <Voltar />
        <div className="grow">
          <h1>{treino.nome}</h1>
          <p>{[treino.foco, treino.dia, treino.duracao ? `~${treino.duracao} min` : ''].filter(Boolean).join(' · ')}</p>
        </div>
      </header>

      <section className="card" aria-label="Progresso" style={{ gap: 8 }}>
        <div className="card-head">
          <span className="big">{qtd}<small> / {itens.length} {ehAcademia ? 'exercícios' : 'itens'}</small></span>
          <span className="note" style={{ fontSize: 13 }}>{pct}%</span>
        </div>
        <div className="track"><i style={{ width: `${pct}%` }} /></div>
      </section>

      {calibracao && ehAcademia && (
        <div className="callout"><b>Semanas 1 e 2 · calibração.</b> Comece leve e suba série a série. A última termina com 2 reps na reserva. Essa carga é seu ponto de partida. Nada de falha.</div>
      )}
      {deload && ehAcademia && (
        <div className="callout"><b>Semana de deload.</b> Metade das séries, mesma carga.</div>
      )}

      {duplas.length > 0 && (
        <section className="card" style={{ padding: 0, gap: 0 }}>
          <button type="button" onClick={() => setMobAberta(!mobAberta)} aria-expanded={mobAberta}
            style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', background: 'transparent', border: 0, color: 'var(--fg)', cursor: 'pointer', textAlign: 'left' }}>
            <span className="grow" style={{ fontSize: 15, fontWeight: 600 }}>Aquecimento · mobilidade 10 min</span>
            <span className="note" style={{ fontSize: 13 }}>{duplas.length} duplas</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b73" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transform: mobAberta ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {mobAberta && (
            <div style={{ padding: '0 16px 12px' }}>
              <p className="note" style={{ margin: '0 0 6px' }}>3 voltas de cada dupla, um exercício seguido do outro.</p>
              {duplas.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14 }}>
                  {d.map((x, j) => <span key={x.id}><span className="note">{j + 1} </span>{x.nome} · {x.reps}</span>)}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {blocos.map((b) => (
        <section key={b.nome} aria-label={b.nome} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="bloco-t">{b.nome}</h2>
          <div className="card list" style={{ padding: '0 6px 0 16px' }}>
            {b.itens.map((i) => {
              const on = feito(i);
              return (
                <div key={i.id} className={`row${on ? ' done' : ''}`} style={{ minHeight: 76 }}>
                  <Link href={`/treinos/exercicio/${i.id}`} className="txt" style={{ padding: '10px 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span className="t1" style={{ fontSize: 16 }}>{i.nome}</span>
                      {i.categoria && i.categoria !== 'Mobilidade' && <span className={tagCls[i.categoria] || 'tag'}>{i.categoria}</span>}
                    </span>
                    <span className="t2" style={{ fontSize: 13 }}>{i.presc}{i.parcial && !i.feito ? ` · ${i.parcial} série${i.parcial > 1 ? 's' : ''} salva${i.parcial > 1 ? 's' : ''}` : ''}</span>
                  </Link>
                  <button type="button" className="check round" role="checkbox" aria-checked={on} aria-label={`Concluir ${i.nome}`} onClick={() => !i.feito && toggle(i)} style={{ width: 48, height: 48, marginLeft: 0 }}>
                    <span>{on ? '✓' : ''}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {ehAcademia && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <button type="button" className={`btn${fim ? ' btn-ghost' : ''}`} style={{ height: 54 }} disabled={pending || fim}
            onClick={() => start(async () => { setFim(true); await concluirTreino('Academia'); })}>
            {fim ? 'Treino concluído ✓' : 'Concluir treino'}
          </button>
          <p className="note" style={{ textAlign: 'center' }}>Ao concluir, Academia fica marcada no Registrar o dia.</p>
        </div>
      )}
    </main>
  );
}
