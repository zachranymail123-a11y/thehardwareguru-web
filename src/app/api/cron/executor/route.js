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
    body: JSON.stringify({ q: `${task.title} review scores official pc specs requirements pros cons`, num: 10 })
  });
  const searchResults = await res.json();
  const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 10000);

  // 3. GENERUJEME ČLÁNEK
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru, český expert. Piš VŽDY ČESKY. 
        Musíš vrátit JSON objekt přesně v tomto formátu: 
        { 
          "title": "Název článku", 
          "content": "HTML obsah (tabulky, plusy/mínusy, verdikt)" 
        }
        V instrukcích je formát json.`
      },
      { 
        role: "user", 
        content: `Vytvoř profesionální českou recenzi na "${task.title}" na základě těchto dat: ${rawContext}. 
        Obsah musí být HTML a obsahovat: 
        1. Tabulku světových hodnocení (Web vs Známka).
        2. Seznam ✅ PLUSŮ a ❌ MÍNUSŮ.
        3. Tabulku HW nároků.
        4. Ostrý GURU VERDIKT.` 
      }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  
  // POJISTKA PROTI NULL VALUE (Zajišťuje, že content nebude prázdný)
  const finalTitle = article.title || task.title;
  const finalContent = article.content || article.text || article.html || "Chyba při generování obsahu AI.";
  const finalSlug = createSlug(finalTitle);

  // 4. ZÁPIS ČLÁNKU
  const { error: insertError } = await supabase.from('posts').insert({
    title: finalTitle,
    slug: finalSlug,
    content: finalContent, // Už nikdy nebude NULL
    created_at: new Date().toISOString(),
    video_id: null
  });

  if (insertError) {
    return NextResponse.json({ 
      error: 'Chyba zapisu do posts', 
      details: insertError,
      tried_to_insert: { title: finalTitle, slug: finalSlug }
    });
  }

  // 5. OZNAČÍME JAKO HOTOVÉ
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ 
    status: 'SUCCESS', 
    message: `Recenze '${finalTitle}' publikována.`,
    slug: finalSlug
  });
}
