import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; // GURU NOTE: Limit pro Vercel Pro, ale cílíme pod 30s

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// GURU CLEANER: Odstraňuje zbytečný úvod typu "TDP je..."
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
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    }
  );

  try {
    // 1. GURU BATCH: Načteme existující názvy pro kontrolu duplicity
    const { data: existingTerms, error: dbError } = await supabase
      .from('slovnik')
      .select('title');
      
    if (dbError) throw dbError;

    // Posíláme jen posledních 50 pojmů, ať není prompt moc dlouhý (zrychluje to start AI)
    const avoidTitles = existingTerms?.slice(-50).map(t => t.title).join(', ') || 'Nic';

    // 2. GURU SPEED GENERATION: Model "mini" odpovídá skoro okamžitě
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { 
          role: "system", 
          content: `Jsi SEO Expert pro thehardwareguru.cz. Vygeneruj 3 pokročilé pojmy z hardwaru (CZ i EN).
          ZÁKAZ: ${avoidTitles}.
          JSON formát: 
          { "pojmy": [{ 
            "title": "CZ název", "slug": "cz-slug", "description": "CZ popis (1-2 odstavce, <br><br>)", "seo_description": "CZ meta", "seo_keywords": "cz, slova",
            "title_en": "EN Title", "slug_en": "en-slug", "description_en": "EN description (1-2 odstavce, <br><br>)", "seo_description_en": "EN meta", "seo_keywords_en": "en, words" 
          }] }
          Pravidlo: Popis nesmí začínat názvem pojmu.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    const pojmyArray = aiData?.pojmy || [];
    
    let processedLog = [];
    let errorsLog = [];

    // 3. GURU PARALLEL WRITE: Všechny zápisy do DB vyřídíme naráz
    await Promise.all(pojmyArray.map(async (pojem) => {
      try {
        const rawTitle = pojem.title?.trim();
        const cleanSlug = pojem.slug?.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        
        const { error: insertError } = await supabase
          .from('slovnik')
          .insert({
            title: rawTitle,
            slug: cleanSlug,
            description: cleanDescription(rawTitle, pojem.description),
            seo_description: pojem.seo_description,
            seo_keywords: pojem.seo_keywords,
            title_en: pojem.title_en || rawTitle,
            slug_en: pojem.slug_en || cleanSlug,
            description_en: cleanDescription(pojem.title_en, pojem.description_en),
            seo_description_en: pojem.seo_description_en,
            seo_keywords_en: pojem.seo_keywords_en
          });

        if (!insertError) {
          processedLog.push(rawTitle);
        } else {
          errorsLog.push(`DB: ${insertError.message}`);
        }
      } catch (e) {
        errorsLog.push(`Processing: ${e.message}`);
      }
    }));

    return NextResponse.json({ 
      status: "GURU MINI-RUN OK", 
      pridano: processedLog, 
      chyby: errorsLog 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
