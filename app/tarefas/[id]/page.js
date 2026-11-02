import Link from 'next/link';
import { getTarefas } from '../../../lib/data';
import Detalhe from './Detalhe';
import Erro from '../../../components/Erro';

export const dynamic = 'force-dynamic';

export default async function TarefaPage({ params }) {
  try {
    const tarefas = await getTarefas();
    const id = params.id.replace(/-/g, '');
    const t = tarefas.find((x) => x.id.replace(/-/g, '') === id);
    if (!t) return <main className="page"><div className="empty">Tarefa não encontrada.</div><Link href="/tarefas" className="btn btn-ghost">Voltar</Link></main>;
    return <Detalhe t={t} />;
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
