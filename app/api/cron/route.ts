import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: 'Chybi API klice' }, { status: 500 });
    }

    const parser = new Parser();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video v RSS' });
    }
    const video = feed.items[0];

    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).maybeSingle();
    
    if (duplicate) {
      return NextResponse.json({ status: 'Video uz mame hotove', video: video.title });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Vytvor strucny technicky souhrn pro video: ' + video.title + ' Odkaz: ' + video.link }],
    });

    const reportContent = completion.choices[0].message.content;

    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: reportContent,
      url: video.link 
    }]);

    return NextResponse.json({ status: 'SUCCESS: Report vytvoren', video: video.title });

  } catch (error) {
    return NextResponse.json({ error: 'Chyba serveru', details: String(error) }, { status: 500 });
  }
}