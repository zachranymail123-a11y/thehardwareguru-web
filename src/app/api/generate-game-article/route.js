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
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN!' }, { status: 401 });

    const apiKey = process.env.RAWG_API_KEY;

    // 1. GURU DATA MINING
    const [gameRes, movieRes] = await Promise.all([
      fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`),
      fetch(`https://api.rawg.io/api/games/${gameId}/movies?key=${apiKey}`)
    ]);
    
    const gameData = await gameRes.json();
    const movieData = await movieRes.json();
    
    // GURU VIDEO LOGIC: Získáme buď ID z YouTube nebo přímý link na mp4
    const rawVideo = movieData.results?.[0]?.data?.max || gameData.clip?.video || null;
    let videoId = null;
    let trailerUrl = null;

    if (rawVideo) {
        if (rawVideo.includes('youtube.com') || rawVideo.includes('youtu.be')) {
            videoId = rawVideo.split('v=')[1]?.split('&')[0] || rawVideo.split('/').pop();
            trailerUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
            trailerUrl = rawVideo; // Přímý mp4 link
        }
    }

    // 2. TECH REŠERŠE
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${gameData.name} PC engine technical analysis system requirements`, gl: 'us', hl: 'en', num: 5 })
    });
    const searchData = await searchRes.json();
    const techContext = searchData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. AI WRITER
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. Generuješ nekompromisní technické analýzy her. Žádný marketing, jen hardware a engine." },
        { role: "user", content: `Hra: ${gameData.name}\nTechnický kontext: ${techContext}\nGeneruj JSON s poli: title, slug, description, content, title_en, slug_en, description_en, content_en.` }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 🎥 VIDEO EMBED INJECTION: Automaticky vložíme přehrávač do textu
    if (trailerUrl) {
      const isYoutube = trailerUrl.includes('youtube.com');
      const videoHtml = `
        <div class="guru-video-box" style="margin: 40px 0;">
          <h2>Oficiální Trailer / Video</h2>
          <div style="aspect-ratio:16/9; background:#000; border-radius:20px; overflow:hidden; border:1px solid #66fcf1;">
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

    // 4. DB INSERT - 🚀 GURU FIX: Zapisujeme video_id i trailer!
    const { error } = await supabaseAdmin.from('posts').insert([{
      ...ai,
      image_url: gameData.background_image,
      video_id: videoId,
      trailer: trailerUrl,
      type: section || 'expected' 
    }]);

    if (error) throw error;
    
    return NextResponse.json({ success: true, slug: ai.slug });
  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
