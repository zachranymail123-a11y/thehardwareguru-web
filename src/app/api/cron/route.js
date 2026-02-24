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

    // Tady doplň ID svého YouTube kanálu
    const channelId = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${UCgDdszBhhpqkNQc6t4YOCNw}`);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video nenalezeno' });
    }

    const video = feed.items[0];

    // Kontrola duplicity v Supabase
    const { data: duplicate } = await supabase
      .from('reports')
      .select('id')
      .eq('video_id', video.id)
      .maybeSingle();

    if (duplicate) {
      return NextResponse.json({ status: 'Uz existuje', title: video.title });
    }

    // AI souhrn přes OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Vytvoř stručný a výstižný technický souhrn videa v češtině: ' + video.title }],
    });

    // Uložení do Supabase
    const { error } = await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: completion.choices[0].message.content, 
      url: video.link 
    }]);

    if (error) throw error;

    return NextResponse.json({ status: 'SUCCESS', title: video.title });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
