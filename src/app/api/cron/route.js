import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // TVOJE ID, KTERÉ JSME KONEČNĚ POTVRDILI
  const CHANNEL_ID = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
  
  try {
    // 3. KROK: Prohledáme kanál přímo přes Search (najde videa, streamy i shorts)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
      return NextResponse.json({ chyba_api: searchData.error.message }, { status: 400 });
    }

    let novych = 0;
    let preskoceno = 0;

    for (const item of searchData.items || []) {
      // Zajímají nás jen videa (ne playlisty nebo kanály)
      if (item.id.kind !== 'youtube#video') continue;

      const videoId = item.id.videoId;
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
      status: 'HOTOVO_SEARCH', 
      zprava: `Nalezeno ${novych} nových věcí, ${preskoceno} už v DB bylo.`,
      debug: { items_count: searchData.items?.length || 0 }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
