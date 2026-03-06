import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE
 * Tento engine hlídá hranice mezi CZ a EN verzí webu.
 * Je navržen tak, aby nikdy nekolidoval s obrázky, fonty ani skripty.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const acceptLanguage = request.headers.get('accept-language') || '';

  // 🛡️ GURU SHIELD: Ignorujeme systémové soubory a statické assety (obrázky, ikony)
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // 🌍 DETEKCE JAZYKA: Čech/Slovák vs. World
  const isCzechOrSlovak = acceptLanguage.toLowerCase().includes('cs') || acceptLanguage.toLowerCase().includes('sk');

  // SEZNAM SEKCI POD DOHLEDEM GURUHO
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady'];

  // 1. AUTO-REDIRECT PRO CIZINCE NA ROOTU
  if (pathname === '/' && !isCzechOrSlovak) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. GURU ROUTING ENGINE
  for (const section of sections) {
    // Pokud už je v EN větvi, necháme ho v klidu (Proxy archiv to vyřeší)
    if (pathname.startsWith(`/en/${section}`)) {
      return NextResponse.next();
    }

    // Pokud cizinec vleze na českou cestu (např. /clanky), hodíme ho na /en/clanky
    if (pathname.startsWith(`/${section}`) && !isCzechOrSlovak) {
      const targetPath = pathname.replace(`/${section}`, `/en/${section}`);
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // GURU KOREKCE: Pokud někdo napíše nesmysl /clanky/en, opravíme na /en/clanky
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Pro CZ uživatele nebo nespecifikované cesty běží web nativně
  return NextResponse.next();
}

export const config = {
  // GURU MATCHING: Hlídáme pouze cesty, které mají CZ/EN variantu
  matcher: [
    '/', 
    '/slovnik/:path*', '/en/slovnik/:path*',
    '/clanky/:path*', '/en/clanky/:path*',
    '/tipy/:path*', '/en/tipy/:path*',
    '/tweaky/:path*', '/en/tweaky/:path*',
    '/rady/:path*', '/en/rady/:path*'
  ],
};
