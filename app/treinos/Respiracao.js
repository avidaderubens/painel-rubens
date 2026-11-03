'use client';

import { useState, useTransition } from 'react';
import { salvarBolt } from '../actions';

const ddmm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
const nivel = (s) => (s >= 30 ? ['Meta', 'up'] : s >= 20 ? ['Médio', 'mid'] : ['Fraco', 'low']);

const ROTINA = [
  ['Ao acordar', 'em jejum · 5 min', 'Diafragmática só pelo nariz (2 min), depois nauli nos dias dele.'],
  ['Antes do jiu-jitsu', '2 min', 'Inspira 4s, expira 6s, pelo nariz.'],
  ['No rola', 'durante', 'Exalação curta "tss" em todo esforço. Em explosão máxima (ponte, frame, raspagem), trave 1–2s com o abdômen firme e solte. Nunca segure por muito tempo.'],
  ['Pós-treino', '3–5 min', 'Deitado, inspira 4s, expira 8s.']
];

const PROGRESSAO = [
  [[1, 2], 'Sem 1–2', 'Vácuo abdominal 5 × 10s', '1 série de 8 sprints de 6s'],
  [[3, 4], 'Sem 3–4', 'Isolar o reto abdominal no centro, 5 reps', '2 séries de 8 sprints de 6s, 3 min entre séries'],
  [[5, 6], 'Sem 5–6', 'Rotação, 3 × 5 voltas por lado', '2 séries de 8 sprints de 8–10s']
];

const SEQUENCIA = ['Expira normal (sem esvaziar tudo)', 'Sprint segurando o ar', 'Expira tudo', '30s respirando livre', 'Próximo sprint'];

const SEGURANCA = [
  'Nunca faça apneia na água, nem no raso, nem sozinho na beira do mar.',
  'Não hiperventile antes da apneia.',
  'Se tiver tontura ou a visão escurecer, volte para sprints de 4s.',
  'Nauli só em jejum.'
];

export default function Respiracao({ semanaBloco, diaSigla, bolt: boltIni }) {
  const [bolt, setBolt] = useState(boltIni);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [pending, start] = useTransition();
  const fase = PROGRESSAO.find((p) => p[0].includes(semanaBloco)) || PROGRESSAO[0];
  const ultimo = bolt[0];
  const hojeIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const testouHoje = ultimo && ultimo.data === hojeIso;

  const sprintHoje = diaSigla === 'Ter' ? 'Hoje tem sprints com apneia, no fim do Treino B.'
    : diaSigla === 'Sáb' ? 'Hoje tem sprints com apneia, depois dos 10 min de aquecimento e antes do 4x4.'
      : diaSigla === 'Seg' ? 'Hoje é dia do Treino A: sem sprints com apneia.' : null;

  const enviar = (e) => {
    e.preventDefault();
    const s = Number(String(valor).replace(',', '.'));
    setErro('');
    start(async () => {
      const r = await salvarBolt(valor);
      if (r && r.erro) { setErro(r.erro); return; }
      setBolt((b) => [{ id: `novo-${hojeIso}`, data: hojeIso, segundos: s }, ...b.filter((x) => x.data !== hojeIso)]);
      setValor('');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section className="hero" aria-label="Protocolo de respiração">
        <div className="label" style={{ color: '#ff8f3d', fontWeight: 600 }}>Protocolo de respiração · 6 semanas</div>
        <div>
          <div className="t">Semana {semanaBloco} de 6</div>
          <div style={{ fontSize: 14, color: '#f3f3f4', lineHeight: 1.4, marginTop: 4 }}>Resistência e explosão no BJJ, VO2máx e recuperação. Roda junto com o bloco de treino de 6 semanas.</div>
        </div>
        {sprintHoje && <div className="meta"><span>{sprintHoje}</span></div>}
      </section>

      <h2 className="bloco-t">Rotina diária</h2>
      <section className="card list" aria-label="Rotina diária">
        {ROTINA.map(([t, q, d]) => (
          <div key={t} style={{ padding: '12px 0', borderTop: t === ROTINA[0][0] ? 0 : '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span>
              <span className="acc" style={{ fontSize: 12, fontWeight: 700 }}>{q}</span>
            </span>
            <span style={{ fontSize: 14, color: '#c9c9ce', lineHeight: 1.4 }}>{d}</span>
          </div>
        ))}
      </section>

      <div className="callout">
        <b>Na academia é diferente.</b> Nos exercícios pesados (agachamento, terra, supino, desenvolvimento, barra fixa), trave o ar e firme o abdômen a cada rep, e solte no topo. A exalação &quot;tss&quot; fica para o tatame e os exercícios leves.
      </div>

      <h2 className="bloco-t">Progressão</h2>
      <section className="card list" aria-label="Progressão">
        <div style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) minmax(0,1fr)', gap: 10, padding: '12px 0 8px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <span>Semanas</span><span>Nauli · 3x/sem, manhã</span><span>Sprints com apneia · ter e sáb</span>
        </div>
        {PROGRESSAO.map((p) => {
          const atual = p === fase;
          return (
            <div key={p[1]} aria-current={atual ? 'step' : undefined}
              style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) minmax(0,1fr)', gap: 10, padding: '12px 8px', margin: '0 -8px', borderTop: '1px solid var(--line-soft)', borderRadius: atual ? 12 : 0, background: atual ? 'var(--acc-soft)' : 'transparent', fontSize: 14, lineHeight: 1.35 }}>
              <span style={{ fontWeight: 700, color: atual ? 'var(--acc)' : 'var(--fg)' }}>{p[1]}{atual && <><br /><small style={{ fontSize: 11 }}>agora</small></>}</span>
              <span style={{ color: atual ? 'var(--fg)' : '#c9c9ce' }}>{p[2]}</span>
              <span style={{ color: atual ? 'var(--fg)' : '#c9c9ce' }}>{p[3]}</span>
            </div>
          );
        })}
      </section>

      <h2 className="bloco-t">Sprints com apneia</h2>
      <section className="card" aria-label="Sprints com apneia">
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SEQUENCIA.map((s, i) => (
            <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span className="letra" style={{ width: 28, height: 28, fontSize: 14, borderRadius: 8 }}>{i + 1}</span>{s}
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line-soft)', paddingTop: 10, fontSize: 14 }}>
          <span><b className="acc">Terça:</b> no fim do Treino B.</span>
          <span><b className="acc">Sábado:</b> depois dos 10 min de aquecimento, antes do 4x4.</span>
          <span><b style={{ color: 'var(--bad)' }}>Nunca</b> no dia do Treino A (segunda).</span>
        </div>
      </section>

      <h2 className="bloco-t">Domingo · opcional</h2>
      <section className="card" style={{ fontSize: 14, color: '#c9c9ce', lineHeight: 1.4 }}>
        Corrida de 30–40 min só pelo nariz. Se precisar abrir a boca, reduza o ritmo. Se as pernas estiverem pesadas do sábado, troque por caminhada.
      </section>

      <h2 className="bloco-t">Teste BOLT</h2>
      <section className="card" aria-label="Teste BOLT">
        <div className="card-head">
          <h2 style={{ fontSize: 16 }}>Toda segunda, ao acordar</h2>
          {ultimo && <span className={`sug ${nivel(ultimo.segundos)[1] === 'up' ? 'up' : 'hold'}`}>Último: {String(ultimo.segundos).replace('.', ',')}s</span>}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#c9c9ce', lineHeight: 1.4 }}>Antes de qualquer coisa: expira normal, tapa o nariz e cronometra até a primeira vontade de respirar.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 6, fontSize: 12, textAlign: 'center' }}>
          <span className="bolt-n low">&lt; 20s · fraco</span>
          <span className="bolt-n mid">20–29s · médio</span>
          <span className="bolt-n up">30s+ · meta</span>
        </div>
        {diaSigla === 'Seg' && !testouHoje && <div className="callout" style={{ padding: '10px 12px' }}><b>Hoje é dia de teste.</b> Faça antes do café.</div>}
        <form onSubmit={enviar} style={{ display: 'flex', gap: 8 }}>
          <label htmlFor="bolt" className="sr-only">Segundos do teste de hoje</label>
          <input id="bolt" className="input bignum" type="number" inputMode="decimal" step="0.5" min="1" max="300" placeholder="segundos" value={valor} onChange={(e) => setValor(e.target.value)} style={{ flex: 1 }} required />
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 18px', height: 56 }} disabled={pending}>{pending ? 'Salvando…' : testouHoje ? 'Atualizar' : 'Salvar'}</button>
        </form>
        {erro && <div className="error" role="alert">{erro}</div>}
        {bolt.length > 0 ? (
          <div className="list" style={{ display: 'flex', flexDirection: 'column' }}>
            {bolt.map((b) => {
              const [nome, cls] = nivel(b.segundos);
              return (
                <div key={b.id} className="row" style={{ minHeight: 48 }}>
                  <span className="acc" style={{ width: 52, fontWeight: 700 }}>{ddmm(b.data)}</span>
                  <span className="grow" style={{ fontFamily: 'var(--font-num)', fontSize: 18, fontWeight: 700 }}>{String(b.segundos).replace('.', ',')}s</span>
                  <span className={`bolt-n ${cls}`}>{nome}</span>
                </div>
              );
            })}
          </div>
        ) : <div className="empty">Nenhum teste registrado ainda.</div>}
      </section>

      <h2 className="bloco-t">Segurança</h2>
      <section className="card" aria-label="Segurança" style={{ borderColor: '#5a2020', background: '#1d0f0f' }}>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#f3d0d0', lineHeight: 1.4 }}>
          {SEGURANCA.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>
    </div>
  );
}
