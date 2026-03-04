export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function extractNumber(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^\d]/g, "");
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}

export async function GET(req) {
  try {
    const apiKey = process.env.SCRAPER_API_KEY;
    if (!apiKey) throw new Error("Chybí SCRAPER_API_KEY!");

    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('name, product_url');

    if (fetchError) throw fetchError;

    const results = [];

    for (const comp of components) {
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(comp.product_url)}`;
      
      const res = await fetch(scraperUrl);
      const html = await res.text();
      
      let price = null;

      // METODA A: JSON-LD Parser
      const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match[1]);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (item["@type"] === "Product" && item.offers) {
              const foundPrice = extractNumber(item.offers.price || item.offers.lowPrice);
              if (foundPrice && foundPrice > 1000) {
                price = foundPrice;
                break;
              }
            }
          }
        } catch (e) {}
        if (price) break;
      }

      // METODA B: Agresivní Regex (pokud JSON-LD selhalo)
      if (!price) {
        // Hledáme vzor "price": 12345 nebo "amount": 12345 v celém HTML
        const regexPrice = html.match(/"price"\s*:\s*(\d+)/i) || html.match(/"amount"\s*:\s*(\d+)/i);
        if (regexPrice) {
          const foundPrice = parseInt(regexPrice[1]);
          if (foundPrice > 1000) price = foundPrice;
        }
      }

      if (price) {
        // ZÁPIS DO DB PODLE product_url
        const { error: updateError } = await supabase
          .from('components')
          .update({ 
            price: price, 
            last_checked: new Date().toISOString() 
          })
          .eq('product_url', comp.product_url);

        if (updateError) {
          results.push({ name: comp.name, status: 'DB ERROR', error: updateError.message });
        } else {
          results.push({ name: comp.name, status: 'ZAPSÁNO DO DB', price: price });
        }
      } else {
        results.push({ name: comp.name, status: 'Cena nenalezena ani regexem' });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
