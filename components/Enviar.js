'use client';

import { useFormStatus } from 'react-dom';

export default function Enviar({ children, pendente = 'Salvando…' }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? pendente : children}</button>;
}
