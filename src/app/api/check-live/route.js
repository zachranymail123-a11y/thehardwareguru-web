import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  const kickChannel = 'TheHardwareGuru';
  const ytChannelId = process.env.YOUTUBE_CHANNEL_ID;
  const ytApiKey = process.env.YOUTUBE_API_KEY;

  try {
    // --- 1. KONTROLA KICKU ---
    const kickRes = await fetch(`https://kick.com/api/v1/channels/${kickChannel}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    const kickStatus = kickRes.status;
    let isKickLive = false;
    let kickError = null;
    try {
      const kickData = await kickRes.json();
      isKickLive = kickData.livestream !== null;
    } catch(e) {
      kickError = "Kick blokuje přístup (vrátil HTML místo dat).";
    }

    // --- 2. KONTROLA YOUTUBE ---
    let isYTLive = false;
    let ytError = null;
    let ytStatus = null;
    
    if (ytApiKey && ytChannelId) {
      try {
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&type=video&eventType=live&key=${ytApiKey}`, { cache: 'no-store' });
        ytStatus = ytRes.status;
        const ytData = await ytRes.json();
        
        if (ytData.error) {
          ytError = ytData.error.message; // YouTube vrátil konkrétní chybu (např. špatný klíč)
        } else {
          isYTLive = ytData.items && ytData.items.length > 0;
        }
      } catch(e) {
        ytError = "Nepodařilo se spojit s YouTube API: " + e.message;
      }
    } else {
      ytError = "CHYBÍ KLÍČE: Nenalezen YOUTUBE_API_KEY nebo YOUTUBE_CHANNEL_ID ve Vercelu!";
    }

    // --- 3. KONTROLA DATABÁZE ---
    const { data: tracker, error: dbError } = await supabase.from('stream_tracker').select('*').single();

    // --- VÝPIS VÝSLEDKŮ ---
    return new Response(JSON.stringify({
      "--- KICK INFO ---": "",
      "1. HTTP Status Kick": kickStatus,
      "2. Je Kick LIVE?": isKickLive,
      "3. Kick Chyba": kickError || "OK",
      
      "--- YOUTUBE INFO ---": "",
      "4. HTTP Status YT": ytStatus || "Neproběhlo",
      "5. Je YouTube LIVE?": isYTLive,
      "6. YouTube Chyba": ytError || "OK",
      
      "--- DATABÁZE INFO ---": "",
      "7. Tracker hlásí is_live": tracker ? tracker.is_live : "Nenalezeno",
      "8. Poslední uložené ID streamu": tracker ? tracker.last_stream_id : "Nenalezeno",
      "9. Databázová chyba": dbError?.message || "OK"
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ "Kritická chyba": err.message }), { status: 500 });
  }
}
