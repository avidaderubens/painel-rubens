'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sair } from '../app/actions';

const S = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const ITENS = [
  ['/', 'Agenda', 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4'],
  ['/painel', 'Painel', 'M12 3a9 9 0 1 0 9 9h-9zM15 3.5A9 9 0 0 1 20.5 9H15z'],
  ['/tarefas', 'Tarefas', 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8.5 12l2.5 2.5 4.5-5'],
  ['/crm', 'CRM', 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 19v-1a4 4 0 0 0-3-3.87M16 3.13a3.5 3.5 0 0 1 0 6.75'],
  ['/registrar', 'Registrar o dia', 'M12 5v14M5 12h14'],
  ['/treinos', 'Treinos', 'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11'],
  ['/notas', 'Notas', 'M6 3h9l4 4v14H6zM9 11h7M9 15h7M9 7h4'],
  ['/saude', 'Saúde', 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z']
];

export default function Menu() {
  const [aberto, setAberto] = useState(false);
  const p = usePathname();
  useEffect(() => { setAberto(false); }, [p]);
  useEffect(() => {
    if (!aberto) return undefined;
    const esc = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [aberto]);
  const ativo = (href) => (href === '/' ? p === '/' : p.startsWith(href));
  return (
    <>
      <button type="button" className="icon-btn" aria-label="Abrir menu" aria-expanded={aberto} onClick={() => setAberto(true)}>
        <svg {...S}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {aberto && (
        <div className="drawer-wrap">
          <button type="button" className="drawer-bg" aria-label="Fechar menu" onClick={() => setAberto(false)} />
          <nav className="drawer" aria-label="Menu">
            <div className="drawer-top">
              <span className="avatar">R</span>
              <span className="grow"><b>Rubens</b><small>Painel Rubens</small></span>
              <button type="button" className="icon-btn ghost" aria-label="Fechar menu" onClick={() => setAberto(false)}>
                <svg {...S} width={20} height={20} strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {ITENS.map(([href, nome, d]) => (
              <Link key={href} href={href} className="drawer-item" aria-current={ativo(href) ? 'page' : undefined}>
                <svg {...S}><path d={d} /></svg>{nome}
              </Link>
            ))}
            <div className="drawer-sep" />
            <Link href="/perfil" className="drawer-item" aria-current={ativo('/perfil') ? 'page' : undefined}>
              <svg {...S}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
              <span className="grow">Perfil e ajustes</span><small>metas, dias</small>
            </Link>
            <form action={sair} style={{ marginTop: 'auto' }}>
              <button type="submit" className="drawer-item muted">
                <svg {...S}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>Sair
              </button>
            </form>
          </nav>
        </div>
      )}
    </>
  );
}
