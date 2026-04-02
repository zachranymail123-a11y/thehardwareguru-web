import { NextResponse } from 'next/server';

export async function GET(request) {
  const host = "thehardwareguru.cz";
  const key = "thehardwareguru-indexnow-2026";
  const keyLocation = `https://${host}/${key}.txt`;

  // 1. ZÍSKÁNÍ CÍLOVÉ SITEMAPY Z URL PARAMETRU
  // Příklad spuštění: /api/cron-seznam?sitemap=https://thehardwareguru.cz/sitemap-clanky.xml
  const { searchParams } = new URL(request.url);
  const targetSitemap = searchParams.get('sitemap');

  if (!targetSitemap) {
      return NextResponse.json({ 
          success: false, 
          message: "Zadej URL podsitemapy, kterou chceš indexovat. Např: ?sitemap=https://thehardwareguru.cz/sitemap-1.xml" 
      }, { status: 400 });
  }

  try {
    // 2. STAŽENÍ CÍLOVÉ PODSITEMAPY
    const sitemapResponse = await fetch(targetSitemap);
    if (!sitemapResponse.ok) {
        return NextResponse.json({ success: false, message: "Podsitemapu se nepodařilo stáhnout." }, { status: 500 });
    }

    const sitemapText = await sitemapResponse.text();

    // 3. VYTĚŽENÍ URL ADRES
    const urlMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
    const rawUrls = urlMatches.map(match => match[1]);
    
    // Ignorujeme odkazy na další sitemapy (pokud by to byl omylem rozcestník)
    const urlList = [...new Set(rawUrls)].filter(url => !url.endsWith('.xml'));

    if (urlList.length === 0) {
        return NextResponse.json({ success: false, message: "Nenalezeny žádné konkrétní URL adresy." }, { status: 400 });
    }

    // 4. ROZSEKÁNÍ NA BALÍČKY (CHUNKS) PO 10 000 URL
    const chunkSize = 10000;
    const chunks = [];
    for (let i = 0; i < urlList.length; i += chunkSize) {
        chunks.push(urlList.slice(i, i + chunkSize));
    }

    const results = [];

    // 5. ODESLÁNÍ JEDNOTLIVÝCH BALÍČKŮ NA SEZNAM
    for (let i = 0; i < chunks.length; i++) {
        const payload = {
            host: host,
            key: key,
            keyLocation: keyLocation,
            urlList: chunks[i]
        };

        const response = await fetch('https://search.seznam.cz/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': 'search.seznam.cz'
            },
            body: JSON.stringify(payload)
        });

        results.push({
            batch: i + 1,
            sentUrls: chunks[i].length,
            status: response.status
        });

        // Krátká pauza mezi POST požadavky, abychom nedostali ban (429 Too Many Requests)
        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: "Sitemapa úspěšně rozsekána a odeslána na Seznam.", 
        totalUrlsProcessed: urlList.length,
        totalBatches: chunks.length,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Kritická chyba.", error: error.toString() }, { status: 500 });
  }
}
