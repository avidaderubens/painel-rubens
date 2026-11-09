import Link from 'next/link';
import Menu from '../../components/Menu';
import { getAgenda, getRegistro, getTarefas, separar, treinosDoDia } from '../../lib/data';
import { hoje } from '../../lib/date';
import { DIAS_LONGO } from '../../lib/config';
import { diaSemana } from '../../lib/date';
import Abas from './Abas';
import Erro from '../../components/Erro';
import Contato from '../../components/Contato';
import { getContatos, paraFalar } from '../../lib/crm';

export const dynamic = 'force-dynamic';

export default async function Tarefas() {
  try {
    const d = hoje();
    const [tarefas, agenda, registro, contatos] = await Promise.all([getTarefas(), getAgenda(), getRegistro(d), getContatos().catch(() => [])]);
    const falar = paraFalar(contatos).filter((c) => c.tarefas.length === 0);
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
        {falar.length > 0 && (
          <section className="crm-lembrete" aria-label="Lembretes do CRM">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 className="note grow">CRM · falar com {falar.length} {falar.length === 1 ? 'pessoa' : 'pessoas'}</h2>
              <Link href="/crm" className="note" style={{ color: 'var(--acc)' }}>Abrir CRM</Link>
            </div>
            {falar.slice(0, 5).map((c) => <Contato key={c.id} c={c} compacto />)}
            {falar.length > 5 && <Link href="/crm#falar" className="btn btn-ghost btn-sm">Ver mais {falar.length - 5}</Link>}
          </section>
        )}
        <Abas abas={{ hoje: abas.hoje, semana: abas.semana, recorrentes: abas.recorrentes, todas: abas.todas }} treinos={treinos} diaNome={DIAS_LONGO[diaSemana(d)].toLowerCase()} />
      </main>
    );
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
