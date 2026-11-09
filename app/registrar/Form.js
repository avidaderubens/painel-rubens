'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { salvarDia } from '../actions';
import Menu from '../../components/Menu';

const v = (x) => (x == null ? '' : String(x));

export default function Form({ dia, r, j, dias, titulo, protocolos, madrugada }) {
  const reg = r || {};
  const jor = j || {};
  const [nota, setNota] = useState(jor.nota ?? null);
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
          <p>{titulo}{r ? ' · editando' : ''}</p>
        </div>
      </header>

      <nav className="ag-strip" aria-label="Escolher o dia">
        {dias.map((x) => (
          <Link key={x.dia} href={`/registrar?d=${x.dia}`} aria-current={x.dia === dia ? 'date' : undefined}>
            <span>{x.sigla}</span>
            <b>{x.num}</b>
            <i>{x.reg && <em style={{ background: '#5cc98a' }} />}{x.jor && <em style={{ background: '#c08cf5' }} />}</i>
          </Link>
        ))}
      </nav>
      <p className="note" style={{ marginTop: -6 }}>
        <span style={{ color: '#5cc98a' }}>●</span> registro <span style={{ color: '#c08cf5', marginLeft: 8 }}>●</span> journal
        {madrugada && <b style={{ color: 'var(--acc)', marginLeft: 8 }}>Madrugada: abrindo o dia de ontem.</b>}
      </p>

      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="dia" value={dia} />
        <section className="card">
          <div className="card-head"><h2>Treinos do dia</h2><span className="note">toque para marcar</span></div>
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
          <label htmlFor="obs" style={{ fontSize: 18, fontWeight: 600 }}>Observações de saúde</label>
          <textarea id="obs" name="obs" rows={2} className="input" placeholder="Dor, cansaço, algo fora do normal…" defaultValue={v(reg.Notas)} />
        </section>

        <section className="card jr" aria-label="Journal do dia">
          <div className="card-head"><h2>Journal</h2><span className="note">vai para o Journal no Notion</span></div>
          <div className="field">
            <span className="label">Nota do dia</span>
            <input type="hidden" name="nota" value={nota ?? ''} />
            <div className="jr-nota" role="radiogroup" aria-label="Nota do dia de 1 a 10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={nota === n} onClick={() => setNota(nota === n ? null : n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="vitoria">Vitória do dia</label><input id="vitoria" name="vitoria" className="input" placeholder="O que deu certo hoje" defaultValue={v(jor.vitoria)} /></div>
          <div className="field"><label htmlFor="ajustar">Ajustar amanhã</label><input id="ajustar" name="ajustar" className="input" placeholder="O que fazer diferente" defaultValue={v(jor.ajustar)} /></div>
          <div className="field"><label htmlFor="gratidao">Gratidão</label><input id="gratidao" name="gratidao" className="input" placeholder="Opcional" defaultValue={v(jor.gratidao)} /></div>
          <div className="field"><label htmlFor="journal">Escrita livre</label><textarea id="journal" name="journal" rows={7} className="input" placeholder="Como foi o dia, o que passou pela cabeça…" defaultValue={v(jor.journal)} /></div>
        </section>

        <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : ok ? 'Salvo ✓' : 'Salvar o dia'}</button>
      </form>
    </main>
  );
}
