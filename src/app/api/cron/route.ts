// @ts-nocheck
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const parser = new Parser();

export async function GET() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // ID tvého kanálu (doplň si správné, nebo to nechávej na automatice)
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    if (!feed.items.length) return NextResponse.json({ status: 'Žádná videa v RSS' });
    const video = feed.items[0];

    // Kontrola, zda už to máme
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).single();
    if (duplicate) {
      return NextResponse.json({ status: 'Video už je zpracované', video: video.title });
    }

    // AI Generování
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: `Vytvoř report pro video: ${video.title} (${video.link})` }],
    });

    // Uložení
    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: completion.choices[0].message.content,
      url: video.link 
    }]);

    return NextResponse.json({ status: 'SUCCESS: Report uložen', video: video.title });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
