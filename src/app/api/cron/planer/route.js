import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentYear = new Date().getFullYear();

  try {
    // 1. ZÍSKÁME ULTRA ČERSTVÉ TRENDY (Filtrováno na posledních 24 hodin)
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `latest hardware leaks news review benchmark ${currentYear} ${currentYear + 1}`, 
        tbs: "qdr:d", // <--- KLÍČ: Pouze výsledky za posledních 24 hodin!
        gl: "us",     // Hledáme v USA pro nejrychlejší úniky
        hl: "en",     // V angličtině
        num: 15 
      })
    });
    
    const searchData = await searchRes.json();
    const trends = JSON.stringify(searchData.organic || []).substring(0, 8000);

    // 2. NAČTEME STÁVAJÍCÍ PLÁN (Abychom se neopakovali)
    const { data: currentPlan } = await supabase.from('content_plan').select('title');
    const existingTitles = currentPlan?.map(p => p.title).join(', ') || 'žádné';

    // 3. AI ANALÝZA - Šéfredaktor, co hlídá datum
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor webu The Hardware Guru. Je 26. února 2026. 
          Tvůj úkol: Vyber 4 ŽHAVÉ novinky z posledních 24 hodin.
          
          STRATEGIE:
          - Ignoruj starý hardware (RTX 40, Ryzen 7000, Intel 14. gen). 
          - Hledej úniky (leaks) o příští generaci (RTX 60, Zen 6, Intel Nova Lake).
          - Pokud je tam čerstvá recenze (review) z dneška, ber ji.
          
          ZDE JSOU DATA Z GOOGLE (POSLEDNÍCH 24H): ${trends}
          UŽ MÁME (NEOPAKUJ): ${existingTitles}
          
          Vrať JSON: { "plan": [ { "title": "...", "type": "game/hardware", "release_date": "2026-02-26" } ] }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    // 4. ZÁPIS DO DB
    let addedCount = 0;
    for (const task of newTasks) {
      const { error } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: task.release_date, // Vždy dnešní datum pro Executora
        type: task.type,
        status: 'planned'
      });
      
      if (!error) addedCount++;
    }

    return NextResponse.json({ 
      status: 'SUCCESS', 
      added: addedCount, 
      message: `Do plánu přidáno ${addedCount} čerstvých novinek z posledních 24h.` 
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
