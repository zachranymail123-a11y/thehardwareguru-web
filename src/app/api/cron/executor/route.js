import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; 
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

const MAKE_ARTICLE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

async function sendOneSignalNotification(title, slug) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return false;
  const articleUrl = `https://www.thehardwareguru.cz/clanky/${slug}`;
  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        contents: { en: `Nový článek: ${title}`, cs: `Nový článek: ${title}` },
        headings: { en: "The Hardware Guru", cs: "The Hardware Guru" },
        url: articleUrl,
      }),
    });
    return response.ok;
  } catch (error) { return false; }
}

export async function GET() {
  headers(); 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Výběr úkolů zůstává, ale zpracování je teď totálně sériové
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned') 
    .order('id', { ascending: true })
    .limit(5);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError.message });
  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Žádné nové úkoly.' });

  let results = [];
  let processedCount = 0;

  // ZPĚT NA KLASICKÝ CYKLUS - ŽÁDNÝ PARALELNÍ MAP!
  for (const task of tasks) {
    if (processedCount >= 1) break; //

    try {
      const taskSlug = createSlug(task.title);
      const { data: existing } = await supabase.from('posts').select('id').or(`slug.eq.${taskSlug},title.ilike.%${task.title.split(':')[0]}%`).limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
        results.push({ title: task.title, status: 'DUPLICITA' });
        continue; // Duplicita se nepočítá jako zpracovaný úkol, jde se na další
      }

      await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

      // 1. REŠERŠE (Sériově, aby byl klid)
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} review benchmarks youtube video`, num: 10 })
      });
      const searchResults = await serperRes.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

      // 2. VNITŘNÍ PARALELIZACE (Pouze pro ušetření času u JEDNOHO článku)
      const [completion, imageResponse] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Jsi elitní šéfredaktor The Hardware Guru. Piš VÝHRADNĚ ČESKY. Styl: drsný, profesionální. JSON: { \"title\": \"...\", \"content\": \"HTML obsah\", \"youtube_url\": \"link\" }" },
            { role: "user", content: `Napiš článek o: "${task.title}". Data: ${rawContext}` }
          ],
          response_format: { type: "json_object" }
        }),
        openai.images.generate({
          model: "dall-e-3",
          prompt: `Epic tech magazine thumbnail for: ${task.title}. Photorealistic, no text.`,
          n: 1, size: "1024x1024",
        }).catch(() => null)
      ]);

      const article = JSON.parse(completion.choices[0].message.content);
      const finalSlug = createSlug(article.title);

      let permanentImageUrl = null;
      if (imageResponse) {
        try {
          const imgRes = await fetch(imageResponse.data[0].url);
          const imageBlob = await imgRes.blob();
          const fileName = `${finalSlug}-${Date.now()}.png`;
          await supabase.storage.from('article_images').upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
          permanentImageUrl = supabase.storage.from('article_images').getPublicUrl(fileName).data.publicUrl;
        } catch (e) {}
      }

      await supabase.from('posts').insert({
        title: article.title,
        slug: finalSlug,
        content: article.content,
        type: task.type || 'hardware',
        image_url: permanentImageUrl,
        youtube_url: article.youtube_url,
        created_at: new Date().toISOString()
      });

      if (MAKE_ARTICLE_WEBHOOK_URL) {
        const cleanDescription = article.content.replace(/<[^>]*>?/gm, '').substring(0, 250).trim() + "...";
        fetch(MAKE_ARTICLE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            url: `https://www.thehardwareguru.cz/clanky/${finalSlug}`,
            image_url: permanentImageUrl,
            description: cleanDescription,
            type: task.type || 'article'
          }),
        }).catch(() => {});
      }

      await sendOneSignalNotification(article.title, finalSlug);
      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

      results.push({ title: article.title, status: 'SUCCESS', slug: finalSlug });
      processedCount++; // TADY SE TO UTNE

    } catch (err) {
      await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
      results.push({ title: task.title, status: 'ERROR', error: err.message });
      processedCount++; // I při chybě končíme, ať se to nezacyklí
    }
  }

  return NextResponse.json({ processed_tasks: results });
}
