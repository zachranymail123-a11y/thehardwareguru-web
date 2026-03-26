import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU AI SEO MANAGER - CRAWLER & EVALUATOR
 * 🚀 CÍL: Analyzovat URL přes GPT-4o-mini a uložit návrhy k manuálnímu schválení.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Použijeme tvůj standardní klíč pro připojení
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, pageType = 'general' } = body;

    if (!url) {
      return NextResponse.json({ error: 'Chybí URL k analýze' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Chybí OPENAI_API_KEY v proměnných' }, { status: 500 });
    }

    // 1. STÁHNUTÍ HTML STRÁNKY (Náš vlastní mini-crawler)
    const pageRes = await fetch(url, { headers: { 'User-Agent': 'Guru-SEO-Bot/1.0' } });
    if (!pageRes.ok) {
        return NextResponse.json({ error: 'Nepodařilo se načíst zadanou URL' }, { status: 400 });
    }
    const html = await pageRes.text();

    // 2. EXTRAKCE HLAVNÍCH SEO METADAT POMOCÍ REGEXU (rychlé, bez zátěže)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i) || html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    const extractedData = {
        title: titleMatch ? titleMatch[1].trim() : 'CHYBÍ TITLE',
        description: descMatch ? descMatch[1].trim() : 'CHYBÍ META DESCRIPTION',
        h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'CHYBÍ H1'
    };

    // 3. ODESLÁNÍ DO GPT-4o-mini (Nejlevnější model)
    const systemPrompt = `Jsi senior SEO architekt pro Google, Bing, Yandex a Seznam.cz. 
Zhodnoť poskytnutá metadata webové stránky. Hledej duplicity, příliš dlouhé/krátké texty, chybějící klíčová slova nebo thin-content znaky.
Vrať POUZE validní JSON v tomto formátu, bez markdownu nebo textu okolo:
{
  "seo_score": číslo od 0 do 100,
  "critical_errors": ["chyba 1", "chyba 2"],
  "suggestions": ["konkrétní návrh na nový title", "návrh na úpravu textu pro lepší indexaci"]
}`;

    const userPrompt = `Analyzuj tuto stránku: URL: ${url} \nTyp: ${pageType} \nTitle: ${extractedData.title} \nDescription: ${extractedData.description} \nH1: ${extractedData.h1}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        })
    });

    const aiData = await aiRes.json();
    
    if (aiData.error) {
        console.error("OpenAI Error:", aiData.error);
        return NextResponse.json({ error: 'Chyba při komunikaci s OpenAI' }, { status: 500 });
    }

    // 4. BEZPEČNÉ ULOŽENÍ DO KARANTÉNNÍ TABULKY (Status: pending_review)
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    const { error: dbError } = await supabase
        .from('seo_audits')
        .insert([{
            url: url,
            page_type: pageType,
            seo_score: analysisResult.seo_score,
            critical_errors: analysisResult.critical_errors || [],
            suggestions: analysisResult.suggestions || [],
            status: 'pending_review'
        }]);

    if (dbError) {
        console.error("Supabase Error:", dbError);
        return NextResponse.json({ error: 'Nepodařilo se uložit audit do databáze' }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Audit dokončen a uložen ke schválení.',
        extracted: extractedData,
        audit: analysisResult
    });

  } catch (err) {
    console.error("SEO Audit Error:", err);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}
