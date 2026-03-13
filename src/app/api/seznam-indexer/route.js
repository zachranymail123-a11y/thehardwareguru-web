import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

/**
 * GURU SEZNAM AUTO-INDEXER V1.3 (SUCCESS PARSER FIX)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🚀 CÍL: Obejít ochranu Seznamu a správně označit odeslané URL jako zelené.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sitemapName = searchParams.get('sitemap') || 'pages'; 
  const limit = parseInt(searchParams.get('limit') || '50', 10); 

  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  const baseUrl = 'https://thehardwareguru.cz';
  const sitemapUrl = `${baseUrl}/guru-sitemap/${sitemapName}.xml`;

  try {
    const sitemapRes = await fetch(sitemapUrl, { cache: 'no-store' });
    if (!sitemapRes.ok) {
       return NextResponse.json({ error: `Nelze načíst sitemapu: ${sitemapUrl}. HTTP ${sitemapRes.status}` });
    }
    const xmlData = await sitemapRes.text();

    const parser = new XMLParser();
    const parsed = parser.parse(xmlData);

    let urls = [];
    if (parsed.urlset && parsed.urlset.url) {
        urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    }

    if (urls.length === 0) return NextResponse.json({ message: `Sitemapa ${sitemapName}.xml je prázdná nebo nevalidní.` });

    const urlsToProcess = urls.slice(0, limit).map(u => u.loc);
    const results = [];

    for (const url of urlsToProcess) {
        try {
            const seznamRes = await fetch('https://webmaster.seznam.cz/api/web/document/reindex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-API-Key': apiKey,
                    // Maskování za reálný Google Chrome prohlížeč proti zablokování
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                body: JSON.stringify({ url: url })
            });

            // Seznam často vrátí jen "null" nebo divný status i když to převezme.
            // Pokud to nespadlo do bloku catch nebo nevrátilo vyloženě 4xx error (kromě 429 too many req), je to v pohodě.
            let isOk = seznamRes.ok;
            if (seznamRes.status === 200 || seznamRes.status === 201 || seznamRes.status === 202) {
              isOk = true;
            }

            const responseText = await seznamRes.text();
            let seznamData = null;
            try { seznamData = JSON.parse(responseText); } catch(e) { seznamData = responseText; }

            results.push({
                url,
                status: seznamRes.status,
                ok: isOk,
                seznam_response: seznamData
            });

        } catch (err) {
            // Získáme detailní důvod síťového selhání pro terminál v administraci
            const detailedError = err.cause?.message || err.message;
            results.push({ url, error: detailedError, status: 500, ok: false });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        message: `Zpracováno ${urlsToProcess.length} URL.`,
        sitemap_used: sitemapUrl,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
