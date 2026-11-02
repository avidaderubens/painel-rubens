'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { marcarRefeicao, registrarAplicacao, salvarMedidas } from '../actions';
import { Spark } from '../../components/Charts';

const ddmm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—');
const MEDIDAS = [
  ['peso', 'Peso (kg)', 'Peso', 'kg'], ['gordura', '% gordura', '% gordura', '%'],
  ['cintura', 'Cintura (cm)', 'Cintura', 'cm'], ['abdomen', 'Abdômen (cm)', 'Abdômen', 'cm'],
  ['peito', 'Peito (cm)', 'Peito', 'cm'], ['braco', 'Braço (cm)', 'Braço', 'cm'],
  ['coxa', 'Coxa (cm)', 'Coxa', 'cm'], ['quadril', 'Quadril (cm)', 'Quadril', 'cm']
];
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function Dieta({ plano, feitas }) {
  const [lista, setLista] = useOptimistic(feitas);
  const [, start] = useTransition();
  const toggle = (nome) => start(async () => {
    const on = !lista.includes(nome);
    setLista(on ? [...lista, nome] : lista.filter((x) => x !== nome));
    await marcarRefeicao(nome, on, plano.length);
  });
  const qtd = plano.filter((p) => lista.includes(p.nome)).length;
  return (
    <>
      <section className="card">
        <div className="label">Dieta de hoje</div>
        <div className="big">{qtd}<small> / {plano.length} refeições</small></div>
        <div className="track"><i style={{ width: `${plano.length ? (qtd / plano.length) * 100 : 0}%` }} /></div>
      </section>
      <section className="card list" aria-label="Refeições">
        {plano.map((p) => {
          const on = lista.includes(p.nome);
          return (
            <div key={p.id} className={`row${on ? ' done' : ''}`} style={{ minHeight: 72 }}>
              <div style={{ width: 52, flexShrink: 0, fontFamily: 'var(--font-num)', fontSize: 16, fontWeight: 700 }} className="acc">{p.horario || '—'}</div>
              <span className="txt"><span className="t1">{p.nome}</span><span className="t2" style={{ whiteSpace: 'normal' }}>{p.alimentos || 'Alimentos ainda não cadastrados'}</span></span>
              <button type="button" className="check" role="checkbox" aria-checked={on} aria-label={`Marcar ${p.nome}`} onClick={() => toggle(p.nome)} style={{ marginLeft: 0, marginRight: -10 }}>
                <span>{on ? '✓' : ''}</span>
              </button>
            </div>
          );
        })}
        {plano.length === 0 && <div className="empty" style={{ margin: '12px 0' }}>Nenhuma refeição no plano. Cadastre no Notion › Saúde › Plano alimentar.</div>}
      </section>
      <p className="note" style={{ textAlign: 'center' }}>Horários e alimentos são editados no Notion › Saúde › Plano alimentar.</p>
    </>
  );
}

function Protocolos({ protocolos, aplicacoes, diaSigla }) {
  const [pending, start] = useTransition();
  const [feito, setFeito] = useState({});
  return (
    <>
      {protocolos.map((p) => (
        <section key={p.id} className="card" aria-label={p.nome}>
          <div className="card-head"><h2>{p.nome}</h2><span className="note">{[p.dose, p.frequencia].filter(Boolean).join(' · ')}</span></div>
          {p.intervalo > 1 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
                  <div className="note">Última</div><div style={{ fontSize: 17, fontWeight: 700 }}>{ddmm(p.ultima)}</div>
                </div>
                <div style={{ background: 'var(--acc-soft)', border: '1px solid var(--acc-line)', borderRadius: 12, padding: '10px 12px' }}>
                  <div className="note acc">Próxima</div><div className="acc" style={{ fontSize: 17, fontWeight: 700 }}>{ddmm(p.prox.data)} · {p.prox.txt}</div>
                </div>
              </div>
              {p.prox.frac != null && <div className="track"><i style={{ width: `${p.prox.frac * 100}%` }} /></div>}
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 4 }}>
                {SEMANA.map((s) => {
                  const ativo = p.dias.includes(s);
                  const hojeDia = s === diaSigla;
                  return (
                    <div key={s} style={{ height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                      border: `1px solid ${hojeDia ? 'var(--acc)' : ativo ? '#2c2c32' : 'var(--line-soft)'}`, background: ativo ? 'var(--panel)' : 'var(--panel-2)', color: ativo ? 'var(--muted)' : '#4a4a52' }}>
                      {s.slice(0, 1)}
                    </div>
                  );
                })}
              </div>
              <p className="note">Próxima: {p.prox.txt || '—'}</p>
            </>
          )}
          <button type="button" className={`btn ${p.hoje || feito[p.id] ? 'btn-ghost' : ''}`} style={{ height: 48 }} disabled={pending || p.hoje || feito[p.id]}
            onClick={() => start(async () => { setFeito((f) => ({ ...f, [p.id]: true })); await registrarAplicacao(p.id); })}>
            {p.hoje || feito[p.id] ? 'Aplicado hoje ✓' : `+ Registrar aplicação de hoje`}
          </button>
        </section>
      ))}
      <section className="card list" aria-label="Histórico de aplicações">
        <h2 style={{ margin: '12px 0 4px', fontSize: 16 }}>Histórico</h2>
        {aplicacoes.map((a) => (
          <div key={a.id} className="row" style={{ minHeight: 52 }}>
            <span className="acc" style={{ width: 52, fontWeight: 700 }}>{ddmm(a.data)}</span>
            <span className="grow" style={{ fontWeight: 600 }}>{a.produto}</span>
            <span className="note">{[a.dose, a.local].filter(Boolean).join(' · ')}</span>
          </div>
        ))}
        {aplicacoes.length === 0 && <div className="empty" style={{ margin: '0 0 12px' }}>Nenhuma aplicação registrada.</div>}
      </section>
    </>
  );
}

function Corpo({ medidas }) {
  const [aberto, setAberto] = useState(false);
  const [pending, start] = useTransition();
  const ultima = medidas[0];
  const enviar = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => { await salvarMedidas(fd); setAberto(false); });
  };
  const fmt = (x) => (x == null ? '—' : String(x).replace('.', ','));
  return (
    <>
      <section className="card" aria-label="Última medição">
        <div className="card-head"><h2>Medidas</h2><span className="note">última: {ultima ? ddmm(ultima.data) : '—'}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
          {MEDIDAS.map(([, campo, nome, un]) => {
            const serie = medidas.slice().reverse().map((m) => m[campo]);
            return (
              <div key={campo} style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="note">{nome}</span>
                <span style={{ fontFamily: 'var(--font-num)', fontSize: 22, fontWeight: 700 }}>{fmt(ultima ? ultima[campo] : null)}<span className="note"> {un}</span></span>
                <Spark values={serie} height={28} />
              </div>
            );
          })}
        </div>
        {medidas.length < 2 && <p className="note">Os mini-gráficos aparecem a partir da 2ª medição. Meça a cada 15 dias.</p>}
      </section>
      {!aberto && <button type="button" className="btn" onClick={() => setAberto(true)}>+ Registrar medidas de hoje</button>}
      {aberto && (
        <form onSubmit={enviar} className="card">
          <h2>Medidas de hoje</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            {MEDIDAS.map(([k, , nome, un]) => (
              <div key={k} className="field">
                <label htmlFor={`m-${k}`}>{nome} ({un})</label>
                <input id={`m-${k}`} name={k} className="input num" type="number" step="0.1" inputMode="decimal" />
              </div>
            ))}
          </div>
          <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : 'Salvar medidas'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setAberto(false)}>Cancelar</button>
        </form>
      )}
    </>
  );
}

export default function Saude({ plano, feitas, protocolos, aplicacoes, medidas, diaSigla }) {
  const [tab, setTab] = useState('dieta');
  return (
    <main className="page">
      <header className="head">
        <Link href="/" className="icon-btn" aria-label="Voltar ao painel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow"><h1>Saúde</h1><p>Plano, protocolos e evolução do corpo</p></div>
      </header>
      <div className="seg" role="tablist" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        {[['dieta', 'Dieta'], ['proto', 'Protocolos'], ['corpo', 'Corpo']].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'dieta' && <Dieta plano={plano} feitas={feitas} />}
      {tab === 'proto' && <Protocolos protocolos={protocolos} aplicacoes={aplicacoes} diaSigla={diaSigla} />}
      {tab === 'corpo' && <Corpo medidas={medidas} />}
    </main>
  );
}
