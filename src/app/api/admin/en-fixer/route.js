import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// GURU CORE: Admin klient obchází RLS pro hromadné opravy
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GURU CORE: Striktně OpenAI GPT-4 Turbo
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GURU AI ENGINE: Generuje technický překlad a SEO metadata.
 */
async function getGuruTranslation(czData, tableName) {
  // Rozšíření promptu pro tabulku posts o chybějící SEO pole
  const isPosts = tableName === 'posts';
  
  const systemPrompt = `You are 'The Hardware Guru'. Your task is to technically translate and enhance hardware/gaming content from Czech to English. 
  NEVER use generic phrasing. Use expert terminology. 
  For table '${tableName}', return a valid JSON object with:
  - title_en
  - content_en (Full HTML)
  - slug_en (URL friendly)
  - meta_title_en
  - description_en (Technical description)
  ${isPosts ? '- seo_description_en (Engaging SEO summary)\n- seo_keywords_en (Comma separated keywords)' : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Technically translate this Guru content to English: ${JSON.stringify(czData)}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("GURU AI FAIL:", err.message);
    throw new Error(`OpenAI fail: ${err.message}`);
  }
}

/**
 * GURU EN FIXER ROUTE: Opravuje záznamy v CZ/EN mutaci.
 */
export async function POST(req) {
  try {
    const { tableName, limit = 3 } = await req.json();
    
    // 1. GURU ROBUST SEARCH: Najdeme záznamy, kde title_en je buď NULL nebo prázdný řetězec
    const { data: items, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .or(`title_en.is.null,title_en.eq.""`)
      .limit(limit);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Hotovo, v této tabulce není co opravovat.', count: 0 });
    }

    const results = [];

    for (const item of items) {
      // Příprava dat pro AI (Flexible Mapping)
      const czSource = {
        title: item.title,
        content: item.content || item.html_content || item.text || '',
        description: item.description || item.seo_description || '',
        slug: item.slug
      };

      // 2. AI GENERATION
      const enData = await getGuruTranslation(czSource, tableName);

      // 3. DATABASE SYNC: Ukládáme kompletní balík včetně SEO polí
      const updatePayload = {
        ...enData,
        updated_at: new Date().toISOString()
      };

      // Speciální ošetření pro posts, aby se vyplnila seo pole, pokud je AI vrátila v jiném klíči
      if (tableName === 'posts') {
        updatePayload.seo_description_en = enData.seo_description_en || enData.description_en;
        updatePayload.seo_keywords_en = enData.seo_keywords_en || '';
      }

      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update(updatePayload)
        .eq('id', item.id);

      if (updateError) {
        console.error(`GURU DB FAIL for ID ${item.id}:`, updateError.message);
      } else {
        results.push(item.id);
      }
    }

    return NextResponse.json({ 
      message: `Úspěšně opraveno ${results.length} záznamů v tabulce ${tableName}.`,
      processedIds: results 
    });

  } catch (err) {
    console.error("GURU FIXER CRITICAL EXCEPTION:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
