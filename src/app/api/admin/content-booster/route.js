import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.0 (ADSENSE RECOVERY)
 * 🚀 CÍL: Hromadně nafouknout krátké články na High-Value Content pro schválení AdSense.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e"; // Stejný klíč jako u indexeru

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Najdeme články, které mají v CZ verzi méně než 600 znaků
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
      .lt('content', 600) // Podmínka na délku textu
      .limit(5); // Zpracujeme 5 článků naráz (kvůli timeoutům Vercelu)

    if (error) throw error;
    if (!posts || posts.length === 0) return NextResponse.json({ message: "Všechny články jsou už boosterované." });

    const results = [];

    for (const post of posts) {
      // 2. AI Generování dlouhého obsahu v CZ
      const promptCZ = `Jsi seniorní hardwarový analytik s 20 lety praxe (The Hardware Guru). 
      Napiš hlubokou analýzu (minimálně 600 slov) v češtině na téma: "${post.title}".
      Původní krátká zpráva: "${post.content}".
      
      Použij striktně tuto HTML strukturu:
      - Úvod do problematiky v <p><strong>...</strong></p>
      - Nejméně tři sekce s nadpisy <h2>
      - V jedné sekci použij seznam <ul> s odrážkami <li><strong>...</strong></li>
      - Na závěr sekci "Slovo Guru závěrem"
      - Piš profesionálně, technicky, ale čtivě. Srovnávej s aktuálním trhem (RTX 5090, PS5 Pro, atd.).`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });

      const fullContentCZ = aiResCZ.choices[0].message.content;

      // 3. AI Generování EN verze (Překlad + adaptace)
      const promptEN = `Translate and adapt the following hardware article into professional English for a global gaming audience. 
      Keep the exact same HTML structure. Content: ${fullContentCZ}`;

      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptEN }],
        temperature: 0.3,
      });

      const fullContentEN = aiResEN.choices[0].message.content;

      // 4. Update databáze
      const { error: updateErr } = await supabase
        .from('posts')
        .update({
          content: fullContentCZ,
          content_cs: fullContentCZ,
          content_en: fullContentEN
        })
        .eq('id', post.id);

      if (!updateErr) results.push(post.title);
    }

    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted_articles: results,
      message: `Nafouknuto ${results.length} článků. Spusť znovu pro dalších 5.`
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
