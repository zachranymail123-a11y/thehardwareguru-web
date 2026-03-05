import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanDescription(title, desc) {
  if (!desc) return "";
  let cleaned = desc.trim();
  const startsToRemove = [`${title} je`, `${title} jsou`, `${title} (`, `co je to ${title}`, `${title} is`, `what is ${title}`];
  for (let start of startsToRemove) {
    if (cleaned.toLowerCase().startsWith(start.toLowerCase())) {
      cleaned = cleaned.substring(start.length).trim();
      cleaned = cleaned.replace(/^[,.\s:-]+/, '');
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      break; 
    }
  }
  return cleaned;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEO_SECRET) {
    return NextResponse.json({ error: 'Nepovolený přístup' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );

  try {
    const { data: existingTerms, error: dbError } = await supabase
      .from('slovnik')
      .select('title, slug');
      
    if (dbError) throw dbError;

    const existingSlugs = new Set(existingTerms ? existingTerms.filter(t => t.slug).map(t => t.slug.toLowerCase().trim()) : []);
    const avoidTitles = existingTerms && existingTerms.length > 0 ? existingTerms.filter(t => t.title).map(t => t.title).join(', ') : 'Zatím nic nemáme';

    // GURU DUAL-LANGUAGE PROMPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Jsi Senior SEO Expert a Hardware Guru pro thehardwareguru.cz.
          Vygeneruj 5 NEJHLEDANĚJŠÍCH pokročilých pojmů z PC hardwaru/gamingu. Pro každý pojem vytvoř ČESKOU a ANGLICKOU mutaci.
          ZÁKAZ generovat tyto pojmy (už je máme): ${avoidTitles}.
          
          Pravidla pro JSON:
          - Vrať STRIKTNĚ formát: 
            { 
              "pojmy": [ 
                { 
                  "title": "CZ Název", "slug": "cz-slug", "description": "CZ popis...", "seo_description": "CZ seo...", "seo_keywords": "cz, klicova, slova",
                  "title_en": "EN Title", "slug_en": "en-slug", "description_en": "EN description...", "seo_description_en": "EN seo...", "seo_keywords_en": "en, key, words"
                } 
              ] 
            }
          - title/title_en: STRIKTNĚ JEN NÁZEV POJMU (např. 'TDP'). ZÁKAZ vaty typu 'Co je to' / 'What is'.
          - description/description_en: Detailní, odborné vysvětlení na 2-3 odstavce (odřádkuj <br><br>). ZÁKAZ opakovat název pojmu na začátku, ZÁKAZ HTML tagů <b>.
          - seo_description: Úderný meta popisek pro Google (max 160 znaků).` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    
    let pojmyArray = [];
    if (aiData && Array.isArray(aiData.pojmy)) {
      pojmyArray = aiData.pojmy;
    } else if (Array.isArray(aiData)) {
      pojmyArray = aiData;
    } else {
      throw new Error("AI vrátilo neplatný formát.");
    }
    
    let processedLog = [];
    let errorsLog = [];

    await Promise.all(pojmyArray.map(async (pojem) => {
      try {
        // Zpracování CZ
        const rawTitle = pojem.title ? pojem.title.trim() : "Neznamo";
        const cleanSlug = pojem.slug ? pojem.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : "neplatny-slug";
        const finalDesc = cleanDescription(rawTitle, pojem.description);

        // Zpracování EN
        const rawTitleEn = pojem.title_en ? pojem.title_en.trim() : rawTitle;
        const cleanSlugEn = pojem.slug_en ? pojem.slug_en.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : cleanSlug;
        const finalDescEn = cleanDescription(rawTitleEn, pojem.description_en);

        if (!existingSlugs.has(cleanSlug)) {
          
          const { error: insertError } = await supabase
            .from('slovnik')
            .insert({
              title: rawTitle,
              slug: cleanSlug,
              description: finalDesc,
              seo_description: pojem.seo_description || null,
              seo_keywords: pojem.seo_keywords || null,
              // GURU FIX: Zápis EN sloupců
              title_en: rawTitleEn,
              slug_en: cleanSlugEn,
              description_en: finalDescEn,
              seo_description_en: pojem.seo_description_en || null,
              seo_keywords_en: pojem.seo_keywords_en || null
            });

          if (insertError) {
            errorsLog.push(`DB Chyba u ${rawTitle}: ${insertError.message}`);
          } else {
            processedLog.push(`${rawTitle} (CZ+EN)`);
            existingSlugs.add(cleanSlug); 
          }
        } else {
           errorsLog.push(`Duplikát chycen: ${rawTitle}`);
        }
      } catch (e) {
        errorsLog.push(`Chyba zpracování: ${e.message}`);
      }
    }));

    return NextResponse.json({ 
      status: "GURU BILINGUAL SLOVNÍK AKTUALIZOVÁN", 
      pridano: processedLog, 
      chyby: errorsLog 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
