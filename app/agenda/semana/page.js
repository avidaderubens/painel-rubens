import Link from 'next/link';
import Menu from '../../../components/Menu';
import Erro from '../../../components/Erro';
import { Abas } from '../../AgendaDia';
import { getBlocos, montarDia, segundaDa, TIPOS } from '../../../lib/agenda';
import { getTreinos } from '../../../lib/treino';
import { hoje, addDias, ddmm } from '../../../lib/date';
import { DIAS } from '../../../lib/config';

export const dynamic = 'force-dynamic';
const H = 28;

export default async function Semana({ searchParams }) {
  const h = hoje();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.d || '') ? searchParams.d : h;
  let blocos, treinos;
  try {
    [blocos, treinos] = await Promise.all([getBlocos(), getTreinos()]);
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const seg = segundaDa(d);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = addDias(seg, i);
    return { dia, sigla: DIAS[(i + 1) % 7], num: Number(dia.slice(8, 10)), blocos: montarDia(blocos, dia, { treinos }) };
  });
  const todos = dias.flatMap((x) => x.blocos);
  const ini = Math.min(5, ...todos.map((b) => Math.floor(b.s / 60)));
  const fim = Math.max(23, ...todos.map((b) => Math.ceil(b.e / 60)));
  const horas = Array.from({ length: fim - ini + 1 }, (_, i) => ini + i);
  const totais = Object.entries(TIPOS).map(([t, v]) => ({ tipo: t, cor: v.cor, min: todos.filter((b) => b.tipo === t).reduce((s, b) => s + (b.e - b.s), 0) })).filter((x) => x.min > 0).sort((a, b) => b.min - a.min);
  const fmtH = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;
  return (
    <main className="page agenda">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Semana</h1>
          <p>{ddmm(seg)} a {ddmm(addDias(seg, 6))}</p>
        </div>
        <Link href={`/agenda/semana?d=${addDias(seg, -7)}`} className="icon-btn" aria-label="Semana anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <Link href={`/agenda/semana?d=${addDias(seg, 7)}`} className="icon-btn" aria-label="Próxima semana">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </Link>
      </header>
      <Abas ativa="semana" d={d} />

      <div className="ag-sem">
        <div className="ag-sem-head">
          <span />
          {dias.map((x) => (
            <Link key={x.dia} href={`/?d=${x.dia}`} className={x.dia === h ? 'hoje' : undefined}>
              <span>{x.sigla}</span><b>{x.num}</b>
            </Link>
          ))}
        </div>
        <div className="ag-sem-body" style={{ height: (fim - ini) * H + 6 }}>
          {horas.map((hh) => (
            <div key={hh} className="ag-sem-hora" style={{ top: (hh - ini) * H }}>{hh % 2 === 1 ? '' : `${hh}h`}</div>
          ))}
          {dias.map((x, i) => (
            <Link key={x.dia} href={`/?d=${x.dia}`} className={`ag-sem-col${x.dia === h ? ' hoje' : ''}`} style={{ left: `calc(30px + (100% - 30px) * ${i} / 7)` }} aria-label={`Abrir ${x.sigla} ${x.num}`}>
              {x.blocos.map((b) => (
                <span key={b.id} style={{ top: ((b.s / 60) - ini) * H, height: Math.max(6, ((b.e - b.s) / 60) * H - 2), background: `linear-gradient(${b.bg}, ${b.bg}), var(--bg)`, borderColor: b.cor }}>
                  {(b.e - b.s) >= 45 ? b.titulo.split(' · ')[0].replace(/^Treino do dia$/, 'Treino') : ''}
                </span>
              ))}
            </Link>
          ))}
        </div>
      </div>

      <section className="card" aria-label="Horas na semana">
        <div className="note" style={{ marginBottom: 8 }}>Horas na semana</div>
        <div className="ag-totais">
          {totais.map((t) => (
            <div key={t.tipo}><em style={{ background: t.cor }} /><span>{t.tipo}</span><b>{fmtH(t.min)}</b></div>
          ))}
        </div>
      </section>
    </main>
  );
}
