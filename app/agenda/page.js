import Link from 'next/link';
import Menu from '../../components/Menu';
import Erro from '../../components/Erro';
import AgendaDia from './AgendaDia';
import { getBlocos, montarDia, colunas, contextoDia, segundaDa, TIPOS } from '../../lib/agenda';
import { hoje, addDias, ddmm } from '../../lib/date';
import { DIAS, DIAS_LONGO } from '../../lib/config';

export const dynamic = 'force-dynamic';

export default async function Agenda({ searchParams }) {
  const h = hoje();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.d || '') ? searchParams.d : h;
  let blocos, ctx;
  try {
    [blocos, ctx] = await Promise.all([getBlocos(), contextoDia(d)]);
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const seg = segundaDa(d);
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = addDias(seg, i);
    const lista = montarDia(blocos, dia, {});
    return { dia, sigla: DIAS[(i + 1) % 7], num: Number(dia.slice(8, 10)), cores: [...new Set(lista.map((b) => b.cor))].slice(0, 3) };
  });
  const lista = colunas(montarDia(blocos, d, ctx));
  const dow = new Date(`${d}T12:00:00`).getDay();
  const usados = Object.entries(TIPOS).filter(([t]) => lista.some((b) => b.tipo === t)).map(([t, v]) => ({ tipo: t, cor: v.cor }));
  return (
    <main className="page agenda">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Agenda</h1>
          <p>{d === h ? 'Hoje · ' : ''}{DIAS_LONGO[dow]}, {ddmm(d)}</p>
        </div>
        {d !== h && <Link href="/agenda" className="btn btn-sm btn-ghost">Hoje</Link>}
      </header>
      <AgendaDia d={d} hoje={h} blocos={lista} semana={semana} legenda={usados} />
    </main>
  );
}
