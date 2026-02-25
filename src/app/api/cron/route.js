import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // Použijeme tvůj handle - to je nejjistější cesta k tvým datům
  const HANDLE = 'TheHardwareGuru_Czech'; 
  
  try {
    // 1. KROK: Najdeme kanál a jeho Uploads playlist podle HANDLE
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&forHandle=${HANDLE}&part=contentDetails,id`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      return NextResponse.json({ chyba_api: channelData.error.message }, { status: 400 });
    }

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ 
        chyba: 'Kanál nebyl nalezen podle jména @TheHardwareGuru_Czech.', 
        debug: channelData 
      }, { status: 404 });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. KROK: Vytáhneme videa z playlistu nahrávek
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=10`
    );
    const playlistData = await playlistRes.json();

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

      // Kontrola duplicity v DB
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
      status: 'HOTOVO', 
      zprava: `Úspěšně přidáno ${novych} videí, ${preskoceno} už tam bylo.`,
      nalezene_channel_id: channelData.items[0].id
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
