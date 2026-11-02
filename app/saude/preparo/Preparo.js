'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { definirTipoDia } from '../../actions';

const virgula = (n) => String(n).replace('.', ',');
function fmt(v, un) {
  if (un === 'g') return v >= 1000 ? `${virgula(Math.round(v / 10) / 100)} kg` : `${Math.round(v)} g`;
  if (un === 'ml') return v >= 1000 ? `${virgula(Math.round(v / 100) / 10)} L` : `${Math.round(v)} ml`;
  const r = Math.round(v * 10) / 10;
  return `${virgula(r)} ${un}`.trim();
}

function ler(k) { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; } }
function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } }

export default function Preparo({ dias: diasIni, itens, periodo, semanaId }) {
  const [dias, setDias] = useState(diasIni);
  const [ok, setOk] = useState({});
  const [, start] = useTransition();
  const chave = `preparo-${semanaId}`;
  useEffect(() => { setOk(ler(chave)); }, [chave]);

  const nA = dias.filter((d) => d.tipo === 'A').length;
  const nB = 7 - nA;
  const trocar = (i) => {
    const novo = dias[i].tipo === 'A' ? 'B' : 'A';
    setDias((ds) => ds.map((d, j) => (j === i ? { ...d, tipo: novo } : d)));
    start(() => definirTipoDia(dias[i].data, novo));
  };
  const marcar = (k) => { const n = { ...ok, [k]: !ok[k] }; setOk(n); gravar(chave, n); };

  // Soma cozida por alimento e total cru/comprado por item de compra.
  const cozinhar = {}; const comprar = {};
  itens.forEach((i) => {
    const total = (i.a || 0) * nA + (i.b || 0) * nB;
    if (!total) return;
    if (i.preparo === 'Cozinhar') {
      const c = cozinhar[i.compra] || (cozinhar[i.compra] = { nome: i.compra, total: 0, un: i.un, det: [] });
      c.total += total;
      c.det.push(i.refeicao.toLowerCase());
    }
    const k = i.compra || i.nome;
    const p = comprar[k] || (comprar[k] = { nome: k, total: 0, un: i.un, cru: i.fator !== 1 });
    p.total += total * (i.fator || 1);
  });
  const listaC = Object.values(cozinhar);
  const listaP = Object.values(comprar);

  const Linha = ({ k, nome, det, valor, destaque }) => {
    const on = !!ok[k];
    return (
      <div className={`row${on ? ' done' : ''}`} style={{ minHeight: det ? 56 : 48 }}>
        <span className="txt">
          <span className="t1" style={{ whiteSpace: 'normal' }}>{nome}</span>
          {det && <span className="t2">{det}</span>}
        </span>
        <span style={{ fontFamily: 'var(--font-num)', fontSize: destaque ? 20 : 18, fontWeight: 700, color: destaque ? 'var(--acc)' : 'var(--fg)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{valor}</span>
        <button type="button" className="check" role="checkbox" aria-checked={on} aria-label={`${nome} ok`} onClick={() => marcar(k)} style={{ width: 48, height: 48, marginLeft: 0, marginRight: -6 }}>
          <span>{on ? '✓' : ''}</span>
        </button>
      </div>
    );
  };

  return (
    <main className="page">
      <header className="head">
        <Link href="/saude" className="icon-btn" aria-label="Voltar para a dieta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow"><h1>Preparo da semana</h1><p>{periodo} · pesos já cozidos</p></div>
      </header>

      <section className="card" aria-label="Dias da semana" style={{ gap: 10 }}>
        <div className="card-head"><h2 style={{ fontSize: 16 }}>Tipo de cada dia</h2><span className="note" style={{ fontSize: 13 }}>{nA} dias A · {nB} dias B</span></div>
        <div className="week7">
          {dias.map((d, i) => (
            <button key={d.data} type="button" className={d.tipo === 'A' ? 'a' : ''} onClick={() => trocar(i)} aria-label={`${d.nome}: Dia ${d.tipo}. Trocar`}>
              <small>{d.nome}</small><b>{d.tipo}</b>
            </button>
          ))}
        </div>
        <p className="note">Toque num dia para trocar entre A e B. Os totais se ajustam e a dieta daquele dia muda junto.</p>
      </section>

      <section className="card list" aria-label="Cozinhar e porcionar">
        <div className="card-head" style={{ padding: '12px 0 4px' }}><h2 style={{ fontSize: 16 }}>Cozinhar e porcionar</h2><span className="note">7 dias</span></div>
        {listaC.map((c) => <Linha key={`c-${c.nome}`} k={`c-${c.nome}`} nome={c.nome} det={[...new Set(c.det)].join(' + ')} valor={fmt(c.total, c.un)} destaque />)}
      </section>

      <section className="card list" aria-label="Lista de compras">
        <div className="card-head" style={{ padding: '12px 0 4px' }}><h2 style={{ fontSize: 16 }}>Lista de compras</h2></div>
        {listaP.map((p) => <Linha key={`p-${p.nome}`} k={`p-${p.nome}`} nome={p.cru ? `${p.nome} (cru)` : p.nome} valor={fmt(p.total, p.un)} />)}
      </section>

      <p className="note" style={{ lineHeight: 1.4 }}>Peso cru estimado: arroz e feijão rendem cerca de 2,5× cozidos; carnes perdem cerca de 25%. O fator de cada alimento fica no campo Fator cru, em Notion › Saúde › Itens da dieta.</p>
    </main>
  );
}
