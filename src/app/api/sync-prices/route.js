export const dynamic = 'force-dynamic';
export const maxDuration = 300; 

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const apiKey = process.env.APIFY_API_TOKEN; 
    if (!apiKey) throw new Error("Chybí token!");

    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('name, product_url');
      
    if (fetchError) throw fetchError;

    // FILTR + VYČIŠTĚNÍ URL (Odstraníme subdomény, pokud dělají bordel)
    const heurekaComps = components.filter(c => c.product_url && c.product_url.includes('heureka.cz'));

    const startUrls = heurekaComps.map(c => {
      // Převedeme subdomény (procesory.heureka.cz) na hlavní (www.heureka.cz), pokud je to potřeba
      let cleanUrl = c.product_url.replace(/^(https?:\/\/)[^.]+\.heureka\.cz/, '$1www.heureka.cz');
      return { url: cleanUrl };
    });

    const apifyUrl = `https://api.apify.com/v2/acts/cashmere_verdict~heureka-product-scraper/run-sync-get-dataset-items?token=${apiKey}`;

    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: startUrls,
        // PŘIDÁNO: Explicitně řekneme robotu, ať se nesnaží o hloubkový crawling
        maxItems: startUrls.length,
        useProxy: true
      })
    });

    const items = await apifyRes.json();
    const results = [];

    // Pokud je items prázdné, vypíšeme, co jsme tam reálně posílali za URL
    if (items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Apify vrátilo prázdná data.",
        sent_urls: startUrls 
      });
    }

    for (const comp of heurekaComps) {
      const compSlug = comp.product_url.split('?')[0].split('/').filter(Boolean).pop();
      
      const itemData = items.find(i => 
        (i.url && i.url.includes(compSlug)) || (i.productUrl && i.productUrl.includes(compSlug))
      );
      
      let price = null;
      if (itemData) {
        const rawPrice = itemData.priceMin || itemData.price;
        if (rawPrice) price = parseInt(String(rawPrice).replace(/[^\d]/g, ""));
      }

      if (price && price > 1000) {
        await supabase.from('components').update({ price: price }).eq('product_url', comp.product_url);
        results.push({ name: comp.name, status: 'ZAPSÁNO', price: price });
      } else {
        results.push({ name: comp.name, status: 'Nenalezeno' });
      }
    }

    return NextResponse.json({ success: true, processed: results, RAW_APIFY_DATA: items });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
