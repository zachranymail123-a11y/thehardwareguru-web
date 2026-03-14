import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.5 - ANTI-CLOAKING & SAFE SEO ROUTING
 * Cesta: src/middleware.js
 * 🛡️ FIX 1: Odstraněna detekce botů (isBot) - Bing to oprávněně bral jako "Cloaking" (Maskování).
 * 🛡️ FIX 2: Zrušeno vynucené IP přesměrování pro hluboké odkazy. Pokud Bing z USA 
 * explicitně žádá CZ odkaz, dostane CZ obsah. Přesměruje se POUZE hlavní doména (root).
 */
export function middleware(request) {
  const { pathname, search, origin } = request.nextUrl;
  
  // 🚀 GURU SEO: Sestavení absolutní URL a příprava hlaviček pro layout.js (hreflang)
  const absoluteUrl = `${origin}${pathname}${search}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', absoluteUrl);

  const nextWithHeaders = () => NextResponse.next({
    request: { headers: requestHeaders },
  });

  // 🛡️ GURU SHIELD: Absolutní priorita pro API a systémové soubory
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return nextWithHeaders();
  }

  // 🌍 GEO-IP ENGINE
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';
  const hasLocalIP = ['CZ', 'SK'].includes(country.toUpperCase());
  const isForeigner = !hasLocalIP;

  const sections = [
    'slovnik', 'clanky', 'tipy', 'tweaky', 'rady', 'mikrorecenze', 'deals', 'support',
    'gpu', 'cpu', 'gpuvs', 'cpuvs', 'gpu-fps', 'cpu-fps', 
    'gpu-performance', 'cpu-performance', 'gpu-recommend', 'cpu-recommend',
    'gpu-upgrade', 'cpu-upgrade', 'gpu-index', 'cpu-index', 'bottleneck'
  ];

  // 1. AUTO-REDIRECT PRO CIZINCE POUZE NA ROOTU (/) -> (/en)
  // Toto je 100% SEO-safe postup. Pouze domovskou stránku můžeme přesměrovat podle lokace.
  if (pathname === '/' && isForeigner) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. KOREKCE NESMYSLNÝCH URL (např. /clanky/en -> /en/clanky)
  for (const section of sections) {
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Všechny ostatní požadavky (hluboké odkazy) propustíme bez zásahu. 
  // Pokud americký bot žádá CZ URL, dostane ji. To vyřeší blokaci Bingu!
  return nextWithHeaders();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
