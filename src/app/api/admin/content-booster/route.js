import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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
    // 1. GURU FETCH: Najdeme článek, který potřebuje buď nafouknout CZ, nebo dodělat EN.
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en')
      .or('content.lt.2000,content_en.is.null,content_en.lt.2000') 
      .order('id', { ascending: true })
      .limit(1);

    if (fetchError) throw new Error(fetchError.message);
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED", message: "Všechno je v topu." });

    const post = posts[0];
    let finalCZ = post.content || '';
    let finalEN = '';

    // 2. LOGIKA: Nafouknout nebo ne?
    if (finalCZ.length < 2000) {
      // CZ je krátká -> Musíme ji nafouknout
      const promptCZ = `Jsi elitní redaktor webu The Hardware Guru. Napiš EXTRÉMNĚ DLOUHÝ odborný článek v ČEŠTINĚ (minimálně 4000 znaků) na téma: "${post.title}".
      Původní info: "${finalCZ}".
      Použij HTML tagy: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown!`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 3. PŘEKLAD (vždycky děláme čerstvej, pokud EN chybí nebo je krátká)
    const promptEN = `Translate this hardware article to professional English, keep ALL HTML tags exactly as they are: ${finalCZ}`;
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: promptEN }],
      temperature: 0.2,
    });
    finalEN = aiResEN.choices[0].message.content;

    // 4. AGRESIVNÍ ZÁPIS
    const { data: updateCheck, error: updateError } = await supabase
      .from('posts')
      .update({
        content: finalCZ,
        content_en: finalEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      cz_length: finalCZ.length,
      en_length: finalEN.length,
      was_expanded: post.content?.length < 2000 ? "YES" : "NO (Only translated)"
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
