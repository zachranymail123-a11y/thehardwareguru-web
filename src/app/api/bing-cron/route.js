import { NextResponse } from 'next/server';

/**
 * GURU BING CRON - EXPLICIT SITEMAPS
 * Cesta: src/app/api/seo/bing-cron/route.js
 * 🚀 CÍL: Stáhnout data výhradně ze tří zadaných sitemap, sloučit a odeslat 500 URL do Bingu.
 */

export const dynamic = 'force-dynamic';

async function fetchXmlLocs(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`[BING CRON] Nepodařilo se stáhnout: ${url}`);
            return [];
        }
        const text = await res.text();
        
        // Extrahujeme všechny <loc> a vyřadíme RSS bordel
        return [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => !u.endsWith('.rss') && !u.includes('/rss') && !u.includes('/feed'));
    } catch (e) {
        console.error(`[BING CRON] Chyba při zpracování ${url}:`, e);
        return [];
    }
}

export async function GET(request) {
    try {
        // 1. Zabezpečení
        const { searchParams } = new URL(request.url);
        const providedKey = searchParams.get('key');
        const expectedKey = process.env.GURU_CRON_SECRET;

        if (!expectedKey || providedKey !== expectedKey) {
            return NextResponse.json({ error: 'Neplatný nebo chybějící klíč (Unauthorized)' }, { status: 401 });
        }

        const bingApiKey = process.env.BING_API_KEY;
        if (!bingApiKey) {
            return NextResponse.json({ error: 'Chybí BING_API_KEY' }, { status: 500 });
        }

        // 2. TVOJE TŘI EXPLICITNÍ SITEMAPY
        const sitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        // 3. Stáhneme všechny tři naráz (paralelně pro úsporu času Vercel funkce)
        const results = await Promise.all(sitemaps.map(s => fetchXmlLocs(s)));
        
        // 4. Sloučíme je do jednoho obřího pole
        let allUrls = results.flat();

        // Rychlá deduplikace
        allUrls = [...new Set(allUrls)];

        if (allUrls.length === 0) {
            return NextResponse.json({ error: 'Nenašly se žádné platné URL v těchto sitemapách.' }, { status: 404 });
        }

        // 5. Ochrana výkonu: Z obřího pole (až 250k URL) vyzobeme přesně 500 náhodných.
        // Děláme to takto, aby Vercel nemusel sortovat 250 000 položek (což by mohlo shodit RAM).
        const batchSize = Math.min(500, allUrls.length);
        const urlsToSend = [];
        const usedIndices = new Set();

        while (urlsToSend.length < batchSize) {
            const randIdx = Math.floor(Math.random() * allUrls.length);
            if (!usedIndices.has(randIdx)) {
                usedIndices.add(randIdx);
                urlsToSend.push(allUrls[randIdx]);
            }
        }

        // 6. Odeslání dávky 500 URL do Bingu
        const payload = {
            siteUrl: "https://thehardwareguru.cz",
            urlList: urlsToSend
        };

        const bingEndpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingApiKey}`;

        const response = await fetch(bingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': 'ssl.bing.com'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({ 
                success: true, 
                totalUrlsExtracted: allUrls.length,
                submittedCount: urlsToSend.length,
                bingResponse: data 
            }, { status: 200 });
        } else {
            const errorText = await response.text();
            return NextResponse.json({ 
                success: false, 
                error: 'Bing API rejected the request', 
                details: errorText 
            }, { status: response.status });
        }

    } catch (error) {
        console.error("[BING CRON] Kritická chyba:", error);
        return NextResponse.json({ error: 'Internal Server Error', msg: error.message }, { status: 500 });
    }
}
