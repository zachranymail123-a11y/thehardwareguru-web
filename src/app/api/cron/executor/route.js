import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Pomocná funkce pro bezpečný slug (aby si poradil s češtinou v URL)
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Odstraní háčky a čárky
    .replace(/[^a-z0-9]+/g, '-') // Nahradí mezery a znaky pomlčkou
    .replace(/^-+|-+$/g, ''); 
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

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError });
  if (!task) return NextResponse.json({ message: 'Žádný plán.' });

  // 2. HLEDÁNÍ DAT
  let searchQuery = task.type === 'game' 
    ? `official system requirements ${task.title} pc specs minimum recommended steam review scores`
    : `${task.title} official specs performance release date rumors`;

  const searchResults = await searchDetails(searchQuery);
  const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 8000); 

  // 3. GENERUJEME ČLÁNEK (S PŘÍKAZEM PRO ČEŠTINU)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru, český expert na PC a hry.
        
        Tvým úkolem je napsat článek o "${task.title}" na základě poskytnutých dat.
        
        !!! DŮLEŽITÉ PRAVIDLO: CELÝ VÝSTUP MUSÍ BÝT V ČEŠTINĚ !!!
        (Data jsou v angličtině, ty je musíš přeložit a okomentovat česky).

        STRUKTURA (vracíš pouze JSON):
        1. Titulek: Musí být česky, úderný (např. "Nioh 3: Masakr motorovou pilou, který utaví vaši grafiku").
        2. Obsah (HTML):
           - Úvod (česky).
           - Tabulka HW nároků (HTML <table>). Sloupce a řádky musí být česky (např. "Procesor", "Grafika", "Paměť", "Místo na disku").
           - Guru Komentář: Tvůj názor na nároky (česky).
           - Závěr (česky).

        Vrať JSON formát: { "title": "Český nadpis", "content": "HTML obsah v češtině..." }`
      },
      { role: "user", content: `Data ke zpracování: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalSlug = createSlug(article.title);

  // 4. ZÁPIS DO DB
  const insertData = {
    title: article.title, // Teď už bude česky
    slug: finalSlug,
    content: article.content, // I tohle bude česky
    created_at: new Date().toISOString(),
    video_id: null
  };

  const { error: insertError } = await supabase.from('posts').insert(insertData);

  if (insertError) {
    return NextResponse.json({ status: 'ERROR', message: insertError.message });
  }

  // 5. HOTOVO
  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ 
    status: 'SUCCESS',
    message: `Článek '${article.title}' byl zapsán ČESKY!`,
    slug: finalSlug
  });
}
