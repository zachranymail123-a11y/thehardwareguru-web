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
  noStore(); // 🚀 Totální smrt cache
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU QUEUE: Najdeme NEJSTARŠÍ článek, co potřebuje boost (podle updated_at)
    // Tímto se vyhneme cyklení na jednom ID, i kdyby update failnul.
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, content_en, slug, slug_en')
      .or('content.is.null,content_en.is.null,content.lt.2500,content_en.lt.2500')
      .order('updated_at', { ascending: true }) 
      .limit(1)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ status: "FINISHED", message: "Žádné další články k nafouknutí nebyly nalezeny." });
    }

    let finalCZ = post.content || '';
    let finalEN = post.content_en || '';

    // 2. AI GENERATOR (Levný GPT-4o-mini, ale s drsným promptem na délku)
    if (finalCZ.length < 2500) {
      const promptCZ = `Jsi elitní redaktor webu The Hardware Guru. Napiš EXTRÉMNĚ DLOUHÝ odborný článek v ČEŠTINĚ (minimálně 5000 znaků) na téma: "${post.title}". 
      Původní info: "${finalCZ}". 
      MUSÍŠ použít HTML: <p>, <h2>, <ul>, <li>, <strong>. Piš velmi detailně, technicky a do hloubky.`;

      const aiResCZ = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptCZ }],
        temperature: 0.7,
      });
      finalCZ = aiResCZ.choices[0].message.content;
    }

    // 3. PŘEKLAD (Stejně levně, stejně strukturovaně)
    const aiResEN = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Translate this tech article to professional English, keep ALL HTML tags and ensure length is preserved: ${finalCZ}` }],
      temperature: 0.2,
    });
    finalEN = aiResEN.choices[0].message.content;

    // 4. AGRESIVNÍ UPDATE: I kdyby se délka nepovedla, updated_at se změní a článek jde na konec fronty.
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

    // 5. REVALIDACE: Smažeme cache, ať je to na webu vidět hned
    revalidatePath(`/clanky/${post.slug}`);
    revalidatePath(`/en/clanky/${post.slug_en || post.slug}`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      new_cz_len: finalCZ.length,
      new_en_len: finalEN.length,
      db_confirmed: updateData?.length > 0 ? "YES" : "NO",
      next_action: "Refreshni pro další článek ve frontě"
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
