import { getRegistro, getProtocolos, getRegistros } from '../../lib/data';
import { getJournal, getJournais } from '../../lib/journal';
import { hoje, ddmm, diaSemana, addDias, diaDoRegistro, valida } from '../../lib/date';
import { DIAS, DIAS_LONGO } from '../../lib/config';
import Form from './Form';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

export default async function Registrar({ searchParams }) {
  try {
    const h = hoje();
    const padrao = diaDoRegistro();
    const d = valida(searchParams?.d) && searchParams.d <= h ? searchParams.d : padrao;
    const ini = addDias(h, -6);
    const [r, j, { protocolos }, regs, js] = await Promise.all([
      getRegistro(d), getJournal(d), getProtocolos(), getRegistros(ini), getJournais(ini, h)
    ]);
    const sub = Object.fromEntries(protocolos.map((p) => [p.nome, `${p.dose} · ${p.frequencia}`]));
    const dias = Array.from({ length: 7 }, (_, i) => {
      const dia = addDias(ini, i);
      return { dia, sigla: DIAS[diaSemana(dia)], num: Number(dia.slice(8)), reg: regs.some((x) => x.dia === dia), jor: js.some((x) => x.dia === dia && x.tipo === 'Dia') };
    });
    const rel = d === h ? 'Hoje' : d === addDias(h, -1) ? 'Ontem' : null;
    return (
      <Form
        key={d} dia={d} r={r} j={j} dias={dias} protocolos={sub}
        titulo={`${rel ? `${rel} · ` : ''}${DIAS_LONGO[diaSemana(d)]}, ${ddmm(d)}`}
        madrugada={padrao !== h && d === padrao}
      />
    );
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
