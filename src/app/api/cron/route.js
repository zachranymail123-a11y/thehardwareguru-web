import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = process.env.YOUTUBE_API_KEY;
  // ID kanálu, které nám fungovalo přes Search
  const CHANNEL_ID = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
  
  // Inicializace AI - klíč už máš ve Vercelu nastavený
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. Najdeme nová videa (Search metoda - ta jediná fungovala spolehlivě)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
      return NextResponse.json({ chyba_youtube: searchData.error.message }, { status: 400 });
    }

    let novych = 0;
    let preskoceno = 0;
    let errors = [];

    for (const item of searchData.items || []) {
      // Chceme jen videa
      if (item.id.kind !== 'youtube#video') continue;

      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const originalDescription = item.snippet.description;
      
      const slug = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Kontrola, jestli už to video máme
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // --- TADY ZAČÍNÁ MAGIE S AI ---
      let aiContent = '';
      
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Jsi zkušený redaktor webu 'The Hardware Guru'. Jsi 45letý pohodový gamer a HW nadšenec, který píše pro svou komunitu.
              
              Zadání:
              Na základě názvu a krátkého popisu videa napiš poutavý článek v češtině (cca 300-500 slov).
              
              Styl:
              - Tykáš čtenářům, jsi přátelský, občas použij herní slang.
              - Používej HTML formátování (<h2> pro podnadpisy, <p> pro odstavce, <ul> pro seznamy).
              - Text musí být čtivý a strukturovaný.
              
              Obsah musí obsahovat:
              1. Úvod (o čem video je).
              2. Hlavní část (rozveď téma, přidej technické detaily nebo herní tipy související s názvem).
              3. Zmínka o tvém streamu: Vždy v textu zmiň, že na tvém Kick kanále (TheHardwareGuru) je unikátní AI, která komunikuje s diváky a komentuje hru.
              4. Závěr s výzvou ke sledování.`
            },
            {
              role: "user",
              content: `Název videa: ${title}\nOriginální popis: ${originalDescription}`
            }
          ],
          model: "gpt-4o-mini", // Rychlý a levný model
        });

        // Vezmeme text od AI
        aiContent = completion.choices[0].message.content;

        // Přidáme na konec odkaz na video, kdyby ho AI zapomněla
        aiContent += `
          <hr />
          <p><em>Tento článek byl automaticky vygenerován a rozšířen pomocí AI na základě videa.</em></p>
          <p><strong>Sleduj video přímo na YouTube:</strong> <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">ZDE</a></p>
        `;

      } catch (aiError) {
        console.error("AI selhala, používám zálohu:", aiError);
        errors.push(aiError.message);
        // Kdyby došly kredity nebo AI spadla, použijeme původní popis, ať se to aspoň uloží
        aiContent = `<p>${originalDescription.replace(/\n/g, '<br>')}</p>`;
      }

      // Uložení do databáze
      const { error: insertError } = await supabase.from('posts').insert([
        {
          title: title,
          slug: slug,
          video_id: videoId,
          content: aiContent,
          created_at: new Date().toISOString(),
        }
      ]);

      if (!insertError) novych++;
    }

    return NextResponse.json({ 
      status: 'HOTOVO', 
      zprava: `Přidáno ${novych} článků (AI powered), ${preskoceno} už existovalo.`,
      debug_errors: errors.length > 0 ? errors : 'Žádné chyby AI'
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
