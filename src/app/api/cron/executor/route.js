import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

function createSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); 
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. NAČTEME ROVNOU 5 ÚKOLŮ (Abychom se nezacyklili na jednom)
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .eq('status', 'planned') // Bere jen planned
    .order('id', { ascending: true })
    .limit(5);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB při čtení', details: fetchError.message });
  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Vše hotovo, žádné nové úkoly.' });

  let results = [];
  let processedCount = 0;

  // 2. PROJDEME JE JEDEN PO DRUHÉM
  for (const task of tasks) {
    // Pokud už jsme v tomto běhu jeden článek úspěšně VYTVOŘILI, končíme (ať nepálíme kredity hromadně)
    // Pokud ale jen čistíme duplicity, jedeme dál.
    if (processedCount >= 1) break; 

    try {
      // A. KONTROLA DUPLICITY V POSTS
      const taskSlug = createSlug(task.title);
      const { data: existing } = await supabase
        .from('posts')
        .select('id, title')
        .or(`slug.eq.${taskSlug},title.ilike.%${task.title.split(':')[0]}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // JE TO DUPLICITA -> Označíme jako published a JEDEME DÁL
        const { error: updateError } = await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id).select();
        
        results.push({ 
          title: task.title, 
          status: 'DUPLICITA - PŘESKOČENO', 
          match: existing[0].title,
          db_update_error: updateError ? updateError.message : 'OK'
        });
        continue; // Jdeme na další úkol v seznamu
      }

      // B. NENÍ TO DUPLICITA -> Jdeme makat
      // Označíme jako processing
      await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

      // Research
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${task.title} review specs news`, num: 6 })
      });
      const searchResults = await res.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 6000);

      // Generování
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Jsi The Hardware Guru. Piš ČESKY, drsně a věcně. Tvůj výstup musí být striktně ve formátu JSON. Struktura: { \"title\": \"název\", \"content\": \"HTML obsah\" }. V obsahu používej HTML tagy, pro technické parametry VŽDY vytvoř <table> a na konec dej <blockquote class='guru-verdict'> s finálním hodnocením." 
          },
          { 
            role: "user", 
            content: `Vytvoř článek JSON: "${task.title}". Typ: ${task.type}. Info: ${rawContext}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const article = JSON.parse(completion.choices[0].message.content);
      const slug = createSlug(article.title);

      // Zápis do posts
      const { error: insertError } = await supabase.from('posts
