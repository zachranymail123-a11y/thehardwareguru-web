/**
 * 🚀 GURU GAME ARTICLE GENERATOR - MASTER ENGINE V9
 * Vyriešené: YouTube Fallback, Anti-Duplicate logika,
 * EXTRÉMNÍ ZÁKAZ halucinování HW + STRIKTNÍ HTML STRUKTURA (Anti-Parrot).
 */

export const maxDuration = 60;
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { gameId, pin, section } = await req.json();
    
    if (pin !== process.env.GURU_PIN) {
      return NextResponse.json({ error: 'Špatný GURU PIN!' }, { status: 401 });
    }

    const apiKey = process.env.RAWG_API_KEY;

    // 1. GURU DEEP DATA MINING (RAWG)
    const [gameRes, movieRes] = await Promise.all([
      fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`),
      fetch(`https://api.rawg.io/api/games/${gameId}/movies?key=${apiKey}`)
    ]);
    
    const gameData = await gameRes.json();
    const movieData = await movieRes.json();
    
    // 🎥 GURU VIDEO DETECTION (Fáze 1: RAWG)
    let rawVideo = null;
    if (movieData.results && movieData.results.length > 0) {
        rawVideo = movieData.results[0].data?.max || movieData.results[0].data?.["480"];
    }
    if (!rawVideo) rawVideo = gameData.clip?.video;
    
    let videoId = null;
    let trailerUrl = null;

    if (rawVideo) {
        if (rawVideo.includes('youtube.com') || rawVideo.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = rawVideo.match(regExp);
            videoId = (match && match[2].length === 11) ? match[2] : null;
            if (videoId) trailerUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
            trailerUrl = rawVideo;
        }
    }

    // 🎥 GURU VIDEO DETECTION (Fáze 2: YouTube Fallback Scraper)
    if (!videoId && !trailerUrl) {
      try {
        const ytSearch = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: `${gameData.name} official game trailer youtube`, gl: 'us', hl: 'en', num: 3 })
        });
        const ytData = await ytSearch.json();
        
        const videoResult = ytData.organic?.find(r => r.link && r.link.includes('youtube.com/watch'));
        if (videoResult) {
           const match = videoResult.link.match(/[?&]v=([^&]+)/);
           if (match && match[1]) {
               videoId = match[1];
               trailerUrl = `https://www.youtube.com/embed/${videoId}`;
               console.log(`GURU YT FALLBACK SUCCESS pro hru ${gameData.name}:`, videoId);
           }
        }
      } catch (e) {
        console.error("GURU YT FALLBACK FAIL", e);
      }
    }

    // 2. TECH REŠERŠE + STEAM REQUIREMENTS (Dvojitý Serper fetch)
    const [techRes, steamRes] = await Promise.all([
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          q: `${gameData.name} PC tech engine graphics requirements analysis`, 
          gl: 'us', hl: 'en', num: 4 
        })
      }),
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          q: `"system requirements" "${gameData.name}" site:store.steampowered.com`, 
          gl: 'us', hl: 'en', num: 3 
        })
      })
    ]);
    
    const techData = await techRes.json();
    const steamData = await steamRes.json();
    
    const techContext = techData.organic?.map(r => r.snippet).join('\n') || '';
    const steamContext = steamData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. GURU AI ANALYST (S nekompromisní ochranou proti halucinacím HW a pevnou HTML kostrou)
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: `Jsi 'The Hardware Guru'. Generuješ nekompromisní technické rozbory her pro hardcore PC komunitu. 
          
          KRITICKÁ PRAVIDLA PRO STRUKTURU HTML (pole content a content_en):
          1. ZÁKAZ DUPLICITY: NIKDY nepiš na začátek textu název hry, slovíčko "Popis:" ani běžný příběhový děj! Do pole "content" piš VÝHRADNĚ technický rozbor.
          2. TVOU HTML STRUKTURU PŘIKAZUJI TAKTO:
             <h2>Technický rozbor a Engine</h2>
             <p>[Zde napiš expertní analýzu enginu, grafiky, ray-tracingu a předpokládané náročnosti na VRAM/CPU podle poskytnutých dat]</p>
             <h2>Systémové požadavky</h2>
             [Zde vlož <ul><li> seznam HW přesně podle STEAM DATA. Pokud STEAM DATA chybí, vlož sem pouze text: <p>Oficiální hardwarové specifikace zatím nebyly vývojáři stanoveny.</p>]

          KRITICKÉ PRAVIDLO PRO SYSTÉMOVÉ POŽADAVKY:
          1. Nesmíš si vymyslet ANI PÍSMENO HW komponent.
          2. Pokud [STEAM DATA] obsahují např. "Nvidia 3060 RTX", napíšeš do HTML přesně "Nvidia 3060 RTX". Žádné nahrazování za GTX 1060!
          3. Aby ses vyhnul halucinacím, ulož si čistá HW data nejprve do pole "extracted_specs".

          Vrať validní JSON s poli: extracted_specs, title, slug, description (pouze 2 věty technického shrnutí), content (CZ HTML přesně podle mé šablony), title_en, slug_en, description_en, content_en (EN HTML).` 
        },
        { 
          role: "user", 
          content: `Hra: ${gameData.name}\nO hře (jen pro tvůj kontext, nekopíruj to do textu!): ${gameData.description_raw}\n\n[TECHNICKÝ KONTEXT]:\n${techContext}\n\n[STEAM DATA - POUZE Z TOHOTO BER HW]:\n${steamContext}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // Příprava finálních dat
    const postData = {
      title: ai.title,
      slug: ai.slug,
      description: ai.description,
      content: ai.content,
      title_en: ai.title_en,
      slug_en: ai.slug_en,
      description_en: ai.description_en,
      content_en: ai.content_en,
      image_url: gameData.background_image,
      video_id: videoId,
      trailer: trailerUrl,
      youtube_url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : trailerUrl,
      type: section || 'expected'
    };

    // 4. DB UPDATE / INSERT - GURU MASTER ANTI-DUPLICATE ENGINE
    let targetId = null;

    const { data: existingSlug } = await supabaseAdmin.from('posts').select('id').eq('slug', ai.slug).maybeSingle();
    if (existingSlug) {
      targetId = existingSlug.id;
    } else {
      const { data: existingTitle } = await supabaseAdmin.from('posts').select('id').eq('title', ai.title).maybeSingle();
      if (existingTitle) {
        targetId = existingTitle.id;
      }
    }

    if (targetId) {
      const { error: updateError } = await supabaseAdmin.from('posts').update(postData).eq('id', targetId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin.from('posts').insert([postData]);
      if (insertError) throw insertError;
    }
    
    // 5. INTEGRACE MAKE.COM
    try {
      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
      if (makeWebhookUrl) {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'new_game_preview',
            title: postData.title,
            slug: postData.slug,
            description: postData.description,
            image_url: postData.image_url,
            url_cz: `https://www.thehardwareguru.cz/ocekavane-hry/${postData.slug}`,
            url_en: `https://www.thehardwareguru.cz/en/ocekavane-hry/${postData.slug_en || postData.slug}`
          })
        });
        console.log("GURU MAKE.COM WEBHOOK ODESLÁN");
      }
    } catch (makeErr) {
      console.error("GURU MAKE.COM WEBHOOK SELHAL:", makeErr);
    }

    return NextResponse.json({ success: true, slug: ai.slug });

  } catch (err) { 
    console.error("GURU GENERATOR FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
