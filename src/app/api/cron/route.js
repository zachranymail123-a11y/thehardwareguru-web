import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Vytvoříme "zásobník" klíčů. Filtr (Boolean) zajistí, že pokud nějaký zapomeneš vyplnit, skript nespadne a prostě ho přeskočí.
  const ytApiKeys = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY_2,
    process.env.YOUTUBE_API_KEY_3
  ].filter(Boolean);
  
  const CHANNEL_ID = "UCgDdszBhhpqkNQc6t4YOCNw";
  const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU'); // Levnější varianta tahání videí

  let results = { vytvorenaVidea: [], errors: [] };

  const createSafeSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  try {
    let ytData = null;
    let fetchSuccess = false;
    let lastError = "";

    // --- ROTACE KLÍČŮ ---
    // Skript zkouší jeden klíč po druhém. Pokud projde, smyčka se ukončí.
    for (const key of ytApiKeys) {
      try {
        const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=5&key=${key}`;
        const ytRes = await fetch(ytUrl);
        
        if (!ytRes.ok) {
            const errorData = await ytRes.text();
            // Uložíme si chybu, ale skript NEPADÁ, jde na další klíč
            lastError = `Klíč selhal (status ${ytRes.status}): ${errorData}`;
            console.warn(`Záložní systém: ${lastError} - přepínám na další klíč...`);
            continue; 
        }
        
        ytData = await ytRes.json();
        fetchSuccess = true;
        break; // Úspěch! Máme data, vyskakujeme ze smyčky zkoušení klíčů.
      } catch (e) {
        lastError = `Kritická chyba sítě u klíče: ${e.message}`;
        console.warn(`Záložní systém: ${lastError} - přepínám na další klíč...`);
        continue;
      }
    }

    // Pokud selhaly ÚPLNĚ VŠECHNY klíče (což je s tímto levným endpointem skoro nemožné)
    if (!fetchSuccess) {
      throw new Error(`Všechny YouTube API klíče došly nebo selhaly. Poslední chyba: ${lastError}`);
    }

    // --- ZPRACOVÁNÍ VIDEÍ ---
    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        
        if (!videoId) continue;

        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          try {
            const prompt = `Jsi The Hardware Guru. Napiš krátký, úderný článek k mému novému videu s názvem: "${title}". 
            Popis videa: "${description}". 
            Styl: herní slang, expert, vtipné, pozvi na Kick stream. 
            Odstavce formátuj do HTML (<p>, <strong> atd.). NEPIŠ do textu hlavní nadpis (H1), ten už máme odděleně.`;
            
            const aiRes = await openai.chat.completions.create({
              model: "gpt-4-turbo-preview",
              messages: [{ role: "user", content: prompt }]
            });

            const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();

            const { error: insertError } = await supabase.from('posts').insert([{
              title: title,
              content: content,
              video_id: videoId,
              slug: createSafeSlug(title),
              type: 'video',
              youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
              image_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              created_at: new Date().toISOString()
            }]);

            if (insertError) {
              results.errors.push(`Chyba DB u ${title}: ${insertError.message}`);
            } else {
              results.vytvorenaVidea.push(title);
            }
          } catch (aiErr) {
            results.errors.push(`Chyba AI u ${title}: ${aiErr.message}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "HOTOVO", detaily: results }), {
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
