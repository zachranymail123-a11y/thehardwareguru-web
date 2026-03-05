import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; // GURU FIX: Zvýšeno na max, AI teď bude psát hodně

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Pomocná funkce na pročištění textu popisu (GURU CLEANER)
function cleanDescription(title, desc) {
  if (!desc) return "";
  let cleaned = desc.trim();
  // Odstraní zbytečné starty typu "Název pojmu je..."
  const startsToRemove = [`${title} je`, `${title} jsou`, `${title} (`, `co je to ${title}`];
  for (let start of startsToRemove) {
    if (cleaned.toLowerCase().startsWith(start.toLowerCase())) {
      cleaned = cleaned.substring(start.length).trim();
      // Odstraní případnou tečku nebo čárku na začátku a capitalize první písmeno
      cleaned = cleaned.replace(/^[,.\s]+/, '');
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      break; 
    }
  }
  return cleaned;
}

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
    // 1. GURU FIX: Načteme názvy I SLUGY pro inteligentní kontrolu
    const { data: existingTerms, error: dbError } = await supabase
      .from('slovnik')
      .select('title, slug');
      
    if (dbError) throw dbError;

    // Uděláme si Set existujících slugů (pro nejrychlejší kontrolu)
    const existingSlugs = new Set(existingTerms ? existingTerms.map(t => t.slug.toLowerCase().trim()) : []);
    
    // Seznam názvů pro prompt (ať AI ví, co už máme)
    const avoidTitles = existingTerms ? existingTerms.map(t => t.title).join(', ') : 'Zatím nic nemáme';

    // 2. SEO ŠÉFREDAKTOR (Hardcore upravený prompt pro čistotu a kvalitu)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Jsi Senior SEO Expert a Hardware Guru pro thehardwareguru.cz.
          Vygeneruj 10 NEJHLEDANĚJŠÍCH pokročilých pojmů z PC hardwaru/gamingu v CZ (high search volume).
          ZÁKAZ generovat tyto pojmy (už je máme): ${avoidTitles}.
          
          Pravidla pro JSON:
          - title: STRIKTNĚ JEN NÁZEV POJMU (např. 'TDP', 'DLSS'). ZÁKAZ používat vaty jako 'Co je to', 'Vysvětlení', 'Pojem'.
          - slug: cisty-url-slug (pouze malá písmena, čísla, pomlčky).
          - description: Detailní, odborné vysvětlení na 2-3 odstavce (odřádkuj <br><br>). Mluv přímo k věci, ZÁKAZ opakovat název pojmu na začátku, ZÁKAZ používat HTML tagy <b>, jen čistý text. Vysvětli co to je, jak to funguje a proč to má řešit PC hráč.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    
    let processedLog = [];
    let errorsLog = [];

    // 3. 🚀 GURU PARALELNÍ ENGINE (Rychlé zpracování a zápis)
    await Promise.all(aiData.pojmy.map(async (pojem) => {
      try {
        // Vyčištění a validace
        const rawTitle = pojem.title.trim();
        const cleanSlug = pojem.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        
        // Final cleaner popisu
        const finalDescription = cleanDescription(rawTitle, pojem.description);

        // Kontrola podle slugu (neprůstřelné duplicity)
        if (!existingSlugs.has(cleanSlug)) {
          
          // Zápis do DB
          const { error: insertError } = await supabase
            .from('slovnik')
            .insert({
              title: rawTitle,
              slug: cleanSlug,
              description: finalDescription
            });

          if (insertError) {
            errorsLog.push(`DB Chyba u ${rawTitle}: ${insertError.message}`);
          } else {
            processedLog.push(rawTitle);
            // Přidáme do setu, aby v rámci jedné dávky nevznikly duplicity
            existingSlugs.add(cleanSlug); 
          }
        } else {
           errorsLog.push(`Duplikát chycen (podle slugu): ${rawTitle} (${cleanSlug})`);
        }
      } catch (e) {
        errorsLog.push(`Chyba zpracování ${pojem.title}: ${e.message}`);
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
