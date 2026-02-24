import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parser = new Parser();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(
      process.env.SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // YouTube RSS (Doplň si své ID kanálu)
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video' });
    }
    const video = feed.items[0];

    // Kontrola duplicity
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).maybeSingle();
    if (duplicate) {
      return NextResponse.json({ status: 'Hotovo', video: video.title });
    }

    // AI Report
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Vytvor technicky souhrn: ' + video.title }],
    });

    const reportContent = completion.choices[0].message.content;

    // Uložení do DB
    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: reportContent, 
      url: video.link 
    }]);

    return NextResponse.json({ status: 'SUCCESS', video: video.title });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}