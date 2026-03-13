import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU MASTER INDEXER V5.1 (TOTAL SEARCH DOMINATION - REPORT READY)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🚀 CIEĽ: Pokryť Seznam, Bing a ďalšie české vyhľadávače v jednom cykle.
 * 🛡️ FIX: Výsledok IndexNow pushu sa teraz zobrazuje priamo v JSON reporte.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const parser = new XMLParser();
const INDEXNOW_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Bezpečnostná kontrola kľúča (voliteľné, ak používaš cron-job.org)
  const providedKey = searchParams.get('key');
  const validKey = INDEXNOW_KEY;

  if (process.env.NODE_ENV === 'production' && providedKey !== validKey) {
    // Ak chceš testovať v prehliadači, pridaj ?key=85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(parseInt(searchParams.get('limit') || '13', 10), 500); 
  const apiKey = process.env.SEZNAM_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "Chýba SEZNAM_API_KEY vo Verceli!" }, { status: 400 });

  const baseUrl = 'https://thehardwareguru.cz';
  const masterSitemapUrl = `${baseUrl}/guru-sitemap.xml`;

  try {
    // 1. ZÍSKANIE ZOZNAMU VŠETKÝCH SITEMÁP Z INDEXU
    const indexRes = await fetch(masterSitemapUrl, { cache: 'no-store' });
    if (!indexRes.ok) throw new Error("Nepodarilo sa načítať hlavný sitemap index.");
    const indexData = await indexRes.text();
    const parsedIndex = parser.parse(indexData);
    
    let sitemapUrls = [];
    if (parsedIndex.sitemapindex && parsedIndex.sitemapindex.sitemap) {
        const rawSitemaps = Array.isArray(parsedIndex.sitemapindex.sitemap) ? parsedIndex.sitemapindex.sitemap : [parsedIndex.sitemapindex.sitemap];
        sitemapUrls = rawSitemaps.map(s => s.loc);
    }

    let urlsToProcess = [];
    let activeSitemapName = "";

    // 2. CRAWLING: HĽADANIE NOVÝCH ADRIES, KTORÉ EŠTE NEBOLI ODOSLANÉ
    for (const sUrl of sitemapUrls) {
        const sRes = await fetch(sUrl, { cache: 'no-store' });
        if (!sRes.ok) continue;
        const sXml = await sRes.text();
        const sParsed = parser.parse(sXml);
        let allUrls = [];
        if (sParsed.urlset && sParsed.urlset.url) {
            const rawUrls = Array.isArray(sParsed.urlset.url) ? sParsed.urlset.url : [sParsed.urlset.url];
            allUrls = [...new Set(rawUrls.map(u => typeof u === 'string' ? u : u.loc))];
        }
        if (allUrls.length === 0) continue;

        // Kontrola proti DB (chunked check pre stabilitu)
        const chunkSize = 200;
        let processedInDb = [];
        for (let i = 0; i < allUrls.length; i += chunkSize) {
            const chunk = allUrls.slice(i, i + chunkSize);
            const { data: existing } = await supabase.from('seznam_indexed_urls').select('url').in('url', chunk);
            if (existing) processedInDb.push(...existing.map(e => e.url));
        }
        const existingSet = new Set(processedInDb);
        const virginUrls = allUrls.filter(u => !existingSet.has(u));

        if (virginUrls.length > 0) {
            urlsToProcess = virginUrls.slice(0, limit);
            activeSitemapName = sUrl.split('/').pop(); 
            break; 
        }
    }

    if (urlsToProcess.length === 0) return NextResponse.json({ guru_status: "TOTAL_FINISHED", message: "Všetky sitemapy sú kompletne zaindexované." });

    // 🚀 3. MASTER PUSH: ODOSLANIE DO VYHĽADÁVAČOV
    const successfulUrls = [];
    let indexNowReport = { ok: false, status: 0, message: "Not attempted" };

    // --- A) INDEXNOW PUSH (Bing, Tiscali, Seznam-IndexNow Hub) ---
    try {
        const inRes = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                host: "thehardwareguru.cz",
                key: INDEXNOW_KEY,
                keyLocation: `https://thehardwareguru.cz/${INDEXNOW_KEY}.txt`,
                urlList: urlsToProcess
            })
        });
        indexNowReport = { 
            ok: inRes.ok, 
            status: inRes.status, 
            message: inRes.ok ? "Batch successfully sent to IndexNow Hub" : "IndexNow Hub rejected the request" 
        };
    } catch (e) { 
        indexNowReport = { ok: false, status: 500, message: e.message };
        console.error("IndexNow Push Failed", e); 
    }

    // --- B) SEZNAM SPECIFIC PUSH (Priame API cez POST) ---
    for (const url of urlsToProcess) {
        try {
            const targetUrl = `https://reporter.seznam.cz/wm-api/web/document/reindex?key=${apiKey}&url=${encodeURIComponent(url)}`;
            const seznamRes = await fetch(targetUrl, {
                method: 'POST',
                headers: { 
                    'accept': 'application/json', 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36' 
                },
                body: ''
            });
            if (seznamRes.status === 200 || seznamRes.status === 201) successfulUrls.push({ url });
        } catch (err) {
            console.error(`Seznam push failed for ${url}`, err);
        }
        // Delay 600ms pre dodržanie limitov Seznamu (100 req/min)
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // 4. ZÁPIS DO PAMÄTE (SUPABASE)
    if (successfulUrls.length > 0) {
        await supabase.from('seznam_indexed_urls').upsert(successfulUrls, { onConflict: 'url' });
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        targets: ["Seznam.cz", "Bing.com", "IndexNow Partners"],
        index_now_result: indexNowReport, // 🚀 TU TO UVIDÍŠ!
        sitemap_processed: activeSitemapName,
        sent_count: successfulUrls.length,
        message: `Odoslaných ${successfulUrls.length} nových URL z ${activeSitemapName}.`
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
