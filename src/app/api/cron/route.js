import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const YT_API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = "UCgDdszBhhpqkNQc6t4YOCNw";

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
    // --- YOUTUBE SEARCH (Shorts i normální videa) ---
    // maxResults nastaveno na 5, aby skript nespadl na Vercel timeoutu kvůli AI generování
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`;
    
    const ytRes = await fetch(ytUrl);
    if (!ytRes.ok) throw new Error(`YouTube API chyba: ${ytRes.status}`);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        
        // Kontrola, zda video už v DB máme
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          try {
            const prompt = `Jsi The Hardware Guru. Napiš krátký, úderný článek k mému novému videu s názvem: "${title}". 
            Popis videa: "${description}". 
            Styl: herní slang, expert, vtipné, pozvi na Kick stream. 
            Odstavce formátuj do HTML (<p>, <strong> atd.). NEPIŠ do textu hlavní nadpis (H1), ten už máme odděleně.`;
            
            const aiRes = await openai.chat.completions.create({
              model: "gpt-4-turbo-preview", // Případně změň na gpt-4o pro ještě větší rychlost
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
              results.errors.push(`Chyba u uložení ${title}: ${insertError.message}`);
            } else {
              results.vytvorenaVidea.push(title);
            }
          } catch (aiErr) {
            // Pokud spadne AI u jednoho videa, zapíšeme chybu, ale skript jede dál
            results.errors.push(`Chyba AI u ${title}: ${aiErr.message}`);
          }
        }
      }
    }

    // Vrátíme čistý JSON výsledek
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
