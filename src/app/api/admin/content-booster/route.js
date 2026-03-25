import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { revalidatePath } from 'next/cache';
import { headers, cookies } from 'next/headers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ⚡️ Tady MUSÍ být SERVICE_ROLE_KEY, jinak nás Supabase nepustí k zápisu!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  // 🚀 NUTNÉ: Volání headers a cookies zabije jakoukoli cache na Vercelu
  const headerList = headers();
  const cookieStore = cookies();
  
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FETCH: Najdeme článek, co je fakt krátkej (lt 1500) nebo nemá EN.
    // Přidáváme náhodné řazení, abychom se nezasekli na jednom ID, kdyby náhodou.
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, title_en, content, content_en, slug, slug_en')
      .or('content.lt.1500,content_en.is.null,content_en.lt.1500') 
      .order('created_at', { ascending: true }) 
      .limit(1);

    if (fetchError) throw new Error("FETCH FAIL: " + fetchError.message);
    if (!posts || posts.length === 0) return NextResponse.json({ status: "FINISHED" });

    const post = posts[0];
    let finalCZ = post.content || '';
    let finalEN = '';

    // 2. LOGIKA NAFOUKNUTÍ
    if (finalCZ.length < 1500) {
      const promptCZ = `Jsi elitní redaktor webu The Hardware Guru. Napiš EXTRÉMNĚ DLOUHÝ (minimálně 4500 znaků) odborný článek v ČEŠTINĚ na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      Použij striktně HTML: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown!`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 3. PŘEKLAD (Vždycky, aby byla EN verze pořádná)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this tech article to professional English, keep ALL HTML tags: ${finalCZ}` }],
      temperature: 0.2,
    });
    finalEN = aiResEN.choices[0].message.content;

    // 4. AGRESIVNÍ ZÁPIS S KONTROLOU
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({
        content: finalCZ,
        content_en: finalEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select(); // 🚀 Důležité: Vyžádáme si potvrzení zápisu

    if (updateError) throw new Error("UPDATE FAIL: " + updateError.message);
    if (!updateData || updateData.length === 0) throw new Error("DB NO CHANGE: Článek se neuložil. Možná špatný SERVICE_ROLE_KEY?");

    // 5. 🚀 FORCE REVALIDATE: Smažeme starou cache pro tenhle článek
    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      cz_length: finalCZ.length,
      en_length: finalEN.length,
      db_confirmed: "YES",
      was_expanded: post.content?.length < 1500 ? "YES" : "NO (Only translated)"
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
