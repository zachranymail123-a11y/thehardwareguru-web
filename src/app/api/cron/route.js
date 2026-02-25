import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const SERPER_API_KEY = process.env.SERPER_API_KEY;

  let results = { vytvorenaVidea: [], hwNovinka: "negenerována", errors: [] };

  // Pomocná funkce pro vyčištění URL (slugu)
  const createSafeSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Odstraní háčky a čárky
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  try {
    // --- 1. ČÁST: YOUTUBE (Zpracuje všechna nová videa z posledních 5) ---
    const UPLOADS_PLAYLIST_ID = 'UU6O7V0u-9vO7W3zX-b_uG6A'; 
    const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YOUTUBE_API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=5`;
    
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        
        if (title === "Private video" || title === "Deleted video") continue;

        // Kontrola, zda video už máme
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          const prompt = `Jsi The Hardware Guru. Napiš článek k mému novému videu/shortu: "${title}". 
          Popis videa: "${item.snippet.description}". 
          Styl: herní slang, tykání, vtipné, pozvi na Kick stream. Buď stručný, ale úderný.`;
          
          const aiRes = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }]
          });

          const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();
          const slug = createSafeSlug(title);

          const { error: insertError } = await supabase.from('posts').insert([{
            title: title,
            content: content,
            video_id: videoId,
            slug: slug,
            type: 'video'
          }]);

          if (insertError) {
            results.errors.push(`Chyba uložení videa ${title}: ${insertError.message}`);
          } else {
            results.vytvorenaVidea.push(title);
          }
          // break; <-- TADY BYLA TA CHYBA. TEĎ TO ZPRACUJE VŠECHNY NOVINKY NAJEDNOU.
        }
      }
    }

    // --- 2. ČÁST: HW NOVINKA PŘES SERPER ---
    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: "latest hardware rumors leaks RTX Intel AMD gaming news", gl: "cz", hl: "cs", tbs: "qdr:d" }) 
    });
    const searchData = await serperRes.json();
    
    if (searchData.organic && searchData.organic.length > 0) {
        const topResult = searchData.organic[0];
        
        // Kontrola, jestli už tuhle novinku náhodou nemáme (podle titulu)
        const { data: existingNews } = await supabase.from('posts').select('id').eq('title', topResult.title).maybeSingle();

        if (!existingNews) {
            const topicPrompt = `Tady je aktuální zpráva: "${topResult.title}: ${topResult.snippet}".
            Jsi The Hardware Guru. Napiš o tom krátký, úderný článek (novinku). Styl: vtipný, slang, expert. 
            Na první řádek dej nadpis, pak text.`;
            
            const aiRes = await openai.chat.completions.create({
              model: "gpt-4-turbo-preview",
              messages: [{ role: "user", content: topicPrompt }]
            });

            const fullText = aiRes.choices[0].message.content.trim();
            const lines = fullText.split('\n');
            const newsTitle = lines[0].replace(/#|Title:/g, '').trim();
            const newsContent = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();
            const slugNews = `${createSafeSlug(newsTitle)}-${Math.floor(Math.random() * 1000)}`;

            const { error: newsError } = await supabase.from('posts').insert([{
              title: newsTitle,
              content: newsContent,
              video_id: null,
              slug: slugNews,
              type: 'news'
            }]);

            if (!newsError) results.hwNovinka = `Vytvořena: ${newsTitle}`;
        }
    }

    return Response.json({ status: "HOTOVO", detaily: results });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
