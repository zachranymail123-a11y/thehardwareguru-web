import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Necháme pro jistotu maximum

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const ytApiKeys = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY_2,
    process.env.YOUTUBE_API_KEY_3
  ].filter(Boolean);
  
  const CHANNEL_ID = "UCgDdszBhhpqkNQc6t4YOCNw";
  const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU');

  let results = { vytvorenaVidea: [], errors: [] };

  const createSafeSlug = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const parseDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return (hours * 3600) + (minutes * 60) + seconds;
  };

  try {
    let videosData = null;
    let fetchSuccess = false;
    let lastError = "";

    // --- 1. ROTACE KLÍČŮ A STAŽENÍ DAT ---
    for (const key of ytApiKeys) {
      try {
        const ytListUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=15&key=${key}`;
        const ytListRes = await fetch(ytListUrl);
        if (!ytListRes.ok) throw new Error(await ytListRes.text());
        const ytListData = await ytListRes.json();

        const videoIds = ytListData.items.map(i => i.snippet.resourceId.videoId).filter(Boolean).join(',');

        const ytVideosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${key}`;
        const ytVideosRes = await fetch(ytVideosUrl);
        if (!ytVideosRes.ok) throw new Error(await ytVideosRes.text());
        videosData = await ytVideosRes.json();

        fetchSuccess = true;
        break; 
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }

    if (!fetchSuccess) {
      throw new Error(`Selhaly YouTube klíče. Chyba: ${lastError}`);
    }

    // --- 2. TŘÍDĚNÍ NA SHORTS A VIDEA ---
    let foundVideos = [];
    let foundShorts = [];

    for (const item of videosData.items) {
      const durationSec = parseDuration(item.contentDetails.duration);
      if (durationSec <= 185) {
        foundShorts.push(item);
      } else {
        foundVideos.push(item);
      }
    }

    const targetVideos = foundVideos.slice(0, 1);
    const targetShorts = foundShorts.slice(0, 3);
    const toProcess = [...targetVideos, ...targetShorts];

    // --- 3. PARALELNÍ GENEROVÁNÍ AI ČLÁNKŮ (Super rychlé) ---
    // Místo "for" cyklu použijeme mapování a spustíme všechny naráz
    const processPromises = toProcess.map(async (item) => {
      const videoId = item.id;
      const title = item.snippet.title;
      const description = item.snippet.description;
      const isShort = foundShorts.includes(item);
      
      const finalYoutubeUrl = isShort 
        ? `https://www.youtube.com/shorts/${videoId}` 
        : `https://www.youtube.com/watch?v=${videoId}`;

      const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

      if (!existing) {
        try {
          const videoTypeLabel = isShort ? "YouTube Short" : "záznamu streamu / dlouhému videu";
          
          const prompt = `Jsi The Hardware Guru. Napiš krátký, úderný článek k mému novému ${videoTypeLabel} s názvem: "${title}". 
          Popis videa: "${description}". 
          Styl: herní slang, expert, vtipné, pozvi na Kick stream. 
          Odstavce formátuj do HTML (<p>, <strong> atd.). NEPIŠ do textu hlavní nadpis (H1), ten už máme odděleně.`;
          
          // Změněno na gpt-4o pro brutální zrychlení
          const aiRes = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "user", content: prompt }]
          });

          const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();
          const uniqueSlug = `${createSafeSlug(title)}-${videoId}`;

          const { error: insertError } = await supabase.from('posts').insert([{
            title: title,
            content: content,
            video_id: videoId,
            slug: uniqueSlug,
            type: isShort ? 'short' : 'video', 
            youtube_url: finalYoutubeUrl,
            image_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            created_at: new Date().toISOString()
          }]);

          if (insertError) {
            results.errors.push(`Chyba DB u ${title}: ${insertError.message}`);
          } else {
            results.vytvorenaVidea.push(`${isShort ? '[SHORT]' : '[VIDEO]'} ${title}`);
          }
        } catch (aiErr) {
          results.errors.push(`Chyba AI u ${title}: ${aiErr.message}`);
        }
      }
    });

    // Zde počkáme, až se zpracují všechny 4 články paralelně ve stejném čase
    await Promise.all(processPromises);

    return new Response(JSON.stringify({ status: "HOTOVO", zpracovano: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Kritická chyba Cronu:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
