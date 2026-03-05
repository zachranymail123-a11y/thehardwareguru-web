import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // GURU FIX: Pokud uživatel vleze na /en/slovnik, 
  // musíme mu podstrčit cestu, kterou pochopí tvoje složka [lang]
  if (pathname === '/en/slovnik' || pathname.startsWith('/en/slovnik/')) {
    return NextResponse.next();
  }

  // Pokud vleze na klasické /slovnik, podstrčíme mu /cs/slovnik (české SEO zůstane)
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
