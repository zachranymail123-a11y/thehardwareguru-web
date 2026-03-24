import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.6 (THE "REALLY FIX IT" EDITION)
 * 🚀 CÍL: Brutální kontrola zápisu do DB a eliminace duplicit.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Musíš použít SERVICE_ROLE_KEY, aby si Supabase nehrála na hrdinu s RLS politikama!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' 
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FETCH: Najdeme jeden článek, co má krátký EN obsah (pod 1000 znaků)
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content')
      .or('content_en.is.null,content_en.lt.1000')
      .order('id', { ascending: true }) // Bereme je popořadě podle ID
      .limit(1);

    if (fetchError) throw new Error("Fetch Error: " + fetchError.message);
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED" });

    const post = posts[0];

    // 2. AI GENERATOR CZ
    const promptCZ = `Jsi seniorní hardwarový analytik The Hardware Guru. Napiš hlubokou analýzu (800 slov) na téma: "${post.title}". 
    Původní info: "${post.content || ''}".
    STRIKTNĚ POUŽIJ HTML: <p>, <h2>, <ul>, <li>. Žádný Markdown!`;

    const aiResCZ = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptCZ }],
      temperature: 0.7,
    });
    const fullContentCZ = aiResCZ.choices[0].message.content;

    // 3. AI TRANSLATOR EN
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this to tech English, keep HTML tags: ${fullContentCZ}` }],
      temperature: 0.2,
    });
    const fullContentEN = aiResEN.choices[0].message.content;

    // 4. KRITICKÝ UPDATE: Tady se láme chleba
    const { data: updateData, error: updateError, count } = await supabase
      .from('posts')
      .update({
        content: fullContentCZ,
        content_en: fullContentEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select(); // Tohle nám vrátí, co se reálně zapsalo

    if (updateError) throw new Error("Update Error: " + updateError.message);

    // 5. FINÁLNÍ KONTROLA
    return NextResponse.json({ 
      status: "SUCCESS", 
      boosted_id: post.id,
      boosted_title: post.title,
      db_confirmed: updateData && updateData.length > 0 ? "YES" : "NO - ZÁPIS SE NEPOVEDL!",
      new_content_length: fullContentCZ.length
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });

  } catch (err) {
    return NextResponse.json({ error: err.message, stack: "Guru Engine Fail" }, { status: 500 });
  }
}
