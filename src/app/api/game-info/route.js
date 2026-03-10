import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameName = searchParams.get('game');
    
    if (!gameName || gameName === "null") {
      return NextResponse.json({ description: "Právě streamuji pechu s komunitou! Doraz pokecat." });
    }

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ description: `Paříme ${gameName}! Pojď se podívat.` });

    // SERPER
    let context = "Populární videohra.";
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${gameName} video game release date story genre` })
      });
      const searchData = await serperRes.json();
      context = searchData.organic?.[0]?.snippet || context;
    } catch (e) {}

    // OPENAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi The Hardware Guru, 45letý HW nadšenec. Krátce (2 věty) a nadšeně popiš hru." },
        { role: "user", content: `Hra: ${gameName}. Kontext: ${context}` }
      ],
      max_tokens: 100
    });

    return NextResponse.json({ description: completion.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ description: "Streamujeme live! Pojď na gameplay." });
  }
}
