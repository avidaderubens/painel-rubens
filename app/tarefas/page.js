import Link from 'next/link';
import Menu from '../../components/Menu';
import { getAgenda, getRegistro, getTarefas, separar, treinosDoDia } from '../../lib/data';
import { hoje } from '../../lib/date';
import { DIAS_LONGO } from '../../lib/config';
import { diaSemana } from '../../lib/date';
import Abas from './Abas';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

export default async function Tarefas() {
  try {
    const d = hoje();
    const [tarefas, agenda, registro] = await Promise.all([getTarefas(), getAgenda(), getRegistro(d)]);
    const abas = separar(tarefas, d);
    const treinos = treinosDoDia(agenda, d).map((t) => ({ ...t, feito: !!(registro && registro[t.campo]) }));
    return (
      <main className="page">
        <header className="head">
          <Menu />
          <div className="grow">
            <h1>Tarefas</h1>
            <p>{abas.todas.length} abertas · {abas.concluidas} concluídas</p>
          </div>
          <Link href="/tarefas/nova" className="btn btn-sm">+ Nova</Link>
        </header>
        <Abas abas={{ hoje: abas.hoje, semana: abas.semana, recorrentes: abas.recorrentes, todas: abas.todas }} treinos={treinos} diaNome={DIAS_LONGO[diaSemana(d)].toLowerCase()} />
      </main>
    );
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
