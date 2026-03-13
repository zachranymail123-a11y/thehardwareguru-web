import { NextResponse } from 'next/server';

/**
 * GURU SEZNAM STATS V1.2 (WAF BYPASS EDITION)
 * Cesta: src/app/api/seznam-stats/route.js
 * 🚀 CÍL: Získání informací ze Seznamu s maskováním proti zablokování.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  const domain = 'https://thehardwareguru.cz';

  // 🚀 GURU FIX: Globální hlavičky vč. maskování za Chrome prohlížeč
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  };

  try {
    // 1. Volání Seznam API pro "Počty a vzorky webových stránek"
    const res = await fetch(`https://webmaster.seznam.cz/api/web/documents?url=${encodeURIComponent(domain)}`, {
      headers: headers,
      cache: 'no-store'
    });

    // 2. Volání pro Historii 
    const resHistory = await fetch(`https://webmaster.seznam.cz/api/web/documents-history?url=${encodeURIComponent(domain)}`, {
      headers: headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Neznámá chyba z body');
      return NextResponse.json({ 
        success: false, 
        error: `Seznam zamítl požadavek: HTTP ${res.status} | Odpověď: ${errorText}` 
      });
    }

    const data = await res.json();
    const historyData = resHistory.ok ? await resHistory.json() : null;

    return NextResponse.json({ 
        success: true, 
        data: data,
        history: historyData
    });

  } catch (error) {
    // 🚀 GURU FIX: Získáme detailní důvod síťového selhání (např. Connection reset)
    const detailedError = error.cause?.message || error.message;
    console.error("SEZNAM STATS ERROR:", detailedError);
    return NextResponse.json({ success: false, error: detailedError });
  }
}
