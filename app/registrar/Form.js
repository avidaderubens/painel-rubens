'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { salvarDia } from '../actions';
import Menu from '../../components/Menu';

const v = (x) => (x == null ? '' : String(x));

export default function Form({ r, titulo, protocolos }) {
  const reg = r || {};
  const [sono, setSono] = useState(reg.sono ?? 7);
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => { await salvarDia(fd); setOk(true); setTimeout(() => setOk(false), 2200); });
  };

  const treino = (nome) => (
    <label className="toggle" key={nome}>
      <input type="checkbox" name={nome} defaultChecked={!!reg[nome]} />
      {nome}
    </label>
  );
  const pa = (h) => (
    <>
      <label htmlFor={`pa${h}max`}>{h}h</label>
      <input id={`pa${h}max`} name={`pa${h}max`} className="input num" type="number" inputMode="numeric" placeholder="120" aria-label={`${h}h máxima`} defaultValue={v(reg[`PA ${h}h (máx)`])} />
      <input id={`pa${h}min`} name={`pa${h}min`} className="input num" type="number" inputMode="numeric" placeholder="80" aria-label={`${h}h mínima`} defaultValue={v(reg[`PA ${h}h (mín)`])} />
    </>
  );
  const sw = (nome, sub) => (
    <label className="switch-row" key={nome}>
      <input type="checkbox" name={nome} defaultChecked={!!reg[nome]} />
      <span className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{nome}</span>
        <span className="note">{sub}</span>
      </span>
      <span className="switch"><i /></span>
    </label>
  );

  return (
    <main className="page">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Registrar o dia</h1>
          <p>{titulo}{r ? ' · já tem registro, você está editando' : ''}</p>
        </div>
      </header>

      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section className="card">
          <div className="card-head"><h2>Treinos de hoje</h2><span className="note">toque para marcar</span></div>
          <div className="toggle-grid">{['Jiu-jitsu', 'Academia', 'Corrida', 'Respiração'].map(treino)}</div>
          <p className="note">Os treinos do dia também aparecem em Tarefas › Hoje.</p>
        </section>

        <section className="card">
          <div className="card-head"><h2>Pressão arterial</h2><span className="note">mmHg · máx / mín</span></div>
          <div className="pa-grid">{pa(6)}{pa(12)}{pa(22)}</div>
          <p className="note">Pode salvar só o horário que já mediu. Volte depois e complete.</p>
        </section>

        <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
          <div className="field">
            <label htmlFor="peso">Peso (kg)</label>
            <input id="peso" name="peso" className="input bignum" type="number" inputMode="decimal" step="0.1" placeholder="0,0" defaultValue={v(reg.peso)} />
          </div>
          <div className="field">
            <span className="label">Sono (h)</span>
            <div className="stepper">
              <button type="button" aria-label="Menos meia hora" onClick={() => setSono((s) => Math.max(0, +s - 0.5))}>−</button>
              <input name="sono" aria-label="Horas de sono" type="number" step="0.5" inputMode="decimal" value={sono} onChange={(e) => setSono(e.target.value)} />
              <button type="button" aria-label="Mais meia hora" onClick={() => setSono((s) => Math.min(14, +s + 0.5))}>+</button>
            </div>
          </div>
        </section>

        <section className="card" style={{ gap: 0 }}>
          <h2 style={{ marginBottom: 8 }}>Protocolos</h2>
          {sw('Ipamorelin', protocolos.Ipamorelin || 'Toda noite, menos sáb e dom')}
          {sw('Retatrutida', protocolos.Retatrutida || 'A cada 15 dias')}
          <Link href="/saude" className="switch-row acc" style={{ textDecoration: 'none', fontWeight: 600, justifyContent: 'space-between' }}>
            Dieta, aplicações e medidas <span aria-hidden="true">›</span>
          </Link>
        </section>

        <section className="card">
          <label htmlFor="obs" style={{ fontSize: 18, fontWeight: 600 }}>Observações</label>
          <textarea id="obs" name="obs" rows={3} className="input" placeholder="Como você se sentiu, algo fora do normal…" defaultValue={v(reg.Notas)} />
        </section>

        <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : ok ? 'Salvo ✓' : 'Salvar o dia'}</button>
      </form>
    </main>
  );
}
