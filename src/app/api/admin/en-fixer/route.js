import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// GURU CORE: Admin klient obchází RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GURU AI ENGINE: Technický překlad pro HW specialisty.
 */
async function getGuruTranslation(czData, tableName) {
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

export async function POST(req) {
  try {
    const { tableName, limit = 3 } = await req.json();
    if (!tableName) throw new Error("Chybí název tabulky.");

    // 1. GURU JS SURGERY: Stáhneme vše a přefiltrujeme v paměti (100% jistota)
    const { data: allItems, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select('*');

    if (fetchError) throw fetchError;

    // Najdeme záznamy, kde title_en je null, prázdné, nebo jen mezery
    const itemsToProcess = allItems.filter(item => 
      !item.title_en || item.title_en.trim() === ''
    ).slice(0, limit);

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ message: 'Všechny záznamy v této tabulce mají EN verzi.', count: 0 });
    }

    const results = [];

    for (const item of itemsToProcess) {
      const czSource = {
        title: item.title,
        content: item.content || item.html_content || item.text || '',
        description: item.description || item.seo_description || '',
        slug: item.slug
      };

      const enData = await getGuruTranslation(czSource, tableName);

      // GURU SYNC: Připravíme payload (odstraněno updated_at pro stabilitu)
      const updatePayload = {
        ...enData
      };

      if (tableName === 'posts') {
        updatePayload.seo_description_en = enData.seo_description_en || enData.description_en;
        updatePayload.seo_keywords_en = enData.seo_keywords_en || '';
      }

      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update(updatePayload)
        .eq('id', item.id);

      if (updateError) {
        console.error(`GURU DB FAIL ID ${item.id}:`, updateError.message);
      } else {
        results.push(item.id);
      }
    }

    return NextResponse.json({ 
      message: `Úspěšně opraveno ${results.length} záznamů v tabulce ${tableName}.`,
      processedIds: results 
    });

  } catch (err) {
    console.error("GURU FIXER CRITICAL FAIL:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
