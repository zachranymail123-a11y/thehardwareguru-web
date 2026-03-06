import { NextResponse } from 'next/server';

/**
 * 🚀 GURU MASTER MIDDLEWARE 2.0
 * Tento engine teď kombinuje detekci jazyka prohlížeče s reálnou polohou IP adresy (Geo-IP).
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // 🌍 GEO-IP ENGINE: Vercel posílá kód země v této hlavičce
  const country = request.headers.get('x-vercel-ip-country') || 'CZ';

  // 🛡️ GURU SHIELD: Ignorujeme systémové soubory a statické assety
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // 🌍 PŘESNÁ DETEKCE: Je to Čech/Slovák? (Kontrola jazyka i IP adresy)
  const hasLocalLanguage = acceptLanguage.toLowerCase().includes('cs') || acceptLanguage.toLowerCase().includes('sk');
  const hasLocalIP = ['CZ', 'SK'].includes(country.toUpperCase());
  
  // Guru definice: Pokud nemá místní IP ani místní jazyk, je to cizinec.
  // Pokud jsi na VPN v USA, 'hasLocalIP' bude false a pošle tě to do EN.
  const isForeigner = !hasLocalIP && !hasLocalLanguage;

  // SEZNAM SEKCI POD DOHLEDEM GURUHO (Přidány mikrorecenze)
  const sections = ['slovnik', 'clanky', 'tipy', 'tweaky', 'rady', 'mikrorecenze'];

  // 1. AUTO-REDIRECT PRO CIZINCE NA ROOTU
  if (pathname === '/' && isForeigner) {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2. GURU ROUTING ENGINE
  for (const section of sections) {
    // Pokud už je v EN větvi, necháme ho v klidu
    if (pathname.startsWith(`/en/${section}`)) {
      return NextResponse.next();
    }

    // Pokud cizinec (VPN/Zahraničí) vleze na českou cestu, hodíme ho na /en verzi
    if (pathname.startsWith(`/${section}`) && isForeigner) {
      const targetPath = pathname.replace(`/${section}`, `/en/${section}`);
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // GURU KOREKCE: Pokud někdo napíše nesmysl /sekce/en, opravíme na /en/sekce
    if (pathname.endsWith(`/${section}/en`)) {
      return NextResponse.redirect(new URL(`/en/${section}`, request.url));
    }
  }

  // 🏁 GURU FINAL: Pro lokální uživatele běží web nativně
  return NextResponse.next();
}

export const config = {
  // GURU MATCHING: Musíme přidat mikrorecenze do matcheru!
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
