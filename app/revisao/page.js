import Link from 'next/link';
import Menu from '../../components/Menu';
import Erro from '../../components/Erro';
import FormSemana from './FormSemana';
import { getSemana } from '../../lib/journal';
import { segundaDa } from '../../lib/agenda';
import { hoje, addDias, ddmm, valida } from '../../lib/date';
import { DIAS_LONGO } from '../../lib/config';

export const dynamic = 'force-dynamic';

const media = (a) => { const v = a.filter((x) => typeof x === 'number'); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const f1 = (x) => (x == null ? '—' : x.toFixed(1).replace('.', ','));

function feedback(dias, h) {
  const passados = dias.filter((x) => x.dia <= h);
  const regs = passados.map((x) => x.reg).filter(Boolean);
  const n = passados.length;
  const conta = (k) => regs.filter((r) => r[k]).length;
  const uteis = passados.filter((x) => ![0, 6].includes(new Date(`${x.dia}T12:00:00Z`).getUTCDay())).length;
  const academiaMeta = Math.min(4, uteis);
  const out = [];
  const add = (tom, txt) => out.push({ tom, txt });

  if (n === 0) return out;
  const semReg = passados.filter((x) => !x.reg).map((x) => ddmm(x.dia));
  if (semReg.length) add('ruim', `${semReg.length} dia(s) sem registro: ${semReg.join(', ')}. Sem dado, não tem como avaliar.`);
  else add('bom', 'Registrou todos os dias. Constância é o que faz o resto funcionar.');

  const ac = conta('Academia');
  add(ac >= academiaMeta ? 'bom' : 'ruim', `Academia ${ac}/${academiaMeta}${ac >= academiaMeta ? ': meta batida.' : `: faltaram ${academiaMeta - ac}.`}`);
  const jj = conta('Jiu-jitsu');
  add(jj >= uteis ? 'bom' : 'neutro', `Jiu-jitsu ${jj}/${uteis}.`);

  const sono = media(regs.map((r) => r.sono));
  if (sono != null) add(sono >= 7 ? 'bom' : 'ruim', `Sono médio de ${f1(sono)}h${sono < 7 ? ': abaixo de 7h, recuperação e treino pagam a conta.' : '.'}`);

  const pesos = regs.filter((r) => typeof r.peso === 'number');
  if (pesos.length >= 2) {
    const dif = pesos[pesos.length - 1].peso - pesos[0].peso;
    add('neutro', `Peso: ${f1(pesos[0].peso)} → ${f1(pesos[pesos.length - 1].peso)} kg (${dif > 0 ? '+' : ''}${f1(dif)}).`);
  }

  const jor = passados.filter((x) => x.journal);
  add(jor.length >= n ? 'bom' : 'neutro', `Journal em ${jor.length}/${n} dias.`);
  const notas = jor.filter((x) => typeof x.journal.nota === 'number');
  if (notas.length >= 2) {
    const melhor = notas.reduce((a, b) => (b.journal.nota > a.journal.nota ? b : a));
    const pior = notas.reduce((a, b) => (b.journal.nota < a.journal.nota ? b : a));
    add('neutro', `Melhor dia: ${DIAS_LONGO[new Date(`${melhor.dia}T12:00:00Z`).getUTCDay()].toLowerCase()} (${melhor.journal.nota}). Pior: ${DIAS_LONGO[new Date(`${pior.dia}T12:00:00Z`).getUTCDay()].toLowerCase()} (${pior.journal.nota}). Compare o que foi diferente.`);
  }
  const ajustes = jor.map((x) => x.journal.ajustar).filter(Boolean);
  if (ajustes.length) add('neutro', `Você pediu para ajustar ${ajustes.length}x esta semana. Releia a lista abaixo e escolha uma para a próxima semana.`);
  return out;
}

export default async function Revisao({ searchParams }) {
  const h = hoje();
  const seg = segundaDa(valida(searchParams?.d) || h);
  let dados;
  try {
    dados = await getSemana(seg);
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const { dias, semana, tarefasFeitas } = dados;
  const regs = dias.map((x) => x.reg).filter(Boolean);
  const notas = dias.map((x) => x.journal && x.journal.nota).filter((x) => typeof x === 'number');
  const fb = feedback(dias, h);
  const atual = seg === segundaDa(h);
  const tiles = [
    ['Academia', regs.filter((r) => r.Academia).length],
    ['Jiu-jitsu', regs.filter((r) => r['Jiu-jitsu']).length],
    ['Sono médio', `${f1(media(regs.map((r) => r.sono)))}h`],
    ['Nota média', notas.length ? f1(media(notas)) : '—'],
    ['Journal', `${dias.filter((x) => x.journal).length}/7`],
    ['Tarefas feitas', tarefasFeitas]
  ];

  return (
    <main className="page">
      <header className="head">
        <Menu />
        <div className="grow">
          <h1>Revisão</h1>
          <p>{atual ? 'Esta semana · ' : ''}{ddmm(seg)} a {ddmm(addDias(seg, 6))}</p>
        </div>
        <Link href={`/revisao?d=${addDias(seg, -7)}`} className="icon-btn" aria-label="Semana anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        {!atual && (
          <Link href={`/revisao?d=${addDias(seg, 7)}`} className="icon-btn" aria-label="Próxima semana">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        )}
      </header>

      <div className="rv-tiles">
        {tiles.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}
      </div>

      {fb.length > 0 && (
        <section className="card" aria-label="Feedback da semana">
          <h2 style={{ marginBottom: 8 }}>Feedback da semana</h2>
          <ul className="rv-fb">{fb.map((x, i) => <li key={i} className={x.tom}>{x.txt}</li>)}</ul>
        </section>
      )}

      <h2 className="note" style={{ margin: '6px 0 0' }}>Dia a dia</h2>
      {dias.map(({ dia, reg, journal }) => {
        const futuro = dia > h;
        const dow = new Date(`${dia}T12:00:00Z`).getUTCDay();
        return (
          <article key={dia} className={`card rv-dia${futuro ? ' futuro' : ''}`}>
            <div className="rv-top">
              <div className="grow">
                <div className="rv-nome">{DIAS_LONGO[dow]} <span>{ddmm(dia)}</span></div>
                {reg ? (
                  <div className="rv-chips">
                    {['Academia', 'Jiu-jitsu', 'Corrida', 'Respiração'].filter((k) => reg[k]).map((k) => <span key={k} className="ok">{k}</span>)}
                    {reg.sono != null && <span>Sono {f1(reg.sono)}h</span>}
                    {reg.peso != null && <span>{f1(reg.peso)} kg</span>}
                  </div>
                ) : <div className="note">{futuro ? 'Ainda não chegou' : 'Sem registro'}</div>}
              </div>
              {journal && typeof journal.nota === 'number' && <div className="rv-n" aria-label={`Nota ${journal.nota}`}>{journal.nota}</div>}
            </div>
            {journal && (
              <div className="rv-j">
                {journal.vitoria && <p><b>Vitória:</b> {journal.vitoria}</p>}
                {journal.ajustar && <p><b>Ajustar:</b> {journal.ajustar}</p>}
                {journal.gratidao && <p><b>Gratidão:</b> {journal.gratidao}</p>}
                {journal.journal && <details><summary>Ler o journal</summary><p style={{ whiteSpace: 'pre-wrap' }}>{journal.journal}</p></details>}
              </div>
            )}
            {!futuro && <Link href={`/registrar?d=${dia}`} className="rv-edit">{reg || journal ? 'Editar dia' : 'Preencher dia'} ›</Link>}
          </article>
        );
      })}

      <FormSemana key={seg} seg={seg} s={semana} />
    </main>
  );
}
