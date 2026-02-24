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

    const channelId = 'UC_TVÉ_ID_KANÁLU'; // Doplň své ID
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ status: 'Zadne video nenalezeno' });
    }

    let processedCount = 0;
    let skippedCount = 0;

    // Projdeme všech 15 videí (feed.items)
    for (const video of feed.items) {
      // Kontrola duplicity
      const { data: duplicate } = await supabase
        .from('reports')
        .select('id')
        .eq('video_id', video.id)
        .maybeSingle();

      if (duplicate) {
        skippedCount++;
        continue; // Video už máme, jdeme na další
      }

      // AI souhrn
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Vytvoř stručný technický souhrn videa v češtině: ' + video.title }],
      });

      // Uložení
      await supabase.from('reports').insert([{ 
        title: video.title, 
        video_id: video.id, 
        content: completion.choices[0].message.content, 
        url: video.link 
      }]);

      processedCount++;
    }

    return NextResponse.json({ 
      status: 'DOKONČENO', 
      novych_videi: processedCount, 
      preskoceno: skippedCount 
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
