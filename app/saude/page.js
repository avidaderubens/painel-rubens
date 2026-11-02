import { getMedidas, getProtocolos, getRegistro } from '../../lib/data';
import { getDieta, tipoDoDia } from '../../lib/dieta';
import { semanaProtocolo } from '../../lib/treino';
import { hoje, addDias, diasEntre, diaSemana } from '../../lib/date';
import { DIAS, DIAS_LONGO } from '../../lib/config';
import Saude from './Saude';
import Erro from '../../components/Erro';

export const dynamic = 'force-dynamic';

// Próxima aplicação prevista de cada protocolo.
function proxima(p, d) {
  if (p.intervalo > 1) {
    if (!p.ultima) return { data: null, txt: 'Sem aplicação registrada' };
    const prox = addDias(p.ultima, p.intervalo);
    const faltam = diasEntre(d, prox);
    return { data: prox, txt: faltam > 0 ? `em ${faltam} dia${faltam > 1 ? 's' : ''}` : faltam === 0 ? 'hoje' : `atrasada ${-faltam} dia${faltam < -1 ? 's' : ''}`, frac: Math.max(0, Math.min(1, diasEntre(p.ultima, d) / p.intervalo)) };
  }
  if (p.dias.length) {
    for (let i = 0; i < 8; i++) {
      const dd = addDias(d, i);
      if (p.dias.includes(DIAS[diaSemana(dd)])) return { data: dd, txt: i === 0 ? 'hoje' : i === 1 ? 'amanhã' : `em ${i} dias` };
    }
  }
  return { data: null, txt: '' };
}

export default async function SaudePage() {
  try {
    const d = hoje();
    const [dieta, { protocolos, aplicacoes }, medidas, registro] = await Promise.all([getDieta(), getProtocolos(), getMedidas(), getRegistro(d)]);
    const fase = semanaProtocolo(d);
    const prots = protocolos.map((p) => ({ ...p, prox: proxima(p, d), hoje: aplicacoes.some((a) => a.data === d && a.produtoId && a.produtoId.replace(/-/g, '') === p.id.replace(/-/g, '')) }));
    return (
      <Saude
        dieta={{ ...dieta, tipo: tipoDoDia(d, registro), dia: d, diaNome: DIAS_LONGO[diaSemana(d)].toLowerCase(), semana: `Dieta 90 dias · semana ${fase.semana} de ${fase.total} · ${fase.fase}` }}
        feitas={registro ? registro.refeicoesFeitas : []}
        protocolos={prots}
        aplicacoes={aplicacoes.slice(0, 20)}
        medidas={medidas}
        diaSigla={DIAS[diaSemana(d)]}
      />
    );
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
}
