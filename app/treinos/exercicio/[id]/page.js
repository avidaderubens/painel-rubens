import Link from 'next/link';
import { getTreinos, getSeries, norm } from '../../../../lib/treino';
import { hoje } from '../../../../lib/date';
import Erro from '../../../../components/Erro';
import Exercicio from './Exercicio';

export const dynamic = 'force-dynamic';

// Link do YouTube vira endereço de incorporação.
function embed(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&playsinline=1` : null;
}

export default async function ExercicioPage({ params }) {
  const d = hoje();
  let dados;
  try {
    const treinos = await getTreinos();
    let treino = null; let item = null;
    for (const t of treinos) {
      const i = t.itens.find((x) => norm(x.id) === norm(params.id));
      if (i) { treino = t; item = i; break; }
    }
    if (!item) return <main className="page"><div className="empty">Exercício não encontrado.</div><Link href="/treinos" className="btn btn-ghost">Voltar</Link></main>;
    const series = item.exercicioId ? await getSeries({ exercicioId: item.exercicioId }) : [];
    dados = { treino, item, series };
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const { treino, item, series } = dados;
  const pos = treino.itens.findIndex((x) => x.id === item.id);
  const prox = treino.itens[pos + 1] || null;
  const deHoje = series.filter((s) => s.data === d);
  const anteriores = series.filter((s) => s.data && s.data < d);
  const ultimaData = anteriores[0] ? anteriores[0].data : null;
  const ultima = ultimaData ? anteriores.filter((s) => s.data === ultimaData).sort((a, b) => a.serie - b.serie) : [];
  const ex = item.exercicio || {};
  return (
    <Exercicio
      treino={{ id: treino.id, nome: treino.nome }}
      item={{
        id: item.id, nome: item.nome, exercicioId: item.exercicioId, series: item.series || 1,
        repsMin: item.repsMin, repsMax: item.repsMax, unidadeReps: item.unidadeReps, unidadeCarga: item.unidadeCarga,
        descanso: item.descanso, descansoSeg: item.descansoSeg, obs: item.obs, categoria: ex.categoria || ''
      }}
      exercicio={{ execucao: ex.execucao || '', erros: ex.erros || '', video: ex.video || '', embed: embed(ex.video) }}
      posicao={{ n: pos + 1, total: treino.itens.length }}
      proximo={prox ? { id: prox.id, nome: prox.nome } : null}
      hoje={deHoje.map((s) => ({ serie: s.serie, carga: s.carga, reps: s.reps }))}
      ultima={ultimaData ? { data: ultimaData, series: ultima.map((s) => ({ serie: s.serie, carga: s.carga, reps: s.reps })) } : null}
    />
  );
}
