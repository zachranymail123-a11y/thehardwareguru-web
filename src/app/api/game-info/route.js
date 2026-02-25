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
    // 1. SERPER - Hledání detailů o hře
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: `${gameName} video game genre plot story` })
    });
    const searchData = await serperRes.json();
    const context = searchData.organic?.[0]?.snippet || "Populární videohra.";

    // 2. OPENAI - Guru styl popisu
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru, 45letý HW nadšenec a streamer. Krátce (max 2 věty) a úderně popiš hru. Používej gamerský slang, buď nadšený." },
        { role: "user", content: `Hra: ${gameName}. Info z webu: ${context}. Udělej z toho cool popis pro diváky.` }
      ]
    });

    return NextResponse.json({ description: completion.choices[0].message.content });
  } catch (error) {
    console.error("Game Info Error:", error);
    return NextResponse.json({ description: "Paříme tuhle pecku! Pojď se podívat na gameplay." });
  }
}
