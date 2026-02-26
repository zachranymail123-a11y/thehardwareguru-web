import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Nastavení (Environment variables musíš mít v .env)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Funkce pro hledání přes Serper
async function searchGoogle(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:w' }) // qdr:w = results from last week (čerstvé info)
  });
  return res.json();
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. FÁZE: TŘI NEZÁVISLÉ ZDROJE (The Triple Check)
  // Hledáme specificky kalendáře a leaky
  const queries = [
    "major pc game releases this week metacritic ign", // Mainstream + Data
    "upcoming hardware launch dates leaks rumors videocardz", // HW Leaky
    "game release calendar next 7 days eurogamer" // Ověření data
  ];

  let rawData = "";

  // Spustíme hledání paralelně pro rychlost
  const results = await Promise.all(queries.map(q => searchGoogle(q)));
  
  // Slijeme výsledky do jednoho textu pro AI
  results.forEach((r, index) => {
    rawData += `\n--- SOURCE ${index + 1} (${queries[index]}) ---\n`;
    if (r.organic) {
      r.organic.forEach(item => {
        rawData += `Title: ${item.title}\nSnippet: ${item.snippet}\nDate: ${item.date || 'N/A'}\n\n`;
      });
    }
  });

  // 2. FÁZE: AI ANALÝZA A KŘÍŽOVÁ KONTROLA
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi šéfredaktor herního webu The Hardware Guru. Tvým úkolem je naplánovat obsah na tento týden.
        
        Analyzuj poskytnutá data z vyhledávání (3 různé zdroje).
        Hledej POUZE významné hry (AAA nebo očekávané indie) a Hardware, které vychází v nejbližších 7 dnech nebo právě vyšly.
        
        PRAVIDLA PRO VÝBĚR:
        1. Ignoruj DLC, malé patche a mobilní hry.
        2. Pokud se datum vydání shoduje alespoň ve 2 zdrojích, označ to jako "verified".
        3. Datum musí být ve formátu YYYY-MM-DD. Pokud nevíš přesný den, odhadni nejbližší pravděpodobný nebo dej zítřejší.
        
        Vrať JSON objekt s polem "items":
        {
          "items": [
            {
              "title": "Název hry/HW",
              "release_date": "2026-02-28",
              "type": "game" (nebo "hardware"),
              "confidence": "high" (pokud je to ve více zdrojích)
            }
          ]
        }`
      },
      { role: "user", content: rawData }
    ],
    response_format: { type: "json_object" }
  });

  const plan = JSON.parse(completion.choices[0].message.content);

  // 3. FÁZE: ULOŽENÍ DO DATABÁZE (Upsert)
  if (plan.items && plan.items.length > 0) {
    for (const item of plan.items) {
      // Vložíme jen ty s vysokou důvěrou
      if (item.confidence === 'high') {
        // Zkontrolujeme duplicitu podle názvu, abychom to tam necpali 2x
        const { data: existing } = await supabase
            .from('content_plan')
            .select('id')
            .eq('title', item.title)
            .single();

        if (!existing) {
            await supabase.from('content_plan').insert({
                title: item.title,
                release_date: item.release_date,
                type: item.type,
                status: 'planned' // Zatím jen naplánováno
            });
        }
      }
    }
  }

  return NextResponse.json({ 
    message: 'Planer dokončen', 
    found_items: plan.items?.length || 0, 
    items: plan.items 
  });
}
