import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const SERPER_API_KEY = process.env.SERPER_API_KEY;
  const YT_API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = "UCgDdszBhhpqkNQc6t4YOCNw";

  let results = { vytvorenaVidea: [], hwNovinka: "negenerována", errors: [] };

  const createSafeSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  try {
    // --- 1. ČÁST: YOUTUBE SEARCH (Najde Shorts, VODs i klasická videa) ---
    // Používáme search endpoint, který je pro čerstvý obsah nejspolehlivější
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
    
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        
        // Kontrola, zda video už v DB máme
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          const prompt = `Jsi The Hardware Guru. Napiš článek k mému novému obsahu (video/short/záznam): "${title}". 
          Popis: "${description}". 
          Styl: herní slang, expert, vtipné, pozvi na Kick stream. Piš úderně.`;
          
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
            type: 'video'
          }]);

          if (!insertError) results.vytvorenaVidea.push(title);
        }
      }
    }

    // --- 2. ČÁST: HW NOVINKA (ROTACE TÉMAT) ---
    const newsQueries = [
      "latest NVIDIA RTX 5090 leaks rumors",
      "AMD Ryzen Zen 5 benchmarks news",
      "Intel Arrow Lake release date rumors",
      "handheld gaming news Steam Deck 2 MSI Claw",
      "hardware price trends 2026 gaming",
      "new PC cases and cooling tech 2026"
    ];
    
    const randomQuery = newsQueries[Math.floor(Math.random() * newsQueries.length)];

    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: randomQuery, gl: "cz", hl: "cs", tbs: "qdr:d" }) 
    });
    const searchData = await serperRes.json();
    
    if (searchData.organic && searchData.organic.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(3, searchData.organic.length));
        const topResult = searchData.organic[randomIndex];
        
        const { data: existingNews } = await supabase.from('posts').select('id').eq('title', topResult.title).maybeSingle();

        if (!existingNews) {
            const topicPrompt = `Téma: "${topResult.title}". Info: "${topResult.snippet}". Jsi The Hardware Guru. Napiš o tom úderný článek. Styl: slang, vtipný, expert. První řádek nadpis (bez hvězdiček), pak text.`;
            
            const aiRes = await openai.chat.completions.create({
              model: "gpt-4-turbo-preview",
              messages: [{ role: "user", content: topicPrompt }]
            });

            const fullText = aiRes.choices[0].message.content.trim();
            const lines = fullText.split('\n');
            const newsTitle = lines[0].replace(/[#*]/g, '').trim();
            const newsContent = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();

            const { error: newsError } = await supabase.from('posts').insert([{
              title: newsTitle,
              content: newsContent,
              video_id: null,
              slug: `${createSafeSlug(newsTitle)}-${Math.floor(Math.random() * 1000)}`,
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
