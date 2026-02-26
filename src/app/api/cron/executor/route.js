import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Funkce pro hledání
async function searchDetails(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:m' }) // qdr:m = data max měsíc stará (čerstvé)
  });
  return res.json();
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. NAJDEME JEDEN ÚKOL Z PLÁNU
  const { data: task } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .limit(1)
    .single();

  if (!task) {
    return NextResponse.json({ message: 'Žádný plán. Spusť nejdřív Planer.' });
  }

  // 2. LOV DATA - SPECIFICKY NA OFICIÁLNÍ NÁROKY
  let searchQuery = "";
  if (task.type === 'game') {
    // Tady je ta změna: Hledáme "official system requirements" a "steam"
    searchQuery = `official system requirements ${task.title} pc specs minimum recommended steam review scores`;
  } else {
    searchQuery = `${task.title} official specs performance price release date benchmarks`;
  }

  const searchResults = await searchDetails(searchQuery);
  const rawContext = JSON.stringify(searchResults.organic || []);

  // 3. PSANÍ ČLÁNKU (GURU STYLE)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Expert na HW.
        Tvým úkolem je napsat článek o "${task.title}".
        
        DŮLEŽITÉ: HW NÁROKY MUSÍ BÝT Z OFICIÁLNÍCH ZDROJŮ (hledat ve výsledcích Steam, Epic, Official Site).

        STRUKTURA ČLÁNKU (HTML formát obsahu):
        1. **Úderný úvod:** O co jde.
        2. **Verdikt Recenzí:** Pokud jsou venku, udělej průměr známek.
        3. **OFICIÁLNÍ HW NÁROKY (Tabulka):** - Vytvoř HTML tabulku <table> s řádky pro CPU, GPU, RAM a Storage.
           - Sloupce: Minimální vs. Doporučené.
           - Pokud data nenajdeš, napiš "Vývojáři zatím specifikace nezveřejnili".
        4. **GURU KOMENTÁŘ K NÁROKŮM:** - Rozeber to. "Chtějí 32GB RAM? To se zbláznili?" nebo "Optimalizace vypadá dobře."
           - Doporuč konkrétní GPU pro 1080p/1440p.
        5. **Klady a Zápory.**
        6. **Závěr.**

        STYL:
        - Tykání, expertní ale srozumitelný jazyk.
        - Používej <h3> pro nadpisy sekcí.
        
        Vrať JSON:
        {
          "title": "Clickbait titulek",
          "slug": "url-friendly-nazev",
          "content": "HTML obsah..."
        }`
      },
      { role: "user", content: `Data z Googlu: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);

  // 4. PUBLIKACE
  const { error } = await supabase.from('posts').insert({
    title: article.title,
    slug: article.slug,
    content: article.content,
    created_at: new Date().toISOString()
  });

  if (!error) {
    // Odškrtneme úkol
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
  }

  return NextResponse.json({ 
    message: `Článek '${article.title}' byl publikován s ofiko nároky!`,
    task: task.title 
  });
}
