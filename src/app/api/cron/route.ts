import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parser = new Parser();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // YouTube RSS - TADY si v budoucnu vloz sve ID kanalu
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video v RSS' });
    }
    const video = feed.items[0];

    // Kontrola duplicity v Supabase
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).maybeSingle();
    if (duplicate) {
      return NextResponse.json({ status: 'Video uz je zpracovano', video: video.title });
    }

    // AI Analýza
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Vytvor strucny technicky souhrn: ' + video.title + ' Odkaz: ' + video.link }],
    });

    const reportContent = completion.choices[0].message.content;

    // Uložení do DB
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