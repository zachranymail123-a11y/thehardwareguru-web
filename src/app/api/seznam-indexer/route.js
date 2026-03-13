import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

/**
 * GURU SEZNAM AUTO-INDEXER V1.0
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🚀 CÍL: Bleskové natlačení URL do Seznam.cz (až 500 denně).
 * 💡 POUŽITÍ: V prohlížeči zadej: https://thehardwareguru.cz/api/seznam-indexer?sitemap=pages&limit=50
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Nikdy nekešovat, vždy čerstvé spuštění

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Z URL parametrů můžeme určit, kterou sitemapu čteme a kolik adres pošleme
  // Výchozí je 'pages' a limit 50 (Vercel má 10-15s timeout, takže posíláme po menších dávkách)
  const sitemapName = searchParams.get('sitemap') || 'pages'; 
  const limit = parseInt(searchParams.get('limit') || '50', 10); 

  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu! Zkontroluj proměnné prostředí." }, { status: 400 });
  }

  const baseUrl = 'https://thehardwareguru.cz';
  const sitemapUrl = `${baseUrl}/guru-sitemap/${sitemapName}.xml`;

  try {
    // 1. STÁHNUTÍ SITEMAPY Z TVÉHO WEBU
    const sitemapRes = await fetch(sitemapUrl, { cache: 'no-store' });
    if (!sitemapRes.ok) {
       return NextResponse.json({ error: `Nelze načíst sitemapu: ${sitemapUrl}. Existuje vůbec?` });
    }
    const xmlData = await sitemapRes.text();

    // 2. PARSOVÁNÍ XML A ZÍSKÁNÍ URL
    const parser = new XMLParser();
    const parsed = parser.parse(xmlData);

    let urls = [];
    if (parsed.urlset && parsed.urlset.url) {
        // Fast-XML-Parser vrací objekt, pokud je položka jen jedna, jinak pole
        urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    }

    if (urls.length === 0) {
        return NextResponse.json({ message: `Sitemapa ${sitemapName}.xml je prázdná.` });
    }

    // Ořízneme počet adres podle limitu
    const urlsToProcess = urls.slice(0, limit).map(u => u.loc);
    const results = [];

    // 3. ODESÍLÁNÍ DO SEZNAM API (v cyklu)
    for (const url of urlsToProcess) {
        try {
            const seznamRes = await fetch('https://webmaster.seznam.cz/api/web/document/reindex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Seznam většinou vyžaduje Bearer token, testujeme tento standard
                    'Authorization': `Bearer ${apiKey}` 
                },
                // Požadavek na reindexaci jedné URL
                body: JSON.stringify({ url: url })
            });

            // Odchycení odpovědi od Seznamu pro náš Debug report
            const seznamData = await seznamRes.json().catch(() => null);

            results.push({
                url,
                status: seznamRes.status,
                ok: seznamRes.ok,
                seznam_response: seznamData
            });

        } catch (err) {
            results.push({ url, error: err.message });
        }
        
        // Záměrná malá pauza (100 ms), abychom Seznam nespamovali jako DDoS útok
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 4. VYGENEROVÁNÍ GURU REPORTU
    return NextResponse.json({
        guru_status: "SUCCESS",
        message: `Úspěšně zpracováno a odesláno ${urlsToProcess.length} URL ze sitemapy ${sitemapName}.xml do Seznamu.`,
        sitemap_used: sitemapUrl,
        results: results
    });

  } catch (error) {
    console.error("SEZNAM AUTO-INDEXER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
