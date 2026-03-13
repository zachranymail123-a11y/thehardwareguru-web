import { NextResponse } from 'next/server';

/**
 * GURU SEZNAM STATS V1.0
 * Cesta: src/app/api/seznam-stats/route.js
 * 🚀 CÍL: Získání informací o počtu zaindexovaných stránek na Seznamu.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  try {
    // Volání Seznam API pro "Počty a vzorky webových stránek" (z tvého screenshotu)
    const res = await fetch('https://webmaster.seznam.cz/api/web/documents', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    // Pro jistotu stáhneme i historii
    const resHistory = await fetch('https://webmaster.seznam.cz/api/web/documents-history', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = res.ok ? await res.json() : { error: await res.text() };
    const historyData = resHistory.ok ? await resHistory.json() : null;

    return NextResponse.json({ 
        success: res.ok, 
        data: data,
        history: historyData
    });

  } catch (error) {
    console.error("SEZNAM STATS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
