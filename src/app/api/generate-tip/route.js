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
      response_format
