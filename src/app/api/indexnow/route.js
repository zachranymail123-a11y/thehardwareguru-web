import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW PROXY V1.0
 * Cesta: src/app/api/indexnow/route.js
 * 🛡️ FIX: Řeší chybu NetworkError (CORS). 
 * Prohlížeče (Chrome, Edge) blokují přímé POST požadavky z frontendu na cizí domény.
 * Tato routa běží na tvém serveru, kde CORS neplatí, a bezpečně předá seznam URL vyhledávačům.
 */

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Odeslání požadavku přímo na API IndexNow ze serveru Vercel
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      // Pokud Bing/Seznam odpoví 200 OK
      return NextResponse.json({ success: true });
    } else {
      // Pokud API vrátí chybu (např. 400 špatný klíč)
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        error: `IndexNow API Error: ${errorText}` 
      }, { status: response.status });
    }
  } catch (error) {
    // Zachycení technických chyb (výpadek sítě apod.)
    return NextResponse.json({ 
      success: false, 
      error: `Server Proxy Error: ${error.message}` 
    }, { status: 500 });
  }
}
