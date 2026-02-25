import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // TOHLE JE TO SPRÁVNÉ ID TVÉHO KANÁLU:
  const CORRECT_CHANNEL_ID = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
  
  try {
    // 1. Získáme ID playlistu "Uploads" pro tvůj správný kanál
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CORRECT_CHANNEL_ID}&part=contentDetails`
    );
    const channelData = await channelRes.json();

    const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsId) {
      return NextResponse.json({ chyba: 'Nepodařilo se najít složku videí.' }, { status: 404 });
    }

    // 2. Vytáhneme posledních 10 videí
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsId}&part=snippet&maxResults=10`
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

      // Kontrola, jestli už video v DB máme
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // Vložení nového článku
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
      zprava: `Nalezeno ${novych} nových videí, ${preskoceno} už tam bylo.`,
      kanál: "TheHardwareGuru"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
