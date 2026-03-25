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

// Můžeš použít stejný klíč jako u boosteru, ať v tom nemáš bordel
const MASTER_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export async function GET(req) {
  noStore(); // 🚀 SMRT CACHE!
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== MASTER_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. GURU QUEUE: Taháme jen články, kterým reálně chybí SEO nebo obrázek
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, seo_description, seo_description_en, image_url, slug, slug_en')
      .or('seo_description.is.null,seo_description.eq."",seo_description_en.is.null,seo_description_en.eq."",image_url.is.null,image_url.eq.""')
      .order('updated_at', { ascending: true, nullsFirst: true }) // 🚀 Řazení od nejstaršího!
      .limit(100);

    if (fetchError) throw new Error("DB FETCH ERROR: " + fetchError.message);

    // Najdeme první, který má fakt nějaký deficit
    const post = posts.find(p => 
      !p.seo_description || 
      !p.seo_description_en || 
      !p.image_url
    );

    if (!post) {
      return NextResponse.json({ status: "FINISHED", message: "Všechny články mají kompletní SEO i obrázky." });
    }

    let finalSeoCZ = post.seo_description || '';
    let finalSeoEN = post.seo_description_en || '';
    let finalImage = post.image_url || '';
    let actionTaken = [];

    // KROK A: Generování chybějícího CZ SEO (přes ultra levný gpt-4o-mini)
    if (!finalSeoCZ) {
      const resCZ = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 🚀 ŠETŘÍME KREDITY
        messages: [{ role: "user", content: `Napiš úderný SEO meta popisek (max 155 znaků) v češtině pro článek s názvem: "${post.title}". Obsah: ${post.content?.substring(0, 500)}` }],
        temperature: 0.5,
      });
      finalSeoCZ = resCZ.choices[0].message.content.replace(/["']/g, ''); // Vyčištění od uvozovek
      actionTaken.push("SEO_CZ");
    }

    // KROK B: Generování chybějícího EN SEO (přes ultra levný gpt-4o-mini)
    else if (!finalSeoEN) {
      const resEN = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 🚀 ŠETŘÍME KREDITY
        messages: [{ role: "user", content: `Translate this SEO meta description to professional English (max 155 chars): ${finalSeoCZ || post.title}` }],
        temperature: 0.3,
      });
      finalSeoEN = resEN.choices[0].message.content.replace(/["']/g, '');
      actionTaken.push("SEO_EN");
    }

    // KROK C: Generování chybějícího OBRÁZKU (DALL-E 3 - tady to prostě něco stojí)
    else if (!finalImage) {
      const imgRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: `High quality editorial illustration for a hardware and gaming article titled: "${post.title}". Tech, neon, cyberpunk aesthetic, professional lighting, no text in image.`,
        n: 1,
        size: "1024x1024",
      });
      finalImage = imgRes.data[0].url;
      actionTaken.push("IMAGE_GENERATED");
    }

    // 5. 🚀 CRITICAL UPDATE: Zápis do DB + Změna času (posun na konec fronty)
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        seo_description: finalSeoCZ,
        seo_description_en: finalSeoEN,
        image_url: finalImage,
        updated_at: new Date().toISOString() // 🚀 TOHLE JE TEN KOUZELNÝ POSUN VE FRONTĚ
      })
      .eq('id', post.id);

    if (updateError) throw new Error("UPDATE FAIL: " + updateError.message);

    // Vymazání staré cache pro upravený článek
    revalidatePath(`/clanky/${post.slug}`);
    if (post.slug_en) revalidatePath(`/en/clanky/${post.slug_en}`);

    return NextResponse.json({ 
      status: "SUCCESS", 
      article_id: post.id,
      title: post.title,
      actions: actionTaken,
      next_action: "Dej F5 pro další krok nebo další článek."
    });

  } catch (err) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
