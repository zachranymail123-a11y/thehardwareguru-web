import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const SERPER_API_KEY = process.env.SERPER_API_KEY; // Ujisti se, že se jmenuje takto ve Vercelu/Netlify

  let results = { videoClanek: "žádné nové video", hwNovinka: "negenerována" };

  try {
    // --- 1. ČÁST: YOUTUBE (ZŮSTÁVÁ) ---
    const YOUTUBE_CH_ID = 'UC6O7V0u-9vO7W3zX-b_uG6A';
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${YOUTUBE_CH_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.id.videoId;
        if (!videoId) continue;
        const slug = item.snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).maybeSingle();

        if (!existing) {
          const aiRes = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: `Jsi The Hardware Guru. Napiš článek k videu: "${item.snippet.title}". Popis: "${item.snippet.description}". Styl: herní slang, tykání, vtipné.` }]
          });
          const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();
          await supabase.from('posts').insert([{ title: item.snippet.title, content: content, video_id: videoId, slug: slug, type: 'video' }]);
          results.videoClanek = `Vytvořen: ${item.snippet.title}`;
          break;
        }
      }
    }

    // --- 2. ČÁST: HW NOVINKA PŘES SERPER (GOOGLE SEARCH) ---
    // Vyhledáme nejnovější úniky a zprávy o HW
    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: "latest hardware rumors leaks RTX Intel AMD benchmarks", gl: "us", hl: "en", tbs: "qdr:d" }) // qdr:d = za posledních 24h
    });
    const searchData = await serperRes.json();
    
    // Vezmeme úryvky z prvních 3 výsledků
    const searchContext = searchData.organic?.slice(0, 3).map(s => `${s.title}: ${s.snippet}`).join("\n") || "No new specific rumors found.";

    const topicPrompt = `Tady jsou aktuální zprávy z Googlu (v angličtině):\n${searchContext}\n\n
    Jsi The Hardware Guru (45 let, expert). Vyber z toho tu nejzajímavější věc a napiš o tom článek v češtině. 
    Dnes je únor 2026. Styl: vtipný, slang, "stará škola", expert. 
    Na první řádek dej nadpis, pak text. Nepiš anglicky!`;
    
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: topicPrompt }]
    });

    const fullText = aiRes.choices[0].message.content.trim();
    const lines = fullText.split('\n');
    const title = lines[0].replace(/#|Title:/g, '').trim();
    const content = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();
    
    const slugNews = `novinka-${Date.now()}`;

    await supabase.from('posts').insert([{
      title: title,
      content: content,
      video_id: null,
      slug: slugNews,
      type: 'news'
    }]);
    
    results.hwNovinka = `Vytvořena na základě Google search: ${title}`;

    return Response.json({ status: "HOTOVO", detaily: results });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
