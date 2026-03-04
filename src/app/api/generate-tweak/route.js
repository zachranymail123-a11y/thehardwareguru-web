import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Nezadal jsi název hry.' }, { status: 400 });
    }

    // 1. Získáme přesný název z PCGamingWiki vyhledávání
    const searchRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json`);
    const searchData = await searchRes.json();
    
    if (!searchData.query.search.length) {
      return NextResponse.json({ error: 'Hra nebyla na PCGamingWiki nalezena.' }, { status: 404 });
    }
    
    const exactTitle = searchData.query.search[0].title;

    // 2. Vytáhneme surový obsah stránky hry z PCGW
    const pageRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(exactTitle)}&explaintext=1&format=json`);
    const pageData = await pageRes.json();
    const pages = pageData.query.pages;
    const pageId = Object.keys(pages)[0];
    const rawText = pages[pageId].extract || '';

    // Ořízneme text, aby nám to nesežralo všechny tokeny (zajímá nás hlavně úvod a fixy)
    const shortText = rawText.substring(0, 3000); 

    // 3. Pošleme to do GPT, ať z toho udělá GURU článek a SEO popis
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // nebo gpt-3.5-turbo pro úsporu
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. Píšeš drsně, bez servítků, používáš občas sprostá slova, když vývojáři něco odfláknou. Tvým úkolem je vytvořit krátký SEO popis a HTML článek s fixy na základě dat z PCGamingWiki." },
        { role: "user", content: `Tady jsou data z PCGamingWiki pro hru ${exactTitle}:\n\n${shortText}\n\nVygeneruj mi JSON s následující strukturou:\n{\n  "seo_description": "Krátký úderný popis do 150 znaků pro Google.",\n  "html_content": "Kompletní HTML článek s h2 nadpisy a p tagy. Vypíchni hlavní problémy a jak je opravit."\n}` }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(completion.choices[0].message.content);

    // 4. Vygenerujeme obrázek přes DALL-E 3
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A dark, high-tech, cinematic gaming PC hardware illustration related to the video game ${title}. Neon yellow and dark grey accents. Cyberpunk aesthetic, glassmorphism, no text, glowing PC components.`,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({
      seo_description: aiContent.seo_description,
      html_content: aiContent.html_content,
      image_url: image.data[0].url
    });

  } catch (error) {
    console.error('AI Generování selhalo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
