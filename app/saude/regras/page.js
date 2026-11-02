import Link from 'next/link';
import { hoje } from '../../../lib/date';
import { semanaProtocolo } from '../../../lib/treino';

export const dynamic = 'force-dynamic';

const REGRAS = [
  'Pesar tudo cozido, na balança de cozinha.',
  'Sardinha no lugar do frango 2-3x por semana (ômega-3).',
  'Água: mínimo 4 L por dia + 1 pitada de sal na garrafa do jiu-jitsu.',
  'Sono: 8 h por noite.',
  'Proteína nunca cai. Se a fome travar, corte carbo do almoço.'
];
const FASES = [
  ['Semanas 1-2', 'Calibração do protocolo. Dieta normal.'],
  ['Semanas 1-4', 'Jiu-jitsu 3-4x por semana, sem o duplo de quarta.'],
  ['Semanas 5 e 10', 'Deload do protocolo. Manter Dia A nos dias de treino.'],
  ['Semanas 6-13', 'Protocolo completo.']
];
const CHECK = [
  ['Peso', 'Média de 2 pesagens por semana, em jejum.'],
  ['Cintura', 'Fita na altura do umbigo, em jejum.'],
  ['Fotos', 'Mesma luz, mesma hora.'],
  ['Carga', 'Agachamento, supino, barra fixa, terra.']
];
const AJUSTES = [
  ['Perdendo mais de 1 kg por semana', '+30 g de carbo no pós-academia.'],
  ['Peso e cintura parados por 2 semanas', '-30 g de carbo no jantar do Dia B.'],
  ['Força caindo 2 semanas seguidas', '+200 kcal (carbo) nos Dias A.']
];
const MICRO = [
  ['Ferro e zinco', 'Feijão, carne vermelha, ovos'],
  ['Cálcio', 'Leite; 1 iogurte natural se sobrar fome'],
  ['Potássio e magnésio', 'Banana, aveia, feijão, legumes'],
  ['Vitamina C', 'Frutas e salada'],
  ['Ômega-3', 'Sardinha 2-3x por semana']
];

const Tabela = ({ linhas }) => (
  <table className="tbl"><tbody>{linhas.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
);

export default function Regras() {
  const f = semanaProtocolo(hoje());
  return (
    <main className="page">
      <header className="head">
        <Link href="/saude" className="icon-btn" aria-label="Voltar para a dieta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="grow"><h1>Dieta 90 dias</h1><p>Semana {f.semana} de {f.total} · {f.fase}</p></div>
      </header>
      <section className="card prose"><h2>Regras fixas</h2><ul>{REGRAS.map((r) => <li key={r}>{r}</li>)}</ul></section>
      <section className="card prose"><h2>Ajustes</h2><Tabela linhas={AJUSTES} /></section>
      <section className="card prose"><h2>Checkpoints · a cada 14 dias</h2><Tabela linhas={CHECK} /><Link href="/saude" className="btn btn-ghost btn-sm" style={{ width: '100%' }}>Registrar medidas na aba Corpo</Link></section>
      <section className="card prose"><h2>Fases</h2><Tabela linhas={FASES} /></section>
      <section className="card prose"><h2>Micronutrientes</h2><Tabela linhas={MICRO} /></section>
      <p className="note">Valores estimados pela tabela TACO. Cópia completa no Notion › Saúde › Dieta 90 dias – regras e ajustes.</p>
    </main>
  );
}
