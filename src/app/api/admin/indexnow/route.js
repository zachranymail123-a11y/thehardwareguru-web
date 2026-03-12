import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW PROXY V1.1
 * Cesta: src/app/api/indexnow/route.js
 * 🛡️ FIX: Řeší chybu "NetworkError when attempting to fetch resource" (CORS). 
 * Prohlížeče blokují POST požadavky z frontendu na domény vyhledávačů.
 * Tato routa běží na tvém serveru, kde omezení prohlížeče neplatí.
 */

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validace klíče (bezpečnostní pojistka)
    if (!body.key || body.key !== "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e") {
        return NextResponse.json({ success: false, error: "Invalid IndexNow Key" }, { status: 401 });
    }

    // Odeslání požadavku přímo na globální API IndexNow ze serveru (Vercel)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify(body)
    });

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
