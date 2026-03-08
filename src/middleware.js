import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.2 - GEO-IP & API BYPASS
 * Tento engine upřednostňuje reálnou polohu IP adresy před jazykem prohlížeče.
 * Zajišťuje, že /api routy (včetně /api/leaks) projdou bez 404 přesměrování.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 🛡️ GURU SHIELD: Absolutní priorita pro API a systémové soubory
  // Pokud dotaz směřuje na API, statické soubory nebo Next.js interní cesty, 
  // middleware okamžitě končí a propouští požadavek dál bez zásahu.
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 🌍 GEO-IP ENGINE: Vercel posílá kód země v této hlavičce
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';

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
  /**
   * 🚀 GURU CONFIG: Matcher upravený na "vylučovací" režim.
   * Tento regulární výraz říká Next.js: "Spouštěj tento middleware na všechno,
   * KROMĚ cest začínajících na 'api', '_next/static', '_next/image' nebo obsahujících favicon."
   * Toto je nejstabilnější způsob, jak zabránit 404 u API rout na Vercelu.
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
