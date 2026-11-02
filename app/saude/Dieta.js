'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { definirTipoDia, marcarRefeicao } from '../actions';

const fmtQ = (v, un) => {
  if (v == null) return '';
  if (v === 0) return '—';
  const n = String(v).replace('.', ',');
  return un ? `${n} ${un}` : n;
};
const milhar = (n) => (n == null ? '—' : n.toLocaleString('pt-BR'));

// Quantidade equivalente: regra de três sobre a base da troca, arredondada de 5 em 5 g.
function equivalente(q, t) {
  const v = (q * t.qtd) / t.base;
  return t.un === 'g' ? `${Math.round(v / 5) * 5} g` : `${Math.max(1, Math.round(v))} ${t.un}`;
}

export default function Dieta({ refeicoes, trocas, metas, tipo: tipoIni, feitas, dia, diaNome, semana }) {
  const [tipo, setTipo] = useOptimistic(tipoIni);
  const [lista, setLista] = useOptimistic(feitas);
  const [troca, setTroca] = useState(null);
  const [, start] = useTransition();
  const A = tipo === 'A';
  const meta = metas[tipo] || {};

  const escolher = (t) => start(async () => { setTipo(t); await definirTipoDia(dia, t); });
  const toggle = (nome) => start(async () => {
    const on = !lista.includes(nome);
    setLista(on ? [...lista, nome] : lista.filter((x) => x !== nome));
    await marcarRefeicao(nome, on, refeicoes.length);
  });
  const qtd = refeicoes.filter((r) => lista.includes(r.nome)).length;

  return (
    <>
      <section className="card" aria-label="Meta do dia" style={{ gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div className="label">Hoje · {diaNome}</div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{meta.nome || `Dia ${tipo}`}</div>
            <div className="note" style={{ fontSize: 13 }}>{meta.desc}</div>
          </div>
          <div className="toggle-ab" role="group" aria-label="Tipo do dia">
            <button type="button" aria-pressed={A} onClick={() => !A && escolher('A')}>A</button>
            <button type="button" aria-pressed={!A} onClick={() => A && escolher('B')}>B</button>
          </div>
        </div>
        <div className="macros">
          <div><span className="note">kcal</span><b>{milhar(meta.kcal)}</b></div>
          <div><span className="note">Proteína</span><b>{meta.p ?? '—'}<small className="note">g</small></b></div>
          <div><span className="note">Carbo</span><b>{meta.c ?? '—'}<small className="note">g</small></b></div>
          <div><span className="note">Gordura</span><b>{meta.g ?? '—'}<small className="note">g</small></b></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="note" style={{ fontSize: 13 }}>Refeições feitas</span><b>{qtd} / {refeicoes.length}</b></div>
          <div className="track"><i style={{ width: `${refeicoes.length ? (qtd / refeicoes.length) * 100 : 0}%` }} /></div>
        </div>
      </section>

      {refeicoes.map((r, idx) => {
        const on = lista.includes(r.nome);
        const itens = r.itens.filter((i) => i.texto || (A ? i.a : i.b) !== 0);
        return (
          <section key={r.id} aria-label={r.nome} className={`meal${on ? ' done' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="grow">
                <div className="mt">{idx + 1}. {r.nome}</div>
                {r.horario && <div style={{ fontSize: 12, color: '#ff8f3d' }}>{r.horario}</div>}
              </div>
              <button type="button" className="check" role="checkbox" aria-checked={on} aria-label={`Marcar ${r.nome}`} onClick={() => toggle(r.nome)} style={{ width: 48, height: 48, marginLeft: 0 }}>
                <span style={{ width: 28, height: 28 }}>{on ? '✓' : ''}</span>
              </button>
            </div>
            {itens.map((i) => {
              const q = A ? i.a : i.b;
              const txt = i.texto || fmtQ(q, i.un);
              const muda = !i.texto && i.a !== i.b;
              const podeTrocar = i.grupo && trocas[i.grupo] && typeof q === 'number' && q > 0;
              const corpo = <><span className="nm">{i.nome}</span><span className={`q${muda ? ' muda' : ''}`}>{txt}</span><span style={{ width: 14, color: '#4a4a52' }} aria-hidden="true">{podeTrocar ? '›' : ''}</span></>;
              return podeTrocar
                ? <button key={i.id} type="button" className="food" onClick={() => setTroca({ nome: i.nome, q, grupo: i.grupo, un: i.un })} aria-label={`${i.nome}, ${txt}. Ver trocas`}>{corpo}</button>
                : <div key={i.id} className="food">{corpo}</div>;
            })}
            {itens.length === 0 && <div className="food"><span className="nm">Sem alimentos cadastrados.</span></div>}
          </section>
        );
      })}

      <p className="note" style={{ textAlign: 'center' }}>Em laranja: o que muda entre Dia A e Dia B. Toque num alimento para ver as trocas.</p>

      <Link href="/saude/preparo" className="btn" style={{ height: 54 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
        Preparo da semana
      </Link>
      <Link href="/saude/regras" className="btn btn-ghost" style={{ height: 48 }}>Regras, ajustes e checkpoints</Link>
      <p className="note" style={{ textAlign: 'center' }}>{semana}</p>

      {troca && (
        <div className="sheet-wrap">
          <button type="button" className="drawer-bg" aria-label="Fechar trocas" onClick={() => setTroca(null)} />
          <section className="sheet" aria-label="Trocas" role="dialog">
            <div style={{ width: 40, height: 4, borderRadius: 4, background: '#3a3a42', alignSelf: 'center' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="grow">
                <div className="note">Trocar</div>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: 24, fontWeight: 700 }}>{troca.nome} {fmtQ(troca.q, troca.un)}</div>
              </div>
              <button type="button" className="icon-btn" aria-label="Fechar trocas" onClick={() => setTroca(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {trocas[troca.grupo].map((t) => (
              <div key={t.nome} className="op"><span>{t.nome}</span><b>{equivalente(troca.q, t)}</b></div>
            ))}
            <p className="note">Pesos já cozidos, como no plano.</p>
          </section>
        </div>
      )}
    </>
  );
}
