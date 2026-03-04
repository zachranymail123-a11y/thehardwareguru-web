export const dynamic = 'force-dynamic';
export const maxDuration = 300; // TÍMHLE VERCELU ŘÍKÁME: "DEJ TOMU ČAS AŽ 60 SEKUND, NEZABÍJEJ TO HNED!"

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
    const diagnostics = [];

    // ROZDĚLÍME TO DO DÁVEK PO 5 KS (Abychom nepřehltili ScraperAPI limit souběžných dotazů)
    const batchSize = 5;

    for (let i = 0; i < components.length; i += batchSize) {
      const batch = components.slice(i, i + batchSize);
      
      // PARALELNÍ ZPRACOVÁNÍ CELÉ DÁVKY NAJEDNOU
      const batchPromises = batch.map(async (comp) => {
        const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(comp.product_url)}&render=true`;
        let log = { name: comp.name, logs: [] };
        
        try {
          const res = await fetch(scraperUrl);
          log.httpStatus = res.status;
          const html = await res.text();
          log.htmlSnippet = html.substring(0, 300);
          
          let price = null;

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
              log.logs.push(`Meta Tag: ${p}`);
              if (p > 500) { price = p; break; }
            }
          }

          // 2. JSON-LD
          if (!price) {
            const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
            for (const match of jsonMatches) {
              try {
                const parsed = JSON.parse(match[1]);
                const items = Array.isArray(parsed) ? parsed : [parsed];
                for (const item of items) {
                  if (item["@type"] === "Product" && item.offers) {
                    const p = extractNumber(item.offers.price || item.offers.lowPrice);
                    log.logs.push(`JSON Product: ${p}`);
                    if (p > 500) { price = p; break; }
                  }
                }
              } catch (e) {}
              if (price) break;
            }
          }

          // 3. Brutální Regex
          if (!price) {
             const visibleMatch = html.match(/(?:class="[^"]*price[^"]*"[^>]*>|data-price=")([\d\s]+)(?:[,-Kč]*)?/i);
             if (visibleMatch) {
                 const p = extractNumber(visibleMatch[1]);
                 log.logs.push(`Regex: ${p}`);
                 if (p > 500) price = p;
             }
          }

          if (price && price > 500) {
            const { error: updateError } = await supabase
              .from('components')
              .update({ price: price, last_checked: new Date().toISOString() })
              .eq('product_url', comp.product_url);

            return { success: true, item: { name: comp.name, status: updateError ? 'DB ERROR' : 'ZAPSÁNO', price: price } };
          } else {
            return { success: false, item: { name: comp.name, status: 'Selhalo - viz diagnostika' }, log };
          }

        } catch (fetchErr) {
          log.error = fetchErr.message;
          return { success: false, item: { name: comp.name, status: 'Kritická chyba spojení' }, log };
        }
      });

      // POČKÁME NA DOKONČENÍ CELÉ 5KS DÁVKY A JDEME NA DALŠÍ
      const resolvedBatch = await Promise.all(batchPromises);
      
      resolvedBatch.forEach(res => {
        results.push(res.item);
        if (!res.success) diagnostics.push(res.log);
      });
    }

    return NextResponse.json({ success: true, processed: results, diagnostics: diagnostics });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
