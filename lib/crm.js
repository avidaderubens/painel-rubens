import 'server-only';
import { DS } from './config';
import { query } from './notion';
import { hoje, addDias, diasEntre } from './date';

export const FREQ = { Semanal: 7, Mensal: 30, Trimestral: 90 };
const ORDEM = { Quente: 0, Morno: 1, Frio: 2 };

// Situação de cada contato a partir da frequência e do último contato.
function situacao(c, d) {
  if (!c.freq) return { status: 'sem', prazo: null };
  if (!c.ultimo) return { status: 'atrasado', prazo: null };
  const prazo = addDias(c.ultimo, FREQ[c.freq]);
  const falta = diasEntre(d, prazo);
  return { status: falta < 0 ? 'atrasado' : falta === 0 ? 'hoje' : falta <= 7 ? 'semana' : 'ok', prazo, falta };
}

export async function getContatos() {
  const d = hoje();
  const [rows, tarefas] = await Promise.all([
    query(DS.crm),
    query(DS.tarefas, { filter: { and: [{ property: 'CRM', relation: { is_not_empty: true } }, { property: 'Feito', checkbox: { equals: false } }] } })
  ]);
  const abertas = {};
  tarefas.forEach((t) => (t.CRM || []).forEach((id) => { (abertas[id] = abertas[id] || []).push({ id: t.id, nome: t.Nome || 'Tarefa', quando: t.Quando }); }));
  return rows.map((r) => {
    const c = {
      id: r.id,
      nome: (r.Nome || 'Sem nome').trim(),
      freq: r['Frequência'] || null,
      prox: r.Proximidade || null,
      ultimo: r['Último contato'] ? r['Último contato'].slice(0, 10) : null,
      whats: r.WhatsApp || '',
      origem: r.Origem || '',
      notas: (r.Notas || '').replace(/\s*•\s*/g, ' · ').replace(/^ · /, '').replace(/( · )+$/, '').trim(),
      tarefas: abertas[r.id] || []
    };
    return { ...c, ...situacao(c, d), desde: c.ultimo ? diasEntre(c.ultimo, d) : null };
  }).sort((a, b) => (ORDEM[a.prox] ?? 3) - (ORDEM[b.prox] ?? 3) || (a.falta ?? -999) - (b.falta ?? -999) || a.nome.localeCompare(b.nome, 'pt'));
}

export const paraFalar = (lista) => lista.filter((c) => c.status === 'atrasado' || c.status === 'hoje');
