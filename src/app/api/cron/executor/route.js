import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. NAJDEME ÚKOL
  const { data: allPlanned, error: dbError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .limit(1);

  if (dbError || !allPlanned || allPlanned.length === 0) {
    return NextResponse.json({ error: 'Zadny plan k publikaci.' });
  }

  const task = allPlanned[0];

  // 2. ANTI-DUPLICITA (Kontrola jestli už post neexistuje)
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .ilike('title', `%${task.title}%`)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
    return NextResponse.json({ message: `Clanok '${task.title}' uz je na webe, preskakujem.` });
  }

  // 3. HLEDÁNÍ DAT
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: `${task.title} review scores official pc specs requirements pros cons`, num: 10 })
  });
  const searchResults = await res.json();
  const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 10000);

  // 4. GENERUJEME ČLÁNEK
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Pis CESKY. Musis vratit JSON objekt: { "title": "...", "content": "HTML..." }. V instrukci je slovo json.`
      },
      { 
        role: "user", 
        content: `Vytvor recenzi na "${task.title}" z techto dat: ${rawContext}. Povinne HTML: tabulka hodnoceni, plusy/minusy, HW naroky, verdikt.` 
      }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalTitle = article.title || task.title;
  const finalContent = article.content || "Chyba obsahu.";
  const finalSlug = createSlug(finalTitle);

  // 5. ZÁPIS ČLÁNKU
  const { error: insertError } = await supabase.from('posts').insert({
    title: finalTitle,
    slug: finalSlug,
    content: finalContent,
    created_at: new Date().toISOString()
  });

  if (insertError) return NextResponse.json({ error: 'Chyba zapisu', details: insertError });

  // 6. OZNAČÍME JAKO HOTOVÉ
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ status: 'SUCCESS', message: `Recenze '${finalTitle}' publikovana.` });
}
