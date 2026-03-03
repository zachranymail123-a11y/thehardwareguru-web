import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Vynutíme Node.js runtime pro delší operace
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(request) {
  try {
    // 1. Najdeme tipy k opravě
    const { data: tipyKeZmene, error: fetchError } = await supabase
      .from('tipy')
      .select('id, title, image_url')
      .or('image_url.ilike.%openai%,image_url.ilike.%unsplash%');

    if (fetchError) {
        console.error("Supabase Fetch Error:", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!tipyKeZmene || tipyKeZmene.length === 0) {
      return NextResponse.json({ message: "Všechny obrázky jsou v pořádku. Žádná práce pro Guru!" });
    }

    const vysledky = [];

    for (const tip of tipyKeZmene) {
      try {
        console.log(`Generuji nový trvalý obrázek pro: ${tip.title}`);

        const aiImageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional high-tech hardware photography: ${tip.title}. Violet and cyan cinematic lighting, focus on detail, 8k.`,
          n: 1, size: "1024x1024",
        });
        
        const tempImageUrl = aiImageResponse.data[0].url;

        // Stažení
        const imageRes = await fetch(tempImageUrl);
        const buffer = Buffer.from(await imageRes.arrayBuffer());
        const fileName = `fixed-tip-${tip.id}-${Date.now()}.png`;

        // Upload do storage
        const { error: storageError } = await supabase.storage
          .from('clanky-images')
          .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage
          .from('clanky-images')
          .getPublicUrl(fileName);

        const finalImageUrl = publicUrlData.publicUrl;

        // Update DB
        const { error: updateError } = await supabase
          .from('tipy')
          .update({ image_url: finalImageUrl })
          .eq('id', tip.id);

        if (updateError) throw updateError;

        vysledky.push({ title: tip.title, status: 'Success' });
      } catch (err) {
        console.error(`Chyba u tipu ${tip.id}:`, err.message);
        vysledky.push({ title: tip.title, status: 'Failed', error: err.message });
      }
    }

    return NextResponse.json({ 
      processed: vysledky.length,
      details: vysledky 
    }, { status: 200 });

  } catch (error) {
    console.error("Global Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
