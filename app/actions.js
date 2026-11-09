'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { DS } from '../lib/config';
import { createPage, updatePage, query, W } from '../lib/notion';
import { getRegistro, getProtocolos } from '../lib/data';
import { hoje, addDias, addMeses, ddmm, valida } from '../lib/date';
import { getJournal } from '../lib/journal';
import { COOKIE, tokenEsperado } from '../lib/auth';

const atualizar = () => revalidatePath('/', 'layout');

// ---------- Login ----------
export async function entrar(_prev, formData) {
  const senha = String(formData.get('senha') || '');
  if (!process.env.APP_PASSWORD) return { erro: 'APP_PASSWORD não configurada na Vercel.' };
  if (senha !== process.env.APP_PASSWORD) return { erro: 'Senha incorreta.' };
  cookies().set(COOKIE, await tokenEsperado(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  redirect('/');
}

export async function sair() {
  cookies().delete(COOKIE);
  redirect('/login');
}

// ---------- Registro do dia ----------
async function upsertRegistro(props, dia = hoje()) {
  const atual = await getRegistro(dia);
  if (atual) return updatePage(atual.id, props);
  return createPage(DS.indicadores, { Dia: W.title(ddmm(dia)), Data: W.date(dia), ...props });
}

export async function marcarCampo(campo, valor) {
  await upsertRegistro({ [campo]: W.check(valor) });
  atualizar();
}

export async function salvarDia(formData) {
  const n = (k) => W.num(formData.get(k));
  const c = (k) => W.check(formData.get(k) === 'on');
  const t = (k) => String(formData.get(k) || '').trim();
  const d = valida(t('dia')) || hoje();
  // Protocolo marcado agora (e não antes) vira uma aplicação no histórico.
  const antes = await getRegistro(d);
  const { protocolos, aplicacoes } = await getProtocolos();
  for (const nome of ['Ipamorelin', 'Retatrutida']) {
    const marcadoAgora = formData.get(nome) === 'on' && !(antes && antes[nome]);
    const p = protocolos.find((x) => x.nome === nome);
    const jaTem = p && aplicacoes.some((a) => a.data === d && String(a.produtoId).replace(/-/g, '') === p.id.replace(/-/g, ''));
    if (marcadoAgora && p && !jaTem) {
      await createPage(DS.aplicacoes, { 'Aplicação': W.title(`${p.nome} · ${ddmm(d)}`), Data: W.date(d), Produto: W.rel([p.id]), Dose: W.text(p.dose) });
    }
  }
  await upsertRegistro({
    'Jiu-jitsu': c('Jiu-jitsu'), Academia: c('Academia'), Corrida: c('Corrida'), 'Respiração': c('Respiração'),
    'PA 6h (máx)': n('pa6max'), 'PA 6h (mín)': n('pa6min'),
    'PA 12h (máx)': n('pa12max'), 'PA 12h (mín)': n('pa12min'),
    'PA 22h (máx)': n('pa22max'), 'PA 22h (mín)': n('pa22min'),
    'Peso (kg)': n('peso'), 'Sono (h)': n('sono'),
    Ipamorelin: c('Ipamorelin'), Retatrutida: c('Retatrutida'),
    Notas: W.text(formData.get('obs'))
  }, d);
  // Journal do dia: só grava se tiver algo escrito ou nota.
  if (t('journal') || t('vitoria') || t('ajustar') || t('gratidao') || t('nota')) {
    await upsertJournal(d, 'Dia', {
      Nota: W.num(t('nota')), Journal: W.text(t('journal')), 'Vitória': W.text(t('vitoria')),
      Ajustar: W.text(t('ajustar')), 'Gratidão': W.text(t('gratidao'))
    });
  }
  atualizar();
  return { ok: true };
}

async function upsertJournal(dia, tipo, props) {
  const atual = await getJournal(dia, tipo);
  if (atual) return updatePage(atual.id, props);
  return createPage(DS.journal, { Entrada: W.title(`${tipo === 'Semana' ? 'Semana de ' : ''}${ddmm(dia)}`), Data: W.date(dia), Tipo: W.select(tipo), ...props });
}

export async function salvarRevisao(_prev, formData) {
  const t = (k) => String(formData.get(k) || '').trim();
  const seg = valida(t('seg'));
  if (!seg) return { erro: 'Semana inválida.' };
  await upsertJournal(seg, 'Semana', {
    Nota: W.num(t('nota')), 'Vitória': W.text(t('vitoria')), Ajustar: W.text(t('ajustar')), Journal: W.text(t('journal'))
  });
  atualizar();
  return { ok: true, t: Date.now() };
}

export async function marcarRefeicao(nome, feita, totalPlano) {
  const atual = await getRegistro();
  const lista = new Set(atual ? atual.refeicoesFeitas : []);
  if (feita) lista.add(nome); else lista.delete(nome);
  const arr = [...lista];
  await upsertRegistro({
    'Refeições feitas': W.text(arr.join('|')),
    'Refeições cumpridas': W.num(arr.length),
    'Dieta ok': W.check(totalPlano > 0 && arr.length >= totalPlano)
  });
  atualizar();
}

// ---------- Tarefas ----------
export async function concluirTarefa(id, recorrencia, feito) {
  if (recorrencia && recorrencia !== 'Única' && feito) {
    // Recorrente: em vez de marcar Feito, empurra a data para a próxima vez.
    const d = hoje();
    const prox = recorrencia === 'Diária' ? addDias(d, 1) : recorrencia === 'Semanal' ? addDias(d, 7) : addMeses(d, 1);
    await updatePage(id, { Data: W.date(prox), Feito: W.check(false) });
  } else {
    await updatePage(id, { Feito: W.check(feito) });
  }
  atualizar();
}

export async function salvarTarefa(id, dados) {
  const props = {};
  if (dados.recorrencia) props['Recorrência'] = W.select(dados.recorrencia);
  if ('quando' in dados) props.Quando = W.select(dados.quando || null);
  if ('data' in dados) props.Data = W.date(dados.data || null);
  if ('nome' in dados) props.Nome = W.title(dados.nome);
  await updatePage(id, props);
  atualizar();
}

export async function criarTarefa(formData) {
  const projeto = String(formData.get('projeto') || '');
  await createPage(DS.tarefas, {
    Nome: W.title(formData.get('nome')),
    Quando: W.select(formData.get('quando') || 'Hoje'),
    'Recorrência': W.select(formData.get('recorrencia') || 'Única'),
    Data: W.date(formData.get('data') || null),
    Feito: W.check(false),
    ...(projeto ? { Projeto: W.rel([projeto]) } : {})
  });
  atualizar();
  redirect('/tarefas');
}

export async function excluirTarefa(id) {
  // Arquiva no Notion (vai para a lixeira, dá para restaurar).
  await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
    body: JSON.stringify({ in_trash: true })
  });
  atualizar();
  redirect('/tarefas');
}

// ---------- Notas ----------
export async function salvarNota(formData) {
  const texto = String(formData.get('texto') || '').trim();
  if (!texto) return;
  const projeto = String(formData.get('projeto') || '');
  const titulo = texto.split('\n')[0].slice(0, 80);
  await createPage(DS.notas, {
    Nota: W.title(titulo),
    Texto: W.text(texto),
    ...(projeto ? { Projeto: W.rel([projeto]) } : {})
  });
  atualizar();
}

// ---------- Saúde ----------
export async function registrarAplicacao(protocoloId) {
  const { protocolos } = await getProtocolos();
  const p = protocolos.find((x) => x.id === protocoloId);
  if (!p) return;
  const d = hoje();
  await createPage(DS.aplicacoes, {
    'Aplicação': W.title(`${p.nome} · ${ddmm(d)}`),
    Data: W.date(d),
    Produto: W.rel([p.id]),
    Dose: W.text(p.dose)
  });
  if (p.nome === 'Ipamorelin' || p.nome === 'Retatrutida') await upsertRegistro({ [p.nome]: W.check(true) });
  atualizar();
}

export async function salvarMedidas(formData) {
  const n = (k) => W.num(formData.get(k));
  const d = hoje();
  await createPage(DS.medidas, {
    'Medição': W.title(`Medição ${ddmm(d)}`),
    Data: W.date(d),
    'Peso (kg)': n('peso'), '% gordura': n('gordura'),
    'Cintura (cm)': n('cintura'), 'Abdômen (cm)': n('abdomen'),
    'Peito (cm)': n('peito'), 'Braço (cm)': n('braco'),
    'Coxa (cm)': n('coxa'), 'Quadril (cm)': n('quadril')
  });
  atualizar();
}

// ---------- Perfil ----------
export async function salvarDiasTreino(id, dias) {
  await updatePage(id, { Dias: W.multi(dias) });
  atualizar();
}

// ---------- Treinos ----------
// Grava (ou atualiza) uma série do dia no Registro de séries.
export async function salvarSerie({ exercicioId, treinoId, nome, serie, carga, reps }) {
  const d = hoje();
  const existentes = await query(DS.series, {
    filter: { and: [
      { property: 'Data', date: { equals: d } },
      { property: 'Exercício', relation: { contains: exercicioId } },
      { property: 'Série', number: { equals: serie } }
    ] }
  });
  const props = { Carga: W.num(carga), Reps: W.num(reps) };
  if (existentes[0]) await updatePage(existentes[0].id, props);
  else await createPage(DS.series, {
    Registro: W.title(`${nome} · ${ddmm(d)} · S${serie}`),
    Data: W.date(d),
    'Exercício': W.rel([exercicioId]),
    ...(treinoId ? { Treino: W.rel([treinoId]) } : {}),
    'Série': W.num(serie),
    ...props
  });
  revalidatePath('/treinos', 'layout');
}

export async function concluirTreino(campo) {
  await upsertRegistro({ [campo]: W.check(true) });
  atualizar();
}

export async function salvarCorrida(treinoId, dados) {
  const d = hoje();
  await createPage(DS.corridas, {
    Registro: W.title(`VO2max · ${ddmm(d)}`),
    Data: W.date(d),
    ...(treinoId ? { Treino: W.rel([treinoId]) } : {}),
    Tiros: W.num(dados.tiros), PSE: W.num(dados.pse),
    'Distância (km)': W.num(dados.km), 'FC média': W.num(dados.fc),
    Notas: W.text(dados.notas)
  });
  await upsertRegistro({ Corrida: W.check(true) });
  atualizar();
}

// ---------- Dieta ----------
export async function definirTipoDia(dia, tipo) {
  await upsertRegistro({ 'Tipo de dia': W.select(tipo) }, dia);
  atualizar();
}

// ---------- Respiração ----------
// Um teste BOLT por dia: regravar no mesmo dia substitui o valor.
export async function salvarBolt(segundos) {
  const d = hoje();
  const s = Number(String(segundos).replace(',', '.'));
  if (!Number.isFinite(s) || s <= 0 || s > 300) return { erro: 'Digite os segundos (entre 1 e 300).' };
  const existentes = await query(DS.bolt, { filter: { property: 'Data', date: { equals: d } } });
  if (existentes[0]) await updatePage(existentes[0].id, { Segundos: W.num(s) });
  else await createPage(DS.bolt, { Teste: W.title(`BOLT · ${ddmm(d)}`), Data: W.date(d), Segundos: W.num(s) });
  revalidatePath('/treinos');
  return { ok: true };
}

// ---------- Agenda ----------
export async function salvarBloco(_prev, formData) {
  const g = (k) => String(formData.get(k) || '').trim();
  const id = g('id');
  const titulo = g('titulo');
  const hh = (v) => { const m = v.match(/^(\d{1,2}):?(\d{2})$/); return m && Number(m[1]) < 24 && Number(m[2]) < 60 ? `${m[1].padStart(2, '0')}:${m[2]}` : ''; };
  const ini = hh(g('ini'));
  const fim = hh(g('fim'));
  const dia = g('dia') || hoje();
  if (!titulo) return { erro: 'Dê um nome ao bloco.' };
  if (!/^\d{2}:\d{2}$/.test(ini) || !/^\d{2}:\d{2}$/.test(fim)) return { erro: 'Horário inválido. Use HH:MM, ex.: 18:30.' };
  if (fim <= ini) return { erro: 'O fim precisa ser depois do início.' };
  const repetir = g('repetir') || 'Não';
  const dias = formData.getAll('dias').map(String);
  if (repetir === 'Dias específicos' && !dias.length) return { erro: 'Escolha ao menos um dia.' };
  const projeto = g('projeto');
  const props = {
    Bloco: W.title(titulo),
    Tipo: W.select(g('tipo') || 'Pessoal'),
    'Início': W.text(ini),
    Fim: W.text(fim),
    Repetir: W.select(repetir),
    Dias: W.multi(repetir === 'Dias específicos' ? dias : []),
    Data: W.date(repetir === 'Não' || repetir === 'Semanal' ? dia : null),
    'Vínculo': W.select(g('vinculo') || 'Nenhum'),
    Projeto: W.rel(projeto ? [projeto] : []),
    Notas: W.text(g('notas'))
  };
  if (id) await updatePage(id, props);
  else await createPage(DS.agendaBlocos, props);
  atualizar();
  redirect(`/?d=${dia}`);
}

export async function excluirBloco(id, dia) {
  await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
    body: JSON.stringify({ in_trash: true })
  });
  atualizar();
  redirect(`/?d=${dia || hoje()}`);
}

// ---------- CRM ----------
export async function tarefaDoContato(id, nome) {
  await createPage(DS.tarefas, {
    Nome: W.title(`Falar com ${nome}`),
    Quando: W.select('Hoje'),
    'Recorrência': W.select('Única'),
    Data: W.date(hoje()),
    Feito: W.check(false),
    CRM: W.rel([id])
  });
  atualizar();
}

export async function faleiHoje(id, tarefas) {
  await updatePage(id, { 'Último contato': W.date(hoje()) });
  // Tarefas "Falar com…" abertas desse contato saem da lista.
  await Promise.all((tarefas || []).map((t) => updatePage(t, { Feito: W.check(true) })));
  atualizar();
}

export async function salvarContato(_prev, formData) {
  const g = (k) => String(formData.get(k) || '').trim();
  const nome = g('nome');
  if (!nome) return { erro: 'Coloque o nome.' };
  const props = {
    Nome: W.title(nome),
    'Frequência': W.select(g('freq') || null),
    Proximidade: W.select(g('prox') || null),
    WhatsApp: W.phone(g('whats') || null),
    Origem: W.text(g('origem')),
    Notas: W.text(g('notas'))
  };
  const id = g('id');
  if (id) await updatePage(id, props);
  else await createPage(DS.crm, { ...props, ...(g('ultimo') ? { 'Último contato': W.date(g('ultimo')) } : {}) });
  atualizar();
  return { ok: true, t: Date.now() };
}
