import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.8 (BACK TO BASICS - FUNCTIONAL EDITION)
 * 🚀 CÍL: Použít ověřenou logiku, která už jednou fungovala.
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
    // 1. GURU FETCH: Bereme ty, co mají CZ content pod 1000 znaků. 
    // Jakmile ho nafoukneme na 4000+, filtr ho příště už NIKDY nevybere.
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content')
      .lt('content', 1000) 
      .order('created_at', { ascending: false })
      .limit(1); 

    if (fetchError) throw fetchError;
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED", message: "Vše je nafouknuto." });

    const post = posts[0];

    // 2. AI GENERATOR CZ (Ta verze, co ti sypala ty dobrý texty)
    const promptCZ = `Jsi seniorní hardwarový analytik The Hardware Guru. Napiš hlubokou analýzu (800-1000 slov) v češtině na téma: "${post.title}".
    Původní krátká zpráva: "${post.content || ''}".
    
    STRIKTNĚ POUŽIJ TYTO HTML TAGY (NE MARKDOWN!):
    - Začni krátkým shrnutím v <p><strong>...</strong></p>
    - Použij nejméně tři logické sekce s nadpisy <h2>
    - Vlož jeden seznam <ul> s odrážkami <li><strong>...</strong></li> pro klíčové body.
    - Na závěr sekci "Slovo Guru závěrem" v <h2>.
    - Styl: Profesionální, technický, srovnávej s RTX 5090, Zen 5, atd.`;

    const aiResCZ = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptCZ }],
      temperature: 0.7,
    });

    const fullContentCZ = aiResCZ.choices[0].message.content;

    // 3. AI TRANSLATOR EN (Překlad se zachováním HTML)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this tech article to professional English, KEEP ALL HTML TAGS: ${fullContentCZ}` }],
      temperature: 0.2,
    });

    const fullContentEN = aiResEN.choices[0].message.content;

    // 4. DB UPDATE: Zapíšeme CZ do 'content' a EN do 'content_en'
    const { error: updateErr } = await supabase
      .from('posts')
      .update({
        content: fullContentCZ,
        content_en: fullContentEN
      })
      .eq('id', post.id);

    if (updateErr) throw updateError;

    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted: post.title,
      id: post.id
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
