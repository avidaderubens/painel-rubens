'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { concluirTarefa, excluirTarefa, salvarTarefa } from '../../actions';

const RECS = ['Única', 'Diária', 'Semanal', 'Mensal'];
const AJUDA = {
  'Única': 'Some da lista quando você concluir.',
  'Diária': 'Ao concluir, volta amanhã.',
  'Semanal': 'Ao concluir, volta daqui a 7 dias.',
  'Mensal': 'Ao concluir, volta daqui a 1 mês.'
};
const QUANDO = ['Hoje', 'Semana', 'Mês', 'Sem data'];

export default function Detalhe({ t }) {
  const [rec, setRec] = useState(t.recorrencia);
  const [quando, setQuando] = useState(t.quando || 'Sem data');
  const [data, setData] = useState(t.data || '');
  const [msg, setMsg] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [pending, start] = useTransition();

  const salvar = (dados, aviso) => start(async () => { await salvarTarefa(t.id, dados); setMsg(aviso); setTimeout(() => setMsg(''), 1800); });

  return (
    <main className="page">
      <header className="head">
        <Link href="/tarefas" className="icon-btn" aria-label="Voltar para Tarefas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow">
          <div className="label acc">{t.projeto || 'Sem projeto'}</div>
          <h1 style={{ fontSize: 24 }}>{t.nome}</h1>
        </div>
      </header>

      <div className="field">
        <span className="label" id="q-label">Quando</span>
        <div className="seg" role="radiogroup" aria-labelledby="q-label" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {QUANDO.map((q) => (
            <button key={q} type="button" role="radio" aria-checked={quando === q} onClick={() => { setQuando(q); salvar({ quando: q }, 'Salvo'); }}>{q}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="data">Data</label>
        <input id="data" className="input" type="date" value={data} onChange={(e) => { setData(e.target.value); salvar({ data: e.target.value }, 'Data salva'); }} />
      </div>

      <div className="field">
        <span className="label" id="rec-label">Recorrência</span>
        <div className="seg" role="radiogroup" aria-labelledby="rec-label" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {RECS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={rec === r} onClick={() => { setRec(r); salvar({ recorrencia: r }, 'Recorrência salva'); }}>{r}</button>
          ))}
        </div>
        <p className="note">{AJUDA[rec]}</p>
      </div>

      <button type="button" className="btn" disabled={pending} onClick={() => start(async () => { await concluirTarefa(t.id, rec, true); window.location.href = '/tarefas'; })}>
        Concluir tarefa
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        <a href={t.url} target="_blank" rel="noopener" className="btn btn-ghost" style={{ height: 48 }}>Abrir no Notion</a>
        {confirmar
          ? <button type="button" className="btn btn-danger" style={{ height: 48 }} disabled={pending} onClick={() => start(() => excluirTarefa(t.id))}>Confirmar exclusão</button>
          : <button type="button" className="btn btn-danger" style={{ height: 48 }} onClick={() => setConfirmar(true)}>Excluir</button>}
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
    </main>
  );
}
