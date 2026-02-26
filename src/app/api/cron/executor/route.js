import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; 
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Nové klíče pro OneSignal (musíš je přidat do Vercelu!)
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID; // Toto může být i public, ale klidně dej jen ONESIGNAL_APP_ID
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

// Funkce pro odeslání Push notifikace
async function sendOneSignalNotification(title, slug) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn("OneSignal klíče nejsou nastaveny, notifikace se neodešle.");
    return false;
  }

  const articleUrl = `https://www.thehardwareguru.cz/article/${slug}`; // Uprav cestu k článku, pokud ji máš na webu jinak (např. /clanek/...)

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"], // Pošle všem přihlášeným
        contents: {
          en: `Nový článek: ${title}`,
          cs: `Nový článek: ${title}` // Pokud chceš, můžeš přidat českou mutaci
        },
        headings: {
          en: "The Hardware Guru",
          cs: "The Hardware Guru"
        },
        url: articleUrl, // Po kliknutí na notifikaci otevře článek
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Chyba při odesílání OneSignal notifikace:", errorData);
      return false;
    }
    
    console.log("OneSignal notifikace úspěšně odeslána pro:", title);
    return true;
  } catch (error) {
    console.error("Výjimka při odesílání OneSignal notifikace:", error);
    return false;
  }
}

export async function GET() {
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
      return NextResponse.json({ message: 'Žádné nové úkoly k vyřízení.', server_time: new Date().toISOString() });
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

      // ---> VYLEPŠENÉ HLEDÁNÍ PRO HW I HRY <---
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} review Metacritic IGN benchmarks specs performance`, num: 8 })
      });
      const searchResults = await res.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

      // ---> ULTIMÁTNÍ ŠÉFREDAKTOR PROMPT <---
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `Jsi elitní šéfredaktor herního a hardwarového magazínu The Hardware Guru. 
Tvé úkoly a přísná pravidla:
1. Piš VÝHRADNĚ ČESKY. I když jsou podklady v angličtině, ty je musíš perfektně přeložit.
2. STYL: Profesionální, drsný, čtivý, pro české gamery a HW nadšence. Nejsi robot, chovej se jako zkušený novinář.
3. ZÁKAZY: Absolutní ZÁKAZ zmiňovat Reddit, YouTube, uživatelské komentáře nebo psát fráze typu "podle vyhledávání". Text musí působit jako tvoje vlastní autorská recenze/novinka!
4. SPECIFIKA PRO HRY: Pokud píšeš o hře, MUSÍŠ z podkladů vyčíst a uvést hodnocení velkých webů (IGN, GameSpot) nebo Metacritic skóre! Udělej jasnou sekci "Klady a Zápory".
5. SPECIFIKA PRO HW: Pokud píšeš o hardwaru, MUSÍŠ uvést konkrétní specifikace, benchmarky, výkon a ideálně cenovku. Žádná zbytečná omáčka bez čísel.
6. FORMÁTOVÁNÍ: ZÁKAZ jednoho bloku textu! Rozděluj text do krátkých odstavců pomocí <p>. Používej podnadpisy <h2> a <h3> pro strukturu a <strong> pro klíčové pojmy.
7. TABULKY: Pro parametry, benchmarky nebo Klady a Zápory VŽDY vytvoř přehlednou HTML <table>.
8. Výstup MUSÍ BÝT STRIKTNÍ JSON: { "title": "Český úderný název", "content": "Zformátovaný HTML obsah" }.` 
          },
          { 
            role: "user", 
            content: `Napiš exkluzivní, skvěle strukturovaný článek o: "${task.title}". Typ: ${task.type}. 
Zdrojová data (vytahej z nich hodnocení, čísla, parametry a napiš z toho brutálně dobrou recenzi/novinku v češtině, zformátovanou do krásného HTML): 
${rawContext}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const article = JSON.parse(completion.choices[0].message.content);
      const finalSlug = createSlug(article.title);

      // ---> OBRÁZEK PŘES BLOB S OCHRANOU ZNAČEK <---
      let permanentImageUrl = null;
      let imageErrorLog = null; 
      
      try {
        console.log(`Generuji obrázek pro: ${task.title}`);
        
        const safePrompt = `Create a photorealistic, dramatic, and high-quality thumbnail image for a tech and gaming magazine article. The theme is related to: "${task.title}". IMPORTANT: Do NOT include any real-world logos, trademarked text, or specific brand names. Make it generic but epic. No text or words allowed.`;

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: safePrompt,
          n: 1,
          size: "1024x1024",
        });
        const tempOpenAiUrl = imageResponse.data[0].url;

        const imgRes = await fetch(tempOpenAiUrl);
        const imageBlob = await imgRes.blob();
        
        const fileName = `${finalSlug}-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('article_images')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('article_images').getPublicUrl(fileName);
        permanentImageUrl = publicUrlData.publicUrl;

      } catch (imgErr) {
        imageErrorLog = imgErr.message;
        console.error("Chyba obrázku:", imgErr.message);
      }

      // ---> ULOŽENÍ DO DATABÁZE <---
      const { error: insertError } = await supabase.from('posts').insert({
        title: article.title,
        slug: finalSlug,
        content: article.content,
        type: task.type,
        image_url: permanentImageUrl,
        created_at: new Date().toISOString()
      });

      if (insertError) {
         if (insertError.code === '23505') {
            await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
            continue;
         }
         throw insertError;
      }

      // ---> ODESLÁNÍ NOTIFIKACE (NOVÉ!) <---
      // Článek je v DB, můžeme zařvat do světa
      await sendOneSignalNotification(article.title, finalSlug);

      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
      
      if (permanentImageUrl) {
          results.push({ title: article.title, status: 'SUCCESS - PUBLIKOVÁNO A NOTIFIKOVÁNO' });
      } else {
          results.push({ title: article.title, status: 'SUCCESS - VYDÁNO BEZ OBRÁZKU', image_error: imageErrorLog });
      }
      processedCount++; 

    } catch (err) {
      await supabase.from('content_plan').update({ status: 'error' }).eq('id', task.id);
      results.push({ title: task.title, status: 'CRITICAL ERROR', error: err.message });
    }
  }

  return NextResponse.json({ message: 'Exekuce dokončena', processed_tasks: results, server_time: new Date().toISOString() });
}
