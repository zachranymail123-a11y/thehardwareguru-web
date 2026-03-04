export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel Pro limit 5 minut

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  try {
    const apiKey = process.env.APIFY_API_TOKEN; // TADY SI TO BERE TEN TVŮJ NOVÝ KLÍČ
    if (!apiKey) throw new Error("Chybí APIFY_API_TOKEN ve Vercelu!");

    // 1. Vytáhneme komponenty z DB
    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('name, product_url');
      
    if (fetchError) throw fetchError;

    // 2. Ochrana: Vyfiltrujeme jen ty, co už mají Heureka link
    // (Ať Apify nezkouší scrapovat Alza linky, to by spadlo)
    const heurekaComps = components.filter(c => c.product_url && c.product_url.includes('heureka.cz'));

    if (heurekaComps.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "V databázi nejsou žádné Heureka odkazy! Musíš nejdřív přepsat Alza linky na Heureku." 
      });
    }

    // 3. Připravíme data pro Apify
    const startUrls = heurekaComps.map(c => ({ url: c.product_url }));
    const apifyUrl = `https://api.apify.com/v2/acts/cashmere_verdict~heureka-product-scraper/run-sync-get-dataset-items?token=${apiKey}`;

    // 4. Odpalíme to na Apify
    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: startUrls,
        maxItems: startUrls.length
      })
    });

    if (!apifyRes.ok) {
      throw new Error(`Apify selhalo: ${await apifyRes.text()}`);
    }

    // 5. Apify nám vrátí hotová data
    const items = await apifyRes.json();
    const results = [];

    // 6. Propíšeme to do DB
    for (const comp of heurekaComps) {
      // Spárujeme výsledek podle URL
      const itemData = items.find(i => i.url === comp.product_url || i.productUrl === comp.product_url);
      
      let price = null;
      if (itemData) {
        // Heureka scrapery vrací cenu většinou jako price, priceMin nebo priceMax
        const rawPrice = itemData.price || itemData.priceMin || itemData.priceMax;
        if (rawPrice) {
          const cleaned = String(rawPrice).replace(/[^\d]/g, "");
          price = parseInt(cleaned);
        }
      }

      if (price && price > 500) {
        const { error: updateError } = await supabase
          .from('components')
          .update({ price: price, last_checked: new Date().toISOString() })
          .eq('product_url', comp.product_url);

        results.push({ name: comp.name, status: updateError ? 'DB ERROR' : 'OK - ZAPSÁNO', price: price });
      } else {
        results.push({ name: comp.name, status: 'Cena na Heurece nenalezena' });
      }
    }

    return NextResponse.json({ success: true, processed: results });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
