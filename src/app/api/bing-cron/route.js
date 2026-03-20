import { NextResponse } from 'next/server';

/**
 * GURU INDEXNOW OMNI-FEEDER (BULLETPROOF 500 URLS)
 * Cesta: src/app/api/seo/bing-cron/route.js
 */

export const dynamic = 'force-dynamic';

async function fetchSitemapData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return { isIndex: false, urls: [] };
        const text = await res.text();
        
        // Vytáhneme všechny <loc> a vyčistíme RSS bordel
        const locs = [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => !u.endsWith('.rss') && !u.includes('/rss') && !u.includes('/feed'));

        // Obsahuje to další XML rozcestníky?
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

        // 2. TVOJE 3 SITEMAPY
        const mainSitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        let actualUrls = [];
        let childSitemaps = [];

        // 3. Stáhneme hlavní 3 soubory a roztřídíme
        for (const url of mainSitemaps) {
            const data = await fetchSitemapData(url);
            if (data.isIndex) {
                childSitemaps.push(...data.urls); // Odkazy na další XML
            } else {
                actualUrls.push(...data.urls); // Rovnou reálné články
            }
        }

        // 4. Pokud nemáme plných 500 článků, začneme vybírat z rozcestníků
        if (childSitemaps.length > 0 && actualUrls.length < 500) {
            // Náhodně zamícháme podsitemapy, ať nečteme furt dokola ty samé
            childSitemaps = childSitemaps.sort(() => 0.5 - Math.random());

            for (const childUrl of childSitemaps) {
                // Jakmile nahrabeme aspoň 500, končíme čtení
                if (actualUrls.length >= 500) break;
                
                console.log(`[INDEXNOW] Otevírám podsitemapu: ${childUrl}`);
                const childData = await fetchSitemapData(childUrl);
                actualUrls.push(...childData.urls);
            }
        }

        // 5. Odstraníme duplicity
        actualUrls = [...new Set(actualUrls)];

        if (actualUrls.length === 0) {
            return NextResponse.json({ error: 'Nenašly se žádné URL' }, { status: 404 });
        }

        // 6. Odřízneme čistých 500 adres (před oříznutím je zamícháme)
        const batchSize = Math.min(500, actualUrls.length);
        const urlsToSend = actualUrls.sort(() => 0.5 - Math.random()).slice(0, batchSize);

        // 7. ODESLÁNÍ DO INDEXNOW (Bing, Seznam, Yandex)
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
                collectedUrlsFromSitemaps: actualUrls.length,
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
