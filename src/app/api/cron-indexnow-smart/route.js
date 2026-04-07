import { NextResponse } from 'next/server';

// Prodlužujeme limit pro Vercel (máš Pro účet, takže 60 vteřin je v pohodě)
export const maxDuration = 60; 
export const dynamic = 'force-dynamic'; // Zabraní cachování tohoto skriptu na Vercelu

export async function GET(request) {
  const host = "thehardwareguru.cz";
  const key = "guru-indexnow-key-2026";
  const keyLocation = `https://${host}/${key}.txt`;

  try {
    // 1. STAŽENÍ HLAVNÍHO ROZCESTNÍKU
    const mainSitemapUrl = `https://${host}/guru-sitemap.xml`;
    const sitemapResponse = await fetch(mainSitemapUrl);
    
    if (!sitemapResponse.ok) {
        return NextResponse.json({ success: false, message: "Nelze stáhnout hlavní rozcestník." }, { status: 500 });
    }

    const sitemapText = await sitemapResponse.text();
    const indexMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
    const xmlLinks = [...new Set(indexMatches.map(m => m[1]))].filter(url => url.endsWith('.xml'));

    if (xmlLinks.length === 0) {
        return NextResponse.json({ success: false, message: "Nenalezeny žádné podsitemapy." }, { status: 400 });
    }

    // 2. TĚŽBA A FILTROVÁNÍ DAT (Pouze za posledních 24 hodin)
    let urlsToSubmit = [];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Stáhneme všechny podsitemapy postupně
    for (const xmlUrl of xmlLinks) {
        try {
            const subRes = await fetch(xmlUrl);
            const subText = await subRes.text();
            
            // Rozdělíme na jednotlivé <url> bloky, abychom spárovali <loc> a <lastmod>
            const urlBlocks = subText.split('<url>');
            
            for (let i = 1; i < urlBlocks.length; i++) {
                const block = urlBlocks[i];
                const locMatch = block.match(/<loc>(.*?)<\/loc>/);
                const modMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);
                
                if (locMatch && modMatch) {
                    const modDate = new Date(modMatch[1]);
                    // Pokud je článek/duel novější než 24 hodin, bereme ho!
                    if (modDate >= twentyFourHoursAgo) {
                        urlsToSubmit.push(locMatch[1]);
                    }
                }
            }
        } catch (err) {
            console.error(`Chyba při stahování podsitemapy ${xmlUrl}:`, err);
        }
    }

    // Odstranění duplicit a omezení na max 10 000 URL (limit IndexNow)
    urlsToSubmit = [...new Set(urlsToSubmit)].filter(url => !url.endsWith('.xml')).slice(0, 10000);

    if (urlsToSubmit.length === 0) {
        return NextResponse.json({ 
            success: true, 
            message: "Za posledních 24 hodin nebyly na webu nalezeny žádné změny ani nové stránky. Vše je aktuální.",
            urlsProcessed: 0
        });
    }

    // 3. ODESLÁNÍ DO VŠECH 5 VYHLEDÁVAČŮ SOUČASNĚ
    const payload = {
        host: host,
        key: key,
        keyLocation: keyLocation,
        urlList: urlsToSubmit
    };

    const endpoints = [
        { name: "Seznam", url: "https://search.seznam.cz/indexnow", hostHeader: "search.seznam.cz" },
        { name: "Bing", url: "https://www.bing.com/indexnow", hostHeader: "www.bing.com" },
        { name: "Yandex", url: "https://yandex.com/indexnow", hostHeader: "yandex.com" },
        { name: "Naver", url: "https://searchadvisor.naver.com/indexnow", hostHeader: "searchadvisor.naver.com" },
        { name: "Yep", url: "https://indexnow.yep.com", hostHeader: "indexnow.yep.com" }
    ];

    const results = [];

    // Pošleme payload na všechny služby
    for (const engine of endpoints) {
        try {
            const response = await fetch(engine.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Host': engine.hostHeader
                },
                body: JSON.stringify(payload)
            });
            
            results.push({
                engine: engine.name,
                status: response.status,
                success: response.ok
            });
        } catch (err) {
            results.push({ engine: engine.name, error: "Network/Timeout chyba" });
        }
    }

    // 4. SHRNUTÍ VÝSLEDKŮ
    return NextResponse.json({ 
        success: true, 
        message: "Chytrý IndexNow úspěšně proběhl.", 
        newOrUpdatedUrlsFound: urlsToSubmit.length,
        submittedUrls: urlsToSubmit,
        enginesStatus: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Kritická chyba API.", error: error.toString() }, { status: 500 });
  }
}
