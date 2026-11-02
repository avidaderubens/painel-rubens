import Link from 'next/link';
import { getTreinos, getSeries, getCorridas, semanaProtocolo, norm } from '../../../lib/treino';
import { getRegistro } from '../../../lib/data';
import { hoje } from '../../../lib/date';
import Erro from '../../../components/Erro';
import Treino from './Treino';
import Corrida from './Corrida';

export const dynamic = 'force-dynamic';

const reps = (i) => (i.repsMin === i.repsMax || i.repsMax == null ? `${i.repsMin ?? ''}` : `${i.repsMin}–${i.repsMax}`);

export default async function TreinoPage({ params }) {
  const d = hoje();
  let dados;
  try {
    const [treinos, series, registro] = await Promise.all([getTreinos(), getSeries({ desde: d }), getRegistro(d)]);
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
    const feitas = series.filter((s) => norm(s.exercicioId) === norm(i.exercicioId)).length;
    return {
      id: i.id, nome: i.nome, bloco: i.bloco, categoria: i.exercicio ? i.exercicio.categoria : '',
      presc: [`${i.series} × ${reps(i)}${i.unidadeReps && i.unidadeReps !== 'reps' ? ` ${i.unidadeReps}` : ''}`, i.descanso ? `descanso ${i.descanso}` : ''].filter(Boolean).join(' · '),
      feito: i.series > 0 && feitas >= i.series,
      parcial: feitas
    };
  });
  const fase = semanaProtocolo(d);
  return (
    <Treino
      treino={{ id: t.id, nome: t.nome, foco: t.foco, dia: t.dia, duracao: t.duracao, tipo: t.tipo }}
      itens={itens}
      mobilidade={mob ? mob.itens.map((i) => ({ id: i.id, bloco: i.bloco, nome: i.nome, reps: `${i.repsMin ?? ''} ${i.unidadeReps}`.trim() })) : []}
      calibracao={fase.fase === 'calibração'}
      deload={fase.fase === 'deload'}
      concluido={!!(registro && registro.Academia)}
    />
  );
}
