'use client';

import { useState } from 'react';
import { FormContato } from '../../components/Contato';

export default function NovoContato() {
  const [aberto, setAberto] = useState(false);
  if (!aberto) return <button type="button" className="btn btn-ghost" onClick={() => setAberto(true)}>+ Novo contato</button>;
  return (
    <section className="card" aria-label="Novo contato">
      <div className="note" style={{ marginBottom: 8 }}>Novo contato</div>
      <FormContato onFim={() => setAberto(false)} />
      <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setAberto(false)}>Cancelar</button>
    </section>
  );
}
