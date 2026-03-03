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
  "https://www.howtogeek.com/feed/",
  "https://www.theverge.com/tech/rss/index.xml",
  "https://www.guru3d.com/index.php?ct=news&action=rss",
  "https://www.anandtech.com/rss/"
];

export async function GET() {
  try {
    const zamichaneZdroje = RSS_ZDROJE.sort(() => 0.5 - Math.random());
    let novyClanek = null;
    let checkSlug = "";

    for (const zdroj of zamichaneZdroje) {
      try {
        const feed = await parser.parseURL(zdroj);
        const randomIdx = Math.floor(Math.random() * Math.min(feed.items.length, 5));
        const clanek = feed.items[randomIdx]; 
        
        if (!clanek) continue;

        const slug = clanek.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
          
        const { data: existujiciTip } = await supabase.from('tipy').select('id').eq('slug', slug).single();

        if (!existujiciTip) {
          novyClanek = clanek;
          checkSlug = slug;
          break; 
        }
      } catch (err) { continue; }
    }

    if (!novyClanek) return NextResponse.json({ success: true, message: "Guru dnes nemá co nového říct." });

    const textPrompt = `
      Jsi TheHardwareGuru, expert s 20letou praxí. Právě jsi zachytil tuto novinku:
      Titulek: "${novyClanek.title}"
      Zdroj: "${novyClanek.contentSnippet || novyClanek.content}"

      TVŮJ ÚKOL:
      1. Přetvoř toto téma na praktický Guru návod. I kdyby to byla jen novinka, najdi v ní technický přínos pro uživatele.
      2. "content" musí být strukturovaný (Problém, Guru Řešení, Postup v bodech 1. 2. 3.).
      3. Na ÚPLNÝ KONEC pole "content" VŽDY vlož tento text (na nový řádek): 
         "--- \n Pokud ti tento tip pomohl nebo ses dozvěděl něco úplně nového, zvaž podporu projektu The Hardware Guru. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme za každý dar!"

      Vrať POUZE JSON:
      {
        "title": "Guru titulek s emoji",
        "description": "Stručné info, co se čtenář naučí.",
        "content": "Technický návod s tvým support textem na konci.",
        "category": "HARDWARE, SOFTWARE, nebo AI"
      }
    `;

    const aiTextResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: textPrompt }],
      response_format: { type: "json_object" }
    });

    const vygenerovanyTipText = JSON.parse(aiTextResponse.choices[0].message.content);

    // YouTube Vyhledávání
    let realneYoutubeId = null;
    try {
      const query = encodeURIComponent(`${vygenerovanyTipText.title} hardware tutorial`);
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
      const ytData = await ytRes.json();
      if (ytData.items?.length > 0) realneYoutubeId = ytData.items[0].id.videoId;
    } catch (err) {}

    // --- GENEROVÁNÍ A TRVALÉ ULOŽENÍ OBRÁZKU ---
    let finalImageUrl = 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    try {
      const aiImageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional high-tech hardware photography: ${vygenerovanyTipText.title}. Violet and cyan cinematic lighting, focus on detail, 8k.`,
        n: 1, size: "1024x1024",
      });
      
      const tempImageUrl = aiImageResponse.data[0].url;

      // Stáhnutí z OpenAI a nahrání do Supabase
      const imageRes = await fetch(tempImageUrl);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const fileName = `tip-${Date.now()}.png`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('clanky-images')
        .upload(fileName, buffer, { contentType: 'image/png' });

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from('clanky-images')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    } catch (err) { 
      console.error("DALL-E nebo Storage selhal:", err); 
    }

    const finalniTip = {
      title: vygenerovanyTipText.title,
      description: vygenerovanyTipText.description,
      content: vygenerovanyTipText.content,
      category: vygenerovanyTipText.category,
      image_url: finalImageUrl,
      youtube_id: realneYoutubeId, 
      slug: checkSlug 
    };

    // ULOŽENÍ DO DATABÁZE
    const { data, error } = await supabase.from('tipy').insert([finalniTip]).select();
    if (error) throw error;

    // --- ODESLÁNÍ DO MAKE.COM ---
    try {
      const makeUrl = process.env.MAKE_WEBHOOK_URL; 
      if (makeUrl) {
        await fetch(makeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data[0].title,
            description: data[0].description,
            category: data[0].category,
            image_url: data[0].image_url, // Teď už trvalá URL ze Supabase
            article_url: `https://www.thehardwareguru.cz/tipy/${data[0].slug}`,
            youtube_id: data[0].youtube_id
          })
        });
      }
    } catch (makeError) {
      console.error("Chyba při odesílání do Make:", makeError);
    }

    return NextResponse.json({ 
      success: true, 
      tip: data[0],
      make_url_nacteno: process.env.MAKE_WEBHOOK_URL ? "ANO" : "NE"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
