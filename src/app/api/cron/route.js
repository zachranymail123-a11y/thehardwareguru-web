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
  // ID kanálu
  const CHANNEL_ID = 'UCgDdszBhhpqkNQc6t4YOCNw'; 
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. Stáhneme videa (Zvedl jsem limit na 10, ať se ti načte víc videí)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
      return NextResponse.json({ chyba_youtube: searchData.error.message }, { status: 400 });
    }

    let novych = 0;
    let preskoceno = 0;
    let errors = [];

    for (const item of searchData.items || []) {
      if (item.id.kind !== 'youtube#video') continue;

      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const originalDescription = item.snippet.description;
      
      const slug = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Kontrola existence
      const { data: existujici } = await supabase
        .from('posts')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (existujici) {
        preskoceno++;
        continue;
      }

      // --- AI GENEROVÁNÍ ---
      let aiContent = '';
      
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Jsi redaktor webu 'The Hardware Guru'. Napiš článek na základě názvu a popisu videa.
              Styl: Tykání, herní slang, HTML formátování (pouze tagy h2, p, ul, li, strong).
              DŮLEŽITÉ: Vrať pouze čistý HTML kód bez markdown značek.
              Obsah: Úvod, hlavní část, zmínka o unikátní AI v chatu na Kicku, závěr.`
            },
            {
              role: "user",
              content: `Název: ${title}\nPopis: ${originalDescription}`
            }
          ],
          model: "gpt-4o-mini",
        });

        aiContent = completion.choices[0].message.content;

        // --- ČIŠTĚNÍ KÓDU (FIX PROTI BUGU '''html) ---
        // Odstraníme '''html na začátku a ''' na konci
        aiContent = aiContent.replace(/^```html/g, '').replace(/^```/g, '').replace(/```$/g, '');

        aiContent += `<hr /><p><strong>Sleduj video:</strong> <a href="https://www.youtube.com/watch?v=${videoId}">YouTube</a></p>`;

      } catch (aiError) {
        errors.push(aiError.message);
        aiContent = `<p>${originalDescription.replace(/\n/g, '<br>')}</p>`;
      }

      // Uložení
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

    return NextResponse.json({ status: 'HOTOVO', novych, preskoceno, errors });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
