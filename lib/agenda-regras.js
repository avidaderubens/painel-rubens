import { DIAS } from './config';
import { diaSemana } from './date';

export const TIPOS = {
  Treino: { cor: '#ff7a1a', bg: 'rgba(255,122,26,0.16)' },
  'Jiu-jitsu': { cor: '#ffb37a', bg: 'rgba(255,179,122,0.13)' },
  'Refeição': { cor: '#5cc98a', bg: 'rgba(92,201,138,0.12)' },
  Trabalho: { cor: '#7aa2f7', bg: 'rgba(122,162,247,0.12)' },
  'Conteúdo': { cor: '#c08cf5', bg: 'rgba(192,140,245,0.13)' },
  Protocolo: { cor: '#f27ab0', bg: 'rgba(242,122,176,0.13)' },
  Pessoal: { cor: '#9a9aa2', bg: 'rgba(154,154,162,0.13)' }
};

export const minutos = (hhmm) => {
  const m = String(hhmm || '').match(/(\d{1,2})[:h](\d{2})?/);
  return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null;
};

// O bloco aparece neste dia?
export function ocorre(b, dia) {
  const sigla = DIAS[diaSemana(dia)];
  const util = !['Sáb', 'Dom'].includes(sigla);
  if (b.data && dia < b.data && b.repetir !== 'Não') return false;
  switch (b.repetir) {
    case 'Todo dia': return true;
    case 'Seg–Sex': return util;
    case 'Semanal': return b.data ? diaSemana(b.data) === diaSemana(dia) : b.dias.includes(sigla);
    case 'Dias específicos': return b.dias.includes(sigla);
    default: return b.data === dia;
  }
}

