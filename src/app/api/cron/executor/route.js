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

  // 1. NAJDEME ÚKOL (Vezmeme první plánovaný)
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .order('created_at', { ascending: true }) // Abychom nebrali náhodně
    .limit(1);

  if (fetchError || !tasks || tasks.length === 0) {
    return NextResponse.json({ error: 'Zadny plan k publikaci.' });
  }

  const task = tasks[0];

  // --- ANTI-DUPLICITA ---
  // Zkontrolujeme, jestli už článek o této hře náhodou nemáme v tabulce posts
  const { data: existingPost } = await supabase
    .from('posts')
    .select('id')
    .ilike('title', `%${task.title}%`)
    .limit(1);

  if (existingPost && existingPost.length > 0) {
    // Pokud už existuje, označíme úkol jako hotový a jdeme dál
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
    return NextResponse.json({ message: `Článek '${task.title}' už existuje, přeskakuji.` });
  }
  // ---------------------

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
        content: `Jsi The Hardware Guru. Piš ČESKY. Vrať JSON: { "title": "...", "content": "HTML..." }`
      },
      { role: "user", content: `Vytvoř recenzi na "${task.title}" z dat: ${rawContext}.` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalTitle = article.title || task.title;
  const finalContent = article.content || "Chyba obsahu.";
  const finalSlug = createSlug(finalTitle);

  // 4. ZÁPIS ČLÁNKU
  const { error: insertError } = await supabase.from('posts').insert({
    title: finalTitle,
    slug: finalSlug,
    content: finalContent,
    created_at: new Date().toISOString()
  });

  if (insertError) return NextResponse.json({ error: 'Chyba zapisu', details: insertError });

  // 5. OZNAČÍME JAKO HOTOVÉ (DŮLEŽITÉ!)
  const { error: updateError } = await supabase
    .from('content_plan')
    .update({ status: 'published' })
    .eq('id', task.id);

  if (updateError) return NextResponse.json({ error: 'Chyba pri updatu statusu v planu', details: updateError });

  return NextResponse.json({ status: 'SUCCESS', message: `Recenze '${finalTitle}' publikována.` });
}
