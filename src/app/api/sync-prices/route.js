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
    const diagnostics = []; // TADY BUDEME SBÍRAT DŮKAZY

    for (const comp of components) {
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(comp.product_url)}&render=true`;
      
      try {
        const res = await fetch(scraperUrl);
        const status = res.status;
        const html = await res.text();
        
        let price = null;
        
        // Deník pro případ, že to selže
        let log = { 
          name: comp.name, 
          httpStatus: status, 
          htmlSnippet: html.substring(0, 300), // Prvních 300 znaků z webu
          logs: [] 
        };

        // 1. Meta Tagy
        const metaPatterns = [
          /property="product:price:amount"\s+content="([^"]+)"/i,
          /property="og:price:amount"\s+content="([^"]+)"/i,
          /itemprop="price"\s+content="([^"]+)"/i
        ];
        
        for (const pattern of metaPatterns) {
          const match = html.match(pattern);
          if (match) {
            const p = extractNumber(match[1]);
            log.logs.push(`Meta Tag nalezen: ${match[1]} -> převedeno na ${p}`);
            if (p > 500) { price = p; break; }
          }
        }

        // 2. JSON-LD
        if (!price) {
          const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
          log.logs.push(`Nalezeno JSON-LD bloků: ${jsonMatches.length}`);
          
          for (const match of jsonMatches) {
            try {
              const parsed = JSON.parse(match[1]);
              const items = Array.isArray(parsed) ? parsed : [parsed];
              for (const item of items) {
                if (item["@type"] === "Product" && item.offers) {
                  const rawPrice = item.offers.price || item.offers.lowPrice;
                  const p = extractNumber(rawPrice);
                  log.logs.push(`JSON Product nalezen, surová cena: ${rawPrice} -> převedeno na ${p}`);
                  if (p > 500) { price = p; break; }
                }
              }
            } catch (e) {
              log.logs.push("Chyba při čtení JSON-LD");
            }
            if (price) break;
          }
        }

        if (price && price > 500) {
          const { error: updateError } = await supabase
            .from('components')
            .update({ price: price, last_checked: new Date().toISOString() })
            .eq('product_url', comp.product_url);

          results.push({ name: comp.name, status: updateError ? 'DB ERROR' : 'ZAPSÁNO', price: price });
        } else {
          results.push({ name: comp.name, status: 'Selhalo - viz diagnostika' });
          diagnostics.push(log); // Přidáme do logu jen ty zmrdy, co neprošly
        }

      } catch (fetchErr) {
        results.push({ name: comp.name, status: 'Kritická chyba spojení' });
        diagnostics.push({ name: comp.name, error: fetchErr.message });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Vypíšeme na obrazovku výsledky PLUS diagnostiku
    return NextResponse.json({ success: true, processed: results, diagnostics: diagnostics });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
