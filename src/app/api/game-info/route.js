import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Bezpečné získání parametrů z URL
    const { searchParams } = new URL(request.url);
    const gameName = searchParams.get('game');
    
    if (!gameName || gameName === "null" || gameName === "undefined") {
      return NextResponse.json({ description: "Právě streamuji a užívám si hru s komunitou! Doraz pokecat." });
    }

    // 2. Kontrola klíčů hned na začátku
    if (!process.env.SERPER_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ description: `Hrajeme ${gameName}! Pojď se podívat na gameplay.` });
    }

    // 3. SERPER - Najde fakta o hře (v try-catch, aby pád Serperu nezabil API)
    let context = "Populární videohra.";
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: `${gameName} video game release date story genre` })
      });
      if (serperRes.ok) {
        const searchData = await serperRes.json();
        context = searchData.organic?.[0]?.snippet || context;
      }
    } catch (e) {
      console.error("Serper error:", e);
    }

    // 4. OPENAI - Guru popis
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru, 45letý HW nadšenec a streamer. Krátce a úderně (max 2 věty) popiš hru podle kontextu. Buď nadšený gamer, používej slang." },
        { role: "user", content: `Hra: ${gameName}. Kontext: ${context}` }
      ],
      max_tokens: 100
    });

    return NextResponse.json({ 
      description: completion.choices[0]?.message?.content || `Hrajeme ${gameName}! Doraz na stream.` 
    });

  } catch (error) {
    // Tady je ta nejdůležitější pojistka - i při totální chybě vrátíme OK response
    console.error("API Error:", error);
    return NextResponse.json({ description: "Paříme tuhle pecku! Pojď se podívat na gameplay." });
  }
}
