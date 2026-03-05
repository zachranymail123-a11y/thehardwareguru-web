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
  const startsToRemove = [`${title} je`, `${title} jsou`, `${title} (`, `co je to ${title}`];
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

  // GURU FIX: Vytvoření klienta, který natvrdo IGNORUJE paměť Next.js!
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

    // GURU FIX: Sníženo z 10 na 5, aby Vercel neshazoval Timeout 504
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Jsi Senior SEO Expert a Hardware Guru pro thehardwareguru.cz.
          Vygeneruj 5 NEJHLEDANĚJŠÍCH pokročilých pojmů z PC hardwaru/gamingu v CZ.
          ZÁKAZ generovat tyto pojmy (už je máme): ${avoidTitles}.
          
          Pravidla pro JSON:
          - Vrať STRIKTNĚ formát: { "pojmy": [ { "title": "...", "slug": "...", "description": "...", "seo_description": "...", "seo_keywords": "..." } ] }
          - title: STRIKTNĚ JEN NÁZEV POJMU (např. 'TDP'). ZÁKAZ vaty typu 'Co je to'.
          - slug: cisty-url-slug (pouze malá písmena, čísla, pomlčky).
          - description: Detailní, odborné vysvětlení na 2-3 odstavce (odřádkuj <br><br>). ZÁKAZ opakovat název pojmu na začátku, ZÁKAZ HTML tagů <b>.
          - seo_description: Úderný meta popisek pro Google (max 160 znaků). Musí nalákat ke kliknutí.
          - seo_keywords: 3 až 5 klíčových slov oddělených čárkou (např. "procesory, chlazení, teplota, spotřeba").` 
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
    } else if (aiData && aiData.slovnik && Array.isArray(aiData.slovnik)) {
      pojmyArray = aiData.slovnik;
    } else {
      throw new Error("AI vrátilo neplatný formát.");
    }
    
    let processedLog = [];
    let errorsLog = [];

    // Paralelní zpracování
    await Promise.all(pojmyArray.map(async (pojem) => {
      try {
        const rawTitle = pojem.title ? pojem.title.trim() : "Neznamo";
        const cleanSlug = pojem.slug ? pojem.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : "neplatny-slug";
        
        const finalDescription = cleanDescription(rawTitle, pojem.description);

        if (!existingSlugs.has(cleanSlug)) {
          
          // GURU FIX: Zápis i včetně SEO sloupců
          const { error: insertError } = await supabase
            .from('slovnik')
            .insert({
              title: rawTitle,
              slug: cleanSlug,
              description: finalDescription,
              seo_description: pojem.seo_description || null,
              seo_keywords: pojem.seo_keywords || null
            });

          if (insertError) {
            errorsLog.push(`DB Chyba u ${rawTitle}: ${insertError.message}`);
          } else {
            processedLog.push(rawTitle);
            existingSlugs.add(cleanSlug); 
          }
        } else {
           errorsLog.push(`Duplikát chycen (podle slugu): ${rawTitle} (${cleanSlug})`);
        }
      } catch (e) {
        errorsLog.push(`Chyba zpracování: ${e.message}`);
      }
    }));

    return NextResponse.json({ 
      status: "GURU SLOVNÍK AKTUALIZOVÁN", 
      pridano: processedLog, 
      chyby: errorsLog 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
