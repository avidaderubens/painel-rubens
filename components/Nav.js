'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const S = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export default function Nav() {
  const p = usePathname();
  if (p.startsWith('/login')) return null;
  const at = (href) => (href === '/' ? p === '/' : p.startsWith(href)) ? 'page' : undefined;
  return (
    <nav className="nav" aria-label="Navegação principal">
      <Link href="/" aria-label="Painel" aria-current={at('/') || (p.startsWith('/saude') ? 'page' : undefined)}>
        <svg {...S}><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></svg>
      </Link>
      <Link href="/tarefas" aria-label="Tarefas" aria-current={at('/tarefas')}>
        <svg {...S}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
      </Link>
      <Link href="/registrar" aria-label="Registrar o dia" aria-current={at('/registrar')}>
        <span className="plus"><svg {...S} width={24} height={24} strokeWidth={2.2}><path d="M12 5v14M5 12h14" /></svg></span>
      </Link>
      <Link href="/notas" aria-label="Notas" aria-current={at('/notas')}>
        <svg {...S}><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h4" /></svg>
      </Link>
      <Link href="/perfil" aria-label="Perfil" aria-current={at('/perfil')}>
        <svg {...S}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
      </Link>
    </nav>
  );
}
