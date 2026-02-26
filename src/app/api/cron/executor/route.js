import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Tato řádka zajistí, že Next.js nebude skript prerederovat při buildu (řeší tvou chybu z logu)
export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. NAJDEME ÚKOL
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .limit(1);

  if (fetchError || !tasks || tasks.length === 0) {
    return NextResponse.json({ error: 'Zadny plan k publikaci.', details: fetchError });
  }

  const task = tasks[0];

  // 2. HLEDÁNÍ DAT
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: `${task.title} review scores official pc specs pros cons`, num: 10 })
  });
  const searchResults = await res.json();
  const rawContext = JSON.stringify(searchResults.organic || []);

  // 3. GENERUJEME ČLÁNEK
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Napiš ČESKOU recenzi na "${task.title}". 
        Musíš vrátit JSON. V instrukcích musí být slovo json.` // Oprava pro chybu 400
      },
      { 
        role: "user", 
        content: `Vytvoř článek ve formátu json na základě těchto dat: ${rawContext}. 
        Povinně v HTML: Tabulka hodnocení, Seznam ✅ PLUSŮ a ❌ MÍNUSŮ, Tabulka HW nároků a VERDIKT.` 
      }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalSlug = createSlug(article.title || task.title);

  // 4. ZÁPIS ČLÁNKU
  const { error: insertError } = await supabase.from('posts').insert({
    title: article.title || task.title,
    slug: finalSlug,
    content: article.content,
    created_at: new Date().toISOString()
  });

  if (insertError) return NextResponse.json({ error: 'Chyba zapisu', details: insertError });

  // 5. OZNAČÍME JAKO HOTOVÉ
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ status: 'SUCCESS', message: `Recenze '${task.title}' publikována.` });
}
