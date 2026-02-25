import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('game');
  
  if (!gameName || gameName === "null" || gameName === "undefined") {
    return NextResponse.json({ description: "Právě streamuji a užívám si hru s komunitou! Doraz pokecat." });
  }

  try {
    // 1. KONTROLA KLÍČŮ (aby to nehodilo server-side exception)
    if (!process.env.SERPER_API_KEY || !process.env.OPENAI_API_KEY) {
      console.error("Missing API Keys in Environment Variables");
      return NextResponse.json({ description: "Paříme tuhle pecku! Pojď se podívat na gameplay." });
    }

    // 2. SERPER - Najde fakta o hře na Googlu
    let context = "Populární videohra.";
    try {
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: `${gameName} video game release date story genre` }),
          cache: 'no-store'
        });
        
        if (serperRes.ok) {
            const searchData = await serperRes.json();
            context = searchData.organic?.[0]?.snippet || context;
        }
    } catch (serperErr) {
        console.error("Serper call failed:", serperErr);
    }

    // 3. OPENAI - Udělá z toho tvůj "Guru popis"
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru, 45letý HW nadšenec a streamer. Krátce (max 2 věty) a úderně popiš hru podle kontextu. Buď nadšený gamer, používej slang." },
        { role: "user", content: `Hra: ${gameName}. Kontext: ${context}` }
      ],
      max_tokens: 100
    });

    const aiDescription = completion.choices[0]?.message?.content || "Tahle hra vypadá naprosto brutálně, pojď to sledovat live!";

    return NextResponse.json({ description: aiDescription });

  } catch (e) {
    console.error("CRITICAL Game Info API Error:", e.message);
    // VRÁTÍME OK STATUS I PŘI CHYBĚ, ABY PAGE.JS NESPADL
    return NextResponse.json({ description: "Paříme tuhle pecku! Pojď se podívat na gameplay a pokecat." });
  }
}
