import { NextResponse } from 'next/server';

export async function GET(request) {
  // 1. ZÁKLADNÍ NASTAVENÍ
  const host = "thehardwareguru.cz";
  const key = "thehardwareguru-indexnow-2026"; // Zkontroluj, že máš přesně tento .txt soubor v public složce!
  const keyLocation = `https://${host}/${key}.txt`;

  try {
    // 2. STAŽENÍ TVOJÍ VLASTNÍ SITEMAPY
    const sitemapUrl = `https://${host}/guru-sitemap.xml`;
    const sitemapResponse = await fetch(sitemapUrl);
    
    if (!sitemapResponse.ok) {
        return NextResponse.json({ 
            success: false, 
            message: `Nepodařilo se stáhnout sitemapu z ${sitemapUrl}. Zkontroluj, jestli existuje.` 
        }, { status: 500 });
    }

    const sitemapText = await sitemapResponse.text();

    // 3. VYTĚŽENÍ VŠECH URL ZE SITEMAPY PŘES REGEX
    // Najde všechno mezi tagy <loc> a </loc>
    const urlMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
    let urlList = urlMatches.map(match => match[1]);

    // Odstranění případných duplicit a omezení na 10 000 URL (limit IndexNow API)
    urlList = [...new Set(urlList)].slice(0, 10000);

    if (urlList.length === 0) {
        return NextResponse.json({ 
            success: false, 
            message: "Sitemapa se stáhla, ale nenašly se v ní žádné URL adresy." 
        }, { status: 400 });
    }

    // 4. SESTAVENÍ JSON PAYLOADU PRO SEZNAM
    const payload = {
      host: host,
      key: key,
      keyLocation: keyLocation,
      urlList: urlList
    };

    // 5. ODESLÁNÍ HROMADNÉHO POST POŽADAVKU NA SEZNAM
    const response = await fetch('https://search.seznam.cz/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Host': 'search.seznam.cz' // Seznam to striktně vyžaduje
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    let resultText = '';
    try {
       resultText = await response.text();
    } catch (e) {
       resultText = 'Žádná textová odpověď od Seznamu.';
    }

    // 6. VYHODNOCENÍ ODPOVĚDI
    if (status === 200) {
       return NextResponse.json({ 
           success: true, 
           message: "Bum! Celý web z guru-sitemap.xml byl úspěšně odeslán na Seznam.", 
           seznamStatus: status, 
           odeslanoPocetUrl: urlList.length,
           ukazkaOdeslanychUrl: urlList.slice(0, 5) // Ukáže ti prvních 5 URL pro rychlou kontrolu
       });
    } else {
       return NextResponse.json({ 
           success: false, 
           message: "Seznam požadavek odmítl.", 
           seznamStatus: status, 
           seznamChyba: resultText 
       }, { status: status });
    }

  } catch (error) {
    return NextResponse.json({ 
        success: false, 
        message: "Kritická chyba při generování nebo odesílání požadavku.", 
        error: error.toString() 
    }, { status: 500 });
  }
}
