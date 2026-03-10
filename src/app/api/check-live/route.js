import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Totální zákaz cache na úrovni Next.js

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  const kickChannel = 'TheHardwareGuru';
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const ytApiKey = process.env.YOUTUBE_API_KEY;
  const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL; 
  const nowTs = Date.now(); // Pro totální promazání cache

  try {
    let kickLive = false;
    let ytLive = false;
    let streamTitle = '';
    let ytVideoId = null;
    let kickStreamId = null;
    let thumbUrl = 'https://www.thehardwareguru.cz/bg-guru.png';

    // --- 1. KONTROLA KICKU (Agresivní cache busting) ---
    try {
      const kickRes = await fetch(`https://kick.com/api/v1/channels/${kickChannel}?t=${nowTs}`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      if (kickRes.ok) {
        const kickData = await kickRes.json();
        if (kickData.livestream) {
          kickLive = true;
          kickStreamId = kickData.livestream.id;
          streamTitle = kickData.livestream.session_title || 'Live Stream';
          thumbUrl = kickData.livestream.thumbnail?.url || thumbUrl;
        }
      }
    } catch (e) {
      console.log("Kick API nedostupné, jedeme dál...");
    }

    // --- 2. KONTROLA YOUTUBE (Agresivní cache busting) ---
    try {
      if (ytApiKey && ytChannelId) {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&type=video&eventType=live&key=${ytApiKey}&t=${nowTs}`,
          { cache: 'no-store' }
        );
        const ytData = await ytRes.json();
        if (ytData.items && ytData.items.length > 0) {
          ytLive = true;
          ytVideoId = ytData.items[0].id.videoId;
          if (!streamTitle || streamTitle === 'Live Stream') streamTitle = ytData.items[0].snippet.title;
          thumbUrl = `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;
        }
      }
    } catch (e) {
      console.log("YouTube API error:", e);
    }

    // --- 3. DATABÁZOVÝ ZÁMEK (Ten nejdůležitější krok) ---
    const { data: tracker, error: trackerError } = await supabase.from('stream_tracker').select('*').single();
    if (trackerError) throw new Error("Nelze načíst stream_tracker");

    const isAnywhereLive = kickLive || ytLive;
    
    // Unikátní ID streamu (pokud běží oboje, bereme YT jako stabilnější)
    const currentStreamId = ytVideoId 
      ? `yt-${ytVideoId}` 
      : (kickLive && kickStreamId ? `kick-${kickStreamId}` : null);

    // LOGIKA PRO ODESLÁNÍ: Musí být live, mít ID a v DB musí být "OFFLINE"
    if (isAnywhereLive && currentStreamId && !tracker.is_live) {
      
      // A) OKAMŽITÝ ZÁMEK - nejdřív zapíšeme "jsem live", pak teprve děláme zbytek
      const { error: lockError } = await supabase.from('stream_tracker').update({ 
        is_live: true, 
        last_stream_id: currentStreamId 
      }).eq('id', 1);

      if (lockError) throw new Error("Selhalo zamknutí databáze!");

      const postTitle = `🔴 GURU JE LIVE: ${streamTitle}`;
      const postSlug = `live-${currentStreamId}-${nowTs}`;
      const postDescription = `Právě vysílám na Kicku a YouTube: ${streamTitle}. Doražte!`;
      
      // B) Zápis článku
      const { error: postError } = await supabase.from('posts').insert([{
        title: postTitle,
        content: `<h1>Hardwarový nářez je LIVE!</h1><p>Právě streamujeme: <strong>${streamTitle}</strong>.</p><p><a href="https://kick.com/${kickChannel}">Sledovat na KICKU</a> | <a href="https://www.youtube.com/@TheHardwareGuru_Czech">Sledovat na YOUTUBE</a></p>`,
        slug: postSlug,
        image_url: thumbUrl,
        youtube_url: ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : 'https://kick.com/TheHardwareGuru',
        video_id: ytVideoId,
        type: 'game',
        created_at: new Date().toISOString(),
        seo_description: postDescription
      }]);

      if (postError) console.error("Článek se nevytvořil, ale sítě zkusíme odeslat...");

      // C) ODESLÁNÍ NA MAKE.COM (Jen jednou díky zámku nahoře)
      if (makeWebhookUrl) {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postTitle,
            url: `https://www.thehardwareguru.cz/clanky/${postSlug}`,
            image_url: thumbUrl,
            description: postDescription,
            type: 'live' // Důležité pro filtry v Make
          })
        });
      }

      return new Response('Live detekován a odeslán.', { status: 200 });
    }

    // RESET: Pokud nikde nevidíme stream, ale v DB visí "Live", přepneme na offline
    if (!isAnywhereLive && tracker.is_live) {
      await supabase.from('stream_tracker').update({ is_live: false }).eq('id', 1);
      return new Response('Stream ukončen, tracker vyčištěn.', { status: 200 });
    }

    return new Response('Stav se nezměnil (buď pořád Live, nebo pořád Offline).', { status: 200 });

  } catch (err) {
    console.error("Kritická chyba API:", err.message);
    return new Response('Chyba: ' + err.message, { status: 500 });
  }
}
