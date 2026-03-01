import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  const kickChannel = 'TheHardwareGuru';
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const ytApiKey = process.env.YOUTUBE_API_KEY;
  // Načtení tvého Make.com webhooku přesně podle tvého Vercel nastavení
  const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL; 

  try {
    let kickLive = false;
    let ytLive = false;
    let streamTitle = '';
    let ytVideoId = null;
    let thumbUrl = 'https://www.thehardwareguru.cz/bg-guru.png';

    // --- 1. KONTROLA KICKU ---
    const kickRes = await fetch(`https://kick.com/api/v1/channels/${kickChannel}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      cache: 'no-store'
    });
    try {
      const kickData = await kickRes.json();
      if (kickData.livestream) {
        kickLive = true;
        streamTitle = kickData.livestream.session_title;
        thumbUrl = kickData.livestream.thumbnail?.url || thumbUrl;
      }
    } catch (e) {
      console.log("Kick parse chyba, pokračujeme na YT");
    }

    // --- 2. KONTROLA YOUTUBE ---
    if (ytApiKey && ytChannelId) {
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&type=video&eventType=live&key=${ytApiKey}`,
        { cache: 'no-store' }
      );
      const ytData = await ytRes.json();
      if (ytData.items && ytData.items.length > 0) {
        ytLive = true;
        ytVideoId = ytData.items[0].id.videoId;
        if (!streamTitle) streamTitle = ytData.items[0].snippet.title;
        if (thumbUrl.includes('bg-guru.png')) thumbUrl = ytData.items[0].snippet.thumbnails.high?.url;
      }
    }

    // --- 3. VYTVOŘENÍ ČLÁNKU A ODESLÁNÍ NA MAKE ---
    const { data: tracker } = await supabase.from('stream_tracker').select('*').single();
    const isAnywhereLive = kickLive || ytLive;
    
    const currentStreamId = ytVideoId ? `yt-${ytVideoId}` : (kickLive ? `kick-${Date.now()}` : null);

    if (isAnywhereLive && tracker.last_stream_id !== currentStreamId) {
      
      const postTitle = `🔴 MULTISTREAM: ${streamTitle}`;
      const postSlug = `live-multistream-${Date.now()}`;
      const postDescription = `Připojte se k multistreamu The Hardware Guru: ${streamTitle}.`;
      
      // 1. Zápis do Supabase
      const { error: postError } = await supabase.from('posts').insert([{
        title: postTitle,
        content: `
          <h1>Guru je LIVE na všech frontách!</h1>
          <p>Právě vysílám multistream: <strong>${streamTitle}</strong>.</p>
          <p>Vyber si svou oblíbenou platformu a doraž:</p>
          <ul>
            ${kickLive ? `<li><a href="https://kick.com/${kickChannel}">Sledovat na KICKU</a></li>` : ''}
            ${ytLive ? `<li><a href="https://www.youtube.com/watch?v=${ytVideoId}">Sledovat na YOUTUBE</a></li>` : ''}
          </ul>
        `,
        slug: postSlug,
        image_url: thumbUrl,
        youtube_url: ytLive ? `https://www.youtube.com/watch?v=${ytVideoId}` : null,
        video_id: ytVideoId,
        type: 'game',
        created_at: new Date().toISOString(),
        seo_description: postDescription
      }]);

      if (postError) throw postError;

      // 2. Aktualizace trackeru
      await supabase.from('stream_tracker').update({ 
        is_live: true, 
        last_stream_id: currentStreamId 
      }).eq('id', 1);

      // 3. ODESLÁNÍ NA MAKE.COM
      if (makeWebhookUrl) {
        try {
          await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: postTitle,
              url: `https://www.thehardwareguru.cz/${postSlug}`,
              image_url: thumbUrl,
              description: postDescription,
              type: 'game'
            })
          });
          console.log("Úspěšně odesláno na Make.com");
        } catch (makeError) {
          console.error("Make.com neodpovídá:", makeError);
        }
      }

      return new Response('Multistream článek publikován a odeslán na Make!', { status: 200 });
    }

    if (!isAnywhereLive && tracker.is_live) {
      await supabase.from('stream_tracker').update({ is_live: false }).eq('id', 1);
      return new Response('Stream ukončen, tracker resetován.', { status: 200 });
    }

    return new Response('Vše zkontrolováno, stav beze změny.', { status: 200 });

  } catch (err) {
    return new Response('Chyba: ' + err.message, { status: 500 });
  }
}
