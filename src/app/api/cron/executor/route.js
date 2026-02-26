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
  
  let attempts = 0;
  const maxAttempts = 5; // <--- BRZDA: Maximálně 5 pokusů na jedno zavolání

  while (attempts < maxAttempts) {
    attempts++;

    // 1. NAJDEME ÚKOL (Změna: Bereme jen 'planned', abysme se netočili na 'processing')
    const { data: tasks, error: fetchError } = await supabase
      .from('content_plan')
      .select('*')
      .ilike('status', 'planned') 
      .order('id', { ascending: true })
      .limit(1);

    if (fetchError || !tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'Hotovo nebo chyba DB.', attempts });
    }
    
    const task = tasks[0];

    // 2. LOCK - Okamžitý update v DB (Pojistka proti zacyklení)
    await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

    try {
      // 3. AGRESIVNÍ KONTROLA DUPLICITY
      const taskSlug = createSlug(task.title);
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .or(`slug.eq.${taskSlug},title.ilike.%${task.title.split(':')[0]}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
        continue; // Skočí na další úkol
      }

      // 4. RESEARCH
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} review 2026 specs`, num: 5 })
      });
      const searchResults = await res.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 5000);

      // 5. GENERUJEME ČLÁNEK
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Jsi The Hardware Guru. Piš ČESKY. Vrať striktně JSON: { \"title\": \"...\", \"content\": \"HTML s <table>\" }" },
          { role: "user", content: `Téma: "${task.title}". Kontext: ${rawContext}` }
        ],
        response_format: { type: "json_object" }
      });

      const article = JSON.parse(completion.choices[0].message.content);
      const finalSlug = createSlug(article.title);

      // 6. ZÁPIS A DOČIŠTĚNÍ
      const { error: insertError } = await supabase.from('posts').insert({
        title: article.title,
        slug: finalSlug,
        content: article.content,
        type: task.type,
        created_at: new Date().toISOString()
      });

      // Ať už to dopadne jakkoliv, úkol v plánu označíme jako vyřízený
      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

      if (insertError) {
        if (insertError.code === '23505') continue; // Slug duplicita, zkus další
        throw insertError;
      }

      return NextResponse.json({ status: 'SUCCESS', published: article.title, attempts });

    } catch (err) {
      // Při chybě označíme jako 'error', aby se na tom skript netočil příště
      await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
      return NextResponse.json({ error: err.message, attempts });
    }
  }

  return NextResponse.json({ message: 'Dosažen limit pokusů (5). Zkontroluj duplicity.' });
}
