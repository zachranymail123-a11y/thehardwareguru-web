import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Parser from 'rss-parser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new Parser();

const RSS_ZDROJE = [
  "https://www.tomshardware.com/feeds/tutorials", 
  "https://www.pcworld.com/how-to/feed",          
  "https://www.techradar.com/rss/how-to",         
  "https://www.howtogeek.com/feed/",              
  "https://www.makeuseof.com/feed/category/diy/"  
];

export async function POST() {
  try {
    // --- KROK 1: CHYTRÉ HLEDÁNÍ NOVÉHO ČLÁNKU ---
    const zamichaneZdroje = RSS_ZDROJE.sort(() => 0.5 - Math.random());
    
    let novyClanek = null;
    let pouzityZdroj = "";
    let checkSlug = "";

    for (const zdroj of zamichaneZdroje) {
      const feed = await parser.parseURL(zdroj);
      const clanek = feed.items[0]; 
      
      if (!clanek) continue;

      const slug = clanek.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const { data: existujiciTip } = await supabase
        .from('tipy')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existujiciTip) {
        novyClanek = clanek;
        pouzityZdroj = zdroj;
        checkSlug = slug;
        break; 
      }
    }

    if (!novyClanek) {
      return NextResponse.json({ 
        success: true, 
        message: "Všechny weby mají pouze staré články. Automat čeká na další novinky.",
        preskoceno: true
      });
    }

    // --- KROK 2: VOLÁNÍ AI PRO TEXTY ---
    const textPrompt = `
      Jsi TheHardwareGuru. Přečetl jsi tento návod:
      Titulek: "${novyClanek.title}"
      Obsah: "${novyClanek.contentSnippet || novyClanek.summary}"

      Vytáhni nejdůležitější radu a přetvoř ji na krátký, úderný tip.
      Styl: Hardcore, technický, pro PC nadšence.
      Vrať POUZE čistý JSON v tomto formátu:
      {
        "title": "Úderný titulek s emoji",
        "description": "Text tipu (max 3 věty, praktické kroky)",
        "category": "Vyber jednu: HARDWARE, SOFTWARE, AI"
      }
    `;

    const aiTextResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: textPrompt }],
      response_format: { type: "json_object" }
    });

    const vygenerovanyTipText = JSON.parse(aiTextResponse.choices[0].message.content);

    // --- KROK 3: SKUTEČNÉ VYHLEDÁVÁNÍ NA YOUTUBE (S ROTACÍ KLÍČŮ) ---
    let realneYoutubeId = null;
    
    const ytKeys = [
      process.env.YOUTUBE_API_KEY,
      process.env.YOUTUBE_API_KEY_2,
      process.env.YOUTUBE_API_KEY_3
    ].filter(Boolean);

    for (const apiKey of ytKeys) {
      try {
        const query = encodeURIComponent(`${vygenerovanyTipText.title} hardware tutorial`);
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`);
        const ytData = await ytRes.json();
        
        if (ytData.error) {
          console.warn("YouTube API Key selhal, zkouším další záložní klíč...");
          continue; 
        }

        if (ytData.items && ytData.items.length > 0) {
          realneYoutubeId = ytData.items[0].id.videoId;
          break; 
        }
      } catch (err) {
        console.error("Chyba při hledání na YouTube s aktuálním klíčem:", err);
      }
    }

    // --- KROK 4: VOLÁNÍ AI PRO UNIKÁTNÍ OBRÁZEK ---
    const imagePrompt = `
      A futuristic cyberpunk illustration of a hardware component related to: "${vygenerovanyTipText.title}". 
      Use glowing neon purple and green lighting on a dark background. Photorealistic, 8k resolution, highly detailed, without any text.
    `;

    const aiImageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    });

    // --- KROK 5: ULOŽENÍ DO SUPABASE ---
    const finalniTip = {
      title: vygenerovanyTipText.title,
      description: vygenerovanyTipText.description,
      category: vygenerovanyTipText.category,
      image_url: aiImageResponse.data[0].url,
      youtube_id: realneYoutubeId, 
      slug: checkSlug 
    };

    const { data, error } = await supabase
      .from('tipy')
      .insert([finalniTip])
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      zdroj_puvodni_clanek: novyClanek.title, 
      pouzity_zdroj: pouzityZdroj,
      tip: data[0] 
    });

  } catch (error) {
    console.error("Chyba generátoru:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
