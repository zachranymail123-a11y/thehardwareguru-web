import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * GURU CONTENT BOOSTER V1.9 (GOD-MODE DEBUG EDITION)
 * 🚀 CÍL: Zjistit, proč se kurva neukládají data do DB a vynutit změnu.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // ⚡️ MUSÍ BÝT SERVICE_ROLE_KEY!
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FETCH: Najdeme jeden článek, co má v CZ content pod 1000 znaků.
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content')
      .lt('content', 1000) 
      .order('id', { ascending: true }) // Změna: Bereme od nejstaršího ID
      .limit(1);

    if (fetchError) throw new Error("FETCH FAIL: " + fetchError.message);
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED" });

    const post = posts[0];
    const oldLength = post.content?.length || 0;

    // 2. AI GENERATOR (Vynucená délka)
    const promptCZ = `Jsi hardwarový analytik. Napiš článek o minimálně 4000 znacích (800+ slov) na téma: "${post.title}". 
    Použij HTML: <p>, <h2>, <ul>, <li>. Původní text: "${post.content}".`;

    const aiResCZ = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptCZ }],
      temperature: 0.7,
    });
    const fullContentCZ = aiResCZ.choices[0].message.content;

    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate to tech English, keep HTML: ${fullContentCZ}` }],
      temperature: 0.2,
    });
    const fullContentEN = aiResEN.choices[0].message.content;

    // 3. AGRESIVNÍ UPDATE S OVĚŘENÍM
    const { data: updatedRows, error: updateError } = await supabase
      .from('posts')
      .update({
        content: fullContentCZ,
        content_en: fullContentEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select(); // 🚀 Vyžádáme si vrácení změněných dat

    if (updateError) {
       return NextResponse.json({ 
         status: "DATABASE_ERROR", 
         error: updateError.message, 
         hint: "Zkontroluj, jestli máš SERVICE_ROLE_KEY a jestli sloupec 'content' není typu varchar(255)!" 
       });
    }

    const savedLength = updatedRows?.[0]?.content?.length || 0;

    // 4. VERDIKT
    return NextResponse.json({ 
      status: savedLength > 1000 ? "SUCCESS" : "FAILED_TO_SAVE",
      article_id: post.id,
      title: post.title,
      old_length: oldLength,
      new_length_generated: fullContentCZ.length,
      real_db_saved_length: savedLength,
      db_response: updatedRows ? "Data received" : "No data returned from DB"
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (err) {
    return NextResponse.json({ status: "CRITICAL_ERROR", error: err.message }, { status: 500 });
  }
}
