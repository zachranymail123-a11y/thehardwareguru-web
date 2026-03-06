/**
 * 🚀 GURU GAME ARTICLE GENERATOR - MASTER ENGINE V6
 * Vyriešené: YouTube Fallback, 100% Anti-Duplicate logika,
 * a STRIKTNÍ ZÁKAZ halucinování systémových požadavků (Steam Data Only).
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
          q: `${gameData.name} official system requirements minimum recommended Steam`, 
          gl: 'us', hl: 'en', num: 3 
        })
      })
    ]);
    
    const techData = await techRes.json();
    const steamData = await steamRes.json();
    
    const techContext = techData.organic?.map(r => r.snippet).join('\n') || '';
    const steamContext = steamData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. GURU AI ANALYST (S ochranou proti halucinacím)
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: `Jsi 'The Hardware Guru'. Generuješ nekompromisní technické rozbory. 
          STRIKTNÍ ZÁKAZ: Nikdy si nevymýšlej hardware (GPU, CPU, RAM). Pro sekci "Systémové požadavky" smíš použít VÝHRADNĚ reálná data ze sekce [STEAM DATA]. Pokud data ve [STEAM DATA] chybí, napiš jasně, že "oficiální požadavky zatím nebyly stanoveny". Žádné "ATI FireGL" a podobné nesmysly!
          Vrať validní JSON s poli: title, slug, description, content (CZ HTML), title_en, slug_en, description_en, content_en (EN HTML).` 
        },
        { 
          role: "user", 
          content: `Hra: ${gameData.name}\nPopis z RAWG: ${gameData.description_raw}\n\n[TECHNICKÝ KONTEXT]:\n${techContext}\n\n[STEAM DATA - REÁLNÉ POŽADAVKY]:\n${steamContext}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // Příprava finálních dat
    const postData = {
      ...ai,
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
    
    return NextResponse.json({ success: true, slug: ai.slug });

  } catch (err) { 
    console.error("GURU GENERATOR FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
