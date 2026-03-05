import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Pokud uživatel už je na /en nebo /cs, nic neřešíme a pustíme ho dál
  if (pathname.startsWith('/en') || pathname.startsWith('/cs')) {
    return NextResponse.next();
  }

  // 2. GURU DETEKTOR: Koukneme se, co preferuje prohlížeč návštěvníka
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // Pokud je to někdo, kdo NEMÁ v prohlížeči češtinu nebo slovenštinu...
  const isNotCzech = !acceptLanguage.includes('cs') && !acceptLanguage.includes('sk');

  // 3. AUTOMATICKÉ PŘESMĚROVÁNÍ PRO CIZINCE
  if (pathname.startsWith('/slovnik') && isNotCzech) {
    // Američana/Němce/kohokoliv jiného pošleme na EN verzi
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  // 4. ČECHY A SLOVÁKY necháme na /slovnik, ale pod kapotou jim ukážeme /cs verzi
  if (pathname.startsWith('/slovnik')) {
    const url = request.nextUrl.clone();
    url.pathname = `/cs${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/slovnik/:path*', '/en/slovnik/:path*'],
};
