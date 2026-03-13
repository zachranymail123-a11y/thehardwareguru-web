import { NextResponse } from 'next/server';

/**
 * GURU SEZNAM STATS V1.5 (CURL DOCS FIX)
 * Cesta: src/app/api/seznam-stats/route.js
 * 🚀 CÍL: Přesná implementace podle oficiální Seznam Webmaster dokumentace.
 * 🛡️ FIX: API klíč se posílá jako URL parametr 'key', změněn base endpoint na '/wm-api/web/'.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  const domain = 'https://thehardwareguru.cz';

  // Obyčejné hlavičky, jak to ukazuje cURL (žádný Bearer token)
  const headers = {
    'accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  };

  try {
    // 1. Volání Seznam API pro "Počty a vzorky webových stránek"
    // Přesně podle dokumentace: /wm-api/web/documents?key=...&url=...
    const urlDocuments = `https://reporter.seznam.cz/wm-api/web/documents?key=${apiKey}&url=${encodeURIComponent(domain)}`;
    const res = await fetch(urlDocuments, {
      headers: headers,
      cache: 'no-store'
    });

    // 2. Volání pro Historii 
    const urlHistory = `https://reporter.seznam.cz/wm-api/web/documents-history?key=${apiKey}&url=${encodeURIComponent(domain)}`;
    const resHistory = await fetch(urlHistory, {
      headers: headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Neznámá chyba z body');
      return NextResponse.json({ 
        success: false, 
        error: `Seznam zamítl požadavek: HTTP ${res.status} | Odpověď: ${errorText}`,
        debug_url_used: urlDocuments.replace(apiKey, '[SKRYTY_KLIC]') // Pro debugování v Adminu
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
    const detailedError = error.cause?.message || error.message;
    console.error("SEZNAM STATS ERROR:", detailedError);
    return NextResponse.json({ success: false, error: detailedError });
  }
}
