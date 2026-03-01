import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  const kickChannel = 'TheHardwareGuru';
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const ytApiKey = process.env.YOUTUBE_API_KEY;

  try {
    let kickLive = false;
    let ytLive = false;
    let streamTitle = '';
    let ytVideoId = null;
    let thumbUrl = 'https://www.thehardwareguru.cz/bg-guru.png';

    // 1. KONTROLA KICKU
    const kickRes = await fetch(`https://kick.com/api/v1/channels/${kickChannel}`, { cache: 'no-store' });
    const kickData = await kickRes.json();
    if (kickData.livestream) {
      kickLive = true;
      streamTitle = kickData.livestream.session_title;
      thumbUrl = kickData.livestream.thumbnail?.url || thumbUrl;
    }

    // 2. KONTROLA YOUTUBE
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

    // --- LOGIKA MULTISTREAMU ---
    const { data: tracker } = await supabase.from('stream_tracker').select('*').single();
    const isAnywhereLive = kickLive || ytLive;

    // Pokud jsi live a ještě jsme pro tuto "relaci" nevytvořili článek
    if (isAnywhereLive && !tracker.is_live) {
      
      const postTitle = `🔴 MULTISTREAM: ${streamTitle}`;
      const postSlug = `live-multistream-${Date.now()}`;
      
      // Vložíme jeden článek s oběma odkazy
      const { error: postError } = await supabase.from('posts').insert([{
        title: postTitle,
        content: `
          <h1>Guru je LIVE na všech frontách!</h1>
          <p>Právě vysílám multistream: <strong>${streamTitle}</strong>.</p>
          <p>Vyber si svou oblíbenou platformu a doraž:</p>
          <ul>
            <li><a href="https://kick.com/${kickChannel}">Sledovat na KICKU</a></li>
            ${ytLive ? `<li><a href="https://www.youtube.com/watch?v=${ytVideoId}">Sledovat na YOUTUBE</a></li>` : ''}
          </ul>
        `,
        slug: postSlug,
        image_url: thumbUrl,
        youtube_url: ytLive ? `https://www.youtube.com/watch?v=${ytVideoId}` : null,
        video_id: ytVideoId,
        type: 'game',
        published: true,
        created_at: new Date().toISOString(),
        seo_description: `Připojte se k multistreamu The Hardware Guru: ${streamTitle}.`
      }]);

      if (postError) throw postError;

      // Označíme v trackeru, že jsme live (aby se článek neopakoval)
      await supabase.from('stream_tracker').update({ 
        is_live: true, 
        last_stream_id: ytVideoId || 'kick-live' 
      }).eq('id', 1);

      console.log("Multistream článek publikován.");
    }

    // Pokud už nikde nejsi live, resetujeme tracker pro příště
    if (!isAnywhereLive && tracker.is_live) {
      await supabase.from('stream_tracker').update({ is_live: false }).eq('id', 1);
      console.log("Stream ukončen, tracker resetován.");
    }

    return new Response('Multistream check OK');

  } catch (err) {
    return new Response('Chyba: ' + err.message, { status: 500 });
  }
}
