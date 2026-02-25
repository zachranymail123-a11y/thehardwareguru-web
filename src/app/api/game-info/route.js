import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const gameName = searchParams.get('game');
  
  if (!gameName || gameName === "null") {
    return NextResponse.json({ description: "Právě streamuji a užívám si hru s komunitou! Doraz pokecat." });
  }

  try {
    // 1. SERPER - Najde fakta o hře na Googlu
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: `${gameName} video game release date story genre` })
    });
    const searchData = await serperRes.json();
    const context = searchData.organic?.[0]?.snippet || "Populární videohra.";

    // 2. OPENAI - Udělá z toho tvůj "Guru popis"
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru, 45letý HW nadšenec a streamer. Krátce a úderně (max 2 věty) popiš hru podle kontextu. Buď nadšený gamer, používej slang." },
        { role: "user", content: `Hra: ${gameName}. Kontext: ${context}` }
      ]
    });

    return NextResponse.json({ description: completion.choices[0].message.content });
  } catch (e) {
    console.error("Game Info API Error:", e);
    return NextResponse.json({ description: "Paříme tuhle pecku! Pojď se podívat na gameplay." });
  }
}
