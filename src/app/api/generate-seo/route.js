import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Zabezpečení: Kontrola tajného klíče v URL, aby ti AI nečerpal někdo cizí
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEO_SECRET) {
    return NextResponse.json({ error: 'Nepovolený přístup' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const tables = ['slovnik', 'rady', 'posts'];
  let totalUpdated = 0;

  try {
    for (const tableName of tables) {
      const { data: rows } = await supabase
        .from(tableName)
        .select('id, title, description, content')
        .or('seo_description.is.null,seo_description.eq.""')
        .limit(10); // Zpracujeme max 10 najednou, aby Vercel nevypršel čas

      if (!rows || rows.length === 0) continue;

      for (const row of rows) {
        const textToAnalyze = row.description || row.content || "";
        const cleanText = textToAnalyze.replace(/<[^>]*>?/gm, '').substring(0, 1000);

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Jsi SEO expert. Vytvoř meta description (max 160 znaků) a 5 klíčových slov. Formát: POPIS: [text] KLÍČE: [klíče]" },
            { role: "user", content: `Titul: ${row.title}\nObsah: ${cleanText}` }
          ]
        });

        const aiResponse = response.choices[0].message.content;
        const description = aiResponse.match(/POPIS: (.*?) KLÍČE:/s)?.[1].trim();
        const keywords = aiResponse.match(/KLÍČE: (.*)/s)?.[1].trim();

        await supabase.from(tableName).update({ 
          seo_description: description, 
          seo_keywords: keywords 
        }).eq('id', row.id);
        
        totalUpdated++;
      }
    }

    return NextResponse.json({ message: `Hotovo! Aktualizováno ${totalUpdated} položek.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
