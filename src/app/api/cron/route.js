import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1. ZKUSÍME NAJÍT TVOJE VIDEO (VČETNĚ SHORTS)
    const YOUTUBE_CH_ID = 'UC6O7V0u-9vO7W3zX-b_uG6A'; // Tvé ID
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${YOUTUBE_CH_ID}&part=snippet,id&order=date&maxResults=5`;
    
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    let newPostCreated = false;

    if (ytData.items && ytData.items.length > 0) {
      for (const item of ytData.items) {
        const videoId = item.id.videoId;
        if (!videoId) continue;

        const slug = item.snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Kontrola, jestli už ho nemáme
        const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).single();
        if (existing) continue;

        // Máme nové video/short! Necháme AI napsat článek.
        const prompt = `Jsi The Hardware Guru, 45letý herní nadšenec. Napiš článek na základě tohoto názvu videa: "${item.snippet.title}" a popisu: "${item.snippet.description}". Styl: herní slang, tykání, vtipné, zmíni Kick stream a tvou AI.`;
        
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
          type: 'video' // Štítek pro video
        }]);

        newPostCreated = true;
        break; // Vytvoříme jeden a stačí
      }
    }

    // 2. KDYŽ NENÍ NOVÉ VIDEO, VYGENERUJEME HW NOVINKU
    if (!newPostCreated) {
      const topicPrompt = `Napiš zajímavou aktuální novinku, únik (rumor) nebo rekord ze světa hardwaru (CPU, GPU, základní desky, chladiče). Zaměř se na aktuální trendy (např. RTX 50-série, nové Ryzeny, Intel). Styl: The Hardware Guru (45 let, expert, vtipný, slang). Nadpis dej na první řádek, pak text.`;
      
      const aiRes = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: topicPrompt }]
      });

      const fullText = aiRes.choices[0].message.content.trim();
      const lines = fullText.split('\n');
      const title = lines[0].replace(/#|Title:/g, '').trim();
      const content = lines.slice(1).join('\n').replace(/```html|```/g, '').trim();
      const slug = 'hw-novinka-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);

      // Kontrola, jestli už tenhle slug náhodou nemáme (prevence duplicit)
      const { data: existingHw } = await supabase.from('posts').select('id').eq('slug', slug).single();
      
      if (!existingHw) {
        await supabase.from('posts').insert([{
          title: title,
          content: content,
          video_id: null, // Žádné video
          slug: slug,
          type: 'news' // Štítek pro novinku
        }]);
      }
    }

    return Response.json({ status: "HOTOVO" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
