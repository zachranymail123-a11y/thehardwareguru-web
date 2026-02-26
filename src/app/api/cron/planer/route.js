import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: `Jsi šéfredaktor. Naplánuj 4 články (Nioh 3, Resident Evil Requiem, Nvidia N1 chips, AMD Gorgon). 
      Vrať JSON: {"items": [{"title": "...", "release_date": "2026-02-26", "type": "game", "confidence": "high"}]}`
    }],
    response_format: { type: "json_object" }
  });

  const plan = JSON.parse(completion.choices[0].message.content);
  
  // TADY JE TA OPRAVA - DRASTICKÝ INSERT
  const { data, error } = await supabase
    .from('content_plan')
    .insert(plan.items.map(item => ({
      title: item.title,
      release_date: item.release_date,
      type: item.type,
      status: 'planned'
    })));

  if (error) {
    return NextResponse.json({ status: "CHYBA ZÁPISU", error: error });
  }

  return NextResponse.json({ status: "OK - ZAPSÁNO DO DB", items: plan.items });
}
