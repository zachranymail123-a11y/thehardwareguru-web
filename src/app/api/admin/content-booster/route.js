import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.3 (HTML STRUCTURE ENFORCER)
 * 🛡️ FIX: Striktní vynucení HTML tagů (H2, strong, UL/LI) pro maximální SEO skóre.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
      .or('content.lt.1000,content_en.is.null') // Bereme ty, co potřebují maso
      .order('created_at', { ascending: false })
      .limit(3); 

    if (error) throw error;
    if (!posts || posts.length === 0) return NextResponse.json({ guru_status: "FINISHED" });

    for (const post of posts) {
      const promptCZ = `Jsi seniorní hardwarový analytik. Napiš hlubokou analýzu (800 slov) na: "${post.title}".
      STRIKTNĚ POUŽIJ TYTO HTML TAGY (NE MARKDOWN!):
      - Hlavní shrnutí v <p><strong>...</strong></p>
      - Každý podnadpis v <h2>...</h2>
      - Klíčové body v <ul><li><strong>...</strong>: ...</li></ul>
      - Každý odstavec v <p>...</p>
      Obsah musí být technický, zmiňuj RTX 5090, DLSS 4, Zen 5 a tržní dopady.`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });

      const fullContentCZ = aiResCZ.choices[0].message.content;

      // Překlad se zachováním HTML
      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: `Translate this article to professional English, KEEP ALL HTML TAGS EXACTLY: ${fullContentCZ}` }],
        temperature: 0.2,
      });

      const fullContentEN = aiResEN.choices[0].message.content;

      await supabase.from('posts').update({
        content: fullContentCZ,
        content_en: fullContentEN
      }).eq('id', post.id);
    }

    return NextResponse.json({ status: "SUCCESS", boosted: posts.map(p => p.title) });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
