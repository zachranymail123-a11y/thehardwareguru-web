import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const acceptLanguage = request.headers.get('accept-language') || '';

  // GURU PRAVIDLO: Detekce jazyka (Čech/Slovák vs. zbytek světa)
  const isCzechOrSlovak = acceptLanguage.toLowerCase().includes('cs') || acceptLanguage.toLowerCase().includes('sk');

  // SEZNAM VŠECH SEKCI
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady'];

  // 1. AUTO-REDIRECT PRO CIZINCE NA HLAVNÍ STRÁNCE
  if (pathname === '/' && !isCzechOrSlovak) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. UNIVERZÁLNÍ LOGIKA PRO SEKCE
  for (const section of sections) {
    // Pokud už je na /en/ cestě, nic neděláme, Next.js to vyřeší přes naše Proxy soubory
    if (pathname === `/en/${section}` || pathname.startsWith(`/en/${section}/`)) {
      return NextResponse.next();
    }

    // Pokud cizinec vleze na českou cestu, hodíme ho na anglickou
    if (pathname === `/${section}` && !isCzechOrSlovak) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }

    // Pokud někdo napíše nesmysl typu /clanky/en, pošleme ho na /en/clanky
    if (pathname === `/${section}/en`) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // GURU FIX: Pro české cesty vracíme NextResponse.next() BEZ rewritu na /cs/!
  // Soubory jsou přímo v src/app/[sekce], takže není co přepisovat.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', 
    '/slovnik/:path*', '/en/slovnik/:path*',
    '/clanky/:path*', '/en/clanky/:path*',
    '/tipy/:path*', '/en/tipy/:path*',
    '/tweaky/:path*', '/en/tweaky/:path*',
    '/rady/:path*', '/en/rady/:path*'
  ],
};
