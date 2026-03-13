import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEZNAM AUTO-INDEXER V4.0 (INTELLIGENT CRAWLER EDITION)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🚀 CÍL: Automaticky procházet sitemapy jednu po druhé a posílat Seznamu neodeslané URL.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const parser = new XMLParser();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Pokud uživatel vynutí sitemapu parametrem ?sitemap=1, použijeme ji. 
  // Jinak projdeme všechny automaticky.
  const forcedSitemap = searchParams.get('sitemap'); 
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 500); 
  const apiKey = process.env.SEZNAM_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });

  const baseUrl = 'https://thehardwareguru.cz';
  const masterSitemapUrl = `${baseUrl}/guru-sitemap.xml`;

  try {
    // 1. ZÍSKÁNÍ SEZNAMU VŠECH SITEMAP Z INDEXU
    const indexRes = await fetch(masterSitemapUrl, { cache: 'no-store' });
    if (!indexRes.ok) throw new Error("Nelze načíst hlavní sitemap index.");
    
    const indexData = await indexRes.text();
    const parsedIndex = parser.parse(indexData);
    
    let sitemapUrls = [];
    if (parsedIndex.sitemapindex && parsedIndex.sitemapindex.sitemap) {
        const rawSitemaps = Array.isArray(parsedIndex.sitemapindex.sitemap) 
            ? parsedIndex.sitemapindex.sitemap 
            : [parsedIndex.sitemapindex.sitemap];
        sitemapUrls = rawSitemaps.map(s => s.loc);
    }

    // Pokud je vynucená konkrétní sitemapa, omezíme pole jen na ni
    if (forcedSitemap) {
        const target = sitemapUrls.find(url => url.includes(`/${forcedSitemap}.xml`));
        sitemapUrls = target ? [target] : sitemapUrls;
    }

    let urlsToProcess = [];
    let activeSitemap = "";

    // 2. CRAWLING: PROCHÁZÍME SITEMAPY, DOKUD NENAJDEME PRÁCI
    for (const sUrl of sitemapUrls) {
        const sRes = await fetch(sUrl, { cache: 'no-store' });
        if (!sRes.ok) continue;

        const sXml = await sRes.text();
        const sParsed = parser.parse(sXml);
        
        let allUrls = [];
        if (sParsed.urlset && sParsed.urlset.url) {
            const rawUrls = Array.isArray(sParsed.urlset.url) ? sParsed.urlset.url : [sParsed.urlset.url];
            allUrls = rawUrls.map(u => u.loc);
        }

        if (allUrls.length === 0) continue;

        // 3. EFEKTIVNÍ CHECK PROTI DB (Pouze pro tuhle sitemapu)
        // Zjistíme, které z těchto URL už v DB máme
        const { data: existing } = await supabase
            .from('seznam_indexed_urls')
            .select('url')
            .in('url', allUrls);
        
        const existingSet = new Set(existing?.map(e => e.url) || []);
        const virginUrls = allUrls.filter(u => !existingSet.has(u));

        if (virginUrls.length > 0) {
            urlsToProcess = virginUrls.slice(0, limit);
            activeSitemap = sUrl.split('/').pop(); // Jméno souboru pro report
            break; // Máme práci, končíme hledání
        }
    }

    // Pokud jsme prošli úplně všechno a nic nenašli
    if (urlsToProcess.length === 0) {
        return NextResponse.json({ 
            guru_status: "TOTAL_FINISHED", 
            message: "Všechny adresy z celého webu (všechny sitemapy) již byly Seznamu odeslány." 
        });
    }

    const results = [];
    const successfulUrls = [];

    // 4. ODESÍLÁNÍ S DELAYEM (600ms)
    for (const url of urlsToProcess) {
        try {
            const targetUrl = `https://reporter.seznam.cz/wm-api/web/document/reindex?key=${apiKey}&url=${encodeURIComponent(url)}`;
            
            const seznamRes = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                body: ''
            });

            const ok = seznamRes.status === 200 || seznamRes.status === 201;
            if (ok) successfulUrls.push({ url });

            results.push({ url, status: seznamRes.status, ok });

        } catch (err) {
            results.push({ url, error: err.message, status: 500, ok: false });
        }
        
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // 5. ZÁPIS DO PAMĚTI
    if (successfulUrls.length > 0) {
        await supabase
            .from('seznam_indexed_urls')
            .upsert(successfulUrls, { onConflict: 'url' });
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        sitemap_processed: activeSitemap,
        new_indexed_count: successfulUrls.length,
        message: `Odesláno ${successfulUrls.length} nových URL ze sitemapy ${activeSitemap}.`,
        results: results
    });

  } catch (error) {
    console.error("GURU INDEXER CRITICAL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
