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

    const { data: components, error: fetchError } = await supabase.from('components').select('name, product_url');
    if (fetchError) throw fetchError;

    const results = [];

    for (const comp of components) {
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(comp.product_url)}`;
      const res = await fetch(scraperUrl);
      const html = await res.text();
      
      let price = null;

      // METODA 1: Meta Tagy (Nejspolehlivější pro Alzu u TOP produktů)
      const metaPatterns = [
        /property="product:price:amount"\s+content="([^"]+)"/i,
        /property="og:price:amount"\s+content="([^"]+)"/i,
        /itemprop="price"\s+content="([^"]+)"/i
      ];

      for (const pattern of metaPatterns) {
        const match = html.match(pattern);
        if (match) {
          const p = extractNumber(match[1]);
          if (p > 500) { price = p; break; }
        }
      }

      // METODA 2: JSON-LD (Záloha)
      if (!price) {
        const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match[1]);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              if (item["@type"] === "Product" && item.offers) {
                const p = extractNumber(item.offers.price || item.offers.lowPrice);
                if (p > 500) { price = p; break; }
              }
            }
          } catch (e) {}
          if (price) break;
        }
      }

      // METODA 3: Agresivní Regex na surová data
      if (!price) {
        const rawMatch = html.match(/"price"\s*:\s*(\d+)/i);
        if (rawMatch) price = parseInt(rawMatch[1]);
      }

      if (price && price > 500) {
        const { error: updateError } = await supabase
          .from('components')
          .update({ price: price, last_checked: new Date().toISOString() })
          .eq('product_url', comp.product_url);

        results.push({ name: comp.name, status: updateError ? 'DB ERROR' : 'ZAPSÁNO', price: price });
      } else {
        results.push({ name: comp.name, status: 'Cena stále nenalezena' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
