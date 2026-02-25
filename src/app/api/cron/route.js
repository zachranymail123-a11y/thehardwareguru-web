import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const YOUTUBE_CHANNELS = [
    { id: 'UC2_X6C2v_q_A8Y0S-Yv9TfQ', name: 'TheHardwareGuru_Czech' } 
  ];

  const API_KEY = process.env.YOUTUBE_API_KEY;
  let novych = 0;
  let preskoceno = 0;

  try {
    for (const channel of YOUTUBE_CHANNELS) {
      // 1. Získáme videa z YT
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channel.id}&part=snippet,id&order=date&maxResults=5`
      );
      const data = await res.json();

      if (!data.items) continue;

      for (const item of data.items) {
        const videoId = item.id.videoId;
        if (!videoId) continue;

        const title = item.snippet.title;
        const description = item.snippet.description;
        
        // Vytvoříme slug z nadpisu
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // 2. Kontrola, jestli už ho nemáme (podle video_id)
        const { data: existujici } = await supabase
          .from('posts')
          .select('id')
          .eq('video_id', videoId)
          .single();

        if (existujici) {
          preskoceno++;
          continue;
        }

        // 3. Uložení do databáze VČETNĚ video_id
        const { error } = await supabase.from('posts').insert([
          {
            title: title,
            slug: slug,
            video_id: videoId, // TADY UKLÁDÁME TO ID
            content: `
              <p>${description}</p>
              <p>Sledujte video přímo zde nebo na mém YouTube kanálu.</p>
              <p>https://www.youtube.com/watch?v=${videoId}</p>
            `,
            created_at: new Date().toISOString(),
          },
        ]);

        if (!error) novych++;
      }
    }

    return NextResponse.json({ status: 'DOKONČENO', novych, preskoceno });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
