import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new Parser();

const RSS_ZDROJE = [
  "https://www.tomshardware.com/feeds/all",       
  "https://www.pcworld.com/how-to/feed",          
  "https://www.howtogeek.com/feed/"              
];

export async function GET() {
  try {
    const zamichaneZdroje = RSS_ZDROJE.sort(() => 0.5 - Math.random());
    let novyClanek = null;
    let pouzityZdroj = "";
    let checkSlug = "";

    for (const zdroj of zamichaneZdroje) {
      try {
        const feed = await parser.parseURL(zdroj);
        const clanek = feed.items[0]; 
        if (!clanek) continue;

        const slug = clanek.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const { data: existujiciTip } = await supabase.from('tipy').select('id').eq('slug', slug).single();

        if (!existujiciTip) {
          novyClanek = clanek;
          pouzityZdroj = zdroj;
          checkSlug = slug;
          break; 
        }
      } catch (err) { continue; }
    }

    if (!novyClanek) return NextResponse.json({ success: true, message: "Všechny zdroje už máš stažené." });

    // --- TVOJE NOVÁ LOGIKA: NÁVOD V BODECH ---
    const textPrompt = `
      Jsi TheHardwareGuru. Právě jsi přečetl tento technický materiál:
      Titulek: "${novyClanek.title}"
      Obsah: "${novyClanek.contentSnippet || novyClanek.summary || novyClanek.content}"

      TVŮJ ÚKOL:
      1. Pokud téma není o PC hardware, chlazení, stavbě PC, optimalizaci Windows nebo AI, vrať: {"odpad": true}
      2. Pokud je téma správné, vytvoř z něj konkrétní technický návod.
      3. "content" musí být strukturovaný návod (Problém, Řešení, Kroky 1. 2. 3.). Používej Markdown.
      
      Vrať POUZE JSON:
      {
        "title": "Úderný titulek s emoji",
        "description": "Krátké shrnutí problému (1-2 věty).",
        "content": "Zde rozepiš ten tvůj slibovaný návod v bodech 1. 2. 3. Buď věcný, technický a mluv k věci.",
        "category": "HARDWARE, SOFTWARE, nebo AI",
        "odpad": false
      }
    `;

    const aiTextResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: textPrompt }],
      response_format: { type: "json_object" }
    });

    const vygenerovanyTipText = JSON.parse(aiTextResponse.choices[0].message.content);

    if (vygenerovanyTipText.odpad) return NextResponse.json({ success: true, message: "Zahozen nepodstatný obsah." });

    // YouTube Vyhledávání
    let realneYoutubeId = null;
    const ytKeys = [process.env.YOUTUBE_API_KEY, process.env.YOUTUBE_API_KEY_2, process.env.YOUTUBE_API_KEY_3].filter(Boolean);
    for (const apiKey of ytKeys) {
      try {
        const query = encodeURIComponent(`${vygenerovanyTipText.title} pc hardware tutorial`);
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`);
        const ytData = await ytRes.json();
        if (ytData.items?.length > 0) {
          realneYoutubeId = ytData.items[0].id.videoId;
          break; 
        }
      } catch (err) {}
    }

    // Generování unikátního obrázku
    const aiImageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Cyberpunk hardware illustration: ${vygenerovanyTipText.title}. Neon purple/green lighting, dark tech background, 8k.`,
      n: 1, size: "1024x1024",
    });

    // ULOŽENÍ DO DATABÁZE (Včetně contentu)
    const finalniTip = {
      title: vygenerovanyTipText.title,
      description: vygenerovanyTipText.description,
      content: vygenerovanyTipText.content, // <--- TADY JE TEN NÁVOD
      category: vygenerovanyTipText.category,
      image_url: aiImageResponse.data[0].url,
      youtube_id: realneYoutubeId, 
      slug: checkSlug 
    };

    const { data, error } = await supabase.from('tipy').insert([finalniTip]).select();
    if (error) throw error;

    return NextResponse.json({ success: true, tip: data[0] });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
