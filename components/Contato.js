'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { tarefaDoContato, faleiHoje, salvarContato } from '../app/actions';

const COR = { Quente: '#ff6b5e', Morno: '#ffc14d', Frio: '#7aa2f7' };
const SIT = {
  atrasado: ['Atrasado', '#ff6b5e'],
  hoje: ['Hoje', '#ff7a1a'],
  semana: ['Esta semana', '#ffc14d'],
  ok: ['Em dia', '#5cc98a'],
  sem: ['Sem frequência', '#9a9aa2']
};

function quando(c) {
  if (!c.ultimo) return 'Nunca registrado';
  if (c.desde === 0) return 'Falou hoje';
  return `Último contato há ${c.desde} dia${c.desde === 1 ? '' : 's'}`;
}

function whatsLink(n) {
  const d = String(n || '').replace(/\D/g, '');
  if (!d) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}

function Salvar() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>;
}

export function FormContato({ c, onFim }) {
  const [estado, acao] = useFormState(salvarContato, null);
  useEffect(() => { if (estado?.ok && onFim) onFim(); }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <form action={acao} className="crm-form">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="field"><label htmlFor={`n-${c?.id || 'novo'}`}>Nome</label><input id={`n-${c?.id || 'novo'}`} name="nome" className="input" defaultValue={c?.nome || ''} required /></div>
      <div className="crm-2">
        <div className="field"><label htmlFor={`f-${c?.id || 'novo'}`}>Falar a cada</label>
          <select id={`f-${c?.id || 'novo'}`} name="freq" className="input" defaultValue={c?.freq || ''}>
            <option value="">Sem frequência</option><option>Semanal</option><option>Mensal</option><option>Trimestral</option>
          </select></div>
        <div className="field"><label htmlFor={`p-${c?.id || 'novo'}`}>Proximidade</label>
          <select id={`p-${c?.id || 'novo'}`} name="prox" className="input" defaultValue={c?.prox || ''}>
            <option value="">—</option><option>Quente</option><option>Morno</option><option>Frio</option>
          </select></div>
      </div>
      <div className="crm-2">
        <div className="field"><label htmlFor={`w-${c?.id || 'novo'}`}>WhatsApp</label><input id={`w-${c?.id || 'novo'}`} name="whats" type="tel" inputMode="tel" className="input" defaultValue={c?.whats || ''} placeholder="47 99999-9999" /></div>
        <div className="field"><label htmlFor={`o-${c?.id || 'novo'}`}>Origem</label><input id={`o-${c?.id || 'novo'}`} name="origem" className="input" defaultValue={c?.origem || ''} placeholder="Jiu-jitsu, cliente…" /></div>
      </div>
      <div className="field"><label htmlFor={`t-${c?.id || 'novo'}`}>Notas</label><textarea id={`t-${c?.id || 'novo'}`} name="notas" className="input" rows={2} defaultValue={c?.notas || ''} /></div>
      {estado?.erro && <p role="alert" style={{ margin: 0, color: 'var(--bad)' }}>{estado.erro}</p>}
      <Salvar />
    </form>
  );
}

export default function Contato({ c, compacto }) {
  const [pend, start] = useTransition();
  const [feito, setFeito] = useState(null); // 'tarefa' | 'falei'
  const [editar, setEditar] = useState(false);
  const temTarefa = c.tarefas.length > 0 || feito === 'tarefa';
  const sit = feito === 'falei' ? SIT.ok : SIT[c.status];
  const wa = whatsLink(c.whats);

  return (
    <article className="card crm-card" style={{ borderLeftColor: c.prox ? COR[c.prox] : '#26262b' }}>
      <div className="crm-top">
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="crm-nome">{c.nome}</div>
          <div className="crm-meta">
            <span style={{ color: sit[1] }}>● {feito === 'falei' ? 'Falou hoje' : sit[0]}</span>
            {c.freq && <span>{c.freq}</span>}
            {c.prox && <span>{c.prox}</span>}
          </div>
        </div>
        {!compacto && (
          <button type="button" className="icon-btn" aria-label={`Editar ${c.nome}`} aria-expanded={editar} onClick={() => setEditar((v) => !v)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
          </button>
        )}
      </div>
      <p className="crm-sub">{feito === 'falei' ? 'Falou hoje' : quando(c)}{c.notas ? ` · ${c.notas}` : ''}</p>
      {c.tarefas.length > 0 && feito !== 'falei' && (
        <ul className="crm-tar">{c.tarefas.map((t) => <li key={t.id}>{t.nome}{t.quando ? <small> · {t.quando}</small> : null}</li>)}</ul>
      )}
      <div className="crm-acoes">
        <button
          type="button" className="btn btn-sm btn-ghost" disabled={pend || temTarefa || feito === 'falei'}
          onClick={() => { setFeito('tarefa'); start(() => tarefaDoContato(c.id, c.nome)); }}
        >
          {temTarefa ? '✓ Em tarefas' : '→ Tarefa'}
        </button>
        <button
          type="button" className="btn btn-sm" disabled={pend || feito === 'falei'}
          onClick={() => { setFeito('falei'); start(() => faleiHoje(c.id, c.tarefas.map((t) => t.id))); }}
        >
          {feito === 'falei' ? '✓ Registrado' : 'Falei hoje'}
        </button>
        {wa && <a className="btn btn-sm btn-ghost crm-wa" href={wa} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${c.nome}`}>WhatsApp</a>}
      </div>
      {editar && <FormContato c={c} onFim={() => setEditar(false)} />}
    </article>
  );
}
