import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // GURU FIX: Zabití Next.js Cache!
export const maxDuration = 60; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEO_SECRET) {
    return NextResponse.json({ error: 'Nepovolený přístup' }, { status: 401 });
  }

  // GURU FIX: Vytvoření klienta, který IGNORUJE paměť prohlížeče i Vercelu
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );

  try {
    const { data: posts, error: dbError } = await supabase
      .from('posts')
      .select('id, title, content, image_url, type')
      .or('seo_description.is.null,seo_description.eq."",image_url.is.null,image_url.eq."",image_alt.is.null,og_title.is.null')
      .not('image_url', 'eq', 'error_dalle')
      .order('updated_at', { ascending: true, nullsFirst: true }) 
      .limit(4);

    if (dbError) throw dbError;
    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { message: "🦾 Všechno SEO i obrázky jsou kompletně hotové. Jsi GURU!" },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const results = await Promise.all(posts.map(async (post) => {
      try {
        const videoQuery = `${post.title} trailer review gameplay`;
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: videoQuery, num: 3 }),
          cache: 'no-store' // Pojistka i pro Google Serper
        });
        const searchResults = await serperRes.json();
        const ytLinks = (searchResults.organic || [])
          .filter(item => item.link.includes('youtube.com') || item.link.includes('youtu.be'))
          .map(item => item.link);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Jsi SEO Guru pro web thehardwareguru.cz. Vrať JSON: { \"seo_description\": \"...\", \"seo_keywords\": \"...\", \"image_alt\": \"...\", \"og_title\": \"...\", \"youtube_url\": \"...\", \"dalle_prompt\": \"...\" }" },
            { role: "user", content: `Název: ${post.title}\nObsah: ${(post.content || "").substring(0, 1000)}` }
          ],
          response_format: { type: "json_object" }
        });

        const aiData = JSON.parse(completion.choices[0].message.content);

        let finalImageUrl = post.image_url;
        let imageStatus = "Existující";

        if (!finalImageUrl || finalImageUrl === "" || finalImageUrl.includes("placeholder")) {
          try {
            const imageRes = await openai.images.generate({
              model: "dall-e-3",
              prompt: `Tech cinematic photography: ${aiData.dalle_prompt}. Professional 8k lighting.`,
              size: "1024x1024"
            });
            finalImageUrl = imageRes.data[0].url;
            imageStatus = "Vygenerován";
          } catch (e) {
            finalImageUrl = "error_dalle"; 
            imageStatus = "DALL-E Selhal (Označen jako error)";
          }
        }

        const { data: updatedRow, error: updateError } = await supabase.from('posts').update({
          seo_description: aiData.seo_description,
          seo_keywords: aiData.seo_keywords,
          image_alt: aiData.image_alt,
          og_title: aiData.og_title,
          youtube_url: aiData.youtube_url || ytLinks[0] || null,
          image_url: finalImageUrl,
          updated_at: new Date().toISOString()
        }).eq('id', post.id).select();

        if (updateError) throw updateError;
        if (!updatedRow || updatedRow.length === 0) {
           return { title: post.title, status: '❌ CHYBA ZÁPISU (Zkontroluj Service Role Key!)' };
        }

        return { title: post.title, status: `✅ OK (${imageStatus})` };

      } catch (e) {
        return { title: post.title, status: '❌ Chyba', error: e.message };
      }
    }));

    return NextResponse.json(
      { status: "GURU ENGINE RUNNING", processed: results },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
