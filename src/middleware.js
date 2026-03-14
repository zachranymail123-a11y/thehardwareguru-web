import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.4 - BOT BYPASS & FULL HW ROUTING
 * Cesta: src/middleware.js
 * 🛡️ FIX 1: Detekce Crawlerů (Bingbot, Googlebot) - projdou web bez IP přesměrování!
 * 🛡️ FIX 2: Doplněno pole 'sections' o všechny HW cesty (gpu, gpuvs, bottleneck atd.).
 */
export function middleware(request) {
  const { pathname, search, origin } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
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

  // 🤖 GURU BOT-BYPASS: Boti nesmí být NIKDY přesměrováni podle IP adresy!
  // Jinak Google a Bing ze svých US serverů nikdy nezaindexují CZ verzi webu.
  const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|seznam|yandex|baiduspider|facebookexternalhit|twitterbot/i.test(userAgent);
  if (isBot) {
      return nextWithHeaders(); 
  }

  // 🌍 GEO-IP ENGINE: Běžní uživatelé
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';
  const hasLocalIP = ['CZ', 'SK'].includes(country.toUpperCase());
  const isForeigner = !hasLocalIP;

  // 🚀 GURU FIX: Přidány všechny chybějící hardwarové a aplikační sekce
  const sections = [
    'slovnik', 'clanky', 'tipy', 'tweaky', 'rady', 'mikrorecenze', 'deals', 'support',
    'gpu', 'cpu', 'gpuvs', 'cpuvs', 'gpu-fps', 'cpu-fps', 
    'gpu-performance', 'cpu-performance', 'gpu-recommend', 'cpu-recommend',
    'gpu-upgrade', 'cpu-upgrade', 'gpu-index', 'cpu-index', 'bottleneck'
  ];

  // 1. AUTO-REDIRECT PRO CIZINCE NA ROOTU (/) -> (/en)
  if (pathname === '/' && isForeigner) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. GURU ROUTING ENGINE PRO SEKCE
  for (const section of sections) {
    // Pokud už je v EN větvi, propustíme dál
    if (pathname.startsWith(`/en/${section}`)) {
      return nextWithHeaders();
    }

    // Cizinec leze na CZ -> Přesměruj na EN
    if (pathname.startsWith(`/${section}`) && isForeigner) {
      const targetPath = pathname.replace(`/${section}`, `/en/${section}`);
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // Korekce lomítek
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Lokální uživatelé (CZ/SK) zůstávají na nativní CZ verzi
  return nextWithHeaders();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
