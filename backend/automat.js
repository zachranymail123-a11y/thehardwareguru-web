// Force rebuild - pridan rss-parser do package.json
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// --- KONFIGURACE (Načítá se ze systému, ne z kódu!) ---
const YOUTUBE_CHANNEL_ID = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Kontrola, jestli klíče nechybí (pro tvůj klid v terminálu)
if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("❌ CHYBA: Chybí environmentální proměnné (klíče)! Zkontroluj nastavení ve Vercelu.");
}

const parser = new Parser();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function generujReport(nazevVidea) {
  console.log(`🤖 AI píše report pro: "${nazevVidea}"...`);
  const prompt = `
    Jsi "The Hardware Guru". Cynický, vtipný herní expert z Ostravy.
    Video: "${nazevVidea}".
    Napiš krátký, úderný report pro herní web (cca 3-4 věty).
    Styl: Drsný, vtipný, upřímný, herní slang. Žádné uvozovky.
  `;
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
    });
    return completion.choices[0].message.content;
  } catch (e) {
    return "Tenhle report AI nesežrala, ale video je určitě nářez. Sleduj!";
  }
}

async function run() {
  console.log("📡 Připojuji se k YouTube a kontroluji novinky...");
  try {
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
    
    for (const item of feed.items) {
      const videoId = item.id.replace('yt:video:', '');
      const title = item.title;
      const slug = createSlug(title);

      const { data: existing } = await supabase.from('posts').select('id').eq('video_id', videoId).single();

      if (!existing) {
        console.log(`🔥 [NOVÉ VIDEO] ${title}`);
        const aiText = await generujReport(title);
        
        const { error: insertError } = await supabase.from('posts').insert([{
          title: title,
          content: aiText,
          video_id: videoId,
          slug: slug,
          created_at: new Date(item.pubDate).toISOString()
        }]);

        if (insertError) console.error("Chyba při vkládání:", insertError.message);
        else console.log(`✅ Uloženo jako: /clanky/${slug}`);
      } else {
        console.log(`⏭️ [JIŽ MÁME] ${title}`);
      }
    }
  } catch (err) {
    console.error("❌ CHYBA:", err.message);
  }
  console.log("🏁 HOTOVO. Web je aktuální.");
}

run();

// Update pro vynuceni buildu - rss-parser fix