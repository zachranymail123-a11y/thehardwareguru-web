import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; // <--- TÍMHLE ZABIJEME CACHE
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  // Zavoláním headers() donutíme server vždy generovat data čerstvě
  headers(); 
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned') 
    .order('id', { ascending: true })
    .limit(5);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError.message });
  
  if (!tasks || tasks.length === 0) {
      return NextResponse.json({ 
          message: 'Žádné nové úkoly k vyřízení.',
          server_time: new Date().toISOString()
      });
  }

  let results = [];
  let processedCount = 0;

  for (const task of tasks) {
    if (processedCount >= 1) break; 

    try {
      const taskSlug = createSlug(task.title);
      const { data: existing } = await supabase
        .from('posts')
        .select('id, title')
        .or(`slug.eq.${taskSlug},title.ilike.%${task.title.split(':')[0]}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
        results.push({ title: task.title, status: 'DUPLICITA - PŘESKOČENO' });
        continue;
      }

      await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

      // Research
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} review specs news`, num: 6 })
      });
      const searchResults = await res.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

      // Generování textu
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Jsi The Hardware Guru. Piš ČESKY, drsně a věcně. Tvůj výstup musí být striktně ve formátu JSON. Struktura: { \"title\": \"název\", \"content\": \"HTML obsah\" }. V obsahu používej HTML tagy a pro parametry VŽDY vytvoř <table>." 
          },
          { role: "user", content: `Vytvoř článek JSON: "${task.title}". Typ: ${task.type}. Info: ${rawContext}` }
        ],
        response_format: { type: "json_object" }
      });

      const article = JSON.parse(completion.choices[0].message.content);
      const finalSlug = createSlug(article.title);

      // DALL-E 3 Generování obrázku
      let imageUrl = null;
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Create a photorealistic, dramatic, and high-quality thumbnail image for a tech and gaming magazine article titled: "${task.title}". The image must NOT contain any text, letters, or words. Style: modern, sleek, hardware/gaming focus.`,
          n: 1,
          size: "1024x1024",
        });
        imageUrl = imageResponse.data[0].url;
      } catch (imgErr) {
        console.error("Chyba obrázku:", imgErr.message);
      }

      // Zápis nového článku
      const { error: insertError } = await supabase.from('posts').insert({
        title: article.title,
        slug: finalSlug,
        content: article.content,
        type: task.type,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      });

      if (insertError) {
         if (insertError.code === '23505') {
            await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
            continue;
         }
         throw insertError;
      }

      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
      results.push({ title: article.title, status: 'SUCCESS - PUBLIKOVÁNO S OBRÁZKEM' });
      processedCount++; 

    } catch (err) {
      await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
      results.push({ title: task.title, status: 'CRITICAL ERROR', error: err.message });
    }
  }

  return NextResponse.json({ 
      message: 'Exekuce dokončena', 
      processed_tasks: results,
      server_time: new Date().toISOString()
  });
}
