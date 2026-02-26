import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. DYNAMICKÉ DATUM (Tady se řeší ten březen, duben...)
  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  const fullDate = `${now.getDate()}. ${currentMonth} ${currentYear}`;

  try {
    // 2. CHYTRÝ VYHLEDÁVACÍ DOTAZ (Žádné natvrdo psané měsíce)
    const searchQuery = `latest hardware leaks OR gaming reviews releases ${currentMonth} ${currentYear} site:ign.com OR site:videocardz.com OR site:wccftech.com OR site:gamespot.com`;

    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: searchQuery, 
        tbs: "qdr:d", // <--- HLÍDÁ POSLEDNÍCH 24 HODIN
        gl: "us",
        hl: "en",
        num: 20 
      })
    });
    
    const searchData = await searchRes.json();
    const trends = JSON.stringify(searchData.organic || []).substring(0, 8000);

    // 3. NAČTEME STÁVAJÍCÍ PLÁN
    const { data: currentPlan } = await supabase.from('content_plan').select('title');
    const existingTitles = currentPlan?.map(p => p.title).join(', ') || 'žádné';

    // 4. AI ANALÝZA (Předáváme jí aktuální datum, aby věděla, co je DNES)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor webu The Hardware Guru. Dnes je ${fullDate}. 
          Tvým úkolem je vybrat 4 NEJŽHAVĚJŠÍ novinky z posledních 24 hodin.
          
          STRATEGIE:
          - 2x Hardware (leaks, benchmarks, nové CPU/GPU).
          - 2x Gaming (čerstvé recenze, oznámení, trailery).
          - Ignoruj staré věci, hledej jen to, co hýbe světem DNES.
          
          DATA Z GOOGLE: ${trends}
          UŽ MÁME: ${existingTitles}
          
          Vrať JSON: { "plan": [ { "title": "...", "type": "game/hardware", "release_date": "${now.toISOString().split('T')[0]}" } ] }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    // 5. ZÁPIS DO DB
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
      date: fullDate,
      message: `Plánovač úspěšně naplněn pro ${fullDate}.` 
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
