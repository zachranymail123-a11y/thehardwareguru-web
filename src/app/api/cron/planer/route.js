import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function searchGoogle(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 20, tbs: 'qdr:w' }) // Zvedl jsem num na 20 výsledků
  });
  return res.json();
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. VYSAVAČ - Agresivní dotazy na seznamy
  const queries = [
    "pc games release calendar february 2026 list", // Konkrétní měsíc
    "upcoming game releases next 7 days list",      // Nejbližší týden
    "hardware rumors nvidia amd intel leaks this week", // HW Leaky
    "steam upcoming releases popular list"          // Co je trendy na Steamu
  ];

  let rawData = "";

  // Paralelní sosání dat
  const results = await Promise.all(queries.map(q => searchGoogle(q)));
  
  results.forEach((r, index) => {
    rawData += `\n--- SOURCE ${index + 1} (${queries[index]}) ---\n`;
    if (r.organic) {
      r.organic.forEach(item => {
        // Bereme i datumy, pokud tam jsou
        rawData += `Title: ${item.title}\nSnippet: ${item.snippet}\nDate info: ${item.date || 'N/A'}\n\n`;
      });
    }
  });

  // 2. TŘÍDIČKA - Mírnější pravidla
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi šéfredaktor The Hardware Guru. Tvým úkolem je naplnit redakční plán na tento týden.
        
        Zahrň VŠECHNO, o čem se mluví:
        1. Velké hry (AAA).
        2. Zajímavé Indie hry a AA tituly (neignoruj menší hry!).
        3. Hardwarové novinky, leaky a spekulace (Nvidia, AMD, Intel).
        4. Důležité patche nebo DLC do velkých her.

        Pravidla:
        - Datum vydání odhadni z kontextu (např. "comes out this Friday").
        - Pokud datum chybí, dej zítřejší datum.
        - Nebuď přehnaně kritický. Pokud to má název a datum, ber to.
        
        Vrať JSON:
        {
          "items": [
            {
              "title": "Název",
              "release_date": "YYYY-MM-DD",
              "type": "game" | "hardware",
              "confidence": "high" | "medium"
            }
          ]
        }`
      },
      { role: "user", content: rawData }
    ],
    response_format: { type: "json_object" }
  });

  const plan = JSON.parse(completion.choices[0].message.content);

  // 3. ULOŽENÍ (Bereme i Medium confidence)
  let savedCount = 0;
  if (plan.items && plan.items.length > 0) {
    for (const item of plan.items) {
      // Ukládáme i 'medium', nejen 'high', abychom měli víc materiálu
      if (item.confidence === 'high' || item.confidence === 'medium') {
        
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
                status: 'planned'
            });
            savedCount++;
        }
      }
    }
  }

  return NextResponse.json({ 
    message: 'Planer V2 dokončen', 
    found_items_total: plan.items?.length || 0,
    saved_new_items: savedCount,
    items: plan.items 
  });
}
