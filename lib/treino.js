import 'server-only';
import { DS, DIAS, INICIO_PROTOCOLO, SEMANAS_PROTOCOLO } from './config';
import { query } from './notion';
import { diaSemana, diasEntre } from './date';

const norm = (id) => String(id || '').replace(/-/g, '');

// Converte "90s", "3 min", "0s → tríceps" em segundos.
export function segundos(txt) {
  const s = String(txt || '');
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*min/);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 60);
  const x = s.match(/(\d+)\s*s/);
  return x ? Number(x[1]) : 0;
}

export function semanaProtocolo(dia) {
  const n = Math.floor(diasEntre(INICIO_PROTOCOLO, dia) / 7) + 1;
  const sem = Math.max(1, Math.min(SEMANAS_PROTOCOLO, n));
  const fase = n < 1 ? 'Começa em breve'
    : n <= 2 ? 'calibração'
      : n === 5 || n === 10 ? 'deload'
        : n > SEMANAS_PROTOCOLO ? 'protocolo encerrado'
          : n <= 4 ? 'adaptação' : 'protocolo completo';
  return { semana: sem, total: SEMANAS_PROTOCOLO, fase };
}

function item(r, exMap) {
  const exId = (r['Exercício'] || [])[0];
  const ex = exId ? exMap[norm(exId)] : null;
  return {
    id: r.id,
    nome: ex ? ex.nome : (r.Item || '').replace(/^[A-Z]\d+ · /, ''),
    titulo: r.Item || '',
    treinoId: (r.Treino || [])[0] || null,
    exercicioId: exId || null,
    exercicio: ex,
    ordem: r.Ordem || 0,
    bloco: r.Bloco || '',
    series: r['Séries'] || 0,
    repsMin: r['Reps mín'],
    repsMax: r['Reps máx'],
    unidadeReps: r['Unidade reps'] || 'reps',
    unidadeCarga: r['Unidade carga'] || 'kg',
    descanso: r.Descanso || '',
    descansoSeg: segundos(r.Descanso),
    duracao: r['Duração (s)'] || 0,
    etapa: r.Etapa || null,
    obs: r.Obs || ''
  };
}

export async function getTreinos() {
  const [treinos, itens, exs] = await Promise.all([
    query(DS.treinos, { sorts: [{ property: 'Ordem', direction: 'ascending' }] }),
    query(DS.itensTreino, { sorts: [{ property: 'Ordem', direction: 'ascending' }] }),
    query(DS.exercicios)
  ]);
  const exMap = {};
  exs.forEach((e) => {
    exMap[norm(e.id)] = { id: e.id, nome: e.Nome || '', tipo: e.Tipo, categoria: e.Categoria || '', execucao: e['Execução'] || '', erros: e['Erros comuns'] || '', video: e['Vídeo'] || '' };
  });
  const lista = itens.map((r) => item(r, exMap));
  return treinos.map((t) => ({
    id: t.id,
    nome: t.Nome || '',
    codigo: t['Código'] || '',
    tipo: t.Tipo || '',
    dia: t.Dia || '',
    foco: t.Foco || '',
    duracao: t['Duração (min)'] || 0,
    notas: t.Notas || '',
    itens: lista.filter((i) => norm(i.treinoId) === norm(t.id)).sort((a, b) => a.ordem - b.ordem)
  }));
}

export function treinoDoDia(treinos, dia) {
  const sigla = DIAS[diaSemana(dia)];
  return treinos.find((t) => t.dia === sigla) || null;
}

// Séries registradas. Filtra por exercício quando informado.
export async function getSeries({ exercicioId, desde } = {}) {
  const and = [];
  if (exercicioId) and.push({ property: 'Exercício', relation: { contains: exercicioId } });
  if (desde) and.push({ property: 'Data', date: { on_or_after: desde } });
  const rows = await query(DS.series, {
    ...(and.length ? { filter: and.length === 1 ? and[0] : { and } } : {}),
    sorts: [{ property: 'Data', direction: 'descending' }]
  });
  return rows.map((r) => ({
    id: r.id,
    data: r.Data ? r.Data.slice(0, 10) : null,
    exercicioId: (r['Exercício'] || [])[0] || null,
    treinoId: (r.Treino || [])[0] || null,
    serie: r['Série'],
    carga: r.Carga,
    reps: r.Reps
  }));
}

export async function getCorridas() {
  const rows = await query(DS.corridas, { sorts: [{ property: 'Data', direction: 'descending' }] });
  return rows.slice(0, 8).map((r) => ({ id: r.id, data: r.Data ? r.Data.slice(0, 10) : null, tiros: r.Tiros, pse: r.PSE, km: r['Distância (km)'], fc: r['FC média'] }));
}

export async function getBolt() {
  const rows = await query(DS.bolt, { sorts: [{ property: 'Data', direction: 'descending' }] });
  return rows.filter((r) => r.Data && typeof r.Segundos === 'number').slice(0, 26).map((r) => ({ id: r.id, data: r.Data.slice(0, 10), segundos: r.Segundos }));
}

export { norm };
