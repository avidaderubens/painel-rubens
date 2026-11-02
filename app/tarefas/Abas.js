'use client';

import { useState } from 'react';
import { TaskRow, TreinoRow } from '../../components/TaskRow';

const ABAS = [['hoje', 'Hoje'], ['semana', 'Semana'], ['recorrentes', 'Recorrentes'], ['todas', 'Todas']];

export default function Abas({ abas, treinos, diaNome }) {
  const [aba, setAba] = useState('hoje');
  const [busca, setBusca] = useState('');
  const q = busca.trim().toLowerCase();
  const lista = abas[aba].filter((t) => !q || t.nome.toLowerCase().includes(q) || (t.projeto || '').toLowerCase().includes(q));
  const contagem = { ...Object.fromEntries(Object.entries(abas).map(([k, v]) => [k, v.length])) };
  contagem.hoje += treinos.length;

  return (
    <>
      <label htmlFor="busca" style={{ position: 'absolute', left: -9999 }}>Buscar tarefa</label>
      <input id="busca" className="input" type="search" placeholder="Buscar tarefa ou projeto" value={busca} onChange={(e) => setBusca(e.target.value)} />

      <div className="chips" role="tablist" aria-label="Filtro de tarefas">
        {ABAS.map(([k, label]) => (
          <button key={k} type="button" role="tab" className="chip" aria-selected={aba === k} onClick={() => setAba(k)}>
            {label} <span style={{ opacity: 0.7, fontWeight: 500 }}>{contagem[k]}</span>
          </button>
        ))}
      </div>

      {aba === 'hoje' && treinos.length > 0 && !q && (
        <section className="card list" aria-label="Treinos de hoje" style={{ borderColor: 'var(--acc-line)' }}>
          <div className="card-head" style={{ padding: '12px 0 4px' }}>
            <h2 style={{ fontSize: 16 }}>Treinos de hoje</h2>
            <span className="note">{diaNome}</span>
          </div>
          {treinos.map((t) => <TreinoRow key={t.id} treino={t} feito={t.feito} />)}
        </section>
      )}

      <section className="card list" aria-label="Lista de tarefas">
        {lista.map((t) => <TaskRow key={t.id} t={t} />)}
        {lista.length === 0 && (
          <div className="empty" style={{ margin: '12px 0' }}>
            {aba === 'recorrentes'
              ? 'Nenhuma tarefa recorrente ainda. Abra uma tarefa e escolha Diária, Semanal ou Mensal.'
              : q ? 'Nada encontrado.' : 'Nada por aqui.'}
          </div>
        )}
      </section>
      <p className="note" style={{ textAlign: 'center' }}>Toque no quadrado para concluir. Recorrentes voltam sozinhas na próxima data.</p>
    </>
  );
}
