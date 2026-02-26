import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. NAJDEME ÚKOL - Zkusíme to nejjednodušší volání bez filtrů, co by mohly padat
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .limit(1);

  if (fetchError || !tasks || tasks.length === 0) {
    return NextResponse.json({ 
      error: 'V DB vidím prázdno, i když tam data jsou. Zkusíme jiný filtr.', 
      db_error: fetchError,
      found_data: tasks 
    });
  }

  const task = tasks[0];

  // 2. HLEDÁNÍ DAT NA GOOGLE
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: `${task.title} review scores official pc specs requirements pros cons`, num: 10 })
  });
  const searchResults = await res.json();
  const rawContext = JSON.stringify(searchResults.organic || []);

  // 3. GENERUJEME ČLÁNEK (PROFI RECENZE ČESKY)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Napiš špičkovou ČESKOU recenzi na "${task.title}". 
        Povinně: HTML Tabulka světových hodnocení, Seznam ✅ PLUSŮ a ❌ MÍNUSŮ, Tabulka HW nároků a tvůj ostrý VERDIKT.`
      },
      { role: "user", content: `Data: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalSlug = createSlug(article.title);

  // 4. ZÁPIS DO POSTS
  const { error: insertError } = await supabase.from('posts').insert({
    title: article.title,
    slug: finalSlug,
    content: article.content,
    created_at: new Date().toISOString(),
    video_id: null
  });

  if (insertError) return NextResponse.json({ error: 'Chyba zápisu článku', details: insertError });

  // 5. OZNAČÍME JAKO PUBLIKOVÁNO
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ 
    status: 'SUCCESS',
    message: `Recenze '${article.title}' je venku!`,
    slug: finalSlug
  });
}
