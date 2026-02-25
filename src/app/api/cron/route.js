import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // DEFINITIVNĚ SPRÁVNÉ ID KANÁLU PRO THEHARDWAREGURU_CZECH:
  const CHANNEL_ID = 'UC2_X6C2v_q_A8Y0S-Yv9TfQ'; 
  
  try {
    // 1. Zjistíme ID playlistu "Uploads" (přidáním 'UU' místo 'UC' na začátek ID kanálu)
    // Tohle je nejspolehlivější trik YouTube API
    const uploadsId = CHANNEL_ID.replace('UC', 'UU');

    // 2. Vytáhneme posledních 10 videí přímo z playlistu nahrávek
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsId}&part=snippet&maxResults=10`
    );
    const playlistData = await playlistRes.json();

    if (playlistData.error) {
      return NextResponse.json({ chyba: playlistData.error.message }, { status: 400 });
    }

    let novych = 0;
    let preskoceno = 0;

    for (const item of playlistData.items || []) {
      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description;
      
      const slug = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Kontrola v DB
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // Vložení
      const { error: insertError } = await supabase.from('posts').insert([
        {
          title: title,
          slug: slug,
          video_id: videoId,
          content: `
            <p>${description.replace(/\n/g, '<br>')}</p>
            <p><strong>Sledujte zde:</strong> https://www.youtube.com/watch?v=${videoId}</p>
          `,
          created_at: new Date().toISOString(),
        }
      ]);

      if (!insertError) novych++;
    }

    return NextResponse.json({ 
      status: 'HOTOVO', 
      zprava: `Úspěch! Přidáno ${novych} videí, ${preskoceno} už tam bylo.`,
      id_pouziteho_playlistu: uploadsId
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
