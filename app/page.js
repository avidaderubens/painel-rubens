import Link from 'next/link';
import Menu from '../components/Menu';
import { getAgenda, getRegistros, getTarefas, separar, treinosDoDia } from '../lib/data';
import { hoje, addDias } from '../lib/date';
import { META_SCORE } from '../lib/config';
import { Ring, Spark } from '../components/Charts';
import Trend from '../components/Trend';
import { TaskRow, TreinoRow } from '../components/TaskRow';
import Erro from '../components/Erro';

export const dynamic = 'force-dynamic';

const media = (a) => { const v = a.filter((x) => typeof x === 'number'); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const fmt = (v, d = 0) => (v == null ? '—' : v.toFixed(d).replace('.', ','));

export default async function Painel() {
  let dados;
  try {
    const d = hoje();
    const [registros, tarefas, agenda] = await Promise.all([getRegistros(addDias(d, -45)), getTarefas(), getAgenda()]);
    dados = { d, registros, tarefas, agenda };
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const { d, registros, tarefas, agenda } = dados;
  const desde = addDias(d, -6);
  const semana = registros.filter((r) => r.dia >= desde);
  const doDia = registros.find((r) => r.dia === d);
  const ultimos14 = Array.from({ length: 14 }, (_, i) => registros.find((r) => r.dia === addDias(d, i - 13)));

  const modal = ['Jiu-jitsu', 'Academia', 'Corrida'].map((k) => {
    const a = agenda.find((x) => x.campo === k);
    return { k, feito: semana.filter((r) => r[k]).length, meta: a ? a.meta : 3 };
  });
  const totalTreinos = modal.reduce((s, x) => s + x.feito, 0);
  const metaTreinos = modal.reduce((s, x) => s + x.meta, 0);
  const score = media(semana.map((r) => r.score));
  const paMax = media(semana.map((r) => r.paMax));
  const paMin = media(semana.map((r) => r.paMin));
  const sono = media(semana.map((r) => r.sono));

  const abas = separar(tarefas, d);
  const treinosHoje = treinosDoDia(agenda, d);
  const porProjeto = {};
  abas.todas.forEach((t) => { const k = t.projeto || 'Sem projeto'; porProjeto[k] = (porProjeto[k] || 0) + 1; });
  const top = Object.entries(porProjeto).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pct = tarefas.length ? Math.round((abas.concluidas / tarefas.length) * 100) : 0;

  return (
    <main className="page">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Painel Rubens</h1>
          <p>Saúde e performance em tempo real</p>
        </div>
      </header>

      <Link href="/saude" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, textDecoration: 'none' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Saúde</span>
        <span className="acc" style={{ fontSize: 14, fontWeight: 600 }}>Dieta, protocolos e corpo ›</span>
      </Link>

      {semana.length === 0 && <div className="empty">Nenhum dia registrado nos últimos 7 dias. Toque no + laranja para registrar hoje.</div>}

      <section className="kpis" aria-label="Indicadores de saúde">
        <div className="kpi">
          <div className="label">Treinos · 7 dias</div>
          <div className="big">{totalTreinos}<small> / {metaTreinos}</small></div>
          <div className="rings3">
            {modal.map((x) => (
              <div key={x.k}>
                <Ring size={40} stroke={4} value={x.feito} max={x.meta || 1} text={`${x.feito}/${x.meta}`} label={`${x.k}: ${x.feito} de ${x.meta}`} />
                <span>{x.k}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kpi">
          <div className="label">Score do dia · média</div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ring value={score} text={score == null ? '—' : `${Math.round(score)}%`} label={`Score médio ${score == null ? 'sem dados' : Math.round(score) + '%'}`} />
          </div>
          <div className="note">Meta: <b className="acc">{META_SCORE}%</b> ou mais</div>
        </div>
        <div className="kpi">
          <div className="label">Pressão média · 7 dias</div>
          <div className="big">{fmt(paMax)}<small>/</small>{fmt(paMin)}</div>
          <div className="note">mmHg · média das medições</div>
          <Spark values={ultimos14.map((r) => (r ? r.paMax : null))} />
        </div>
        <div className="kpi">
          <div className="label">Sono médio · 7 dias</div>
          <div className="big">{fmt(sono, 1)}<small> h</small></div>
          <div className="note">por noite</div>
          <Spark values={ultimos14.map((r) => (r ? r.sono : null))} />
        </div>
      </section>

      <section className="card list" aria-label="Tarefas de hoje">
        <div className="card-head" style={{ padding: '12px 0 8px' }}>
          <h2>Hoje <span className="note" style={{ fontSize: 14 }}>· {abas.hoje.length + treinosHoje.length} tarefas</span></h2>
          <Link href="/tarefas" className="btn btn-ghost btn-sm" style={{ height: 36 }}>Ver todas ›</Link>
        </div>
        {treinosHoje.map((t) => <TreinoRow key={t.id} treino={t} feito={!!(doDia && doDia[t.campo])} />)}
        {abas.hoje.slice(0, 6).map((t) => <TaskRow key={t.id} t={t} />)}
        {abas.hoje.length + treinosHoje.length === 0 && <div className="empty" style={{ margin: '0 0 12px' }}>Nada para hoje.</div>}
      </section>

      <Trend dias={registros} />

      <section className="card" aria-label="Performance">
        <h2>Performance</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring size={104} stroke={10} value={pct} text={`${pct}%`} label={`${pct}% das tarefas concluídas`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, flexGrow: 1 }}>
            <div><div className="label">Concluídas</div><div className="big">{abas.concluidas}</div></div>
            <div><div className="label">Pendentes</div><div className="big">{abas.todas.length}</div></div>
            <div><div className="label">Hoje</div><div className="big">{abas.hoje.length + treinosHoje.length}</div></div>
            <div><div className="label">Prospecção</div><div className="big" style={{ color: 'var(--dim)', fontSize: 20 }}>em breve</div></div>
          </div>
        </div>
      </section>

      <section className="card" aria-label="Pendentes por projeto">
        <h2>Pendentes por projeto</h2>
        <div className="bars">
          {top.map(([nome, n]) => (
            <div key={nome} style={{ display: 'contents' }}>
              <span>{nome}</span>
              <div className="track"><i style={{ width: `${(n / top[0][1]) * 100}%` }} /></div>
              <b>{n}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
