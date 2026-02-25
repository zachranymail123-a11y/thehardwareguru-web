import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const SERPER_API_KEY = process.env.SERPER_API_KEY;

  let results = { videoClanek: "žádné nové video", hwNovinka: "negenerována", errors: [] };

  try {
    // --- 1. ČÁST: YOUTUBE (PLAYLIST STRATEGIE) ---
    const UPLOADS_PLAYLIST_ID = 'UU6O7V0u-9vO7W3zX-b_uG6A'; 
    
    const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YOUTUBE_API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=5`;
    
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        
        if (title === "Private video" || title === "Deleted video") continue;

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          const prompt = `Jsi The Hardware Guru. Napiš článek k mému novému videu/shortu: "${title}". 
          Popis videa: "${item.snippet.description}". 
          Styl: herní slang, tykání, vtipné, pozvi na Kick stream.`;
          
          const aiRes = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }]
          });

          const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();

          const { error: insertError } = await supabase.from('posts').insert([{
            title: title,
            content: content,
            video_id: videoId,
            slug: slug,
            type: 'video'
          }]);

          if (insertError) {
            results.errors.push(`Chyba uložení videa: ${insertError.message}`);
          } else {
            results.videoClanek = `Vytvořen: ${title}`;
          }
          break; 
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
        const topicPrompt = `Tady je aktuální zpráva z internetu: "${topResult.title}: ${topResult.snippet}".
        Jsi The Hardware Guru. Napiš o tom krátký, úderný článek (novinku). 
        Styl: vtipný, slang, expert. 
        Dnes je ${new Date().toLocaleDateString('cs-CZ')}.
        Na první řádek dej nadpis, pak text.`;
        
        const aiRes = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: topicPrompt }]
        });

        const fullText = aiRes.choices[0].message.content.trim();
        const lines = fullText.split('\n');
        const title = lines[0].replace(/#|Title:/g, '').trim();
        const content = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();
        
        // --- OPRAVA URL: Vytvoříme hezký slug z nadpisu ---
        let slugNews = title
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstraní diakritiku
          .replace(/[^a-z0-9]+/g, "-") // Vše divné na pomlčky
          .replace(/(^-|-$)+/g, ""); // Odstraní pomlčky na krajích
        
        // Přidáme náhodné číslo pro unikátnost (kdyby byl stejný nadpis)
        slugNews = `${slugNews}-${Math.floor(Math.random() * 1000)}`;

        const { error: newsError } = await supabase.from('posts').insert([{
          title: title,
          content: content,
          video_id: null,
          slug: slugNews,
          type: 'news'
        }]);

        if (newsError) {
            results.errors.push(`Chyba uložení novinky: ${newsError.message}`);
        } else {
            results.hwNovinka = `Vytvořena: ${title}`;
        }
    }

    return Response.json({ status: "HOTOVO", detaily: results });

  } catch (err) {
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
