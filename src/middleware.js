import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE V2.8 (ADSENSE & ANTI-404 PROTECTION)
 * Cesta: src/middleware.js
 * 🛡️ FIX 1: Návrat Bot Bypassu. Boti (US IP) nesmí dostat redirect!
 * 🛡️ FIX 2: Geo-IP redirect pro reálné lidi pouze na rootu (SEO Safe).
 * 🛡️ FIX 3: GURU ANTI-404 SHIELD: Odchytáváme mrtvé cesty, co kazí AdSense skóre.
 */
export function middleware(request) {
  const { pathname, search, origin } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // 🚀 GURU SEO: Sestavení absolutní URL pro layout.js (hreflang)
  const absoluteUrl = `${origin}${pathname}${search}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', absoluteUrl);

  const nextWithHeaders = () => NextResponse.next({
    request: { headers: requestHeaders },
  });

  // 🛡️ GURU ANTI-404 SHIELD: Záchranná síť pro AdSense
  // Pokud někdo/něco hledá staré skripty nebo neexistující cesty, co vidíme v Analytics
  const forbiddenSuffixes = ['.php', '.asp', '.aspx', '.jsp', '.cgi', 'wp-admin', 'wp-login'];
  if (forbiddenSuffixes.some(suffix => pathname.toLowerCase().includes(suffix))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 🛡️ GURU SHIELD: Absolutní priorita pro systémové soubory a API
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return nextWithHeaders();
  }

  // 🤖 ZLATÉ PRAVIDLO: Crawler z USA musí vidět CZ verzi bez redirectu!
  const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|seznam|yandex|baiduspider|facebookexternalhit|twitterbot/i.test(userAgent);
  if (isBot) {
      return nextWithHeaders(); 
  }

  // 🌍 GEO-IP ENGINE (Pouze pro reálné lidi)
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';
  const hasLocalIP = ['CZ', 'SK'].includes(country.toUpperCase());
  const isForeigner = !hasLocalIP;

  // 1. AUTO-REDIRECT PRO CIZINCE POUZE NA ROOTU (/) -> (/en)
  if (pathname === '/' && isForeigner) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. KOREKCE URL (např. /clanky/en -> /en/clanky)
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady', 'mikrorecenze', 'deals', 'support', 'gpu', 'cpu', 'gpuvs', 'cpuvs'];
  for (const section of sections) {
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Vše ostatní propustíme čistě.
  return nextWithHeaders();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
