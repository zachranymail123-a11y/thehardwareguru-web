import { NextResponse } from 'next/server';

/**
 * GURU SEZNAM STATS V1.1 (DEBUG EDITION)
 * Cesta: src/app/api/seznam-stats/route.js
 * 🚀 CÍL: Získání informací s přesným debugováním chyb od Seznamu.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  // Seznam Webmaster API většinou vyžaduje specifikovat, pro jaký web data chceme
  const domain = 'https://thehardwareguru.cz';

  try {
    const res = await fetch(`https://webmaster.seznam.cz/api/web/documents?url=${encodeURIComponent(domain)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Key': apiKey // Přidáno pro jistotu, některé CZ API to preferují
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ 
        success: false, 
        error: `HTTP ${res.status} | Odpověď Seznamu: ${errorText}` 
      });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data: data });

  } catch (error) {
    console.error("SEZNAM STATS ERROR:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
