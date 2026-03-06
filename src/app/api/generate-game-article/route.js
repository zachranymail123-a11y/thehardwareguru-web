/**
 * 🚀 GURU GAME ARTICLE GENERATOR - MASTER ENGINE
 * Obsahuje: Trailer Detection, Dual-Language AI, DB Upsert (Anti-Duplicate)
 */

export const maxDuration = 60; // GURU FIX: Prevence timeoutu na Vercelu
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// GURU ADMIN: Používáme SERVICE_ROLE_KEY pro zápis bez omezení RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { gameId, pin, section } = await req.json();
    
    // 🛡️ GURU SECURITY SHIELD
    if (pin !== process.env.GURU_PIN) {
      return NextResponse.json({ error: 'Špatný GURU PIN!' }, { status: 401 });
    }

    const apiKey = process.env.RAWG_API_KEY;

    // 1. GURU DATA MINING (Hra + Trailery)
    const [gameRes, movieRes] = await Promise.all([
      fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`),
      fetch(`https://api.rawg.io/api/games/${gameId}/movies?key=${apiKey}`)
    ]);
    
    const gameData = await gameRes.json();
    const movieData = await movieRes.json();
    
    // 🎥 GURU VIDEO LOGIC: Identifikace typu videa (YouTube vs Direct MP4)
    const rawVideo = movieData.results?.[0]?.data?.max || gameData.clip?.video || null;
    let videoId = null;
    let trailerUrl = null;

    if (rawVideo) {
        if (rawVideo.includes('youtube.com') || rawVideo.includes('youtu.be')) {
            videoId = rawVideo.split('v=')[1]?.split('&')[0] || rawVideo.split('/').pop();
            trailerUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
            trailerUrl = rawVideo; // Přímý link na soubor
        }
    }

    // 2. TECH REŠERŠE (Serper Google Search)
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `${gameData.name} PC game engine technical analysis requirements RTX features`, 
        gl: 'us', hl: 'en', num: 6 
      })
    });
    const searchData = await searchRes.json();
    const techContext = searchData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. GURU AI ANALYST (Dual Language Generation)
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "Jsi 'The Hardware Guru'. Generuješ nekompromisní technické analýzy her. Žádný marketingový bullshit, jen hardware, engine, VRAM a optimalizace. Vždy vrať validní JSON s CZ i EN verzí." 
        },
        { 
          role: "user", 
          content: `Hra: ${gameData.name}\nPopis z RAWG: ${gameData.description_raw}\nTechnický kontext: ${techContext}\n\nGeneruj JSON s poli: title, slug, description, content (CZ HTML), title_en, slug_en, description_en, content_en (EN HTML).` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 🎥 VIDEO INJECTION: Automaticky vložíme video box do HTML obsahu
    if (trailerUrl) {
      const isYoutube = trailerUrl.includes('youtube.com') || trailerUrl.includes('embed');
      const videoHtml = `
        <div class="guru-video-injection" style="margin: 40px 0;">
          <h2>Technická Video-Ukázka</h2>
          <div style="aspect-ratio:16/9; background:#000; border-radius:24px; overflow:hidden; border:1px solid #66fcf1; box-shadow: 0 0 30px rgba(102,252,241,0.1);">
            ${isYoutube 
              ? `<iframe width="100%" height="100%" src="${trailerUrl}" frameborder="0" allowfullscreen></iframe>`
              : `<video width="100%" height="100%" controls poster="${gameData.background_image}"><source src="${trailerUrl}" type="video/mp4"></video>`
            }
          </div>
        </div>
      `;
      ai.content += videoHtml;
      ai.content_en += videoHtml;
    }

    // 4. DB UPSERT - 🚀 GURU MASTER FIX: Přepisujeme článek, pokud už existuje (onConflict: 'slug')
    const { error } = await supabaseAdmin.from('posts').upsert([{
      ...ai,
      image_url: gameData.background_image,
      video_id: videoId,
      trailer: trailerUrl,
      type: section || 'expected' 
    }], { onConflict: 'slug' });

    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      slug: ai.slug,
      message: `GURU SYSTEM: Preview pro ${gameData.name} bylo úspěšně vygenerováno a zapsáno.`
    });

  } catch (err) { 
    console.error("GURU GENERATOR FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
