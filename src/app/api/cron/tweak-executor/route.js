import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; 
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Nastavení z tvého funkčního článku-executoru [cite: 2026-03-04]
const MAKE_ARTICLE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  headers(); 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Hledáme úkoly typu 'tweak', které jsou naplánované [cite: 2026-03-04]
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned')
    .eq('type', 'tweak') 
    .order('id', { ascending: true })
    .limit(5);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError.message });
  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Žádné nové tweaky k vyřízení.' });

  let results = [];
  let processedCount = 0;

  // Striktní for...of cyklus pro jeden úkol [cite: 2026-03-04]
  for (const task of tasks) {
    if (processedCount >= 1) break; 

    try {
      const taskSlug = createSlug(task.title);
      // Kontrola duplicity v tabulce tweaky [cite: 2026-03-04]
      const { data: existing } = await supabase.from('tweaky').select('id').eq('slug', taskSlug).limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
        results.push({ title: task.title, status: 'DUPLICITA' });
        continue;
      }

      await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

      // 1. REŠERŠE (Optimalizace, configy, fixy) [cite: 2026-03-04]
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} PC optimization steam system requirements reddit config ini stuttering fix`, num: 10 })
      });
      const searchResults = await serperRes.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

      // 2. PARALELNÍ BĚH (Text + Obrázek pro jeden tweak) [cite: 2026-03-04]
      const [completion, imageResponse] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: "Jsi 'The Hardware Guru'. Píšeš drsně, technicky. JSON: { \"title\": \"...\", \"seo_description\": \"...\", \"html_content\": \"...\" }" 
            },
            { role: "user", content: `Vytvoř GURU TWEAK pro: "${task.title}". Data: ${rawContext}. HTML musí obsahovat Guru Analýzu a Hardcore Fixy.` }
          ],
          response_format: { type: "json_object" }
        }),
        openai.images.generate({
          model: "dall-e-3",
          prompt: `High-tech cinematic PC hardware, glowing neon, liquid cooling, extreme detail for: ${task.title}. No text.`,
          n: 1, size: "1024x1024",
        }).catch(() => null)
      ]);

      const tweak = JSON.parse(completion.choices[0].message.content);
      const finalSlug = createSlug(tweak.title || task.title);

      // 3. STORAGE UPLOAD [cite: 2026-03-04]
      let permanentImageUrl = null;
      if (imageResponse) {
        try {
          const imgRes = await fetch(imageResponse.data[0].url);
          const imageBlob = await imgRes.blob();
          const fileName = `tweaky/${finalSlug}-${Date.now()}.png`;
          await supabase.storage.from('images').upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
          permanentImageUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
        } catch (e) {}
      }

      // 4. ZÁPIS DO TABULKY TWEAKY [cite: 2026-03-04]
      await supabase.from('tweaky').insert({
        title: tweak.title || task.title,
        slug: finalSlug,
        description: tweak.seo_description,
        content: tweak.html_content,
        image_url: permanentImageUrl,
        category: 'Optimalizace',
        created_at: new Date().toISOString()
      });

      // 5. ODESLÁNÍ DO MAKE.COM (Stejně jako u článků) [cite: 2026-03-04]
      if (MAKE_ARTICLE_WEBHOOK_URL) {
        try {
          const cleanDesc = tweak.seo_description || "Nový Guru Tweak je venku!";
          await fetch(MAKE_ARTICLE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: tweak.title || task.title,
              url: `https://www.thehardwareguru.cz/tweaky/${finalSlug}`,
              image_url: permanentImageUrl,
              description: cleanDesc,
              type: 'tweak'
            }),
          });
        } catch (e) {}
      }

      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
      results.push({ title: task.title, status: 'SUCCESS', slug: finalSlug });
      processedCount++; 

    } catch (err) {
      await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
      results.push({ title: task.title, status: 'ERROR', error: err.message });
      processedCount++; 
    }
  }

  return NextResponse.json({ processed_tweaks: results });
}
