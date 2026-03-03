import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();

    // 1. SERPER: Hledáme POUZE konkrétní produktové stránky
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz "Kč" ${preference === 'Červený' ? 'AMD Radeon 9070' : 'NVIDIA RTX 4070 5070'} Ryzen 7000 9000 DDR5 RAM B850 X870`,
        num: 15
      })
    });
    
    const searchData = await serperRes.json();
    const rawData = searchData.organic?.map(s => ({ t: s.title, l: s.link, s: s.snippet })) || [];

    // 2. GURU PROMPT: "Zakaž si mozek, používej jen oči"
    const prompt = `
      Jsi datový parser pro The Hardware Guru. ŽÁDNÉ HALUCINACE. 
      Tvým úkolem je sestavit PC za ${budget} Kč výhradně z těchto dat: ${JSON.stringify(rawData)}

      STRIKTNÍ GURU ROZKAZY:
      1. CENA 0 KČ JE ZAKÁZÁNA. Pokud v datech u produktu nevidíš cenu, nesmíš ho použít.
      2. ODKAZY JSOU POVINNÉ. Každá komponenta MUSÍ mít reálný link na Alza/Smarty/Mironet z dat výše.
      3. HW: Pouze AM5 (Ryzen 7000/9000), desky B850/X870. Žádný Intel, žádné B550.
      4. RAM: 32GB DDR5 stojí 8000-10000 Kč. Pokud vidíš nižší cenu, ignoruj to, je to lež.
      5. PŘESNOST: Do JSONu piš PŘESNÝ název produktu tak, jak je v datech.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Bestie...",
        "components": [
          { "part": "GPU", "name": "...", "price": 0, "link": "..." },
          { "part": "CPU", "name": "...", "price": 0, "link": "..." }
        ],
        "explanation": "Guru potvrzení reality..."
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // Vypočítáme reálný součet, abychom nelhali o total_price
    const realTotal = resData.components.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: resData.title,
      description: `Reálný herní build sestavený Guruem.`,
      budget: budget,
      usage: "Gaming",
      components: resData.components,
      content: resData.explanation,
      total_price: realTotal, // Tohle už nebude halucinace, ale prostý součet
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
