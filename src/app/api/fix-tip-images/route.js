import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    // 1. Vytáhneme prostě VŠECHNY tipy, ať vidíme, co tam je
    const { data: vsechnyTipy, error: fetchError } = await supabase
      .from('tipy')
      .select('id, title, image_url');

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const vysledky = [];

    // 2. Teď projdeme každý jeden a opravíme ho jen tehdy, pokud NEJSOU v tvém storage
    for (const tip of vsechnyTipy) {
      // Pokud adresa NEobsahuje tvůj Supabase bucket "clanky-images", je to kandidát na opravu
      const jeToSpatne = !tip.image_url || !tip.image_url.includes('clanky-images');

      if (jeToSpatne) {
        try {
          console.log(`Opravuji: ${tip.title}`);
          const aiImageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Professional high-tech hardware photography: ${tip.title}. Violet and cyan cinematic lighting, focus on detail, 8k.`,
            n: 1, size: "1024x1024",
          });
          
          const tempImageUrl = aiImageResponse.data[0].url;
          const imageRes = await fetch(tempImageUrl);
          const buffer = Buffer.from(await imageRes.arrayBuffer());
          const fileName = `fixed-tip-${tip.id}-${Date.now()}.png`;

          await supabase.storage
            .from('clanky-images')
            .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

          const { data: publicUrlData } = supabase.storage
            .from('clanky-images')
            .getPublicUrl(fileName);

          await supabase.from('tipy').update({ image_url: publicUrlData.publicUrl }).eq('id', tip.id);

          vysledky.push({ title: tip.title, status: 'OPRAVENO' });
        } catch (err) {
          vysledky.push({ title: tip.title, status: 'CHYBA', error: err.message });
        }
      } else {
        vysledky.push({ title: tip.title, status: 'JIŽ OK (V STORAGE)' });
      }
    }

    return NextResponse.json({ processed: vsechnyTipy.length, details: vysledky });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
