import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.5 (CRON-OPTIMIZED)
 * 🚀 CÍL: Nafouknout vždy pouze 1 článek, aby nedošlo k timeoutu.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Vybereme pouze JEDEN článek, který ještě nemá pořádný anglický obsah
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
      .or('content_en.is.null,content_en.lt.1000') // Pokud má EN verze pod 1000 znaků, bereme jako nenafouknuto
      .order('created_at', { ascending: false })
      .limit(1); 

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ status: "FINISHED", message: "Všechny články jsou již nafouknuty." });
    }

    const post = posts[0];

    // 2. Generování CZ obsahu (Hluboká analýza)
    const promptCZ = `Jsi seniorní hardwarový analytik webu The Hardware Guru. Napiš hlubokou technickou analýzu (minimálně 800 slov) na téma: "${post.title}".
    STRIKTNĚ POUŽIJ TYTO HTML TAGY:
    - Hlavní shrnutí v <p><strong>...</strong></p>
    - Každý podnadpis v <h2>...</h2>
    - Klíčové technické parametry v <ul><li><strong>...</strong>: ...</li></ul>
    - Ostatní text v <p>...</p>
    Zaměř se na výkon, architekturu (RTX 50-series, Zen 5 atd.) a tržní souvislosti.`;

    const aiResCZ = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptCZ }],
      temperature: 0.7,
    });

    const fullContentCZ = aiResCZ.choices[0].message.content;

    // 3. Překlad do EN (Zachování HTML)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this tech article to professional English, KEEP ALL HTML TAGS EXACTLY: ${fullContentCZ}` }],
      temperature: 0.2,
    });

    const fullContentEN = aiResEN.choices[0].message.content;

    // 4. Update databáze - zapíšeme CZ i EN verzi
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: fullContentCZ,
        content_en: fullContentEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted: post.title 
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (err) {
    console.error("Booster Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
