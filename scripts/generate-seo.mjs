import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function processTable(tableName) {
  console.log(`🔍 Kontroluji tabulku: ${tableName}...`);

  // Najde řádky, kde chybí SEO popisek
  const { data: rows, error } = await supabase
    .from(tableName)
    .select('id, title, description, content')
    .or('seo_description.is.null,seo_description.eq.""');

  if (error) {
    console.error(`❌ Chyba v tabulce ${tableName}:`, error);
    return;
  }

  console.log(`📈 Nalezeno ${rows.length} položek k vylepšení.`);

  for (const row of rows) {
    const textToAnalyze = row.description || row.content || "";
    const cleanText = textToAnalyze.replace(/<[^>]*>?/gm, '').substring(0, 1000);

    console.log(`✍️ Generuji SEO pro: ${row.title}...`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Levný a super rychlý model
      messages: [
        {
          role: "system",
          content: "Jsi expert na SEO a hardware. Tvým úkolem je vytvořit meta description (max 160 znaků) a 5 klíčových slov oddělených čárkou pro daný článek/pojem. Odpovídej ve formátu: POPIS: [text] KLÍČE: [klíče]"
        },
        {
          role: "user",
          content: `Titul: ${row.title}\nObsah: ${cleanText}`
        }
      ]
    });

    const aiResponse = response.choices[0].message.content;
    const description = aiResponse.match(/POPIS: (.*?) KLÍČE:/s)?.[1].trim();
    const keywords = aiResponse.match(/KLÍČE: (.*)/s)?.[1].trim();

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        seo_description: description, 
        seo_keywords: keywords 
      })
      .eq('id', row.id);

    if (updateError) console.error(`❌ Chyba zápisu u ${row.title}:`, updateError);
    else console.log(`✅ SEO uloženo!`);
  }
}

async function run() {
  await processTable('slovnik');
  await processTable('rady');
  await processTable('posts');
  console.log('🏁 Hotovo! Tvůj web je teď SEO monstrum.');
}

run();
