import Link from 'next/link';
import { getTreinos, getSeries, getCorridas, semanaAcademia, norm } from '../../../lib/treino';
import { getRegistro } from '../../../lib/data';
import { hoje, ddmm } from '../../../lib/date';
import Erro from '../../../components/Erro';
import Treino from './Treino';
import Corrida from './Corrida';

export const dynamic = 'force-dynamic';

const reps = (i) => (i.repsMin === i.repsMax || i.repsMax == null ? `${i.repsMin ?? ''}` : `${i.repsMin}–${i.repsMax}`);

export default async function TreinoPage({ params }) {
  const d = hoje();
  let dados;
  try {
    const [treinos, series, registro] = await Promise.all([getTreinos(), getSeries(), getRegistro(d)]);
    const t = treinos.find((x) => norm(x.id) === norm(params.id));
    if (!t) return <main className="page"><div className="empty">Treino não encontrado.</div><Link href="/treinos" className="btn btn-ghost">Voltar</Link></main>;
    const corridas = t.tipo === 'Corrida' ? await getCorridas() : [];
    dados = { t, treinos, series, registro, corridas };
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const { t, treinos, series, registro, corridas } = dados;

  if (t.tipo === 'Corrida') {
    return (
      <Corrida
        treino={{ id: t.id, nome: t.nome, foco: t.foco, notas: t.notas }}
        etapas={t.itens.map((i) => ({ id: i.id, nome: i.titulo, etapa: i.etapa, duracao: i.duracao }))}
        feito={!!(registro && registro.Corrida)}
        historico={corridas}
      />
    );
  }

  const mob = t.tipo === 'Academia' ? treinos.find((x) => x.tipo === 'Mobilidade') : null;
  const itens = t.itens.map((i) => {
    const doEx = series.filter((s) => norm(s.exercicioId) === norm(i.exercicioId));
    const feitas = doEx.filter((s) => s.data === d).length;
    // Último treino deste exercício (antes de hoje), para ver a carga a bater.
    const ant = doEx.filter((s) => s.data && s.data < d);
    const ultData = ant[0] ? ant[0].data : null;
    const fmt = (n) => (n == null ? '–' : String(n).replace('.', ','));
    const ultima = ultData ? `Último ${ddmm(ultData)}: ${ant.filter((s) => s.data === ultData).sort((a, b) => a.serie - b.serie).map((s) => `${fmt(s.carga)}×${fmt(s.reps)}`).join(' · ')}` : '';
    return {
      id: i.id, nome: i.nome, bloco: i.bloco, categoria: i.exercicio ? i.exercicio.categoria : '',
      presc: [`${i.series} × ${reps(i)}${i.unidadeReps && i.unidadeReps !== 'reps' ? ` ${i.unidadeReps}` : ''}`, i.descanso ? (/^0s\s*→/.test(i.descanso) ? `sem pausa → ${i.descanso.replace(/^0s\s*→\s*/, '')}` : `descanso ${i.descanso}`) : ''].filter(Boolean).join(' · '),
      feito: i.series > 0 && feitas >= i.series,
      parcial: feitas,
      ultima
    };
  });
  const fase = semanaAcademia(d);
  return (
    <Treino
      treino={{ id: t.id, nome: t.nome, foco: t.foco, dia: t.dia, duracao: t.duracao, tipo: t.tipo, notas: t.notas }}
      itens={itens}
      mobilidade={mob ? mob.itens.map((i) => ({ id: i.id, bloco: i.bloco, nome: i.nome, reps: `${i.repsMin ?? ''} ${i.unidadeReps}`.trim() })) : []}
      calibracao={fase.fase === 'calibração'}
      deload={fase.fase === 'deload'}
      concluido={!!(registro && registro.Academia)}
    />
  );
}
