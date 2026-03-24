import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.1 (ADSENSE RECOVERY - EXACT COLUMN MATCH)
 * Cesta: src/app/api/admin/content-booster/route.js
 * 🚀 CÍL: Hromadně nafouknout krátké články na High-Value Content.
 * 🛡️ FIX: Používá sloupce 'content' (CZ) a 'content_en' (EN).
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Najdeme články, které mají CZ content kratší než 800 znaků (aby tam bylo maso)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
      // Filtrujeme články, které jsou pro Google "tenké"
      .or('content.is.null,content.lt.800')
      .limit(3); // Sníženo na 3 kvůli limitům Vercel timeoutu (generování trvá dlouho)

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "Všechny články v databázi jsou už dostatečně dlouhé." });
    }

    const results = [];

    for (const post of posts) {
      // 2. AI Generování hluboké CZ analýzy
      const promptCZ = `Jsi seniorní hardwarový analytik s 20 lety praxe (The Hardware Guru). 
      Napiš hlubokou analýzu (minimálně 600-800 slov) v češtině na téma: "${post.title}".
      Původní krátká zpráva: "${post.content || ''}".
      
      Striktně dodržuj tuto HTML strukturu (bez Markdownu, jen tagy):
      - Začni krátkým shrnutím v <p><strong>...</strong></p>
      - Použij nejméně tři logické sekce s nadpisy <h2>
      - Vlož jeden seznam <ul> s odrážkami <li><strong>...</strong></li> pro klíčové body.
      - Na závěr sekci "Slovo Guru závěrem" v <h2>.
      - Styl: Profesionální, technický, srovnávej s aktuální generací (RTX 5090, Zen 5, atd.).`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });

      const fullContentCZ = aiResCZ.choices[0].message.content;

      // 3. AI Generování EN verze (Překlad + adaptace)
      const promptEN = `Translate and adapt the following hardware article into professional English for a global gaming audience. 
      Keep the exact same HTML structure. Content to translate: ${fullContentCZ}`;

      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptEN }],
        temperature: 0.3,
      });

      const fullContentEN = aiResEN.choices[0].message.content;

      // 4. Update databáze (přesné sloupce: content, content_en)
      const { error: updateErr } = await supabase
        .from('posts')
        .update({
          content: fullContentCZ,      // 🇨🇿 Čeština
          content_en: fullContentEN    // 🇬🇧 Angličtina
        })
        .eq('id', post.id);

      if (!updateErr) {
        results.push({ id: post.id, title: post.title });
      } else {
        console.error(`Chyba u postu ${post.id}:`, updateErr);
      }
    }

    return NextResponse.json({ 
      status: "SUCCESS", 
      processed_count: results.length,
      boosted_articles: results,
      instructions: "Pokud chceš pokračovat, obnov stránku. Vercel dává cca 30s na jeden běh."
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
