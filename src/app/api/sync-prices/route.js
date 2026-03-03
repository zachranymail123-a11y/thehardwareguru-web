import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funkce pro vytažení čísla z textu (např. "25 490 Kč" -> 25490)
function extractNumber(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^\d]/g, "");
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}

async function fetchAlzaPrice(url) {
  try {
    const res = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "cs-CZ,cs;q=0.9"
      },
      cache: "no-store"
    });

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Pokus: JSON-LD (Nejspolehlivější)
    const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          // Hledáme objekt Product a jeho nabídku (offers)
          if (item["@type"] === "Product" && item.offers) {
            const price = extractNumber(item.offers.price || item.offers.lowPrice);
            if (price) return price;
          }
        }
      } catch (e) {}
    }

    // 2. Pokus: Meta tagy (Záloha)
    const metaMatch = html.match(/property="product:price:amount"\s+content="([^"]+)"/);
    if (metaMatch) {
      const price = extractNumber(metaMatch[1]);
      if (price) return price;
    }

    // 3. Pokus: Regulární výraz na cenu (Poslední záchrana)
    const genericMatch = html.match(/(\d{1,3}(?:\s\d{3})*)\s*(?:Kč|,-)/);
    if (genericMatch) {
      const price = extractNumber(genericMatch[1]);
      if (price) return price;
    }

    return null;
  } catch (err) {
    console.error(`Chyba fetchování pro ${url}:`, err);
    return null;
  }
}

export async function GET(req) {
  try {
    // Načteme všechny komponenty z DB
    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('id, name, product_url');

    if (fetchError) throw fetchError;

    const results = [];

    for (const comp of components) {
      const price = await fetchAlzaPrice(comp.product_url);
      
      if (price) {
        const { error: updateError } = await supabase
          .from('components')
          .update({ 
            price: price, 
            last_checked: new Date().toISOString() 
          })
          .eq('id', comp.id);

        results.push({ name: comp.name, status: updateError ? 'Error update' : 'OK', price });
      } else {
        results.push({ name: comp.name, status: 'Price not found' });
      }

      // Rate limit: 2 sekundy pauza mezi požadavky, ať nás Alza nezařízne
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
