import 'server-only';

const BASE = 'https://api.notion.com/v1';
const VERSION = '2025-09-03';

async function api(path, method = 'GET', body) {
  if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN não configurado na Vercel.');
  const r = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  if (!r.ok) throw new Error(`Notion ${r.status}: ${await r.text()}`);
  return r.json();
}

export async function query(dataSourceId, body = {}) {
  const out = [];
  let cursor = null;
  do {
    const r = await api(`/data_sources/${dataSourceId}/query`, 'POST', {
      ...body,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {})
    });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out.map(row);
}

export const createPage = (dataSourceId, properties) =>
  api('/pages', 'POST', { parent: { type: 'data_source_id', data_source_id: dataSourceId }, properties });

export const updatePage = (id, properties) => api(`/pages/${id}`, 'PATCH', { properties });

function val(p) {
  if (!p) return null;
  switch (p.type) {
    case 'title': return p.title.map((t) => t.plain_text).join('');
    case 'rich_text': return p.rich_text.map((t) => t.plain_text).join('');
    case 'number': return p.number;
    case 'checkbox': return p.checkbox;
    case 'select': return p.select ? p.select.name : null;
    case 'multi_select': return p.multi_select.map((o) => o.name);
    case 'date': return p.date ? p.date.start : null;
    case 'relation': return p.relation.map((r) => r.id);
    case 'formula': return p.formula ? p.formula[p.formula.type] : null;
    case 'created_time': return p.created_time;
    default: return null;
  }
}

function row(page) {
  const o = { id: page.id, url: page.url };
  for (const [k, p] of Object.entries(page.properties || {})) o[k] = val(p);
  return o;
}

// Construtores de propriedades para gravar no Notion.
export const W = {
  title: (s) => ({ title: [{ text: { content: String(s || '') } }] }),
  text: (s) => ({ rich_text: s ? [{ text: { content: String(s) } }] : [] }),
  num: (n) => ({ number: n === '' || n === null || n === undefined || isNaN(Number(n)) ? null : Number(n) }),
  check: (b) => ({ checkbox: !!b }),
  select: (s) => ({ select: s ? { name: s } : null }),
  multi: (a) => ({ multi_select: (a || []).map((name) => ({ name })) }),
  date: (d) => ({ date: d ? { start: d } : null }),
  rel: (ids) => ({ relation: (ids || []).map((id) => ({ id })) })
};
