import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function searchGoogle(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 20, tbs: 'qdr:w' })
  });
  return res.json();
}

export async function GET() {
  // DŮLEŽITÉ: Používáme SERVICE_ROLE_KEY, který obchází RLS (Row Level Security)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const queries = [
    "pc games release calendar february 2026 list",
    "upcoming game releases next 7 days list",
    "hardware rumors nvidia amd intel leaks this week",
    "steam upcoming releases popular list" 
  ];

  let rawData = "";
  const results = await Promise.all(queries.map(q => searchGoogle(q)));
  
  results.forEach((r, index) => {
    rawData += `\n--- SOURCE ${index + 1} ---\n`;
    if (r.organic) {
      r.organic.forEach(item => {
        rawData += `Title: ${item.title}\nSnippet: ${item.snippet}\nDate: ${item.date || 'N/A'}\n\n`;
      });
    }
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi šéfredaktor The Hardware Guru. Naplň redakční plán.
        Vrať JSON: { "items": [{ "title": "Název", "release_date": "YYYY-MM-DD", "type": "game" | "hardware", "confidence": "high" | "medium" }] }`
      },
      { role: "user", content: rawData }
    ],
    response_format: { type: "json_object" }
  });

  const plan = JSON.parse(completion.choices[0].message.content);

  let savedCount = 0;
  let errors = []; // Tady budeme chytat chyby

  if (plan.items && plan.items.length > 0) {
    for (const item of plan.items) {
      if (item.confidence === 'high' || item.confidence === 'medium') {
        
        // 1. Kontrola existence
        const { data: existing, error: selectError } = await supabase
            .from('content_plan')
            .select('id')
            .eq('title', item.title)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // Ignorujeme chybu "nenalezeno"
             errors.push({ action: 'SELECT', title: item.title, msg: selectError.message });
        }

        if (!existing) {
            // 2. Pokus o zápis
            const { error: insertError } = await supabase.from('content_plan').insert({
                title: item.title,
                release_date: item.release_date,
                type: item.type,
                status: 'planned'
            });

            if (insertError) {
                // TADY CHYTÍME, PROČ SE TO NEZAPSALO
                errors.push({ action: 'INSERT', title: item.title, msg: insertError.message, details: insertError });
            } else {
                savedCount++;
            }
        }
      }
    }
  }

  return NextResponse.json({ 
    message: 'Planer DEBUG dokončen', 
    saved_new_items: savedCount,
    errors: errors, // Tohle nám řekne pravdu
    items: plan.items 
  });
}
