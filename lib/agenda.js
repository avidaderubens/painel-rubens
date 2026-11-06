import 'server-only';
import { DS, DIAS, TZ } from './config';
import { TIPOS, minutos, ocorre } from './agenda-regras';

export { TIPOS, minutos, ocorre };
import { query } from './notion';
import { addDias, diaSemana } from './date';
import { getTreinos, treinoDoDia } from './treino';
import { getRegistro, getProtocolos, getPlano } from './data';

export function agoraMin() {
  const s = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  return minutos(s);
}

export function segundaDa(dia) {
  return addDias(dia, -((diaSemana(dia) + 6) % 7));
}

export async function getBlocos() {
  const rows = await query(DS.agendaBlocos);
  return rows.map((r) => ({
    id: r.id,
    titulo: r.Bloco || 'Bloco',
    tipo: r.Tipo || 'Pessoal',
    ini: r['Início'] || '',
    fim: r.Fim || '',
    repetir: r.Repetir || 'Não',
    dias: r.Dias || [],
    data: r.Data ? r.Data.slice(0, 10) : null,
    vinculo: r['Vínculo'] || 'Nenhum',
    projetoId: (r.Projeto || [])[0] || null,
    notas: r.Notas || ''
  })).filter((b) => minutos(b.ini) != null && minutos(b.fim) != null);
}

// Monta os blocos de um dia, já com título real do treino e o que dá para fazer em cada um.
export function montarDia(blocos, dia, ctx) {
  const treino = ctx.treinos ? treinoDoDia(ctx.treinos, dia) : null;
  const mob = ctx.treinos ? ctx.treinos.find((t) => t.tipo === 'Mobilidade') : null;
  return blocos.filter((b) => ocorre(b, dia)).map((b) => {
    const out = { ...b, s: minutos(b.ini), e: minutos(b.fim), cor: (TIPOS[b.tipo] || TIPOS.Pessoal).cor, bg: (TIPOS[b.tipo] || TIPOS.Pessoal).bg, auto: b.vinculo !== 'Nenhum', acao: null, feito: false };
    if (b.vinculo === 'Treino do dia') {
      const t = treino || (DIAS[diaSemana(dia)] === 'Qua' ? mob : null);
      if (t) {
        out.titulo = t.foco ? `${t.nome} · ${t.foco}` : t.nome;
        out.acao = { tipo: 'link', href: `/treinos/${t.id}`, texto: 'Abrir treino' };
        out.nota = b.notas || `${t.itens.length} ${t.tipo === 'Corrida' ? 'etapas' : 'exercícios'}${t.duracao ? ` · ~${t.duracao} min` : ''}.`;
      }
    } else if (b.vinculo === 'Refeição') {
      const feitas = (ctx.registro && ctx.registro.refeicoesFeitas) || [];
      const r = (ctx.plano || []).find((p) => p.nome === b.titulo);
      out.feito = feitas.includes(b.titulo);
      out.acao = { tipo: 'refeicao', nome: b.titulo, total: (ctx.plano || []).length, texto: out.feito ? 'Desmarcar' : 'Marcar feito' };
      out.nota = b.notas || (r && r.alimentos) || 'Veja as quantidades em Saúde › Dieta.';
    } else if (b.vinculo === 'Ipamorelin') {
      const p = ctx.ipamorelin;
      out.feito = !!(ctx.registro && ctx.registro.Ipamorelin);
      out.acao = p && !out.feito ? { tipo: 'aplicacao', id: p.id, texto: 'Registrar aplicação' } : null;
      out.nota = b.notas || (p ? `${p.dose || ''} · aplicação da noite.` : '');
    } else if (b.vinculo === 'Tarefas') {
      out.acao = { tipo: 'link', href: '/tarefas', texto: 'Ver tarefas' };
      out.nota = b.notas || 'Tarefas de hoje na aba Tarefas.';
    } else {
      out.nota = b.notas;
    }
    return out;
  }).sort((a, b) => a.s - b.s || b.e - a.e);
}

// Blocos que se sobrepõem dividem a largura.
export function colunas(lista) {
  const out = lista.map((b) => ({ ...b, col: 0, cols: 1 }));
  let grupo = [];
  let fimGrupo = -1;
  const fecha = () => {
    const ativos = [];
    grupo.forEach((b) => {
      let c = 0;
      while (ativos[c] != null && ativos[c] > b.s) c++;
      ativos[c] = b.e;
      b.col = c;
    });
    const n = Math.max(1, ativos.length);
    grupo.forEach((b) => { b.cols = n; });
  };
  out.forEach((b) => {
    if (b.s >= fimGrupo && grupo.length) { fecha(); grupo = []; }
    grupo.push(b);
    fimGrupo = Math.max(fimGrupo, b.e);
  });
  if (grupo.length) fecha();
  return out;
}

export async function contextoDia(dia) {
  const [treinos, registro, { protocolos }, plano] = await Promise.all([
    getTreinos(), getRegistro(dia), getProtocolos(), getPlano()
  ]);
  return { treinos, registro, plano, ipamorelin: protocolos.find((p) => p.nome === 'Ipamorelin') || null };
}
