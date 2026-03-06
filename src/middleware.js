import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const acceptLanguage = request.headers.get('accept-language') || '';

  // GURU PRAVIDLO: Detekce jazyka (Čech/Slovák vs. zbytek světa)
  const isCzechOrSlovak = acceptLanguage.toLowerCase().includes('cs') || acceptLanguage.toLowerCase().includes('sk');

  // SEZNAM VŠECH SEKCI, KTERÉ MUSÍME HLÍDAT
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady'];

  // 1. AUTO-REDIRECT PRO CIZINCE NA HLAVNÍ STRÁNCE
  if (pathname === '/' && !isCzechOrSlovak) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. UNIVERZÁLNÍ LOGIKA PRO VŠECHNY SEKCE
  for (const section of sections) {
    // Pokud uživatel už je na správné anglické cestě (např. /en/clanky), necháme ho být
    if (pathname === `/en/${section}` || pathname.startsWith(`/en/${section}/`)) {
      return NextResponse.next();
    }

    // Pokud cizinec vleze na českou cestu (např. /clanky), hodíme ho na anglickou (/en/clanky)
    if (pathname === `/${section}` && !isCzechOrSlovak) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }

    // GURU FIX: Pokud je uživatel na české cestě (např. /clanky), podstrčíme mu interně /cs/clanky
    // To zajistí, že dynamické [slug] stránky budou vědět, že jsou v CZ režimu.
    if (pathname === `/${section}` || pathname.startsWith(`/${section}/`)) {
      // Pokud někdo omylem napíše /clanky/en, přesměrujeme ho na správné /en/clanky
      if (pathname === `/${section}/en`) {
        return NextResponse.redirect(new URL(`/en/${section}`, request.url));
      }
      
      const url = request.nextUrl.clone();
      url.pathname = `/cs${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // GURU MATCHING: Musíme hlídat vše, co chceme překládat
  matcher: [
    '/', 
    '/slovnik/:path*', '/en/slovnik/:path*',
    '/clanky/:path*', '/en/clanky/:path*',
    '/tipy/:path*', '/en/tipy/:path*',
    '/tweaky/:path*', '/en/tweaky/:path*',
    '/rady/:path*', '/en/rady/:path*'
  ],
};
