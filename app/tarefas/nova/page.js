import Link from 'next/link';
import { getProjetos } from '../../../lib/data';
import { criarTarefa } from '../../actions';
import Erro from '../../../components/Erro';
import Enviar from '../../../components/Enviar';

export const dynamic = 'force-dynamic';

export default async function Nova() {
  let projetos = [];
  try {
    projetos = (await getProjetos()).rows.filter((p) => p.Status !== 'Concluído').sort((a, b) => (a.Nome || '').localeCompare(b.Nome || ''));
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  return (
    <main className="page">
      <header className="head">
        <Link href="/tarefas" className="icon-btn" aria-label="Voltar para Tarefas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow"><h1>Nova tarefa</h1></div>
      </header>
      <form action={criarTarefa} className="card">
        <div className="field">
          <label htmlFor="nome">Tarefa</label>
          <input id="nome" name="nome" className="input" required placeholder="O que precisa ser feito?" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="projeto">Projeto</label>
          <select id="projeto" name="projeto" className="input">
            <option value="">Sem projeto</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.Nome}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
          <div className="field">
            <label htmlFor="quando">Quando</label>
            <select id="quando" name="quando" className="input" defaultValue="Hoje">
              {['Hoje', 'Semana', 'Mês', 'Sem data'].map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="recorrencia">Recorrência</label>
            <select id="recorrencia" name="recorrencia" className="input" defaultValue="Única">
              {['Única', 'Diária', 'Semanal', 'Mensal'].map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="data">Data (opcional)</label>
          <input id="data" name="data" type="date" className="input" />
        </div>
        <Enviar>Criar tarefa</Enviar>
      </form>
    </main>
  );
}
