import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Rychla kontrola, ze to bezi
    console.log('Cron spusten');

    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing API Keys' }, { status: 500 });
    }

    const parser = new Parser();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // YouTube RSS
    const channelId = 'UC_YOUR_CHANNEL_ID'; 
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'No videos found' });
    }
    
    const video = feed.items[0];

    // Check duplicate
    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).single();
    if (duplicate) {
      return NextResponse.json({ status: 'Video already processed', video: video.title });
    }

    // AI Generate
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Create a short technical summary for: ' + video.title + ' Link: ' + video.link }],
    });

    const reportContent = completion.choices[0].message.content;

    // Save
    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: reportContent,
      url: video.link 
    }]);

    return NextResponse.json({ status: 'SUCCESS', video: video.title });

  } catch (error) {
    return NextResponse.json({ error: 'Error', details: String(error) }, { status: 500 });
  }
}