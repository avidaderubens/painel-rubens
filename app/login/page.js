'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { entrar } from '../actions';
import Enviar from '../../components/Enviar';

export default function Login() {
  const [estado, acao] = useFormState(entrar, null);
  const [ver, setVer] = useState(false);
  return (
    <main className="page" style={{ minHeight: '100vh', justifyContent: 'center', gap: 28, paddingBottom: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <div aria-hidden="true" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0c0c0e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-num)', fontSize: 32 }}>Painel Rubens</h1>
          <p className="note" style={{ fontSize: 15, marginTop: 6 }}>Saúde, tarefas e notas num lugar só.</p>
        </div>
      </div>
      <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label htmlFor="senha" className="label">Senha</label>
        <div style={{ position: 'relative' }}>
          <input id="senha" name="senha" type={ver ? 'text' : 'password'} className="input" style={{ height: 56, paddingRight: 56 }} placeholder="Digite sua senha" autoComplete="current-password" required />
          <button type="button" aria-label={ver ? 'Esconder senha' : 'Mostrar senha'} onClick={() => setVer(!ver)}
            style={{ position: 'absolute', right: 6, top: 6, width: 44, height: 44, background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
        </div>
        {estado?.erro && <div className="error" role="alert">{estado.erro}</div>}
        <Enviar pendente="Entrando…">Entrar</Enviar>
        <p className="note" style={{ textAlign: 'center' }}>Este aparelho fica conectado por 30 dias.</p>
      </form>
    </main>
  );
}
