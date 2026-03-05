import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET(request) {
  // Zabezpečení přes tvůj secret v URL
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
    // 1. Najdeme články, kde chybí SEO. Limit 2 je STRIKTNÍ kvůli DALL-E timeoutu!
    const { data: posts, error: dbError } = await supabase
      .from('posts')
      .select('id, title, content, image_url, type')
      .is('seo_description', null)
      .limit(2);

    if (dbError) throw dbError;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "🦾 Všechno SEO je hotové. Jsi GURU!" });
    }

    let results = [];

    for (const post of posts) {
      // 2. Najdeme relevantní YouTube video přes Serper
      const videoQuery = `${post.title} ${post.type === 'game' ? 'trailer gameplay' : 'review benchmark'}`;
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: videoQuery, num: 3 })
      });
      const searchResults = await serperRes.json();
      
      // Filtrace jen na YouTube linky pro jistotu
      const ytLinks = (searchResults.organic || [])
        .filter(item => item.link.includes('youtube.com/watch') || item.link.includes('youtu.be/'))
        .map(item => item.link);

      // 3. AI analýza a generování dat (gpt-4o)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Jsi SEO expert pro The Hardware Guru. Vrať STRIKTNÍ JSON: { \"seo_description\": \"...\", \"seo_keywords\": \"...\", \"image_alt\": \"...\", \"og_title\": \"...\", \"youtube_url\": \"...\", \"dalle_prompt\": \"...\" }" 
          },
          { 
            role: "user", 
            content: `Název: ${post.title}\nObsah: ${(post.content || "").substring(0, 1500)}\nYouTube tipy: ${ytLinks.join(', ')}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(completion.choices[0].message.content);

      // 4. Pokud chybí obrázek, vygenerujeme ho přes DALL-E 3
      let finalImageUrl = post.image_url;
      if (!finalImageUrl || finalImageUrl === "") {
        try {
          const imageRes = await openai.images.generate({
            model: "dall-e-3",
            prompt: aiData.dalle_prompt,
            size: "1024x1024"
          });
          finalImageUrl = imageRes.data[0].url;
        } catch (e) {
          console.error("DALL-E selhalo:", e.message);
        }
      }

      // 5. Schema.org struktura pro Google
      const seoSchema = {
        "@context": "https://schema.org",
        "@type": post.type === 'hardware' ? 'TechArticle' : 'Article',
        "headline": post.title,
        "image": finalImageUrl,
        "description": aiData.seo_description,
        "author": { "@type": "Organization", "name": "The Hardware Guru" }
      };

      // 6. Zápis do DB
      await supabase.from('posts').update({
        seo_description: aiData.seo_description,
        seo_keywords: aiData.seo_keywords,
        image_alt: aiData.image_alt,
        og_title: aiData.og_title,
        youtube_url: aiData.youtube_url || ytLinks[0] || null,
        seo_schema: seoSchema,
        image_url: finalImageUrl
      }).eq('id', post.id);

      results.push(post.title);
    }

    return NextResponse.json({ 
      message: `GURU FIXER: Aktualizováno ${results.length} položek.`, 
      updated: results 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
