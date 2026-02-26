import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Pomocná funkce pro bezpečný slug
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Odstraní diakritiku
    .replace(/[^a-z0-9]+/g, '-') // Nahradí znaky pomlčkou
    .replace(/^-+|-+$/g, ''); // Ořízne pomlčky na krajích
}

async function searchDetails(query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:m' }) 
    });
    return await res.json();
  } catch (e) {
    return { organic: [] };
  }
}

export async function GET() {
  // DŮLEŽITÉ: Service Role Key pro obcházení RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. NAJDEME ÚKOL
  const { data: task, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .limit(1)
    .single();

  if (fetchError) {
      return NextResponse.json({ error: 'Chyba při čtení plánu', details: fetchError });
  }

  if (!task) {
    return NextResponse.json({ message: 'Žádný plán (vše hotovo nebo prázdné).' });
  }

  // 2. HLEDÁNÍ DAT
  let searchQuery = task.type === 'game' 
    ? `official system requirements ${task.title} pc specs minimum recommended steam review scores`
    : `${task.title} official specs performance release date rumors`;

  const searchResults = await searchDetails(searchQuery);
  const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 8000); 

  // 3. GENERUJEME ČLÁNEK
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Napiš článek o "${task.title}".
        Pokud jde o hru, MUSÍŠ zahrnout HTML tabulku s HW nároky.
        Vrať JSON: { "title": "...", "content": "HTML obsah..." }`
      },
      { role: "user", content: `Data: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalSlug = createSlug(article.title);

  // 4. POKUS O ZÁPIS (UŽ BEZ DESCRIPTION)
  const insertData = {
    title: article.title,
    slug: finalSlug,
    content: article.content,
    created_at: new Date().toISOString(),
    video_id: null
    // Tady byl description, teď je pryč a už to nebude řvát chybu
  };

  const { error: insertError } = await supabase.from('posts').insert(insertData);

  if (insertError) {
    return NextResponse.json({ 
        status: 'ERROR', 
        message: 'Nepodařilo se zapsat článek do DB', 
        supabase_error: insertError, 
        data_we_tried_to_insert: insertData
    });
  }

  // 5. ODŠKRTNUTÍ ÚKOLU
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ 
    status: 'SUCCESS',
    message: `Článek '${article.title}' byl úspěšně zapsán!`,
    slug: finalSlug
  });
}
