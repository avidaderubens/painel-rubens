import 'server-only';
import { DS, DIAS, TREINOS } from './config';
import { query } from './notion';
import { hoje, addDias, diaSemana } from './date';

const norm = (id) => String(id || '').replace(/-/g, '');

export async function getProjetos() {
  const rows = await query(DS.projetos);
  const map = {};
  rows.forEach((p) => { map[norm(p.id)] = p.Nome || ''; });
  return { rows, map };
}

export async function getTarefas() {
  const [rows, { map }] = await Promise.all([query(DS.tarefas), getProjetos()]);
  return rows.map((t) => {
    const projId = (t.Projeto || []).find((id) => map[norm(id)]);
    return {
      id: t.id,
      url: t.url,
      nome: (t.Nome || '').replace(/<[^>]*>/g, '').trim(),
      feito: !!t.Feito,
      quando: t.Quando || null,
      recorrencia: t['Recorrência'] || 'Única',
      data: t.Data ? t.Data.slice(0, 10) : null,
      projeto: projId ? map[norm(projId)] : '',
      projetoId: projId || null,
      crm: (t.CRM || []).length > 0
    };
  });
}

// Classifica as tarefas nas abas do app.
export function separar(tarefas, dia = hoje()) {
  const abertas = tarefas.filter((t) => !t.feito);
  const ehHoje = (t) => t.quando === 'Hoje' || (t.data && t.data <= dia) || (t.recorrencia === 'Diária' && !t.data);
  const limite = addDias(dia, 7);
  return {
    hoje: abertas.filter(ehHoje),
    semana: abertas.filter((t) => !ehHoje(t) && (t.quando === 'Semana' || (t.data && t.data <= limite))),
    recorrentes: abertas.filter((t) => t.recorrencia !== 'Única'),
    todas: abertas,
    concluidas: tarefas.filter((t) => t.feito).length
  };
}

export async function getRegistros(desde) {
  const rows = await query(DS.indicadores, {
    filter: { property: 'Data', date: { on_or_after: desde } },
    sorts: [{ property: 'Data', direction: 'ascending' }]
  });
  return rows.map(normalizaRegistro);
}

export async function getRegistro(dia = hoje()) {
  const rows = await query(DS.indicadores, { filter: { property: 'Data', date: { equals: dia } } });
  return rows[0] ? normalizaRegistro(rows[0]) : null;
}

function media(arr) {
  const v = arr.filter((x) => typeof x === 'number');
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
}

function normalizaRegistro(r) {
  const treinos = ['Jiu-jitsu', 'Academia', 'Corrida'].filter((k) => r[k]).length;
  const habitos = treinos + (r['Respiração'] ? 1 : 0) + (r['Dieta ok'] ? 1 : 0);
  return {
    ...r,
    dia: r.Data ? r.Data.slice(0, 10) : null,
    treinos,
    score: Math.round((habitos / 5) * 100),
    paMax: media([r['PA 6h (máx)'], r['PA 12h (máx)'], r['PA 22h (máx)']]),
    paMin: media([r['PA 6h (mín)'], r['PA 12h (mín)'], r['PA 22h (mín)']]),
    peso: r['Peso (kg)'],
    sono: r['Sono (h)'],
    refeicoesFeitas: (r['Refeições feitas'] || '').split('|').filter(Boolean)
  };
}

export async function getAgenda() {
  const rows = await query(DS.agenda);
  return rows.map((a) => ({ id: a.id, nome: a.Treino, dias: a.Dias || [], meta: a['Meta semanal'] || 0, campo: a['Campo no registro'] || a.Treino }));
}

export function treinosDoDia(agenda, dia = hoje()) {
  const sigla = DIAS[diaSemana(dia)];
  return agenda.filter((a) => a.dias.includes(sigla) && TREINOS.includes(a.campo));
}

export async function getPlano() {
  const rows = await query(DS.plano, { sorts: [{ property: 'Ordem', direction: 'ascending' }] });
  return rows.filter((r) => r.Ativa !== false).map((r) => ({ id: r.id, nome: r['Refeição'], horario: r['Horário'] || '', alimentos: r.Alimentos || '' }));
}

export async function getProtocolos() {
  const [prot, apl] = await Promise.all([
    query(DS.protocolos),
    query(DS.aplicacoes, { sorts: [{ property: 'Data', direction: 'descending' }] })
  ]);
  const aplicacoes = apl.map((a) => ({ id: a.id, data: a.Data ? a.Data.slice(0, 10) : null, produtoId: (a.Produto || [])[0] || null, dose: a.Dose || '', local: a.Local || '' }));
  const protocolos = prot.filter((p) => p.Ativo !== false).map((p) => {
    const ultima = aplicacoes.find((a) => norm(a.produtoId) === norm(p.id));
    return { id: p.id, nome: p.Produto, dose: p.Dose || '', frequencia: p['Frequência'] || '', intervalo: p['Intervalo (dias)'] || 1, dias: p['Dias da semana'] || [], ultima: ultima ? ultima.data : null };
  });
  const nomes = {};
  protocolos.forEach((p) => { nomes[norm(p.id)] = p.nome; });
  return { protocolos, aplicacoes: aplicacoes.map((a) => ({ ...a, produto: nomes[norm(a.produtoId)] || '' })) };
}

export async function getMedidas() {
  const rows = await query(DS.medidas, { sorts: [{ property: 'Data', direction: 'descending' }] });
  return rows.map((m) => ({ id: m.id, data: m.Data ? m.Data.slice(0, 10) : null, ...m }));
}

export async function getNotas() {
  const [rows, { map }] = await Promise.all([
    query(DS.notas, { sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
    getProjetos()
  ]);
  return rows.slice(0, 30).map((n) => {
    const p = (n.Projeto || []).find((id) => map[norm(id)]);
    return { id: n.id, nota: n.Nota || '', texto: n.Texto || '', projeto: p ? map[norm(p)] : '', criada: n['Criada em'] };
  });
}
