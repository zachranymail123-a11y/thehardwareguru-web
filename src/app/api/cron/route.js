import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let results = {
    videoClanek: "žádné nové video",
    hwNovinka: "negenerována"
  };

  try {
    // --- 1. ČÁST: KONTROLA YOUTUBE (VIDEA A SHORTS) ---
    const YOUTUBE_CH_ID = 'UC6O7V0u-9vO7W3zX-b_uG6A';
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${YOUTUBE_CH_ID}&part=snippet,id&order=date&maxResults=5&type=video`;
    
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.id.videoId;
        const slug = item.snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Kontrola, jestli video už máme
        const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).single();

        if (!existing) {
          const prompt = `Jsi The Hardware Guru, 45letý herní expert. Napiš vtipný a odborný článek k tvému novému videu/shortu: "${item.snippet.title}". Popis: "${item.snippet.description}". Styl: slang, tykání, pozvi na Kick stream.`;
          
          const aiRes = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }]
          });

          const content = aiRes.choices[0].message.content.replace(/```html|```/g, '').trim();

          await supabase.from('posts').insert([{
            title: item.snippet.title,
            content: content,
            video_id: videoId,
            slug: slug,
            type: 'video'
          }]);
          
          results.videoClanek = `Vytvořen: ${item.snippet.title}`;
          break; // Zpracujeme jen jedno nejnovější video
        }
      }
    }

    // --- 2. ČÁST: GENEROVÁNÍ HW NOVINKY (VŽDY) ---
    const topicPrompt = `Napiš aktuální HW novinku, únik nebo zajímavost (RTX 50-series, procesory, tech rekordy). Styl: The Hardware Guru (45 let, expert, vtipný). Na první řádek dej jen nadpis, pak text.`;
    
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: topicPrompt }]
    });

    const fullText = aiRes.choices[0].message.content.trim();
    const lines = fullText.split('\n');
    const title = lines[0].replace(/#|Title:/g, '').trim();
    const content = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();
    
    // Unikátní slug s časovou značkou, aby se daly generovat novinky každý den
    const timestamp = Date.now();
    const slugNews = `novinka-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}-${timestamp}`;

    await supabase.from('posts').insert([{
      title: title,
      content: content,
      video_id: null,
      slug: slugNews,
      type: 'news'
    }]);
    
    results.hwNovinka = `Vytvořena: ${title}`;

    return Response.json({ status: "HOTOVO", detaily: results });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
