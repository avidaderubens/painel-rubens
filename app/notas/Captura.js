'use client';

import { useRef, useState, useTransition } from 'react';
import { salvarNota } from '../actions';

export default function Captura({ projetos }) {
  const [projeto, setProjeto] = useState('');
  const [pending, start] = useTransition();
  const ref = useRef(null);

  const enviar = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('projeto', projeto);
    start(async () => { await salvarNota(fd); ref.current.value = ''; });
  };

  return (
    <form onSubmit={enviar} className="card" style={{ borderColor: 'var(--acc)', padding: 14, gap: 10 }}>
      <label htmlFor="texto" style={{ position: 'absolute', left: -9999 }}>Nova nota</label>
      <textarea ref={ref} id="texto" name="texto" rows={4} placeholder="Ideia, tarefa, insight…" required
        style={{ background: 'transparent', border: 0, resize: 'none', fontSize: 17, lineHeight: 1.4, padding: 0, width: '100%' }} />
      <div className="chips">
        <button type="button" className="chip out" aria-pressed={projeto === ''} onClick={() => setProjeto('')}>Sem projeto</button>
        {projetos.map((p) => (
          <button key={p.id} type="button" className="chip out" aria-pressed={projeto === p.id} onClick={() => setProjeto(p.id)}>{p.nome}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="note grow">Vai para o Notion › Notas rápidas</span>
        <button type="submit" className="btn btn-sm" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  );
}
