import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// Dùležité: Vynutí, aby se API spouštìlo vždy èerstvì (ne z cache)
export const dynamic = 'force-dynamic';

const parser = new Parser();

export async function GET() {
  try {
    // Kontrola Env promìnných
    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: 'Chybí API klíèe v nastavení Vercelu' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 1. Naètení YouTube RSS (nahraï ID kanálu, pokud je jiné)
    // Používám obecné ID, automat si doplní správné z tvého Env nebo natvrdo
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL(https://www.youtube.com/feeds/videos.xml?channel_id=);
    
    if (!feed.items.length) return NextResponse.json({ status: 'Žádná videa v RSS' });
    const video = feed.items[0];

    // 2. Kontrola duplicit
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).single();
    if (duplicate) {
      return NextResponse.json({ status: 'Video už je zpracované', video: video.title });
    }

    // 3. AI Analýza
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: Vytvoø struèný technický report a souhrn pro toto video:  () }],
    });

    const reportContent = completion.choices[0].message.content;

    // 4. Uložení
    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: reportContent,
      url: video.link 
    }]);

    return NextResponse.json({ status: 'SUCCESS: Report vytvoøen', video: video.title });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
