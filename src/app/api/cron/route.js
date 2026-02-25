import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // Zkusíme najít kanál přímo podle handle (@TheHardwareGuru_Czech)
  const HANDLE = 'TheHardwareGuru_Czech'; 
  
  try {
    // 1. KROK: Najdeme správné ID kanálu podle handle
    const findChannel = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&forHandle=${HANDLE}&part=id,contentDetails,snippet`
    );
    const channelData = await findChannel.json();

    if (channelData.error) {
       return NextResponse.json({ CHYBA_API: channelData.error.message }, { status: 400 });
    }

    if (!channelData.items || channelData.items.length === 0) {
       return NextResponse.json({ 
         chyba: "Google nenašel kanál pod handle @TheHardwareGuru_Czech. Zkontroluj handle v kódu.",
         vystup: channelData 
       }, { status: 404 });
    }

    const channelId = channelData.items[0].id;
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. KROK: Vytáhneme videa z playlistu
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=10`
    );
    const playlistData = await playlistRes.json();

    let novych = 0;
    let preskoceno = 0;

    if (playlistData.items) {
      for (const item of playlistData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        
        const slug = title
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: existujici } = await supabase
          .from('posts')
          .select('id')
          .eq('video_id', videoId)
          .maybeSingle();

        if (existujici) {
          preskoceno++;
          continue;
        }

        const { error: insertError } = await supabase.from('posts').insert([
          {
            title: title,
            slug: slug,
            video_id: videoId,
            content: `<p>${description.replace(/\n/g, '<br>')}</p>`,
            created_at: new Date().toISOString(),
          }
        ]);

        if (!insertError) novych++;
      }
    }

    return NextResponse.json({ 
      status: 'SUCCESS', 
      nalezene_id_kanalu: channelId,
      novych, 
      preskoceno 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
