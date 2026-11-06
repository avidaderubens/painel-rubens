'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { salvarBloco, excluirBloco } from '../actions';
import { TIPOS, ocorre, minutos } from '../../lib/agenda-regras';

const REPS = [['Não', 'Uma vez'], ['Todo dia', 'Todo dia'], ['Seg–Sex', 'Seg–Sex'], ['Semanal', 'Semanal'], ['Dias específicos', 'Dias']];
const SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const VINCULOS = ['Nenhum', 'Treino do dia', 'Refeição', 'Ipamorelin', 'Tarefas'];

// Digita 1830 e vira 18:30.
function hora(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

function Salvar({ novo }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? 'Salvando…' : novo ? 'Salvar bloco' : 'Salvar alterações'}</button>;
}

export default function BlocoForm({ bloco, dia, projetos, outros }) {
  const novo = !bloco;
  const [estado, acao] = useFormState(salvarBloco, null);
  const [tipo, setTipo] = useState(bloco?.tipo || 'Trabalho');
  const [rep, setRep] = useState(bloco?.repetir || 'Não');
  const [dias, setDias] = useState(bloco?.dias || []);
  const [d, setD] = useState(bloco?.data || dia);
  const [ini, setIni] = useState(bloco?.ini || '');
  const [fim, setFim] = useState(bloco?.fim || '');
  const [apagando, startApagar] = useTransition();

  const choque = useMemo(() => {
    const s = minutos(ini); const e = minutos(fim);
    if (s == null || e == null || e <= s) return null;
    const teste = { repetir: rep, dias, data: d };
    return outros.find((o) => o.id !== bloco?.id && ocorre(o, d) && ocorre(teste, d) && minutos(o.ini) < e && minutos(o.fim) > s) || null;
  }, [ini, fim, rep, dias, d, outros, bloco]);

  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {bloco && <input type="hidden" name="id" value={bloco.id} />}
      <header className="head">
        <Link href={`/?d=${dia}`} className="icon-btn" aria-label="Cancelar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </Link>
        <div className="grow"><h1>{novo ? 'Novo bloco' : 'Editar bloco'}</h1></div>
      </header>

      <div className="field">
        <label htmlFor="titulo">O que vai fazer</label>
        <input id="titulo" name="titulo" className="input" defaultValue={bloco?.titulo || ''} placeholder="Ex.: Gravar Reels · AVDR" required style={{ height: 52, fontSize: 17, fontWeight: 600 }} />
      </div>

      <div className="field">
        <span className="label">Tipo</span>
        <input type="hidden" name="tipo" value={tipo} />
        <div className="ag-chips" role="radiogroup" aria-label="Tipo do bloco">
          {Object.entries(TIPOS).map(([t, v]) => (
            <button key={t} type="button" role="radio" aria-checked={tipo === t} onClick={() => setTipo(t)}>
              <em style={{ background: v.cor }} />{t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
        <div className="field">
          <label htmlFor="dia">{rep === 'Não' ? 'Dia' : 'A partir de'}</label>
          <input id="dia" name="dia" type="date" className="input" value={d} onChange={(e) => setD(e.target.value)} style={{ padding: '0 10px', minWidth: 0 }} />
        </div>
        <div className="field">
          <label htmlFor="ini">Início</label>
          <input id="ini" name="ini" type="text" inputMode="numeric" placeholder="00:00" maxLength={5} autoComplete="off" className="input bignum" value={ini} onChange={(e) => setIni(hora(e.target.value))} required style={{ padding: 0, minWidth: 0, fontSize: 20, height: 48 }} />
        </div>
        <div className="field">
          <label htmlFor="fim">Fim</label>
          <input id="fim" name="fim" type="text" inputMode="numeric" placeholder="00:00" maxLength={5} autoComplete="off" className="input bignum" value={fim} onChange={(e) => setFim(hora(e.target.value))} required style={{ padding: 0, minWidth: 0, fontSize: 20, height: 48 }} />
        </div>
      </div>

      <div className="field">
        <span className="label">Repetir</span>
        <input type="hidden" name="repetir" value={rep} />
        <div className="seg" role="radiogroup" aria-label="Repetir" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {REPS.map(([v, nome]) => (
            <button key={v} type="button" role="radio" aria-checked={rep === v} onClick={() => setRep(v)} style={{ fontSize: 14, padding: 0 }}>{nome}</button>
          ))}
        </div>
        {rep === 'Dias específicos' && (
          <div className="ag-dias">
            {SEMANA.map((s) => (
              <label key={s}>
                <input type="checkbox" name="dias" value={s} checked={dias.includes(s)} onChange={(e) => setDias((x) => (e.target.checked ? [...x, s] : x.filter((y) => y !== s)))} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
        <div className="field">
          <label htmlFor="projeto">Projeto</label>
          <select id="projeto" name="projeto" className="input" defaultValue={bloco?.projetoId || ''}>
            <option value="">Nenhum</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vinculo">Puxa do app</label>
          <select id="vinculo" name="vinculo" className="input" defaultValue={bloco?.vinculo || 'Nenhum'}>
            {VINCULOS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" className="input" rows={2} defaultValue={bloco?.notas || ''} placeholder="Opcional" />
      </div>

      {choque && (
        <p className="callout" role="status" style={{ margin: 0 }}>
          Bate com <b>{choque.titulo}</b> ({choque.ini}–{choque.fim}). Dá para salvar assim mesmo; os dois aparecem lado a lado.
        </p>
      )}
      {estado?.erro && <p role="alert" style={{ margin: 0, color: 'var(--bad)' }}>{estado.erro}</p>}

      <Salvar novo={novo} />
      {bloco && (
        <button type="button" className="btn btn-danger" disabled={apagando} onClick={() => { if (window.confirm(`Excluir “${bloco.titulo}” da agenda?`)) startApagar(() => excluirBloco(bloco.id, dia)); }}>
          {apagando ? 'Excluindo…' : 'Excluir bloco'}
        </button>
      )}
    </form>
  );
}
