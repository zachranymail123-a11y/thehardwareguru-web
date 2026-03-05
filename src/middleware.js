import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Pokud už URL začíná /en/ nebo /cs/, nic nedělej a pusť to dál
  if (pathname.startsWith('/en/') || pathname.startsWith('/cs/')) {
    return NextResponse.next();
  }

  // Pokud někdo jde na /en/slovnik (bez lomítka na konci), pusť ho dál
  if (pathname === '/en/slovnik' || pathname === '/cs/slovnik') {
    return NextResponse.next();
  }

  // GURU SEO TRIK: 
  // Pokud někdo jde na čisté /slovnik, pod kapotou mu podstrčíme /cs/ verzi
  if (pathname.startsWith('/slovnik')) {
    const url = request.nextUrl.clone();
    url.pathname = `/cs${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/slovnik/:path*', '/en/slovnik/:path*', '/cs/slovnik/:path*'],
};
