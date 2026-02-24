// @ts-nocheck
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Kontrola klicu
    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: 'Chybi API klice v nastaveni Vercelu' }, { status: 500 });
    }

    const parser = new Parser();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 2. YouTube RSS (Dopln si ID sveho kanalu, nebo pouzij env promennou)
    // Pro test davam obecny kanal, zmen si to na svuj!
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video v RSS' });
    }
    const video = feed.items[0];

    // 3. Kontrola duplicit
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).single();
    if (duplicate) {
      return NextResponse.json({ status: 'Video uz mame hotove', video: video.title });
    }

    // 4. AI Report
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Vytvor strucny technicky souhrn pro video: ' + video.title + ' Odkaz: ' + video.link }],
    });

    const reportContent = completion.choices[0].message.content;

    // 5. Ulozeni do DB
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