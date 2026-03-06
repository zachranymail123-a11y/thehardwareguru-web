import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GURU CORE: Inicializace s admin právy
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const apiKey = ""; // API klíč je injektován prostředím

// Pomocná funkce pro technický překlad přes Gemini s exponenciálním backoffem
async function getGuruTranslation(czData, tableName) {
  const systemPrompt = `You are 'The Hardware Guru'. Your task is to translate and technically enhance hardware/gaming content from Czech to English. 
  NEVER use generic phrasing. Use expert terminology. 
  For table '${tableName}', you must return a valid JSON object with the following keys based on the input:
  - title_en
  - content_en (Full HTML)
  - slug_en (URL friendly)
  - meta_title_en
  - description_en
  - seo_description_en (if applicable)
  - seo_keywords_en (if applicable)`;

  const userQuery = `Translate this technical content to English: ${JSON.stringify(czData)}`;

  const fetchWithRetry = async (retries = 0) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error(`AI fail: ${response.status}`);
      const result = await response.json();
      return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) {
      if (retries < 5) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries + 1);
      }
      throw err;
    }
  };

  return await fetchWithRetry();
}

export async function POST(req) {
  try {
    const { tableName, limit = 5 } = await req.json();
    
    // 1. Najdeme záznamy, kde chybí EN titul
    const { data: items, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .is('title_en', null)
      .limit(limit);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) return NextResponse.json({ message: 'Hotovo! Žádné NULL záznamy.', count: 0 });

    const results = [];

    for (const item of items) {
      // Příprava dat pro AI (bereme jen CZ sloupce)
      const czSource = {
        title: item.title,
        content: item.content || item.html_content,
        description: item.description || item.seo_description || item.description_en,
        slug: item.slug
      };

      const enData = await getGuruTranslation(czSource, tableName);

      // 2. Update záznamu v DB
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({
          ...enData,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) console.error(`Guru Fix Error (ID ${item.id}):`, updateError);
      else results.push(item.id);
    }

    return NextResponse.json({ 
      message: `Úspěšně opraveno ${results.length} záznamů v tabulce ${tableName}.`,
      processedIds: results 
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
