// Token do cookie de login: SHA-256 de APP_PASSWORD + AUTH_SECRET.
// Usa Web Crypto, que funciona tanto no middleware (Edge) quanto no servidor.
export const COOKIE = 'pr_auth';

export async function tokenEsperado() {
  const senha = process.env.APP_PASSWORD || '';
  const segredo = process.env.AUTH_SECRET || 'painel-rubens';
  const dados = new TextEncoder().encode(`${senha}:${segredo}`);
  const hash = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
