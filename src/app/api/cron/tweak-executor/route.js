import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAKE_ARTICLE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL;

export async function GET() {
  headers(); 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. KROK: Najdeme naplánované tweaky v tabulce 'tweaky'
  const { data: tasks, error: fetchError } = await supabase
    .from('tweaky')
    .select('*')
    .eq('tweak_plan', 'planned')
    .order('id', { ascending: true })
    .limit(5);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError.message });
  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Žádné nové úkoly.' });

  let results = [];
  let processedCount = 0;

  // 2. KROK: Striktní zpracování JEDNOHO úkolu
  for (const task of tasks) {
    if (processedCount >= 1) break; 

    try {
      // Zámek - aby to nebral jiný proces
      await supabase.from('tweaky').update({ tweak_plan: 'processing' }).eq('id', task.id);

      // 3. KROK: Odeslání na Make.com (STRIKTNĚ STEJNÁ DATA JAKO ČLÁNKY)
      if (MAKE_ARTICLE_WEBHOOK_URL) {
        // Vyčištění obsahu od HTML tagů a zkrácení na 250 znaků - přesně jako u článků
        const cleanDescription = task.content ? task.content.replace(/<[^>]*>?/gm, '').substring(0, 250).trim() + "..." : "Nový Guru Tweak je venku!";
        
        await fetch(MAKE_ARTICLE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            url: `https://www.thehardwareguru.cz/tweaky/${task.slug}`,
            image_url: task.image_url,
            description: cleanDescription,
            type: 'tweak' // Make.com dostane type 'tweak', aby věděl, co s tím
          }),
        });
      }

      // 4. KROK: Nastavení na published
      await supabase.from('tweaky').update({ tweak_plan: 'published' }).eq('id', task.id);

      // Výstup musí být naprosto stejný jako u normálního executoru (vidím na tvém screenu)
      results.push({ title: task.title, status: 'SUCCESS', slug: task.slug });
      processedCount++; 

    } catch (err) {
      await supabase.from('tweaky').update({ tweak_plan: 'error' }).eq('id', task.id);
      results.push({ title: task.title, status: 'ERROR', error: err.message });
    }
  }

  // Vracíme 'processed_tasks', aby se to chovalo a vypadalo 1:1 jako normální executor
  return NextResponse.json({ processed_tasks: results });
}
