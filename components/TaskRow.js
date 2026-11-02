'use client';

import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import { concluirTarefa, marcarCampo } from '../app/actions';

const pillClass = { 'Diária': 'pill d', 'Semanal': 'pill s', 'Mensal': 'pill m' };

export function TaskRow({ t }) {
  const [feito, setFeito] = useOptimistic(t.feito);
  const [pending, start] = useTransition();
  const toggle = () => start(async () => { setFeito(!feito); await concluirTarefa(t.id, t.recorrencia, !feito); });
  const sub = [t.projeto, t.data ? `${t.data.slice(8, 10)}/${t.data.slice(5, 7)}` : ''].filter(Boolean).join(' · ');
  return (
    <div className={`row${feito ? ' done' : ''}`}>
      <button type="button" className="check" role="checkbox" aria-checked={feito} aria-label={`Concluir ${t.nome}`} onClick={toggle} disabled={pending}>
        <span>{feito ? '✓' : ''}</span>
      </button>
      <Link href={`/tarefas/${t.id}`} className="txt">
        <span className="t1">{t.nome}</span>
        {sub && <span className="t2">{sub}</span>}
      </Link>
      <span className={pillClass[t.recorrencia] || 'pill'}>{t.recorrencia}</span>
    </div>
  );
}

export function TreinoRow({ treino, feito: inicial }) {
  const [feito, setFeito] = useOptimistic(inicial);
  const [pending, start] = useTransition();
  const toggle = () => start(async () => { setFeito(!feito); await marcarCampo(treino.campo, !feito); });
  return (
    <div className={`row${feito ? ' done' : ''}`}>
      <button type="button" className="check" role="checkbox" aria-checked={feito} aria-label={`Marcar ${treino.nome}`} onClick={toggle} disabled={pending}>
        <span>{feito ? '✓' : ''}</span>
      </button>
      <span className="txt"><span className="t1">{treino.nome}</span><span className="t2">Marca também no Registrar o dia</span></span>
      <span className="pill treino">Treino</span>
    </div>
  );
}
