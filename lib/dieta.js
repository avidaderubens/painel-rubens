import 'server-only';
import { DS, TIPO_PADRAO } from './config';
import { query } from './notion';
import { diaSemana } from './date';

const norm = (id) => String(id || '').replace(/-/g, '');

export async function getDieta() {
  const [plano, itens, trocas, metas] = await Promise.all([
    query(DS.plano, { sorts: [{ property: 'Ordem', direction: 'ascending' }] }),
    query(DS.itensDieta, { sorts: [{ property: 'Ordem', direction: 'ascending' }] }),
    query(DS.trocas),
    query(DS.metasDieta)
  ]);
  const refeicoes = plano.filter((r) => r.Ativa !== false).map((r) => ({
    id: r.id,
    nome: r['Refeição'] || '',
    horario: r['Horário'] || '',
    itens: itens
      .filter((i) => (i['Refeição'] || []).some((x) => norm(x) === norm(r.id)))
      .sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0))
      .map((i) => ({
        id: i.id,
        nome: i.Alimento || '',
        a: i['Dia A'],
        b: i['Dia B'],
        un: i.Unidade || '',
        texto: i.Texto || '',
        grupo: i['Grupo de troca'] || null,
        compra: i['Item de compra'] || '',
        fator: i['Fator cru'] || 1,
        preparo: i.Preparo || null
      }))
  }));
  const grupos = {};
  trocas.forEach((t) => {
    if (!t.Grupo) return;
    (grupos[t.Grupo] = grupos[t.Grupo] || []).push({ nome: t.Equivalente || '', base: t.Base || 1, qtd: t.Quantidade || 0, un: t.Unidade || 'g' });
  });
  const m = {};
  metas.forEach((x) => {
    const k = x['Código'] || (x.Dia || '').slice(-1);
    m[k] = { nome: x.Dia || `Dia ${k}`, desc: x['Descrição'] || '', kcal: x.kcal, p: x['Proteína (g)'], c: x['Carbo (g)'], g: x['Gordura (g)'] };
  });
  return { refeicoes, trocas: grupos, metas: m };
}

export function tipoDoDia(dia, registro) {
  return (registro && registro['Tipo de dia']) || TIPO_PADRAO[diaSemana(dia)];
}
