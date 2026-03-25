import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { revalidatePath } from 'next/cache'; // 🚀 Tady je ten klíč k opravě

/**
 * GURU CONTENT BOOSTER V1.7 (FORCE REVALIDATE EDITION)
 * 🚀 CÍL: Nafouknout článek a OKAMŽITĚ vynutit jeho aktualizaci na webu.
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
    // 1. GURU FETCH: Najdeme jeden článek, který má v EN verzi pod 1000 znaků (to je jistota)
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, slug, slug_en')
      .or('content_en.is.null,content_en.lt.1000')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED" });

    const post = posts[0];

    // 2. AI GENERATOR CZ (Nafukujeme maso)
    const promptCZ = `Jsi seniorní hardwarový analytik The Hardware Guru. Napiš hlubokou analýzu (800-1000 slov) v ČEŠTINĚ na téma: "${post.title}". 
    Původní info: "${post.content || ''}".
    POUŽIJ STRIKTNĚ HTML TAGY: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown!`;

    const aiResCZ = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptCZ }],
      temperature: 0.7,
    });
    const fullContentCZ = aiResCZ.choices[0].message.content;

    // 3. AI TRANSLATOR EN
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this article to professional tech English, keep ALL HTML tags: ${fullContentCZ}` }],
      temperature: 0.2,
    });
    const fullContentEN = aiResEN.choices[0].message.content;

    // 4. DB UPDATE
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: fullContentCZ,
        content_en: fullContentEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) throw updateError;

    // 5. 🚀 FORCE REVALIDATE: Tohle vymaže starou cache, aby se změna hned projevila!
    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);
    revalidatePath('/clanky'); // Aktualizujeme i archiv

    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted: post.title,
      id: post.id,
      revalidated: "YES"
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
