import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    // 1. Najdeme tipy, které mají obrázek z OpenAI (vypršený) nebo fallback
    // Hledáme adresy obsahující 'openai' nebo 'unsplash'
    const { data: tipyKeZmene, error: fetchError } = await supabase
      .from('tipy')
      .select('id, title, image_url')
      .or('image_url.ilike.%openai%,image_url.ilike.%unsplash%');

    if (fetchError) throw fetchError;
    if (!tipyKeZmene || tipyKeZmene.length === 0) {
      return NextResponse.json({ message: "Žádné tipy k opravě nebyly nalezeny." });
    }

    const vysledky = [];

    // 2. Projdeme nalezené tipy a vygenerujeme jim nové obrázky
    for (const tip of tipyKeZmene) {
      try {
        console.log(`Opravuji obrázek pro: ${tip.title}`);

        const aiImageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional high-tech hardware photography: ${tip.title}. Violet and cyan cinematic lighting, focus on detail, 8k.`,
          n: 1, size: "1024x1024",
        });
        
        const tempImageUrl = aiImageResponse.data[0].url;

        // Stáhnout a nahrát do Supabase
        const imageRes = await fetch(tempImageUrl);
        const buffer = Buffer.from(await imageRes.arrayBuffer());
        const fileName = `fixed-tip-${tip.id}-${Date.now()}.png`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('clanky-images')
          .upload(fileName, buffer, { contentType: 'image/png' });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage
          .from('clanky-images')
          .getPublicUrl(fileName);

        const finalImageUrl = publicUrlData.publicUrl;

        // 3. Update v databázi
        const { error: updateError } = await supabase
          .from('tipy')
          .update({ image_url: finalImageUrl })
          .eq('id', tip.id);

        if (updateError) throw updateError;

        vysledky.push({ id: tip.id, status: 'Opraveno', url: finalImageUrl });
      } catch (err) {
        vysledky.push({ id: tip.id, status: 'Chyba', error: err.message });
      }
    }

    return NextResponse.json({ 
      message: `Zpracování dokončeno. Celkem nalezeno: ${tipyKeZmene.length}`,
      detaily: vysledky 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
