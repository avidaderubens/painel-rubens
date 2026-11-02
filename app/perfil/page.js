import { getAgenda } from '../../lib/data';
import { META_SCORE } from '../../lib/config';
import { sair } from '../actions';
import Dias from './Dias';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

export default async function Perfil() {
  let agenda;
  try { agenda = await getAgenda(); } catch (e) { return <main className="page"><Erro e={e} /></main>; }
  const ordem = ['Jiu-jitsu', 'Academia', 'Corrida', 'Respiração'];
  agenda.sort((a, b) => ordem.indexOf(a.nome) - ordem.indexOf(b.nome));
  return (
    <main className="page">
      <header className="head">
        <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--acc-soft)', border: '1px solid var(--acc-line)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 700 }}>R</div>
        <div className="grow"><h1>Rubens</h1><p>@avidaderubens · Itajaí</p></div>
      </header>

      <section className="card" aria-label="Dias de treino">
        <div>
          <h2>Dias de treino</h2>
          <p className="note" style={{ marginTop: 4 }}>Nos dias marcados, o treino aparece em Tarefas › Hoje. Salva direto no Notion.</p>
        </div>
        {agenda.map((a) => <Dias key={a.id} item={a} />)}
      </section>

      <section className="card" aria-label="Metas">
        <h2>Metas</h2>
        {agenda.map((a) => (
          <div key={a.id} className="row" style={{ minHeight: 48 }}>
            <span className="grow">{a.nome}</span><b>{a.meta}x / semana</b>
          </div>
        ))}
        <div className="row" style={{ minHeight: 48 }}><span className="grow">Score do dia</span><b>{META_SCORE}%</b></div>
        <p className="note">Metas de treino são editadas no Notion › Saúde › Agenda de treinos.</p>
      </section>

      <section className="card" aria-label="Conexões">
        <h2>Conexões</h2>
        <div className="row" style={{ minHeight: 52 }}>
          <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--ok)' }} />
          <span className="txt"><span className="t1">Notion</span><span className="t2">QG – Ecossistema Rubens</span></span>
        </div>
        <a href="https://app.notion.com/p/3c67f5c31ed1806592c7cc64b3e03fc6" target="_blank" rel="noopener" className="btn btn-ghost" style={{ height: 48 }}>Abrir o QG no Notion</a>
      </section>

      <form action={sair}><button type="submit" className="btn btn-danger">Sair da conta</button></form>
    </main>
  );
}
