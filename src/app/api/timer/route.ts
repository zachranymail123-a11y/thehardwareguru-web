import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UC_CHANNEL_ID');
    const video = feed.items[0];

    const { data: duplicate } = await supabase.from('reports').select('id').eq('video_id', video.id).single();
    if (duplicate) return NextResponse.json({ status: 'Nic nového' });

    const ai = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: `Udělej report pro: ${video.title}` }],
    });

    await supabase.from('reports').insert([{ 
      title: video.title, 
      video_id: video.id, 
      content: ai.choices[0].message.content 
    }]);

    return NextResponse.json({ status: 'Report vytvořen', video: video.title });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}