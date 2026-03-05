import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Důležité pro DALL-E (pokud jsi na Pro plánu Vercelu)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEO_SECRET) {
    return NextResponse.json({ error: 'Nepovolený přístup' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. GURU QUERY: Vybereme články, které SEO fakt potřebují. 
    // Limit 4 je optimální pro paralelní běh pod 30-60 sekundami.
    const { data: posts, error: dbError } = await supabase
      .from('posts')
      .select('id, title, content, image_url, type')
      .or('seo_description.is.null,seo_description.eq."",image_url.is.null,image_url.eq.""')
      .order('created_at', { ascending: false }) // Bereme nejnovější nejdřív
      .limit(4);

    if (dbError) throw dbError;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "🦾 Všechno SEO i obrázky jsou hotové. Jsi GURU!" });
    }

    // 2. PARALELNÍ ENGINE
    const results = await Promise.all(posts.map(async (post) => {
      try {
        // A. Najdeme YouTube video (Serper)
        const videoQuery = `${post.title} ${post.type === 'game' ? 'official trailer gameplay' : 'hardware review benchmark'}`;
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: videoQuery, num: 3 })
        });
        const searchResults = await serperRes.json();
        const ytLinks = (searchResults.organic || [])
          .filter(item => item.link.includes('youtube.com/watch') || item.link.includes('youtu.be/'))
          .map(item => item.link);

        // B. AI generování dat (Guru styl - Google Optimized)
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: "Jsi Senior SEO expert a hardware guru. Piš v Guru stylu (technicky přesně, ale srozumitelně). SEO description musí začínat akčním slovesem. Vrať JSON: { \"seo_description\": \"...\", \"seo_keywords\": \"...\", \"image_alt\": \"...\", \"og_title\": \"...\", \"youtube_url\": \"...\", \"dalle_prompt\": \"...\" }" 
            },
            { 
              role: "user", 
              content: `Název: ${post.title}\nObsah: ${(post.content || "").substring(0, 1200)}\nYouTube: ${ytLinks.join(', ')}` 
            }
          ],
          response_format: { type: "json_object" }
        });

        const aiData = JSON.parse(completion.choices[0].message.content);

        // C. Generování obrázku jen pokud fakt chybí
        let finalImageUrl = post.image_url;
        if (!finalImageUrl || finalImageUrl === "" || finalImageUrl.includes("placeholder")) {
          const imageRes = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Highly detailed cinematic tech photography of: ${aiData.dalle_prompt}. Cyberpunk aesthetic, 8k, hardware guru style.`,
            size: "1024x1024"
          });
          finalImageUrl = imageRes.data[0].url;
        }

        // D. Schema.org (Google snippet optimization)
        const seoSchema = {
          "@context": "https://schema.org",
          "@type": post.type === 'hardware' ? 'TechArticle' : 'Article',
          "headline": post.title,
          "image": finalImageUrl,
          "description": aiData.seo_description,
          "author": { "@type": "Person", "name": "The Hardware Guru", "url": "https://youtube.com/@TheHardwareGuru_Czech" }
        };

        // E. UPDATE DB
        const { error: updateError } = await supabase.from('posts').update({
          seo_description: aiData.seo_description,
          seo_keywords: aiData.seo_keywords,
          image_alt: aiData.image_alt,
          og_title: aiData.og_title,
          youtube_url: aiData.youtube_url || ytLinks[0] || null,
          seo_schema: seoSchema,
          image_url: finalImageUrl,
          updated_at: new Date().toISOString() // Příznak, že jsme na to sáhli
        }).eq('id', post.id);

        if (updateError) throw updateError;
        return { title: post.title, status: '✅ OK' };

      } catch (e) {
        console.error(`GURU ERROR u ${post.title}:`, e.message);
        return { title: post.title, status: '❌ Chyba', error: e.message };
      }
    }));

    return NextResponse.json({ 
      status: "GURU ENGINE RUNNING",
      processed: results 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
