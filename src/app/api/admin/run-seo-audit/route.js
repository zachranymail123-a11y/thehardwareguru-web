import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU AI SEO MANAGER - CRAWLER & EVALUATOR
 * 🚀 CÍL: Analyzovat URL přes GPT-4o-mini a uložit návrhy k manuálnímu schválení.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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

    // 1. STÁHNUTÍ HTML STRÁNKY
    const pageRes = await fetch(url, { headers: { 'User-Agent': 'Guru-SEO-Bot/1.0' } });
    if (!pageRes.ok) {
        return NextResponse.json({ error: 'Nepodařilo se načíst zadanou URL' }, { status: 400 });
    }
    const html = await pageRes.text();

    // 2. EXTRAKCE HLAVNÍCH SEO METADAT
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i) || html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const textContentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    const extractedData = {
        title: titleMatch ? titleMatch[1].trim() : 'CHYBÍ TITLE',
        description: descMatch ? descMatch[1].trim() : 'CHYBÍ META DESCRIPTION',
        h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'CHYBÍ H1',
        textLength: textContentMatch ? textContentMatch[1].replace(/<[^>]+>/g, '').length : 0
    };

    // 3. ODESLÁNÍ DO GPT-4o-mini S EXTRÉMNĚ SPECIFICKÝM PROMPTEM PRO 4 VYHLEDÁVAČE
    const systemPrompt = `Jsi elitní SEO architekt. Tvým jediným cílem je raketový růst organického trafficu.
Perfektně ovládáš algoritmy a oficiální dokumentace pro tyto 4 vyhledávače:
1. GOOGLE: Zaměření na E-E-A-T, uživatelský záměr (search intent). Title max 60 znaků, Description max 155 znaků.
2. BING: Extrémní citlivost na přesnou shodu klíčových slov v Title a H1. Nulová tolerance k duplicitám a prázdným meta tagům.
3. YANDEX: Tvrdá penalizace za "thin content" (krátký, nekvalitní obsah) a SEO spam. Hodnotí čistotu tagů a jasnou strukturu.
4. SEZNAM.CZ: Specifický lokální vyhledávač. Klade důraz na přesnou českou sémantiku, skloňování a výskyt klíčového slova hned na začátku nadpisu.

Zhodnoť poskytnutá data webové stránky. Tvé návrhy musí být agresivní, praktické a cílené na získání prvních pozic.
U každé chyby nebo návrhu specifikuj, pro který vyhledávač je to kritické (např. "[BING] Chybí klíčové slovo v H1", "[YANDEX] Obsah je příliš krátký").

Vrať POUZE validní JSON v tomto formátu, bez markdownu nebo textu okolo:
{
  "seo_score": číslo od 0 do 100,
  "critical_errors": ["seznam kritických chyb s označením vyhledávače"],
  "suggestions": ["konkrétní návrhy na úpravu textů, klíčových slov a tagů pro raketový růst"]
}`;

    const userPrompt = `Analyzuj tuto stránku: 
URL: ${url} 
Typ stránky: ${pageType} 
Title: ${extractedData.title} 
Description: ${extractedData.description} 
H1: ${extractedData.h1}
Přibližná délka textu: ${extractedData.textLength} znaků.`;

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

    // 4. BEZPEČNÉ ULOŽENÍ DO KARANTÉNNÍ TABULKY
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
