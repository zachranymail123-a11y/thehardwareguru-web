import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Najdeme články, kde chybí SEO (bereme max 2 najednou, kvůli DALL-E timeoutu)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, image_url, type')
    .is('seo_description', null)
    .limit(2);

  if (error) return NextResponse.json({ error: 'DB Error', details: error.message });
  
  if (!posts || posts.length === 0) {
    return NextResponse.json({ message: '🦾 SEO GURU: Všechny články jsou perfektní!' });
  }

  let results = [];

  for (const post of posts) {
    try {
      // --- KROK 1: Sběr kontextu a YouTube přes Serper ---
      const videoQuery = `${post.title} ${post.type === 'game' ? 'trailer gameplay' : 'review benchmark'}`;
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: videoQuery, num: 3 })
      });
      const searchResults = await serperRes.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 1500);

      // --- KROK 2: Analýza přes gpt-4o a generování SEO dat ---
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `Jsi SEO expert a šéfredaktor HW/Gaming webu The Hardware Guru. 
            Analyzuj text a data z vyhledávání. Vrať STRIKTNÍ JSON:
            {
              "seo_description": "Úderné SEO shrnutí (max 160 znaků) s klíčovým slovem na začátku.",
              "seo_keywords": "čárkou oddělená nehledanější CZ klíčová slova (max 8).",
              "image_alt": "Popis obrázku pro Google Images (5-10 slov).",
              "youtube_url": "Z dodaného kontextu vyber POUZE validní YouTube odkaz (formát youtube.com/watch?v=...), jinak null.",
              "og_title": "Clickbait titulek pro Pinterest/FB.",
              "dalle_prompt": "Detailní anglický prompt pro DALL-E 3, který vystihuje téma článku. Styl: moderní, fotorealistický, dramatické osvětlení, žádný text v obrázku."
            }` 
          },
          { 
            role: "user", 
            content: `Název: ${post.title}\nText: ${(post.content || '').substring(0, 2000)}...\n\nYouTube data: ${rawContext}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(completion.choices[0].message.content);

      // --- KROK 3: Generování obrázku přes DALL-E 3 (pokud image_url je NULL) ---
      let finalImageUrl = post.image_url;
      if (!finalImageUrl) {
        try {
          const imageGeneration = await openai.images.generate({
            model: "dall-e-3",
            prompt: aiData.dalle_prompt,
            n: 1,
            size: "1024x1024", // Lepší čtverec pro Pinterest
          });
          finalImageUrl = imageGeneration.data[0].url;
        } catch (imgErr) {
          console.error("DALL-E chyba:", imgErr.message);
          // Záloha pro případ selhání DALL-E (např. nevhodný prompt)
          finalImageUrl = "https://thehardwareguru.cz/images/guru_placeholder.jpg";
        }
      }

      // --- KROK 4: Strukturovaná data (Schema.org) ---
      const schemaType = post.type === 'hardware' ? 'TechArticle' : 'Article';
      const seoSchema = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "headline": post.title,
        "description": aiData.seo_description,
        "image": finalImageUrl,
        "author": { "@type": "Person", "name": "The Hardware Guru" },
        "publisher": { "@type": "Organization", "name": "TheHardwareGuru.cz" }
      };

      // --- KROK 5: Zápis do databáze (s novými poli a upsert logikou) ---
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          seo_description: aiData.seo_description,
          seo_keywords: aiData.seo_keywords,
          image_alt: aiData.image_alt, // Přidej si sloupec image_alt (text)
          youtube_url: aiData.youtube_url || null,
          og_title: aiData.og_title, // Přidej si sloupec og_title (text)
          seo_schema: seoSchema, // Přidej si sloupec seo_schema (jsonb)
          image_url: finalImageUrl, // Aktualizujeme image_url, pokud byla NULL
        })
        .eq('id', post.id);

      if (updateError) throw new Error(`DB Update Error: ${updateError.message}`);

      results.push({ title: post.title, status: 'DOPLNĚNO', image: finalImageUrl });

    } catch (err) {
      results.push({ title: post.title, status: 'CHYBA', error: err.message });
    }
  }

  return NextResponse.json({ processed: results });
}
