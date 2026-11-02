import { getNotas, getProjetos } from '../../lib/data';
import Captura from './Captura';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

const quando = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
};

export default async function Notas() {
  try {
    const [notas, { rows }] = await Promise.all([getNotas(), getProjetos()]);
    const projetos = rows.filter((p) => p.Status === 'Ativo').map((p) => ({ id: p.id, nome: p.Nome }));
    return (
      <main className="page">
        <header className="head">
          <div className="grow">
            <h1>Notas</h1>
            <p>Anote antes de esquecer. Organiza depois.</p>
          </div>
        </header>
        <Captura projetos={projetos} />
        <h2 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 600 }}>Últimas notas</h2>
        {notas.length === 0 && <div className="empty">Nenhuma nota ainda. A primeira que você salvar aparece aqui.</div>}
        {notas.map((n) => (
          <article key={n.id} className="card" style={{ gap: 8, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{n.texto || n.nota}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              {n.projeto ? <span className="pill d">{n.projeto}</span> : <span />}
              <span className="note">{quando(n.criada)}</span>
            </div>
          </article>
        ))}
      </main>
    );
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
