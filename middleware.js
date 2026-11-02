import { NextResponse } from 'next/server';
import { COOKIE, tokenEsperado } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();
  const cookie = req.cookies.get(COOKIE)?.value;
  if (process.env.APP_PASSWORD && cookie === (await tokenEsperado())) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/|icons/|manifest.webmanifest|favicon.ico|apple-touch-icon.png).*)']
};
