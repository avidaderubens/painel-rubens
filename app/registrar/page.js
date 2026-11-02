import { getRegistro, getProtocolos } from '../../lib/data';
import { hoje, ddmm, diaSemana } from '../../lib/date';
import { DIAS_LONGO } from '../../lib/config';
import Form from './Form';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

export default async function Registrar() {
  try {
    const d = hoje();
    const [r, { protocolos }] = await Promise.all([getRegistro(d), getProtocolos()]);
    const sub = Object.fromEntries(protocolos.map((p) => [p.nome, `${p.dose} · ${p.frequencia}`]));
    return <Form r={r} titulo={`${DIAS_LONGO[diaSemana(d)]}, ${ddmm(d)}`} protocolos={sub} />;
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
