import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// GURU CORE: Inicializace Supabase s admin právy
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GURU CORE: Inicializace OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GURU AI TRANSLATOR: Převede CZ data na technicky přesný EN balík přes OpenAI.
 */
async function getGuruTranslation(czData, tableName) {
  const systemPrompt = `You are 'The Hardware Guru'. Your task is to translate and technically enhance hardware/gaming content from Czech to English. 
  NEVER use generic phrasing. Use expert terminology (e.g., 'registry tweaks', 'performance overhead', 'VRAM allocation'). 
  For table '${tableName}', you must return a valid JSON object with EXACTLY these keys:
  - title_en
  - content_en (Full HTML with technical tags if needed)
  - slug_en (URL friendly version of title_en)
  - meta_title_en (SEO optimized title)
  - description_en (Engaging meta description)`;

  const userQuery = `Technically translate this Guru content to English: ${JSON.stringify(czData)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("GURU AI FAIL:", err);
    throw new Error("OpenAI Engine failed to respond.");
  }
}

/**
 * GURU EN FIXER ROUTE: Najde záznamy s title_en = NULL a opraví je.
 */
export async function POST(req) {
  try {
    const { tableName, limit = 2 } = await req.json();
    
    // 1. GURU SYNC: Najdeme záznamy bez anglického názvu
    const { data: items, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .is('title_en', null)
      .limit(limit);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Všechny záznamy v této tabulce již mají angličtinu.', count: 0 });
    }

    const results = [];

    for (const item of items) {
      // Příprava CZ zdrojů pro AI
      const czSource = {
        title: item.title,
        content: item.content || item.html_content,
        description: item.description || item.seo_description || item.description_en,
        slug: item.slug
      };

      // 2. AI FIX: Generujeme anglická data přes OpenAI GPT-4 Turbo
      const enData = await getGuruTranslation(czSource, tableName);

      // 3. DATABASE UPDATE: Ukládáme kompletní EN balík zpět do DB
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({
          ...enData,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) {
        console.error(`Update failed for ID ${item.id}:`, updateError);
      } else {
        results.push(item.id);
      }
    }

    return NextResponse.json({ 
      message: `Úspěšně opraveno ${results.length} záznamů v tabulce ${tableName}.`,
      processedIds: results 
    });

  } catch (err) {
    console.error("GURU CRITICAL ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
