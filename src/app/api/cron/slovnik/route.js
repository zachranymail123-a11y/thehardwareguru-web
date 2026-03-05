import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(request) {
  // GURU Zámek
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEO_SECRET) {
    return NextResponse.json({ error: 'Nepovolený přístup' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. NEPRŮSTŘELNÁ KONTROLA DUPLICIT (Načteme všechno, co už existuje)
    const { data: existingTerms, error: dbError } = await supabase
      .from('slovnik')
      .select('title');
      
    if (dbError) throw dbError;

    // Uděláme si seznam malými písmeny pro přesné porovnání
    const existingTitles = existingTerms ? existingTerms.map(t => t.title.toLowerCase().trim()) : [];
    const avoidList = existingTitles.length > 0 ? existingTitles.join(', ') : 'Zatím nic nemáme'; 

    // 2. SEO ŠÉFREDAKTOR (Hardcore prompt zaměřený na nejhledanější slova v CZ)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Jsi Senior SEO Expert a Hardware Guru pro thehardwareguru.cz.
          Tvůj úkol je vygenerovat 10 NEJHLEDANĚJŠÍCH pojmů z PC hardwaru a gamingu. 
          Zaměř se na klíčová slova, která lidé v Česku reálně nejčastěji zadávají do Googlu (tzv. high search volume), když řeší stavbu PC, výběr komponent nebo optimalizaci her.
          ABSOLUTNÍ ZÁKAZ generovat tyto pojmy (už je máme): ${avoidList}.
          Vrať STRIKTNĚ JSON v tomto formátu: 
          { 
            "pojmy": [ 
              { 
                "title": "Přesný název (např. Co je to Bottleneck)", 
                "slug": "cisty-url-slug-bez-diakritiky", 
                "description": "Detailní, odborné, ale čtivé vysvětlení na 2 až 3 odstavce (použij tagy <br><br> pro odřádkování). Použij HTML tagy <b> pro hlavní klíčová slova. Obsah musí být maximálně SEO friendly pro vyhledávač Google. Vysvětli co to je, jak to funguje a proč to má řešit PC hráč." 
              } 
            ] 
          }` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    
    let log = [];
    let errors = [];

    // 3. FILTR A ZÁPIS (Pokud se AI splete, vyhazovač zasáhne)
    for (const pojem of aiData.pojmy) {
      const cleanTitle = pojem.title.toLowerCase().trim();
      
      if (!existingTitles.includes(cleanTitle)) {
        
        // Sychr: Skript ještě natvrdo vyčistí slug, ať tam fakt nejsou prasárny
        const cleanSlug = pojem.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

        const { error } = await supabase
          .from('slovnik')
          .insert({
            title: pojem.title,
            slug: cleanSlug,
            description: pojem.description
          });

        if (error) {
          errors.push(`Chyba u ${pojem.title}: ${error.message}`);
        } else {
          log.push(pojem.title);
          // Přidáme hned do lokálního seznamu, kdyby AI vyplivlo 2 stejné věci naráz
          existingTitles.push(cleanTitle); 
        }
      } else {
         errors.push(`Přeskočeno (GURU Filtr chytil duplikát): ${pojem.title}`);
      }
    }

    return NextResponse.json({ 
      status: "GURU SLOVNÍK NAPLNĚN", 
      pridano: log, 
      chyby: errors 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
