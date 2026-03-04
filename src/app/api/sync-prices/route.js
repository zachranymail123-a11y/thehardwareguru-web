export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel Pro - dáváme tomu 5 minut na dojetí

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SERVICE_ROLE_KEY zaručí, že zápis do DB projde vždycky
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const apiKey = process.env.APIFY_API_TOKEN; 
    if (!apiKey) throw new Error("Do prdele, chybí APIFY_API_TOKEN ve Vercelu!");

    // 1. Vytáhneme komponenty z DB
    const { data: components, error: fetchError } = await supabase
      .from('components')
      .select('name, product_url');
      
    if (fetchError) throw fetchError;

    // 2. Bereme JEN Heureka odkazy (Pojistka, kdyby tam zbyla nějaká Alza)
    const heurekaComps = components.filter(c => c.product_url && c.product_url.includes('heureka.cz'));

    if (heurekaComps.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "V databázi nejsou žádné Heureka odkazy! Zkontroluj SQL update." 
      });
    }

    // 3. Připravíme krmivo pro Apify
    const startUrls = heurekaComps.map(c => ({ url: c.product_url }));
    const apifyUrl = `https://api.apify.com/v2/acts/cashmere_verdict~heureka-product-scraper/run-sync-get-dataset-items?token=${apiKey}`;

    // 4. Odpalíme to na Apify (POST request s JSON payloadem)
    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: startUrls,
        includeShopOffers: false, // Chceme jen základní info, ne milion nabídek
        includeSpecifications: false
      })
    });

    if (!apifyRes.ok) {
      const errText = await apifyRes.text();
      throw new Error(`Apify selhalo: ${errText}`);
    }

    // 5. Apify nám vrátilo hotový dataset!
    const items = await apifyRes.json();
    const results = [];

    // 6. Propíšeme to do DB
    for (const comp of heurekaComps) {
      // Spárujeme výsledek podle URL
      const itemData = items.find(i => i.url === comp.product_url || i.productUrl === comp.product_url);
      
      let price = null;
      if (itemData) {
        // Z Heureky taháme nejnižší nebo hlavní cenu
        const rawPrice = itemData.price || itemData.priceMin || itemData.priceMax;
        if (rawPrice) {
          const cleaned = String(rawPrice).replace(/[^\d]/g, "");
          price = parseInt(cleaned);
        }
      }

      // Pojistka proti nesmyslům pod 500 Kč
      if (price && price > 500) {
        const { error: updateError } = await supabase
          .from('components')
          .update({ price: price, last_checked: new Date().toISOString() })
          .eq('product_url', comp.product_url);

        results.push({ name: comp.name, status: updateError ? 'DB ERROR' : 'ZAPSÁNO', price: price });
      } else {
        results.push({ name: comp.name, status: 'Cena na Heurece nenalezena nebo moc nízká' });
      }
    }

    return NextResponse.json({ success: true, processed: results });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
