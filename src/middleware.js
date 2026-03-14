import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.3 - GEO-IP & API BYPASS & SEO HREFLANG
 * Cesta: src/middleware.js
 * Slučuje tvé Geo-IP přesměrování a předávání 'x-url' hlavičky 
 * pro dynamické SEO hreflang tagy v RootLayoutu.
 */
export function middleware(request) {
  const { pathname, search, origin } = request.nextUrl;
  
  // 🚀 GURU SEO: Sestavení absolutní URL a příprava hlaviček pro layout.js
  const absoluteUrl = `${origin}${pathname}${search}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', absoluteUrl);

  // Pomocná funkce pro bezpečné vracení response s našimi novými hlavičkami
  const nextWithHeaders = () => NextResponse.next({
    request: { headers: requestHeaders },
  });

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
    return nextWithHeaders();
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
    // Pokud už je v EN větvi, propustíme dál s hlavičkami
    if (pathname.startsWith(`/en/${section}`)) {
      return nextWithHeaders();
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
  return nextWithHeaders();
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
