import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW OMNI-FEEDER (S PODPOROU ROZCESTNÍKŮ)
 * Cesta: src/app/api/seo/bing-cron/route.js
 */

export const dynamic = 'force-dynamic';

async function fetchSitemapData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return { isIndex: false, urls: [] };
        const text = await res.text();
        
        // Vytáhneme všechny <loc> a ignorujeme RSS
        const locs = [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => !u.endsWith('.rss') && !u.includes('/rss') && !u.includes('/feed'));

        // Zjistíme, jestli to je rozcestník na další XML, nebo už reálné články
        const isIndex = text.includes('<sitemapindex');
        
        return { isIndex, urls: locs };
    } catch (e) {
        console.error(`[INDEXNOW] Chyba stahování ${url}:`, e);
        return { isIndex: false, urls: [] };
    }
}

export async function GET(request) {
    try {
        // 1. Zabezpečení
        const { searchParams } = new URL(request.url);
        const providedKey = searchParams.get('key');
        const expectedKey = process.env.GURU_CRON_SECRET;

        if (!expectedKey || providedKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. TVOJE 3 HLAVNÍ SITEMAPY
        const mainSitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        let allActualUrls = [];
        let childSitemaps = [];

        // 3. Projdeme je a roztřídíme na "články" a "další XML rozcestníky"
        for (const url of mainSitemaps) {
            const data = await fetchSitemapData(url);
            if (data.isIndex) {
                childSitemaps.push(...data.urls);
            } else {
                allActualUrls.push(...data.urls);
            }
        }

        // 4. Pokud jsme našli rozcestník, vybereme náhodně JEDNU podsitemapu a vycucneme ji 
        // (Bereme jen jednu, abychom nestahovali 250k URL naráz a neshodili Vercel server)
        if (childSitemaps.length > 0) {
            const randomChild = childSitemaps[Math.floor(Math.random() * childSitemaps.length)];
            console.log(`[INDEXNOW] Zanořuji se do podsitemapy: ${randomChild}`);
            const childData = await fetchSitemapData(randomChild);
            allActualUrls.push(...childData.urls);
        }

        // 5. Vyčistíme duplicity
        allActualUrls = [...new Set(allActualUrls)];

        if (allActualUrls.length === 0) {
            return NextResponse.json({ error: 'Nenašly se žádné URL' }, { status: 404 });
        }

        // 6. ZAMÍCHÁME A VEZMEME MAX 500 URL (Limit API na jeden request)
        const batchSize = Math.min(500, allActualUrls.length);
        const urlsToSend = allActualUrls.sort(() => 0.5 - Math.random()).slice(0, batchSize);

        // 7. ODESLÁNÍ DO INDEXNOW
        const payload = {
            host: "thehardwareguru.cz",
            key: "guru-indexnow-key-2026",
            keyLocation: "https://thehardwareguru.cz/guru-indexnow-key-2026.txt",
            urlList: urlsToSend
        };

        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return NextResponse.json({ 
                success: true, 
                submittedCount: urlsToSend.length,
                message: "Úspěšně odesláno do IndexNow sítě (Bing, Seznam.cz, Yandex)."
            }, { status: 200 });
        } else {
            const errorText = await response.text();
            return NextResponse.json({ success: false, error: 'IndexNow Error', details: errorText }, { status: response.status });
        }

    } catch (error) {
        console.error("[INDEXNOW CRON] Kritická chyba:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
