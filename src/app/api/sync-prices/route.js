export const dynamic = 'force-dynamic';
export const maxDuration = 300; 

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// TADY JE TA OPRAVA! Natvrdo zakazujeme Next.js cachovat databázi.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      fetch: (url, options) => {
        return fetch(url, { ...options, cache: 'no-store' }); // ZABITÍ CACHE
      }
    }
  }
);

export async function GET(req) {
  try {
    const apiKey = process.env.APIFY_API_TOKEN; 
    if (!apiKey) throw new Error("Chybí APIFY_API_TOKEN ve Vercelu!");

    // Díky "no-store" tohle teď už STOPROCENTNĚ stáhne ty tvoje nové Heureka odkazy
    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('name, product_url');
      
    if (fetchError) throw fetchError;

    const heurekaComps = components.filter(c => c.product_url && c.product_url.includes('heureka.cz'));

    if (heurekaComps.length === 0) {
      // Pokud by to i tak nenašlo, vypíše to přesně to, co v té DB reálně vidí!
      return NextResponse.json({ 
        success: false, 
        message: "V databázi pořád nejsou Heureka odkazy. Vercel čte tohle:",
        vidim_odkazy: components.map(c => c.product_url)
      });
    }

    const startUrls = heurekaComps.map(c => ({ url: c.product_url }));
    const apifyUrl = `https://api.apify.com/v2/acts/cashmere_verdict~heureka-product-scraper/run-sync-get-dataset-items?token=${apiKey}`;

    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: startUrls,
        includeShopOffers: false,
        includeSpecifications: false
      })
    });

    if (!apifyRes.ok) throw new Error(`Apify error: ${await apifyRes.text()}`);

    const items = await apifyRes.json();
    const results = [];

    for (const comp of heurekaComps) {
      const compSlug = comp.product_url.split('?')[0].split('/').filter(Boolean).pop();
      
      const itemData = items.find(i => 
        (i.url && i.url.includes(compSlug)) || 
        (i.productUrl && i.productUrl.includes(compSlug))
      );
      
      let price = null;
      if (itemData) {
        // Prioritně bereme nejnižší cenu
        const rawPrice = itemData.priceMin || itemData.price;
        if (rawPrice) {
          price = parseInt(String(rawPrice).replace(/[^\d]/g, ""));
        }
      }

      // Brutální pojistka: Nic nestojí pod 1000 Kč (vyřazení kabelů za 499 Kč)
      if (price && price > 1000) {
        const { error: updateError } = await supabase
          .from('components')
          .update({ price: price, last_checked: new Date().toISOString() })
          .eq('product_url', comp.product_url);

        results.push({ name: comp.name, status: updateError ? 'DB ERROR' : 'ZAPSÁNO', price: price });
      } else {
        results.push({ 
          name: comp.name, 
          status: price ? `Ignorováno (nesmyslná cena ${price} Kč)` : 'Nenalezeno' 
        });
      }
    }

    // Na konci nám to vyblije ty surová data, abych viděl případný nesmysly u karet!
    return NextResponse.json({ success: true, processed: results, RAW_APIFY_DATA: items });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
