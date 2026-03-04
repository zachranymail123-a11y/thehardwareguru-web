export const dynamic = 'force-dynamic';
export const maxDuration = 300; 

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) } }
);

export async function GET(req) {
  try {
    const apiKey = process.env.APIFY_API_TOKEN; 
    if (!apiKey) throw new Error("Chybí token!");

    const { data: components, error: fetchError } = await supabase.from('components').select('name, product_url');
    if (fetchError) throw fetchError;

    // AGRESIVNÍ ČIŠTĚNÍ: Odstraníme mezery a vyfiltrujeme jen Heureku
    const heurekaComps = components
      .map(c => ({ ...c, product_url: (c.product_url || "").trim() }))
      .filter(c => c.product_url.includes('heureka.cz'));

    // Pokud je to prázdné, hned končíme s hlášením, co v té DB reálně je
    if (heurekaComps.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Filtr nenašel žádné Heureka URL.",
        data_v_db: components.map(c => ({ name: c.name, url: c.product_url }))
      });
    }

    // Převedeme subdomény na www, aby to Apify scraper lépe žral
    const startUrls = heurekaComps.map(c => ({
      url: c.product_url.replace(/^(https?:\/\/)[^.]+\.heureka\.cz/, '$1www.heureka.cz')
    }));

    const apifyUrl = `https://api.apify.com/v2/acts/cashmere_verdict~heureka-product-scraper/run-sync-get-dataset-items?token=${apiKey}`;

    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: startUrls,
        maxItems: startUrls.length,
        useProxy: true
      })
    });

    const items = await apifyRes.json();
    
    // Diagnostika pro případ, že Apify vrátí chybu (jako tvůj poslední screen)
    if (items.error || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Apify vrátilo chybu", RAW_APIFY_DATA: items, sent_urls: startUrls });
    }

    const results = [];
    for (const comp of heurekaComps) {
      const compSlug = comp.product_url.split('?')[0].split('/').filter(Boolean).pop();
      const itemData = items.find(i => (i.url || "").includes(compSlug) || (i.productUrl || "").includes(compSlug));
      
      let price = null;
      if (itemData) {
        const rawPrice = itemData.priceMin || itemData.price;
        if (rawPrice) price = parseInt(String(rawPrice).replace(/[^\d]/g, ""));
      }

      if (price && price > 1000) {
        await supabase.from('components').update({ price: price, last_checked: new Date().toISOString() }).eq('product_url', comp.product_url);
        results.push({ name: comp.name, status: 'ZAPSÁNO', price: price });
      } else {
        results.push({ name: comp.name, status: price ? `Cena ${price} Kč ignorována` : 'Nenalezeno' });
      }
    }

    return NextResponse.json({ success: true, processed: results, RAW_APIFY_DATA: items });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
