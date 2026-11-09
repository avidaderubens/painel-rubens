'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { salvarRevisao } from '../actions';

function Salvar({ ok }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : ok ? 'Salvo ✓' : 'Salvar revisão da semana'}</button>;
}

export default function FormSemana({ seg, s }) {
  const [estado, acao] = useFormState(salvarRevisao, null);
  const [nota, setNota] = useState(s?.nota ?? null);
  return (
    <form action={acao} className="card jr" aria-label="Revisão escrita da semana">
      <div className="card-head"><h2>Sua revisão da semana</h2><span className="note">domingo à noite</span></div>
      <input type="hidden" name="seg" value={seg} />
      <div className="field">
        <span className="label">Nota da semana</span>
        <input type="hidden" name="nota" value={nota ?? ''} />
        <div className="jr-nota" role="radiogroup" aria-label="Nota da semana de 1 a 10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={nota === n} onClick={() => setNota(nota === n ? null : n)}>{n}</button>
          ))}
        </div>
      </div>
      <div className="field"><label htmlFor="sv">O que funcionou</label><textarea id="sv" name="vitoria" rows={3} className="input" defaultValue={s?.vitoria || ''} /></div>
      <div className="field"><label htmlFor="sa">O que não funcionou</label><textarea id="sa" name="ajustar" rows={3} className="input" defaultValue={s?.ajustar || ''} /></div>
      <div className="field"><label htmlFor="sj">Foco da próxima semana</label><textarea id="sj" name="journal" rows={3} className="input" defaultValue={s?.journal || ''} /></div>
      {estado?.erro && <p role="alert" style={{ margin: 0, color: 'var(--bad)' }}>{estado.erro}</p>}
      <Salvar ok={estado?.ok} />
    </form>
  );
}
