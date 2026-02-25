import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const CHANNEL_ID = 'UC2_X6C2v_q_A8Y0S-Yv9TfQ'; 
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  let novych = 0;
  let preskoceno = 0;

  try {
    // 1. KROK: Zjistíme ID playlistu "Uploads" pro tvůj kanál
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CHANNEL_ID}&part=contentDetails`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      return NextResponse.json({ chyba: 'Chyba kanálu: ' + channelData.error.message }, { status: 400 });
    }

    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ chyba: 'Nepodařilo se najít playlist nahraných videí.' }, { status: 404 });
    }

    // 2. KROK: Vytáhneme videa z tohoto playlistu (tohle je 100% spolehlivé)
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=10`
    );
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json({ status: 'PRÁZDNO', zprava: 'V playlistu nejsou žádná videa.' });
    }

    for (const item of playlistData.items) {
      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description;
      
      const slug = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Kontrola duplicity
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // Vložení do DB
      const { error: insertError } = await supabase.from('posts').insert([
        {
          title: title,
          slug: slug,
          video_id: videoId,
          content: `
            <p>${description.replace(/\n/g, '<br>')}</p>
            <p><strong>Odkaz na video:</strong> https://www.youtube.com/watch?v=${videoId}</p>
          `,
          created_at: new Date().toISOString(),
        }
      ]);

      if (!insertError) novych++;
    }

    return NextResponse.json({ 
      status: 'DOKONČENO', 
      novych, 
      preskoceno,
      zprava: novych === 0 ? 'Všechna videa už v databázi máš.' : `Úspěšně přidáno ${novych} videí.`
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
