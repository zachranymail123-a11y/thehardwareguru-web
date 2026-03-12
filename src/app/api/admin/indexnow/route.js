import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW PROXY V1.2
 * Cesta: src/app/api/indexnow/route.js
 * 🛡️ FIX: Přidán AbortController pro Timeout dle instrukcí ChatGPT.
 * Zabraňuje případnému "zamrznutí" funkce, pokud by IndexNow API neodpovídalo.
 */

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validace klíče (bezpečnostní pojistka)
    if (!body.key || body.key !== "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e") {
        return NextResponse.json({ success: false, error: "Invalid IndexNow Key" }, { status: 401 });
    }

    // 🚀 CHATGPT FIX: Přidán timeout 5000ms proti zamrznutí routy
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Odeslání požadavku přímo na globální API IndexNow ze serveru (Vercel)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      // Bing / Seznam potvrdil přijetí (Status 200/202)
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        error: `IndexNow API Error: ${errorText}` 
      }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: `Server Proxy Error: ${error.message}` 
    }, { status: 500 });
  }
}
