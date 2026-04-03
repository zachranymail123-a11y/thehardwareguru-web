import { NextResponse } from 'next/server';

// Prodlužujeme limit pro Vercel
export const maxDuration = 60; 

export async function GET(request) {
  const host = "thehardwareguru.cz";
  const key = "thehardwareguru-indexnow-2026";
  const keyLocation = `https://${host}/${key}.txt`;

  const { searchParams } = new URL(request.url);
  const targetSitemap = searchParams.get('sitemap');

  // ============================================================================
  // CHYTRÝ AUTOMAT: POKUD NENÍ ZADANÁ SITEMAPA, SPUSTÍ AUTOMATICKÝ HTML RUNNER
  // ============================================================================
  if (!targetSitemap) {
    try {
      const mainSitemapUrl = `https://${host}/guru-sitemap.xml`;
      const sitemapResponse = await fetch(mainSitemapUrl);
      const sitemapText = await sitemapResponse.text();

      const urlMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
      const rawUrls = urlMatches.map(match => match[1]);
      const xmlLinks = [...new Set(rawUrls)].filter(url => url.endsWith('.xml'));

      const html = `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hardware Guru - IndexNow Automat (BING)</title>
            <style>
                body { font-family: monospace; background: #0a0b0d; color: #66fcf1; padding: 20px; line-height: 1.5; }
                h1 { color: #3b82f6; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .log { background: #111; padding: 15px; border: 1px solid #333; border-radius: 8px; height: 60vh; overflow-y: auto; margin-top: 20px; box-shadow: inset 0 0 10px #000; }
                .log div { margin-bottom: 5px; border-bottom: 1px dashed #222; padding-bottom: 5px; }
                .success { color: #4ade80; font-weight: bold; }
                .error { color: #f87171; font-weight: bold; }
                .info { color: #9ca3af; }
                .stats { background: rgba(102, 252, 241, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(102, 252, 241, 0.3); display: inline-block; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>🚀 Guru IndexNow Automat (BING)</h1>
            <p>Nalezeno podsitemap v rozcestníku: <strong>${xmlLinks.length}</strong></p>
            <div class="stats">
                Celkem zpracováno URL v této relaci: <strong id="total-count" style="font-size: 20px; color: #fff;">0</strong>
            </div>
            <p style="color: #f87171;">⚠️ NEZAVÍREJ TUTO STRÁNKU, automat právě sype data na Bing...</p>
            
            <div class="log" id="log"></div>

            <script>
                const sitemaps = ${JSON.stringify(xmlLinks)};
                const logEl = document.getElementById('log');
                const totalCountEl = document.getElementById('total-count');
                let totalUrls = 0;

                function log(msg, type = 'info') {
                    const div = document.createElement('div');
                    div.className = type;
                    div.innerText = '[' + new Date().toLocaleTimeString() + '] ' + msg;
                    logEl.appendChild(div);
                    logEl.scrollTop = logEl.scrollHeight;
                }

                async function processAll() {
                    log('Zahajuji automatický proces pro ' + sitemaps.length + ' podsitemap...', 'info');
                    
                    for(let i = 0; i < sitemaps.length; i++) {
                        log('Tahám podsitemapu (' + (i+1) + '/' + sitemaps.length + '): ' + sitemaps[i], 'info');
                        try {
                            const res = await fetch('?sitemap=' + encodeURIComponent(sitemaps[i]));
                            const data = await res.json();
                            
                            if(data.success) {
                                const processed = data.totalUrlsProcessed || 0;
                                totalUrls += processed;
                                totalCountEl.innerText = totalUrls.toLocaleString();
                                log('✅ Úspěch! Rozsekáno a odesláno ' + processed + ' URL.', 'success');
                            } else {
                                log('❌ Chyba: ' + data.message, 'error');
                            }
                        } catch(e) {
                            log('❌ Kritická chyba při spojení: ' + e, 'error');
                        }
                        
                        // Ochranná pauza 2 vteřiny
                        await new Promise(r => setTimeout(r, 2000));
                    }
                    
                    log('🔥🔥 HOTOVO! Celý web byl kompletně natlačen do Bingu! 🔥🔥', 'success');
                }

                processAll();
            </script>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });

    } catch (e) {
      return NextResponse.json({ success: false, message: "Nepodařilo se načíst rozcestník guru-sitemap.xml." });
    }
  }

  // ============================================================================
  // WORKER: TATO ČÁST ZPRACOVÁVÁ KONKRÉTNÍ PODSITEMAPU PŘES API
  // ============================================================================
  try {
    const sitemapResponse = await fetch(targetSitemap);
    if (!sitemapResponse.ok) {
        return NextResponse.json({ success: false, message: "Podsitemapu se nepodařilo stáhnout." }, { status: 500 });
    }

    const sitemapText = await sitemapResponse.text();
    const urlMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)];
    const rawUrls = urlMatches.map(match => match[1]);
    
    const urlList = [...new Set(rawUrls)].filter(url => !url.endsWith('.xml'));

    if (urlList.length === 0) {
        return NextResponse.json({ success: true, message: "Prázdná sitemapa, ignoruji.", totalUrlsProcessed: 0 });
    }

    // Limit 10 000 pro IndexNow
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

        // ZMĚNA: Odeslání na endpoint Bingu
        const response = await fetch('https://www.bing.com/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': 'www.bing.com' // Bing to vyžaduje v hlavičce
            },
            body: JSON.stringify(payload)
        });

        results.push({
            batch: i + 1,
            sentUrls: chunks[i].length,
            status: response.status
        });

        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: "Úspěšně rozsekáno a odesláno.", 
        totalUrlsProcessed: urlList.length,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Kritická chyba API.", error: error.toString() }, { status: 500 });
  }
}
