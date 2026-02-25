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
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`
    );
    const data = await res.json();

    // Pokud Google vrátí chybu (např. klíč, limit), vypíše ji to sem!
    if (data.error) {
      return NextResponse.json({ 
        CHYBA_GOOGLE_API: data.error.message, 
        KOD: data.error.code 
      }, { status: 400 });
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ 
        status: 'VAROVÁNÍ', 
        zprava: 'Google nevrátil žádná videa. Zkontroluj, zda je kanál veřejný.' 
      });
    }

    for (const item of data.items) {
      const videoId = item.id.videoId;
      if (!videoId) continue; // Přeskočí věci co nejsou video (playlisty atd.)

      const title = item.snippet.title;
      const description = item.snippet.description;
      
      const slug = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Kontrola, jestli už ho nemáme
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // Vložení do databáze
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

    return NextResponse.json({ status: 'DOKONČENO', novych, preskoceno });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
