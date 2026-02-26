import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Funkce pro hledání detailů (recenze, benchmarky)
async function searchDetails(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 15, tbs: 'qdr:m' }) // Hledáme data z posledního měsíce
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

  // 2. LOV DATA (Podle toho, jestli je to hra nebo HW)
  let searchQuery = "";
  if (task.type === 'game') {
    searchQuery = `${task.title} review scores metacritic ign performance benchmark pc requirements`;
  } else {
    searchQuery = `${task.title} specs performance price release date leaks rumors`;
  }

  const searchResults = await searchDetails(searchQuery);
  const rawContext = JSON.stringify(searchResults.organic || []);

  // 3. PSANÍ ČLÁNKU (GURU STYLE)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Jsi The Hardware Guru. Nekompromisní HW a herní expert.
        Tvým úkolem je napsat článek o "${task.title}" na základě nalezených dat.

        STRUKTURA ČLÁNKU (HTML formát, ale bez <html> tagů, jen obsah):
        1. **Úderný úvod:** Co to je a proč by to čtenáře mělo zajímat.
        2. **Verdikt Recenzí (pouze u her):** Udělej přehled známek (IGN, GameSpot atd.), pokud jsi je našel. Vypočítej průměr.
        3. **Klady a Zápory:** Odrážky. Buď konkrétní.
        4. **HW GURU CHECK:** Na čem to pojede? (Vytáhni HW nároky a přidej svůj komentář, např. "Na 1060ce si ani neškrtnete").
        5. **Závěr:** Koupit, nebo čekat na slevu?

        STYL:
        - Tykání, herní slang (ale srozumitelný).
        - Krátké odstavce.
        - Tučné písmo pro důležité věci.
        
        Vrať JSON:
        {
          "title": "Clickbait titulek (např. Resident Evil Requiem: Masakr motorovou pilou nebo propadák?)",
          "slug": "url-friendly-nazev",
          "content": "HTML obsah článku..."
        }`
      },
      { role: "user", content: `Tady jsou data z Googlu: ${rawContext}` }
    ],
    response_format: { type: "json_object" }
  });

  const article = JSON.parse(completion.choices[0].message.content);

  // 4. PUBLIKACE NA WEB
  // a) Vložíme článek do 'posts'
  const { error: insertError } = await supabase.from('posts').insert({
    title: article.title,
    slug: article.slug,
    content: article.content,
    type: 'article', // Nebo 'review'
    created_at: new Date().toISOString()
  });

  if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // b) Odškrtneme úkol v 'content_plan'
  await supabase
    .from('content_plan')
    .update({ status: 'published' })
    .eq('id', task.id);

  return NextResponse.json({ 
    message: `Článek '${article.title}' byl úspěšně publikován!`,
    task: task.title 
  });
}
