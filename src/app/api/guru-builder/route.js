import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { budget, usage, preference } = await req.json();

    // 1. ZÍSKÁNÍ AKTUÁLNÍCH CEN PŘES SERPER
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `nejlepší PC komponenty březen 2026 rozpočet ${budget} CZK ${usage}` })
    });
    const searchData = await serperRes.json();

    // 2. OPENAI MOZEK
    const prompt = `Jsi The Hardware Guru. Na základě těchto dat z webu: ${JSON.stringify(searchData.organic.slice(0, 3))}
    Sestav nejlepší PC pro uživatele. Rozpočet: ${budget} CZK. Využití: ${usage}. Preference: ${preference}.
    Vrať POUZE JSON v tomto formátu:
    {
      "title": "Guru Sestava: Herní Bestie za ${budget} Kč",
      "description": "Guru výběr pro maximální výkon.",
      "components": [{"part": "GPU", "name": "NVIDIA RTX 5070", "price": 15000}],
      "explanation": "Tato sestava je postavena na...",
      "total_price": 24900
    }`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const sestavaData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. VYTVOŘENÍ SLUGU A ULOŽENÍ DO DB
    const slug = `sestava-${budget}-${usage.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: sestavaData.title,
      description: sestavaData.description,
      budget: budget,
      usage: usage,
      components: sestavaData.components,
      content: sestavaData.explanation,
      total_price: sestavaData.total_price,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png" // Později můžeš přidat DALL-E
    }]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, url: `/sestavy/${slug}`, data: data[0] });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
