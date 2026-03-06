export const maxDuration = 60; // GURU FIX: Prodloužený čas pro hloubkovou analýzu

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
    const { gameId, pin } = await req.json();
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN!' }, { status: 401 });

    const apiKey = process.env.RAWG_API_KEY;

    // 1. GURU DATA MINING (RAWG + Google Search)
    const rawgRes = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
    const gameData = await rawgRes.json();

    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `${gameData.name} PC optimization system requirements technical issues engine`, 
        gl: 'us', hl: 'en', num: 6 
      })
    });
    const searchData = await searchRes.json();
    const techContext = searchData.organic?.map(res => res.snippet).join('\n') || '';

    // 2. GURU AI WRITER (Full Auto Mode)
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: `Jsi 'The Hardware Guru'. Píšeš technicky hluboké články o nadcházejících hrách. 
          STRIKTNÍ ZÁKAZ OSEKÁVÁNÍ! Nepoužívej '...', 'atd.' nebo 'etc.'. 
          Článek musí obsahovat:
          - Technickou analýzu enginu.
          - Detailní rozbor HW nároků.
          - Guru předpověď (jak to poběží na RTX 4090 vs RTX 3060).
          - HTML formátování s <h2>, <p> a <ul>.
          Generuj JSON s poli: title, slug, content, description, title_en, slug_en, content_en, description_en.` 
        },
        { 
          role: "user", 
          content: `Hra: ${gameData.name}\nPopis: ${gameData.description_raw}\nTechnický kontext: ${techContext}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 3. DATABASE INSERT (Házíme to rovnou do Posts)
    const { data, error } = await supabaseAdmin.from('posts').insert([{
      ...ai,
      image_url: gameData.background_image,
      type: 'game',
      created_at: new Date().toISOString()
    }]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, slug: ai.slug });
  } catch (err) {
    console.error("GURU GENERATE FAIL:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
