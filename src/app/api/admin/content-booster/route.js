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
  noStore(); // Totální smrt Vercel cache
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU QUEUE: Vezmeme 100 NEJSTARŠÍCH článků podle času poslední úpravy.
    // Tím zaručíme, že se fronta po každém zápisu posune!
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en, slug, slug_en')
      .order('updated_at', { ascending: true, nullsFirst: true }) 
      .limit(100);

    if (fetchError) throw new Error("DB FETCH ERROR: " + fetchError.message);

    // 2. JS FILTER: Zkontrolujeme REÁLNOU délku znaků, ne abecední nesmysly
    const post = allPosts.find(p => 
      (p.content === null || p.content.length < 2000) || 
      (p.content_en === null || p.content_en.length < 2000)
    );

    if (!post) {
      return NextResponse.json({ status: "FINISHED", message: "Těchto 100 nejstarších článků je už v TOPu." });
    }

    let finalCZ = post.content || '';
    let finalEN = post.content_en || '';

    // 3. AI GENERATOR (CZ) přes levný model gpt-4o-mini
    if (finalCZ.length < 2000) {
      const promptCZ = `Jsi seniorní hardwarový redaktor. Napiš VELMI DLOUHÝ článek (min. 4000 znaků) na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      STRIKTNĚ POUŽIJ HTML TAGY: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown! Rozděl to do logických odstavců.`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 4. AI TRANSLATOR (EN)
    if (finalEN.length < 2000) {
      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Translate this tech article to professional English, KEEP ALL HTML TAGS: ${finalCZ}` }],
        temperature: 0.2,
      });
      finalEN = aiResEN.choices[0].message.content;
    }

    // 5. 🚀 CRITICAL UPDATE: Zápis STRIKTNĚ do content a content_en + POSUNUTÍ VE FRONTĚ
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: finalCZ,
        content_en: finalEN,
        updated_at: new Date().toISOString() // Tohle zapíše aktuální čas a pošle článek na konec fronty!
      })
      .eq('id', post.id);

    if (updateError) throw new Error("UPDATE FAIL: " + updateError.message);

    // 6. Vymaže starou verzi na webu
    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);
    revalidatePath(`/admin`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      cz_length_saved: finalCZ.length,
      en_length_saved: finalEN.length,
      next_action: "Dej F5. Fronta se teď zaručeně posunula."
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
