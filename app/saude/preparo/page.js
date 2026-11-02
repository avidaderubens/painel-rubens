import { getDieta, tipoDoDia } from '../../../lib/dieta';
import { getRegistros } from '../../../lib/data';
import { hoje, addDias, diaSemana, ddmm } from '../../../lib/date';
import { DIAS } from '../../../lib/config';
import Erro from '../../../components/Erro';
import Preparo from './Preparo';

export const dynamic = 'force-dynamic';

export default async function PreparoPage() {
  const d = hoje();
  const seg = addDias(d, -((diaSemana(d) + 6) % 7)); // segunda desta semana
  const datas = Array.from({ length: 7 }, (_, i) => addDias(seg, i));
  let dieta; let registros;
  try {
    [dieta, registros] = await Promise.all([getDieta(), getRegistros(seg)]);
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const dias = datas.map((dt) => ({ data: dt, nome: DIAS[diaSemana(dt)], tipo: tipoDoDia(dt, registros.find((r) => r.dia === dt)) }));
  const itens = dieta.refeicoes.flatMap((r) => r.itens.filter((i) => typeof i.a === 'number' || typeof i.b === 'number').map((i) => ({ ...i, refeicao: r.nome })));
  return <Preparo dias={dias} itens={itens} periodo={`${ddmm(datas[0])} a ${ddmm(datas[6])}`} semanaId={seg} />;
}
