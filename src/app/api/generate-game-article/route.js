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
    
    // Získáme trailer
    const trailerId = movieData.results?.[0]?.data?.max || gameData.clip?.video || null;

    // 2. TECH REŠERŠE
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${gameData.name} PC engine technical analysis system requirements`, gl: 'us', hl: 'en', num: 5 })
    });
    const searchData = await searchRes.json();
    const techContext = searchData.organic?.map(r => r.snippet).join('\n') || '';

    // 3. AI WRITER (Dual Language)
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. Generuješ hloubkové technické analýzy her. Žádný bullshit, jen hardware, engine a optimalizace. Vždy vrať validní JSON." },
        { role: "user", content: `Hra: ${gameData.name}\nPopis: ${gameData.description_raw}\nTechnický kontext: ${techContext}\n\nGeneruj JSON s poli: title, slug, description, content (CZ HTML), title_en, slug_en, description_en, content_en (EN HTML).` }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 🎥 VIDEO INJECTION
    if (trailerId) {
      const videoEmbed = `<h2>Oficiální Trailer</h2><div style="aspect-ratio:16/9; margin: 30px 0;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailerId}" frameborder="0" allowfullscreen style="border-radius:16px;"></iframe></div>`;
      ai.content += videoEmbed;
      ai.content_en += videoEmbed;
    }

    // 4. DB INSERT - 🚀 GURU FIX: Nastavujeme typ podle sekce (default 'expected' pro kalendář)
    const { error } = await supabaseAdmin.from('posts').insert([{
      ...ai,
      image_url: gameData.background_image,
      video_id: trailerId,
      type: section || 'expected' 
    }]);

    if (error) throw error;
    
    return NextResponse.json({ success: true, slug: ai.slug });
  } catch (err) { 
    console.error("GURU GENERATOR FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
