import Link from 'next/link';
import { getTreinos, treinoDoDia, semanaProtocolo, getBolt } from '../../lib/treino';
import { hoje, diaSemana } from '../../lib/date';
import { DIAS, DIAS_LONGO } from '../../lib/config';
import Menu from '../../components/Menu';
import Erro from '../../components/Erro';
import Hub from './Hub';

export const dynamic = 'force-dynamic';

const ORDEM = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default async function Treinos() {
  let treinos; let bolt;
  try { [treinos, bolt] = await Promise.all([getTreinos(), getBolt()]); } catch (e) { return <main className="page"><Erro e={e} /></main>; }
  const d = hoje();
  const sigla = DIAS[diaSemana(d)];
  const doDia = treinoDoDia(treinos, d);
  const mob = treinos.find((t) => t.tipo === 'Mobilidade');
  const fase = semanaProtocolo(d);
  const semana = ORDEM.map((s) => {
    const t = treinos.find((x) => x.dia === s);
    const sig = t ? (t.tipo === 'Corrida' ? 'VO2' : t.codigo || t.nome.slice(0, 3)) : s === 'Qua' && mob ? 'M' : '–';
    const href = t ? `/treinos/${t.id}` : s === 'Qua' && mob ? `/treinos/${mob.id}` : null;
    return { s, sig, href, hoje: s === sigla, folga: !t && !(s === 'Qua' && mob) };
  });
  const hero = doDia || (sigla === 'Qua' ? mob : null);
  const lista = (tipo) => treinos.filter((t) => t.tipo === tipo).map((t) => ({
    id: t.id, nome: t.nome, codigo: t.codigo, foco: t.foco, dia: t.dia, n: t.itens.length, duracao: t.duracao,
    itens: t.tipo === 'Mobilidade' ? t.itens.map((i) => ({ id: i.id, bloco: i.bloco, nome: i.nome, reps: `${i.repsMin ?? ''} ${i.unidadeReps}`.trim() })) : []
  }));

  return (
    <main className="page">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Treinos</h1>
          <p>Semana {fase.semana} de {fase.total} · {fase.fase}</p>
        </div>
      </header>

      <section className="week7" aria-label="Semana">
        {semana.map((x) => {
          const cls = x.hoje ? 'hoje' : x.folga ? 'folga' : '';
          const inner = <><small>{x.s}</small><b>{x.sig}</b></>;
          return x.href
            ? <Link key={x.s} href={x.href} className={cls} aria-label={`${x.s}: ${x.sig}`}>{inner}</Link>
            : <div key={x.s} className={cls}>{inner}</div>;
        })}
      </section>

      {hero ? (
        <section className="hero" aria-label="Treino de hoje">
          <div className="label" style={{ color: '#ff8f3d', fontWeight: 600 }}>Hoje · {DIAS_LONGO[diaSemana(d)].toLowerCase()}</div>
          <div>
            <div className="t">{hero.nome}</div>
            <div style={{ fontSize: 15 }}>{hero.foco}</div>
          </div>
          <div className="meta">
            <span>{hero.itens.length} {hero.tipo === 'Corrida' ? 'etapas' : 'exercícios'}</span>
            {hero.duracao ? <span>~{hero.duracao} min</span> : null}
            {hero.tipo === 'Academia' && mob ? <span>+{mob.duracao} min mobilidade</span> : null}
          </div>
          <Link href={`/treinos/${hero.id}`} className="btn">Começar treino</Link>
        </section>
      ) : (
        <section className="card"><div className="label">Hoje</div><div style={{ fontSize: 16, fontWeight: 600 }}>Descanso total.</div><p className="note">Jiu-jitsu não entra no domingo.</p></section>
      )}

      <Hub academia={lista('Academia')} corrida={lista('Corrida')} respiracao={{ semanaBloco: ((fase.semana - 1) % 6) + 1, diaSigla: sigla, bolt }} mobilidade={lista('Mobilidade')} />
    </main>
  );
}
