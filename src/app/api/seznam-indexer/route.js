import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

/**
 * GURU SEZNAM AUTO-INDEXER V2.0 (CRON & RATE LIMIT READY)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🛡️ LIMITS: 
 * - Max 5 dotazů / s (nastaveno 600ms delay = ~1.6 req/s)
 * - Max 100 dotazů / min (600ms delay zajistí max 100/min)
 * - Max 500 dotazů / den (kontrolováno parametrem limit)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sitemapName = searchParams.get('sitemap') || 'pages'; 
  
  // 🚀 GURU LIMIT: Maximálně 500 denně dle pravidel Seznamu. 
  // Pro jedno spuštění doporučuji 15, aby Vercel nehodil Timeout (10s limit).
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 500); 

  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  const baseUrl = 'https://thehardwareguru.cz';
  const sitemapUrl = `${baseUrl}/guru-sitemap/${sitemapName}.xml`;

  try {
    // 1. STÁHNUTÍ SITEMAPY
    const sitemapRes = await fetch(sitemapUrl, { cache: 'no-store' });
    if (!sitemapRes.ok) {
       return NextResponse.json({ error: `Nelze načíst sitemapu: ${sitemapUrl}. HTTP ${sitemapRes.status}` });
    }
    const xmlData = await sitemapRes.text();

    // 2. PARSOVÁNÍ URL
    const parser = new XMLParser();
    const parsed = parser.parse(xmlData);

    let urls = [];
    if (parsed.urlset && parsed.urlset.url) {
        urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    }

    if (urls.length === 0) return NextResponse.json({ message: `Sitemapa ${sitemapName}.xml je prázdná.` });

    // Náhodně zamícháme nebo vezmeme prvních N podle limitu
    const urlsToProcess = urls.slice(0, limit).map(u => u.loc);
    const results = [];

    // 3. CYKLUS S INTELLIGENTNÍM DELAYEM (600ms)
    for (const url of urlsToProcess) {
        try {
            // 🚀 GURU FIX: Přesný formát z tvého úspěšného cURL testu
            // URL parametry key a url v POST požadavku
            const targetUrl = `https://reporter.seznam.cz/wm-api/web/document/reindex?key=${apiKey}&url=${encodeURIComponent(url)}`;
            
            const seznamRes = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                body: '' // cURL ukázal prázdné body (-d '')
            });

            const responseText = await seznamRes.text();
            let seznamData = null;
            try { seznamData = JSON.parse(responseText); } catch(e) { seznamData = responseText; }

            results.push({
                url,
                status: seznamRes.status,
                ok: seznamRes.status === 200 || seznamRes.status === 201,
                seznam_response: seznamData
            });

        } catch (err) {
            results.push({ url, error: err.message, status: 500, ok: false });
        }
        
        // 🚀 RATE LIMIT BYPASS: 600ms pauza zajistí dodržení 100 req/min i 5 req/s
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        processed_count: results.length,
        message: `Odesláno ${results.filter(r => r.ok).length} URL do Seznamu (Rate limit 600ms dodržen).`,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
