import { createClient } from '@supabase/supabase-js';

// TÍMTO NEXT.JS ZAKÁŽEME UKLÁDÁNÍ DO PAMĚTI (FIX PRO VERCEL BUILD ERROR)
export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  const kickChannel = 'TheHardwareGuru';
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const ytApiKey = process.env.YOUTUBE_API_KEY;
  const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL; 

  try {
    let kickLive = false;
    let ytLive = false;
    let streamTitle = '';
    let ytVideoId = null;
    let kickStreamId = null;
    let thumbUrl = 'https://www.thehardwareguru.cz/bg-guru.png';

    // --- 1. KONTROLA KICKU ---
    try {
      const kickRes = await fetch(`https://kick.com/api/v1/channels/${kickChannel}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
        cache: 'no-store'
      });
      const kickData = await kickRes.json();
      if (kickData.livestream) {
        kickLive = true;
        kickStreamId = kickData.livestream.id;
        streamTitle = kickData.livestream.session_title || 'Live Stream';
        thumbUrl = kickData.livestream.thumbnail?.url || thumbUrl;
      }
    } catch (e) {
      console.log("Kick parse chyba, pokračujeme na YT");
    }

    // --- 2. KONTROLA YOUTUBE ---
    try {
      if (ytApiKey && ytChannelId) {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&type=video&eventType=live&key=${ytApiKey}`,
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
      console.log("YouTube parse chyba", e);
    }

    // --- 3. LOGIKA ROZHODOVÁNÍ (ZÁMEK PROTI DUPLICITÁM) ---
    const { data: tracker } = await supabase.from('stream_tracker').select('*').single();
    const isAnywhereLive = kickLive || ytLive;
    
    // Unikátní ID z YouTube má přednost, jinak bereme unikátní ID z Kicku.
    // Pokud nemáme ani jedno, nepoužíváme náhradní názvy, aby se ID neměnilo v čase.
    const currentStreamId = ytVideoId 
      ? `yt-${ytVideoId}` 
      : (kickLive && kickStreamId ? `kick-${kickStreamId}` : null);

    // PODMÍNKA: Musíme být live, musíme mít ID a HLAVNĚ v databázi musí svítit, že jsme byli OFFLINE (is_live: false)
    if (isAnywhereLive && currentStreamId && !tracker.is_live) {
      
      // 1. OKAMŽITĚ ZAMKNEME TRACKER v databázi
      // Děláme to jako první věc, aby případný druhý souběžný proces narazil na "is_live: true" a skončil.
      await supabase.from('stream_tracker').update({ 
        is_live: true, 
        last_stream_id: currentStreamId 
      }).eq('id', 1);

      const postTitle = `🔴 MULTISTREAM: ${streamTitle}`;
      const postSlug = `live-multistream-${Date.now()}`;
      const postDescription = `Připojte se k multistreamu The Hardware Guru: ${streamTitle}.`;
      
      // 2. Zápis článku do Supabase
      const { error: postError } = await supabase.from('posts').insert([{
        title: postTitle,
        content: `
          <h1>Guru je LIVE na všech frontách!</h1>
          <p>Právě vysílám multistream: <strong>${streamTitle}</strong>.</p>
          <p>Vyber si svou oblíbenou platformu a doraž:</p>
          <ul>
            <li><a href="https://kick.com/${kickChannel}">Sledovat na KICKU</a></li>
            <li><a href="https://www.youtube.com/@TheHardwareGuru_Czech">Sledovat na YOUTUBE</a></li>
          </ul>
        `,
        slug: postSlug,
        image_url: thumbUrl,
        youtube_url: 'https://www.youtube.com/@TheHardwareGuru_Czech',
        video_id: ytVideoId,
        type: 'game',
        created_at: new Date().toISOString(),
        seo_description: postDescription
      }]);

      if (postError) throw postError;

      // 3. FIX: PAUZA 2 VTEŘINY, ABY SUPABASE STIHLA ČLÁNEK ZVEŘEJNIT
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. ODESLÁNÍ NA MAKE.COM
      if (makeWebhookUrl) {
        try {
          await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: postTitle,
              url: `https://www.thehardwareguru.cz/clanky/${postSlug}`,
              image_url: thumbUrl,
              description: postDescription,
              type: 'game'
            })
          });
        } catch (makeError) {
          console.error("Make.com neodpovídá:", makeError);
        }
      }

      return new Response('Stream zahájen a odeslán na sítě jen jednou.', { status: 200 });
    }

    // Pokud už nikde stream neběží, ale v databázi svítí "is_live: true", resetujeme to na offline
    if (!isAnywhereLive && tracker.is_live) {
      await supabase.from('stream_tracker').update({ is_live: false }).eq('id', 1);
      return new Response('Stream ukončen, tracker resetován do stavu Offline.', { status: 200 });
    }

    return new Response('Vše v pořádku. Buď už jsi nahlášen jako Live, nebo jsi stále Offline.', { status: 200 });

  } catch (err) {
    return new Response('Chyba: ' + err.message, { status: 500 });
  }
}
