import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. ZÍSKÁME AKTUÁLNÍ TRENDY Z GOOGLE (Únor 2026)
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: 'latest gaming and hardware releases February 2026 reviews news', num: 10 })
    });
    const searchData = await searchRes.json();
    const trends = JSON.stringify(searchData.organic);

    // 2. NAČTEME STÁVAJÍCÍ PLÁN (Abychom se neopakovali)
    const { data: currentPlan } = await supabase.from('content_plan').select('title');
    const existingTitles = currentPlan?.map(p => p.title).join(', ') || 'žádné';

    // 3. AI ANALÝZA A TVORBA STRATEGICKÉHO PLÁNU
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor webu The Hardware Guru. Je 26. února 2026.
          Tvým úkolem je vytvořit plán 4 NOVÝCH článků.
          
          STRATEGIE OBSAHU:
          - 2x Recenze velké hry (co právě vyšlo nebo vychází).
          - 2x Hardware novinka (nové GPU, CPU, testy komponent).
          
          ZDE JSOU AKTUÁLNÍ TRENDY Z GOOGLE: ${trends}
          TYTO ČLÁNKY UŽ V PLÁNU MÁŠ (NEOPAKUJ JE): ${existingTitles}
          
          Vrať VŽDY JSON formát: 
          { "plan": [ { "title": "...", "type": "game/hardware", "release_date": "2026-02-26" } ] }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    // 4. CHYTRÝ ZÁPIS DO DB (S ignorováním duplicit)
    let addedCount = 0;
    for (const task of newTasks) {
      const { error } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: task.release_date,
        type: task.type,
        status: 'planned'
      });
      
      if (!error) addedCount++;
    }

    return NextResponse.json({ 
      status: 'SUCCESS', 
      added: addedCount, 
      message: `Do plánu přidáno ${addedCount} nových unikátních článků.` 
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
