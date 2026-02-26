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

  // 1. NAJDEME ÚKOL (Řadíme podle ID, filtrujeme bez ohledu na velikost písmen)
  const { data: tasks, error: fetchError } = await supabase
    .from('content_plan')
    .select('*')
    .ilike('status', 'planned') 
    .order('id', { ascending: true })
    .limit(1);

  if (fetchError) return NextResponse.json({ error: 'Chyba DB', details: fetchError.message });
  if (!tasks || tasks.length === 0) return NextResponse.json({ message: 'Nic k praci.' });
  
  const task = tasks[0];

  // 2. LOCK - Označíme jako processing
  await supabase.from('content_plan').update({ status: 'processing' }).eq('id', task.id);

  try {
    // 3. KONTROLA DUPLICITY V POSTECH
    const taskSlug = createSlug(task.title);
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .or(`slug.eq.${taskSlug},title.ilike.%${task.title.split(':')[0]}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
      return NextResponse.json({ message: `Přeskočeno: '${task.title}' už je na webu.` });
    }

    // 4. RESEARCH (SERPER)
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${task.title} tech specs review 2026`, num: 8 })
    });
    const searchResults = await res.json();
    const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 8000);

    // 5. GENERUJEME ČLÁNEK (Opraveno: Explicitní zmínka JSON pro OpenAI API)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Jsi The Hardware Guru. Piš ČESKY, drsně a věcně. Tvůj výstup musí být striktně ve formátu JSON. Struktura: { \"title\": \"název\", \"content\": \"HTML obsah\" }. V obsahu používej HTML tagy, pro technické parametry VŽDY vytvoř <table> a na konec dej <blockquote class='guru-verdict'> s finálním hodnocením." 
        },
        { 
          role: "user", 
          content: `Vytvoř článek ve formátu JSON o tématu: "${task.title}". Typ obsahu: ${task.type}. Data pro research: ${rawContext}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const article = JSON.parse(completion.choices[0].message.content);
    const slug = createSlug(article.title);

    // 6. ZÁPIS DO POSTS
    const { error: insertError } = await supabase.from('posts').insert({
      title: article.title,
      slug: slug,
      content: article.content,
      type: task.type,
      created_at: new Date().toISOString()
    });

    if (insertError && insertError.code === '23505') {
       await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);
       return NextResponse.json({ message: 'Slug duplicita, označeno jako hotové.' });
    }

    // 7. HOTOVO
    await supabase.from('content_plan').update({ status: 'published' }).eq('id', task.id);

    return NextResponse.json({ status: 'SUCCESS', published: article.title });

  } catch (err) {
    // Při chybě vrátíme zpět na planned
    await supabase.from('content_plan').update({ status: 'planned' }).eq('id', task.id);
    return NextResponse.json({ error: err.message });
  }
}
