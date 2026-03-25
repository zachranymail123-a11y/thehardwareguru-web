import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export const maxDuration = 120; // 🚀 GURU TIMEOUT FIX
export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export async function GET(req) {
  noStore(); // Smrt Vercel cache
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en, slug, slug_en')
      .order('updated_at', { ascending: true, nullsFirst: true }) 
      .limit(100);

    if (fetchError) throw new Error("DB FETCH ERROR: " + fetchError.message);

    const post = allPosts.find(p => 
      (p.content === null || p.content.length < 2000) || 
      (p.content_en === null || p.content_en.length < 2000)
    );

    if (!post) {
      return NextResponse.json({ status: "FINISHED", message: "Všechny články jsou komplet nafouknuté." });
    }

    let finalCZ = post.content || '';
    let finalEN = post.content_en || '';
    let actionTaken = "";
    let pushToBackOfQueue = false; // 🚀 Magický přepínač

    // KROK A: Chybí Čeština
    if (finalCZ.length < 2000) {
      const promptCZ = `Jsi seniorní hardwarový redaktor. Napiš VELMI DLOUHÝ článek (min. 4000 znaků) na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      STRIKTNĚ POUŽIJ HTML TAGY: <p>, <h2>, <ul>, <li>, <strong>. Žádný Markdown!`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
      actionTaken = "GENERATED_CZ";

      // Pokud AI udělala práci dobře (>2000 znaků), NEZMĚNÍME updated_at! 
      // Tím článek zůstane první na ráně pro další F5, aby se rovnou udělala EN.
      // Pokud to AI odflákla, odpálíme ho dozadu, ať se nezacyklíme.
      if (finalCZ.length < 2000) {
         pushToBackOfQueue = true;
      }

    // KROK B: Čeština je hotová, chybí Angličtina
    } else if (finalEN.length < 2000) {
      const aiResEN = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Translate this tech article to professional English, KEEP ALL HTML TAGS: ${finalCZ}` }],
        temperature: 0.2,
      });
      finalEN = aiResEN.choices[0].message.content;
      actionTaken = "GENERATED_EN";

      // Obě verze jsou hotové, můžeme článek poslat na konec fronty.
      pushToBackOfQueue = true;
    }

    // Příprava dat pro zápis
    const updatePayload = {
      content: finalCZ,
      content_en: finalEN,
    };

    // Zapíšeme aktuální čas jen tehdy, když chceme článek vyřadit z čela fronty
    if (pushToBackOfQueue) {
      updatePayload.updated_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', post.id);

    if (updateError) throw new Error("UPDATE FAIL: " + updateError.message);

    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);
    revalidatePath(`/admin`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      action: actionTaken,
      cz_length_saved: finalCZ.length,
      en_length_saved: finalEN.length,
      queue_moved: pushToBackOfQueue ? "YES" : "NO (Waiting for EN translation)",
      next_action: pushToBackOfQueue ? "Dej F5 pro DALŠÍ článek." : "Dej F5 pro PŘEKLAD tohoto článku."
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
