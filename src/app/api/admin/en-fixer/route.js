import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// GURU CORE: Admin klient s božskými právy (SERVICE_ROLE_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 🚀 GURU MASTER DETECTION
 * Tato funkce musí být 1:1 s frontendem. 
 * Detekuje: null, undefined, prázdný string "" a textový řetězec "NULL".
 */
const isActuallyEmpty = (val) => {
  if (val === null || val === undefined) return true;
  const s = String(val).trim();
  return s === '' || s.toLowerCase() === 'null';
};

/**
 * GURU AI TRANSLATOR: Technický překlad pro experty.
 */
async function getGuruTranslation(czData, tableName) {
  const isPosts = tableName === 'posts';
  const systemPrompt = `You are 'The Hardware Guru'. Technically translate hardware/gaming content. 
  For table '${tableName}', return valid JSON with: title_en, content_en, slug_en, meta_title_en, description_en ${isPosts ? ', seo_description_en, seo_keywords_en' : ''}. Use expert terminology.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Translate technically: ${JSON.stringify(czData)}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("GURU AI FAIL:", err.message);
    throw new Error("OpenAI API Failure");
  }
}

export async function POST(req) {
  try {
    const { tableName, limit = 3 } = await req.json();
    
    // GURU FETCH: Sázíme na absolutní jistotu, stáhneme vše a přefiltrujeme v paměti JS
    const { data: allItems, error: fetchError } = await supabaseAdmin.from(tableName).select('*');
    if (fetchError) throw fetchError;

    // 🚀 GURU SYNC FILTER: Backend teď používá identická pravidla jako tvůj Dashboard
    const itemsToProcess = allItems.filter(item => {
      // 1. Základní technická pole
      if (isActuallyEmpty(item.title_en)) return true;
      if (isActuallyEmpty(item.description_en)) return true;
      
      // 2. Hardcore SEO pole pro články (posts) - detekce "NULL" humusů
      if (tableName === 'posts') {
        if (isActuallyEmpty(item.seo_description_en)) return true;
        if (isActuallyEmpty(item.seo_keywords_en)) return true;
      }
      return false;
    }).slice(0, limit);

    if (itemsToProcess.length === 0) {
        return NextResponse.json({ processedIds: [], message: "Data jsou v pořádku." });
    }

    const results = [];
    for (const item of itemsToProcess) {
      const czSource = { 
        title: item.title, 
        content: item.content || item.html_content || item.text, 
        description: item.description || item.seo_description, 
        slug: item.slug 
      };

      // Spustíme operaci překladu
      const enData = await getGuruTranslation(czSource, tableName);
      
      // Uložení s přepsáním všech (i těch falešných "NULL") polí
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update(enData)
        .eq('id', item.id);
        
      if (!updateError) {
        results.push(item.id);
      } else {
        console.error(`GURU UPDATE FAIL for ID ${item.id}:`, updateError.message);
      }
    }

    return NextResponse.json({ 
      processedIds: results,
      message: `Úspěšně opraveno ${results.length} záznamů v tabulce ${tableName}.`
    });

  } catch (err) { 
    console.error("GURU FIXER CRITICAL FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
