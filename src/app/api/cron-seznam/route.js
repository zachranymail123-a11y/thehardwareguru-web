import { NextResponse } from 'next/server';

export async function GET(request) {
  const host = "thehardwareguru.cz";
  const key = "thehardwareguru-indexnow-2026";
  const keyLocation = `https://${host}/${key}.txt`;

  const { searchParams } = new URL(request.url);
  const targetSitemap = searchParams.get('sitemap');

  if (!targetSitemap) {
      return NextResponse.json({ 
          success: false, 
          message: "Zadej URL podsitemapy. Např: ?sitemap=https://thehardwareguru.cz/guru-sitemap.xml" 
      }, { status: 400 });
  }

  try {
    const sitemapResponse = await fetch(targetSitemap);
    if (!sitemapResponse.ok) {
        return NextResponse.json({ success: false, message: "Sitemapu se nepodařilo stáhnout." }, { status: 500 });
    }

    const sitemapText = await sitemapResponse.text();
    const urlMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
    const rawUrls = urlMatches.map(match => match[1]);
    
    // Rozdělení na skutečné stránky a na podsitemapy (rozcestník)
    const urlList = [...new Set(rawUrls)].filter(url => !url.endsWith('.xml'));
    const xmlLinks = [...new Set(rawUrls)].filter(url => url.endsWith('.xml'));

    // POKUD JE TO ROZCESTNÍK, VYPÍŠEME UŽIVATELI NÁPOVĚDU
    if (urlList.length === 0 && xmlLinks.length > 0) {
        return NextResponse.json({ 
            success: false, 
            message: "Tohle je hlavní rozcestník. Zkopíruj si jednu z podsitemap níže a dej ji do URL parametru místo tohoto rozcestníku.",
            seznamPodsitemap: xmlLinks
        }, { status: 200 });
    }

    if (urlList.length === 0) {
        return NextResponse.json({ success: false, message: "Nenalezeny žádné konkrétní URL adresy." }, { status: 400 });
    }

    // ROZSEKÁNÍ A ODESLÁNÍ (Limit 10 000 pro Seznam)
    const chunkSize = 10000;
    const chunks = [];
    for (let i = 0; i < urlList.length; i += chunkSize) {
        chunks.push(urlList.slice(i, i + chunkSize));
    }

    const results = [];

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

        // Ochrana před banem (pauza mezi odesíláním obřích balíků)
        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: "Úspěšně rozsekáno a odesláno na Seznam.", 
        totalUrlsProcessed: urlList.length,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Kritická chyba.", error: error.toString() }, { status: 500 });
  }
}
