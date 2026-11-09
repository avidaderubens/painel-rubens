import Menu from '../../components/Menu';
import Erro from '../../components/Erro';
import Contato from '../../components/Contato';
import NovoContato from './NovoContato';
import { getContatos } from '../../lib/crm';

export const dynamic = 'force-dynamic';

const GRUPOS = [
  ['falar', 'Falar agora', (c) => c.status === 'atrasado' || c.status === 'hoje'],
  ['semana', 'Esta semana', (c) => c.status === 'semana'],
  ['ok', 'Em dia', (c) => c.status === 'ok'],
  ['sem', 'Sem frequência definida', (c) => c.status === 'sem']
];

export default async function Crm() {
  let lista;
  try {
    lista = await getContatos();
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const grupos = GRUPOS.map(([k, t, f]) => [k, t, lista.filter(f)]);
  const n = (k) => grupos.find((g) => g[0] === k)[2].length;
  return (
    <main className="page">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>CRM</h1>
          <p>{lista.length} contatos · {n('falar')} para falar agora</p>
        </div>
      </header>

      <div className="crm-resumo">
        <a href="#falar"><b style={{ color: '#ff6b5e' }}>{n('falar')}</b><span>Falar agora</span></a>
        <a href="#semana"><b style={{ color: '#ffc14d' }}>{n('semana')}</b><span>Esta semana</span></a>
        <a href="#ok"><b style={{ color: '#5cc98a' }}>{n('ok')}</b><span>Em dia</span></a>
        <a href="#sem"><b>{n('sem')}</b><span>Sem frequência</span></a>
      </div>

      <NovoContato />

      {grupos.map(([k, titulo, itens]) => itens.length > 0 && (
        <section key={k} id={k} className="crm-grupo" aria-label={titulo}>
          <h2 className="note">{titulo} · {itens.length}</h2>
          {k === 'sem' && <p className="note" style={{ marginTop: -4 }}>Toque no lápis e defina a cada quanto tempo falar. Sem isso o contato nunca aparece como lembrete.</p>}
          {itens.map((c) => <Contato key={c.id} c={c} />)}
        </section>
      ))}
    </main>
  );
}
