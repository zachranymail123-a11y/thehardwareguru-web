import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // GURU SEO TRIK: 
  // Pokud někdo vleze na klasické české "/slovnik", neviditelně to proženeme přes jazykovou složku "/cs".
  // URL adresa v prohlížeči zůstane čistá (thehardwareguru.cz/slovnik) = nepřijdeme o české SEO!
  if (pathname.startsWith('/slovnik')) {
    return NextResponse.rewrite(new URL(`/cs${pathname}`, request.url));
  }

  // /en/slovnik to pustí normálně dál
  return NextResponse.next();
}

// Spustí se to jen pro slovník, ať nerozbijeme zbytek webu
export const config = {
  matcher: ['/slovnik/:path*', '/en/slovnik/:path*'],
};
