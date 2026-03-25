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
  // 🚀 KILL CACHE: Tohle vynutí, aby si Next.js pokaždé sáhl pro čerstvá data
  noStore();
  
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU FETCH: Vytáhneme 100 článků bez filtru v DB (ten blbne kvůli abecednímu řazení)
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en, slug, slug_en')
      .order('id', { ascending: false }) // Bereme novější
      .limit(100);

    if (fetchError) throw new Error(fetchError.message);

    // 2. JS FILTER: Najdeme první článek, co je fakt krátký. 
    // Pokud má ID 1111 už 3000+ znaků, tenhle filtr ho teď už NASTALOPRE přeskočí.
    const post = allPosts.find(p => 
      (p.content?.length || 0) < 2000 || 
      (!p.content_en || p.content_en.length < 2000)
    );

    if (!post) return NextResponse.json({ status: "FINISHED", message: "Všechny stažené články jsou už dlouhé." });

    let finalCZ = post.content || '';
    let finalEN = '';

    // 3. AI GENERATOR (pouze pokud je potřeba nafouknout)
    if (finalCZ.length < 2000) {
      const promptCZ = `Jsi elitní redaktor webu The Hardware Guru. Napiš EXTRÉMNĚ DLOUHÝ (minimálně 4500 znaků) technický článek v ČEŠTINĚ na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      Použij striktně HTML: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown!`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 4. PŘEKLAD (vždy děláme pořádnou EN verzi)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: `Translate this article to professional tech English, keep ALL HTML tags: ${finalCZ}` }],
      temperature: 0.2,
    });
    finalEN = aiResEN.choices[0].message.content;

    // 5. ZÁPIS DO DB
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({
        content: finalCZ,
        content_en: finalEN,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select();

    if (updateError) throw new Error("UPDATE FAIL: " + updateError.message);

    // 6. REVALIDACE: Vymaže cache stránky článku
    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);
    revalidatePath(`/admin`); // Pro tvůj dashboard

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      current_cz_len: finalCZ.length,
      current_en_len: finalEN.length,
      next_id: "Další při refreshu..."
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
