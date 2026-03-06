/**
 * 🚀 GURU GAME ARTICLE GENERATOR - MASTER ENGINE V4
 * Vyriešené: Detekcia trailerov z viacerých zdrojov, zápis do DB a riešenie duplicít (upsert).
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

    // 1. GURU DEEP DATA MINING
    // Taháme základné info o hre + trailery (movies)
    const [gameRes, movieRes] = await Promise.all([
      fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`),
      fetch(`https://api.rawg.io/api/games/${gameId}/movies?key=${apiKey}`)
    ]);
    
    const gameData = await gameRes.json();
    const movieData = await movieRes.json();
    
    // 🎥 GURU VIDEO DETECTION LOGIC
    let rawVideo = null;
    // Skúsime nájsť najlepší trailer v movies
    if (movieData.results && movieData.results.length > 0) {
        rawVideo = movieData.results[0].data?.max || movieData.results[0].data?.["480"];
    }
    // Fallback na klip priamo v gameData
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
            trailerUrl = rawVideo; // Priamy .mp4 link
        }
    }

    // 2. TECH REŠERŠE (AI Context)
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `${gameData.name} PC tech engine graphics requirements analysis`, 
        gl: 'us', hl: 'en', num: 4 
      })
    });
    const searchData = await searchRes.json();
    const techContext = searchData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. GURU AI ANALYST
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "Jsi 'The Hardware Guru'. Generuješ nekompromisní technické rozbory. Vrať validní JSON s poli: title, slug, description, content (CZ HTML), title_en, slug_en, description_en, content_en (EN HTML)." 
        },
        { 
          role: "user", 
          content: `Hra: ${gameData.name}\nPopis z RAWG: ${gameData.description_raw}\nTechnický kontext: ${techContext}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 4. DB UPSERT - 🚀 GURU MASTER FIX: 
    // Používame .upsert() s 'onConflict: slug', aby sme prepísali staré dáta a vyhli sa chybe "duplicate key"
    const { error } = await supabaseAdmin.from('posts').upsert({
      ...ai,
      image_url: gameData.background_image,
      video_id: videoId,
      trailer: trailerUrl, // GURU FIX: Ukladáme nájdený trailer
      youtube_url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : trailerUrl, // Poistka pre stĺpec youtube_url
      type: section || 'expected' 
    }, { onConflict: 'slug' });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      throw error;
    }
    
    return NextResponse.json({ success: true, slug: ai.slug });

  } catch (err) { 
    console.error("GURU GENERATOR FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
