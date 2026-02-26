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

  // 1. NAJDEME NEJSTARŠÍ PLÁNOVANÝ ÚKOL
  const { data: tasks } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .order('created_at', { ascending: true })
    .limit(1);

  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Nic k praci.' });
  const task = tasks[0];

  // 2. OKAMŽITÁ POJISTKA - Označíme jako processing, aby se nespustil dvakrát
  await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

  try {
    // 3. AGRESIVNÍ KONTROLA DUPLICITY V POSTECH
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .ilike('title', `%${task.title.split(':')[0]}%`) // Kontrola i na část názvu
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
      return NextResponse.json({ message: `Stopka: '${task.title}' uz na webu je pod jinym ID.` });
    }

    // 4. RESEARCH (SERPER)
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${task.title} review 2026 specs requirements`, num: 8 })
    });
    const searchResults = await res.json();
    const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 8000);

    // 5. GENERUJEME ČLÁNEK
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru. Piš ČESKY. Vrať JSON: { \"title\": \"...\", \"content\": \"HTML...\" }. Používej tabulky pro parametry!" },
        { role: "user", content: `Napiš článek o "${task.title}". Typ: ${task.type}. Data: ${rawContext}` }
      ],
      response_format: { type: "json_object" }
    });

    const article = JSON.parse(completion.choices[0].message.content);
    const slug = createSlug(article.title);

    // 6. ZÁPIS DO POSTS S OŠETŘENÍM CHYBY DUPLICITY SLUGU
    const { error: insertError } = await supabase.from('posts').insert({
      title: article.title,
      slug: slug,
      content: article.content,
      type: task.type, // Přenášíme typ z plánu (game/hardware)
      created_at: new Date().toISOString()
    });

    if (insertError && insertError.code === '23505') {
       // Pokud slug už existuje, prostě úkol v plánu vymažeme a končíme
       await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
       return NextResponse.json({ message: 'Slug uz existuje, ukol zrusen.' });
    }

    // 7. HOTOVO - Označíme jako publikované
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

    return NextResponse.json({ status: 'SUCCESS', published: article.title });

  } catch (err) {
    // Při jakémkoliv jiném průseru vrátíme status na 'planned', abychom to neztratili
    await supabase.from('content_plan').update({ status: 'planned' }).eq('id', task.id);
    return NextResponse.json({ error: err.message });
  }
}
