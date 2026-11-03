'use client';

import Link from 'next/link';
import { useState } from 'react';
import Respiracao from './Respiracao';

const Seta = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);

function Lista({ itens, vazio }) {
  if (!itens.length) return <div className="empty">{vazio}</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {itens.map((t) => (
        <Link key={t.id} href={`/treinos/${t.id}`} className="link-card">
          <span className="letra">{t.codigo && t.codigo.length <= 3 ? t.codigo : t.nome.slice(0, 1)}</span>
          <span className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{t.foco || t.nome}</span>
            <span className="note" style={{ fontSize: 13 }}>{[t.dia, `${t.n} itens`, t.duracao ? `~${t.duracao} min` : ''].filter(Boolean).join(' · ')}</span>
          </span>
          <Seta />
        </Link>
      ))}
    </div>
  );
}

export default function Hub({ academia, corrida, mobilidade, respiracao }) {
  const [tab, setTab] = useState('acad');
  const mob = mobilidade[0];
  const duplas = mob ? Object.values(mob.itens.reduce((acc, i) => { (acc[i.bloco] = acc[i.bloco] || []).push(i); return acc; }, {})) : [];
  return (
    <>
      <div className="seg" role="tablist" aria-label="Tipos de treino" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
        {[['acad', 'Academia'], ['corr', 'Corrida'], ['resp', 'Respiração'], ['mob', 'Mobilidade']].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ fontSize: 14, padding: 0 }}>{l}</button>
        ))}
      </div>
      {tab === 'acad' && <Lista itens={academia} vazio="Nenhum treino de academia no Notion." />}
      {tab === 'corr' && <Lista itens={corrida} vazio="Nenhum treino de corrida no Notion." />}
      {tab === 'resp' && <Respiracao {...respiracao} />}
      {tab === 'mob' && (mob ? (
        <section className="card list" aria-label="Mobilidade">
          {duplas.map((d, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line-soft)' : 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="acc" style={{ fontSize: 12, fontWeight: 700 }}>{(d[0].bloco || `Dupla ${i + 1}`).toUpperCase()} · 3 voltas</span>
              {d.map((x) => <span key={x.id} style={{ fontSize: 14 }}>{x.nome} · {x.reps}</span>)}
            </div>
          ))}
        </section>
      ) : <div className="empty">Sem mobilidade cadastrada.</div>)}
    </>
  );
}
