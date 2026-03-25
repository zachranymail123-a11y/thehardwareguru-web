import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  noStore();
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FETCH: Vytáhneme 100 článků
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en, slug, slug_en')
      .order('id', { ascending: false })
      .limit(100);

    if (fetchError) throw new Error(fetchError.message);

    // 2. JS FILTER: Najdeme první "thin" článek
    const post = allPosts.find(p => 
      (p.content?.length || 0) < 2000 || 
      (!p.content_en || p.content_en.length < 2000)
    );

    if (!post) return NextResponse.json({ status: "FINISHED", message: "Vše je nafouknuto." });

    let finalCZ = post.content || '';
    let finalEN = '';

    // 3. AI GENERATOR - PŘEPNUTO NA GPT-4O-MINI (Levné jako prase)
    if (finalCZ.length < 2000) {
      const promptCZ = `Jsi seniorní redaktor The Hardware Guru. Napiš DLOUHÝ (minimálně 3500 znaků) technický článek v ČEŠTINĚ na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      HTML tagy: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown! Piš odborně.`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 🚀 ULTRA LEVNÝ MODEL
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 4. PŘEKLAD (Také přes mini)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 🚀 ŠETŘÍME KREDITY
      messages: [{ role: "user", content: `Translate this tech article to professional English, keep ALL HTML tags: ${finalCZ}` }],
      temperature: 0.2,
    });
    finalEN = aiResEN.choices[0].message.content;

    // 5. ZÁPIS DO DB
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: finalCZ,
        content_en: finalEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) throw updateError;

    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/admin`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      model_used: "gpt-4o-mini", // Ať víš, že šetříš
      new_cz_len: finalCZ.length,
      new_en_len: finalEN.length
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
