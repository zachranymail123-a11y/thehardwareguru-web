import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); 
}

async function searchDetails(query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 15, tbs: 'qdr:m' }) // Bereme 15 výsledků pro víc dat
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

  // 2. HLEDÁNÍ DAT (Agresivní hledání známek a plusů/mínusů)
  let searchQuery = "";
  if (task.type === 'game') {
    searchQuery = `${task.title} review scores metacritic ign gamespot pcgamer pros cons verdict official system requirements`;
  } else {
    searchQuery = `${task.title} benchmark performance pros cons review verdict price`;
  }

  const searchResults = await searchDetails(searchQuery);
  // Zvětšíme kontext, ať má z čeho brát čísla
  const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 12000); 

  // 3. GENERUJEME ČLÁNEK (PROFI RECENZE)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru, nekompromisní český herní kritik.
        
        Tvým úkolem je napsat ŠPIČKOVOU RECENZI (Review Roundup) na hru "${task.title}".
        Musíš vycházet z nalezených dat. Žádné omáčky, tvrdá data.
        
        VÝSTUP MUSÍ BÝT V ČEŠTINĚ.

        POVINNÁ STRUKTURA (HTML):
        1. **Nadpis:** Úderný clickbait (např. "Hra X: První recenze jsou venku. Je to propadák roku?").
        2. **Úvod:** Krátce o co jde.
        3. **SVĚTOVÉ HODNOCENÍ (Tabulka):** - Vytvoř HTML tabulku, kde vlevo je web (IGN, GameSpot, PCGamer...) a vpravo jejich známka.
           - Pokud v datech známku nenajdeš, odhadni ji z tónu textu (např. 8/10).
           - Pod tabulku napiš tučně: "Průměr na Metacritic: X %" (pokud to najdeš).
        4. **PLUSY A MÍNUSY (To lidi zajímá nejvíc):**
           - Dva seznamy (<ul>). Jeden pro PLUSY (✅), druhý pro MÍNUSY (❌).
           - Buď konkrétní (např. "Špatná optimalizace", "Skvělý soubojový systém").
        5. **HW NÁROKY (Tabulka):** Klasická tabulka Minimální vs Doporučené.
        6. **GURU VERDIKT:** Tvůj finální, ostrý názor. Vyplatí se to koupit hned, nebo počkat na slevu?
        
        Vrať JSON: { "title": "...", "content": "HTML obsah..." }`
      },
      { role: "user", content: `Data z recenzí a webu: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);
  const finalSlug = createSlug(article.title);

  // 4. ZÁPIS DO DB
  const insertData = {
    title: article.title,
    slug: finalSlug,
    content: article.content,
    created_at: new Date().toISOString(),
    video_id: null
  };

  const { error: insertError } = await supabase.from('posts').insert(insertData);

  if (insertError) {
    return NextResponse.json({ status: 'ERROR', message: insertError.message });
  }

  await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

  return NextResponse.json({ 
    status: 'SUCCESS',
    message: `Profi recenze '${article.title}' zapsána!`,
    slug: finalSlug
  });
}
