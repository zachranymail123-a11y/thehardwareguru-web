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
    if (!apiKey) throw new Error("Chybí SCRAPER_API_KEY ve Vercelu!");

    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('id, name, product_url');

    if (fetchError) throw fetchError;

    const results = [];

    for (const comp of components) {
      // PROŽENEME TO PŘES SCRAPERAPI, ABY NÁS ALZA NEBLOKLA
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(comp.product_url)}`;
      
      const res = await fetch(scraperUrl);
      const html = await res.text();
      
      let price = null;

      // 1. JSON-LD Parser
      const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match[1]);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (item["@type"] === "Product" && item.offers) {
              price = extractNumber(item.offers.price || item.offers.lowPrice);
              if (price) break;
            }
          }
        } catch (e) {}
        if (price) break;
      }

      // 2. Fallback - Regex na cenu v HTML
      if (!price) {
        const genericMatch = html.match(/(\d{1,3}(?:\s\d{3})*)\s*(?:Kč|,-)/);
        if (genericMatch) price = extractNumber(genericMatch[1]);
      }

      if (price) {
        await supabase
          .from('components')
          .update({ price: price, last_checked: new Date().toISOString() })
          .eq('id', comp.id);

        results.push({ name: comp.name, status: 'OK', price });
      } else {
        results.push({ name: comp.name, status: 'Price not found' });
      }

      // Se ScraperAPI můžeme jet rychleji, nepotřebujeme tak dlouhé pauzy
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
