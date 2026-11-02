'use client';

import { useState, useTransition } from 'react';
import { salvarDiasTreino } from '../actions';

const SEMANA = [['Dom', 'Domingo'], ['Seg', 'Segunda'], ['Ter', 'Terça'], ['Qua', 'Quarta'], ['Qui', 'Quinta'], ['Sex', 'Sexta'], ['Sáb', 'Sábado']];

export default function Dias({ item }) {
  const [dias, setDias] = useState(item.dias);
  const [, start] = useTransition();
  const toggle = (s) => {
    const novo = dias.includes(s) ? dias.filter((x) => x !== s) : [...dias, s];
    setDias(novo);
    start(() => salvarDiasTreino(item.id, novo));
  };
  return (
    <div className="field">
      <span style={{ fontSize: 14, fontWeight: 600 }}>{item.nome}</span>
      <div role="group" aria-label={`Dias de ${item.nome}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 4 }}>
        {SEMANA.map(([s, nome]) => {
          const on = dias.includes(s);
          return (
            <button key={s} type="button" aria-pressed={on} aria-label={nome} onClick={() => toggle(s)}
              style={{ height: 40, borderRadius: 10, border: `1px solid ${on ? 'var(--acc)' : '#2c2c32'}`, background: on ? 'var(--acc-soft)' : 'var(--panel-2)', color: on ? 'var(--acc)' : 'var(--dim)', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>
              {s.slice(0, 1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
