import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.4 (FIXED ANTI-DUPLICITY)
 * 🛡️ FIX: Přidán 'no-store' a tvrdší filtr, aby se neopakovaly stejné články.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic'; // 🚀 Zákaz cache na úrovni Next.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FILTER: Hledáme články, které mají content_en prázdný nebo moc krátký
    // To je nejjistější známka toho, že ještě neprošly boosterem.
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, content_en')
      .or('content_en.is.null,content_en.lt.500') 
      .order('created_at', { ascending: false })
      .limit(3); 

    if (error) throw error;
    if (!posts || posts.length === 0) return NextResponse.json({ guru_status: "FINISHED", message: "Vše je nafouknuto." });

    const boostedTitles = [];

    for (const post of posts) {
      const promptCZ = `Jsi seniorní hardwarový analytik. Napiš hlubokou technickou analýzu (800 slov) na téma: "${post.title}".
      STRIKTNĚ POUŽIJ TYTO HTML TAGY:
      - Úvod v <p><strong>...</strong></p>
      - Podnadpisy v <h2>...</h2>
      - Odrážky v <ul><li>...</li></ul>
      Obsah musí být unikátní, technický a aktuální k roku 2026.`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });

      const fullContentCZ = aiResCZ.choices[0].message.content;

      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: `Translate this tech article to professional English, KEEP ALL HTML TAGS: ${fullContentCZ}` }],
        temperature: 0.2,
      });

      const fullContentEN = aiResEN.choices[0].message.content;

      // 🚀 UPDATE: Zapisujeme CZ do 'content' a EN do 'content_en'
      // Tím, že content_en teď bude mít 4000+ znaků, příště ho filtr '.lt.500' už NIKDY nevybere.
      const { error: upErr } = await supabase
        .from('posts')
        .update({
          content: fullContentCZ,
          content_en: fullContentEN
        })
        .eq('id', post.id);

      if (!upErr) boostedTitles.push(post.title);
    }

    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted: boostedTitles,
      count: boostedTitles.length
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' } // 🚀 Totální zákaz cache i v prohlížeči
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
