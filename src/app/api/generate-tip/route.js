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

    // YouTube Vyhledávání (Opraveno na původní funkční URL)
    let realne
