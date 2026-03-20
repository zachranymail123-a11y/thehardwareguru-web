import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW OMNI-FEEDER
 * Cesta: src/app/api/seo/bing-cron/route.js
 * 🚀 CÍL: Odeslat 500 URL do IndexNow (Bing, Seznam, Yandex). Žádné doprošování podpory o limity.
 */

export const dynamic = 'force-dynamic';

async function fetchXmlLocs(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const text = await res.text();
        return [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => !u.endsWith('.rss') && !u.includes('/rss') && !u.includes('/feed'));
    } catch (e) {
        console.error(`[INDEXNOW] Chyba stahování sitemapy ${url}:`, e);
        return [];
    }
}

export async function GET(request) {
    try {
        // 1. Zabezpečení CRONU
        const { searchParams } = new URL(request.url);
        const providedKey = searchParams.get('key');
        const expectedKey = process.env.GURU_CRON_SECRET;

        if (!expectedKey || providedKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const baseUrl = "https://thehardwareguru.cz";
        const host = "thehardwareguru.cz"; // IndexNow vyžaduje hostitele čistě bez https://
        const indexNowKey = "guru-indexnow-key-2026"; // Klíč, který jsi dal do public složky
        const keyLocation = `${baseUrl}/${indexNowKey}.txt`;

        // 2. STÁHNEME DATA ZE SITEMAP
        const sitemaps = [
            `${baseUrl}/guru-sitemap.xml`,
            `${baseUrl}/latest.xml`,
            `${baseUrl}/sitemap-hity.xml`
        ];

        const results = await Promise.all(sitemaps.map(s => fetchXmlLocs(s)));
        let allUrls = [...new Set(results.flat())];

        if (allUrls.length === 0) return NextResponse.json({ error: 'Nenašly se žádné URL' }, { status: 404 });

        // 3. VÝBĚR 500 NÁHODNÝCH URL (Zůstáváme bezpečně pod Vercel/API limity)
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

        // 4. SESTAVENÍ INDEXNOW PAYLOADU
        const payload = {
            host: host,
            key: indexNowKey,
            keyLocation: keyLocation,
            urlList: urlsToSend
        };

        // 5. ODESLÁNÍ DO GLOBÁLNÍ INDEXNOW SÍTĚ (Bing to přijme a sdílí se Seznamem a Yandexem)
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        // IndexNow vrací 200 (OK) nebo 202 (Accepted)
        if (response.ok) {
            return NextResponse.json({ 
                success: true, 
                submittedCount: urlsToSend.length,
                message: "Úspěšně odesláno do IndexNow sítě (Bing, Seznam.cz, Yandex)."
            }, { status: 200 });
        } else {
            const errorText = await response.text();
            return NextResponse.json({ 
                success: false, 
                error: 'IndexNow API Error', 
                details: errorText 
            }, { status: response.status });
        }

    } catch (error) {
        console.error("[INDEXNOW CRON] Kritická chyba:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
