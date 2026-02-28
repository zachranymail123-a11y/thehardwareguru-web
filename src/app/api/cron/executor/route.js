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

// FALLBACK OBRÁZEK (Aby Make.com nikdy nedostal prázdnou hodnotu)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000';

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

async function sendOneSignalNotification(title, slug) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return false;
  const articleUrl = `https://www.thehardwareguru.cz/clanky/${slug}`;
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        contents: { cs: `Nový článek: ${title}` },
        headings: { cs: "The Hardware Guru 🦾" },
        url: articleUrl,
      }),
    });
    return true;
  } catch (error) { return false; }
}

export async function GET() {
  headers(); 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned') 
    .order('id', { ascending: true })
    .limit(1); // Zpracováváme po jednom, aby to timeout nezhodil

  if (fetchError || !tasks?.length) return NextResponse.json({ message: 'Nic k práci.' });

  const task = tasks[0];
  try {
    await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

    // SEARCH
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${task.title} review benchmarks specs`, num: 8 })
    });
    const searchResults = await res.json();
    const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

    // AI GENERACE (Přidán požadavek na YouTube URL)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Jsi elitní šéfredaktor The Hardware Guru. Piš drsně, česky, HTML formát (<p>, <h2>, <table>). 
          Výstup MUSÍ BÝT JSON: { "title": "...", "content": "...", "youtube_url": "odkaz na youtube video k tématu pokud existuje v podkladech, jinak null" }.` 
        },
        { role: "user", content: `Téma: ${task.title}. Data: ${rawContext}` }
      ],
      response_format: { type: "json_object" }
    });

    const article = JSON.parse(completion.choices[0].message.content);
    const finalSlug = createSlug(article.title);

    // IMAGE GENERACE
    let permanentImageUrl = DEFAULT_IMAGE; // Defaultní hodnota
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Epic high-tech gaming thumbnail for: ${task.title}. No text, no logos.`,
        n: 1,
        size: "1024x1024",
      });
      
      const imgRes = await fetch(imageResponse.data[0].url);
      const imageBlob = await imgRes.blob();
      const fileName = `${finalSlug}-${Date.now()}.png`;

      await supabase.storage.from('article_images').upload(fileName, imageBlob, { contentType: 'image/png' });
      const { data: publicUrlData } = supabase.storage.from('article_images').getPublicUrl(fileName);
      permanentImageUrl = publicUrlData.publicUrl;
    } catch (imgErr) {
      console.error("DALL-E selhal, používám default.");
    }

    // ---> TADY JE TA OPRAVA: INSERT DO DATABÁZE SE VŠEMI SLOUPCI <---
    const { error: insertError } = await supabase.from('posts').insert({
      title: article.title,
      slug: finalSlug,
      content: article.content,
      type: task.type,
      image_url: permanentImageUrl, // Už nikdy nebude NULL díky DEFAULT_IMAGE
      youtube_url: article.youtube_url || null, // Přidán nový sloupec
      created_at: new Date().toISOString()
    });

    if (insertError) throw insertError;

    // NOTIFIKACE A FINISH
    await sendOneSignalNotification(article.title, finalSlug);
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

    return NextResponse.json({ status: 'SUCCESS', title: article.title });

  } catch (err) {
    await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
    return NextResponse.json({ status: 'ERROR', message: err.message }, { status: 500 });
  }
}
