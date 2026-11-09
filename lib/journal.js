import 'server-only';
import { DS } from './config';
import { query } from './notion';
import { addDias } from './date';
import { getRegistros } from './data';

const mapa = (r) => ({
  id: r.id, dia: r.Data ? r.Data.slice(0, 10) : null, tipo: r.Tipo, nota: r.Nota,
  journal: r.Journal || '', vitoria: r['Vitória'] || '', ajustar: r.Ajustar || '', gratidao: r['Gratidão'] || ''
});

export async function getJournal(dia, tipo = 'Dia') {
  const rows = await query(DS.journal, { filter: { and: [{ property: 'Data', date: { equals: dia } }, { property: 'Tipo', select: { equals: tipo } }] } });
  return rows[0] ? mapa(rows[0]) : null;
}

export async function getJournais(de, ate) {
  const rows = await query(DS.journal, {
    filter: { and: [{ property: 'Data', date: { on_or_after: de } }, { property: 'Data', date: { on_or_before: ate } }] },
    sorts: [{ property: 'Data', direction: 'ascending' }]
  });
  return rows.map(mapa);
}

// Tudo o que a revisão da semana precisa: registros, journais e tarefas concluídas.
export async function getSemana(seg) {
  const dom = addDias(seg, 6);
  const [regs, js, feitas] = await Promise.all([
    getRegistros(seg),
    getJournais(seg, dom),
    query(DS.tarefas, { filter: { and: [
      { property: 'Feito', checkbox: { equals: true } },
      { timestamp: 'last_edited_time', last_edited_time: { on_or_after: `${seg}T03:00:00Z` } },
      { timestamp: 'last_edited_time', last_edited_time: { before: `${addDias(dom, 1)}T03:00:00Z` } }
    ] } }).catch(() => [])
  ]);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = addDias(seg, i);
    return {
      dia,
      reg: regs.find((r) => r.dia === dia) || null,
      journal: js.find((j) => j.dia === dia && j.tipo === 'Dia') || null
    };
  });
  return { dias, semana: js.find((j) => j.tipo === 'Semana' && j.dia === seg) || null, tarefasFeitas: feitas.length };
}
