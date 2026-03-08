import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.1 - GEO-IP PRIORITY
 * Tento engine upřednostňuje reálnou polohu IP adresy před jazykem prohlížeče.
 * Pokud je uživatel mimo CZ/SK, web ho nekompromisně přepne do angličtiny.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 🌍 GEO-IP ENGINE: Vercel posílá kód země v této hlavičce
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';

  // 🛡️ GURU SHIELD: Ignorujeme systémové soubory a statické assety
  // 🚀 GURU FIX: Toto zajišťuje, že /api routy projdou bez 404 přesměrování!
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // 🌍 STRIKTNÍ DETEKCE: Je to cizinec?
  // Pokud IP adresa NENÍ z CZ ani SK, je to foreigner. Tečka.
  const hasLocalIP = ['CZ', 'SK'].includes(country.toUpperCase());
  const isForeigner = !hasLocalIP;

  // SEZNAM SEKCI POD DOHLEDEM GURUHO
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady', 'mikrorecenze'];

  // 1. AUTO-REDIRECT PRO CIZINCE NA ROOTU (/) -> (/en)
  if (pathname === '/' && isForeigner) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. GURU ROUTING ENGINE PRO SEKCE
  for (const section of sections) {
    // Pokud už je v EN větvi, nic neděláme
    if (pathname.startsWith(`/en/${section}`)) {
      return NextResponse.next();
    }

    // Pokud je detekován jako cizinec a snaží se lézt na CZ cestu, hodíme ho na /en
    if (pathname.startsWith(`/${section}`) && isForeigner) {
      const targetPath = pathname.replace(`/${section}`, `/en/${section}`);
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // GURU KOREKCE: Oprava nesmyslných URL typu /sekce/en
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Lokální uživatelé (CZ/SK) zůstávají v nativním jazyce
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', 
    '/slovnik/:path*', '/en/slovnik/:path*',
    '/clanky/:path*', '/en/clanky/:path*',
    '/tipy/:path*', '/en/tipy/:path*',
    '/tweaky/:path*', '/en/tweaky/:path*',
    '/rady/:path*', '/en/rady/:path*',
    '/mikrorecenze/:path*', '/en/mikrorecenze/:path*'
  ],
};
