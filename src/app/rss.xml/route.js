import { NextResponse } from 'next/server';

export async function GET() {
  const rssUrl = 'https://www.thehardwareguru.cz/api/rss';

  const res = await fetch(rssUrl, { cache: 'no-store' });
  const rss = await res.text();

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
