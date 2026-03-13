import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEZNAM AUTO-INDEXER V4.6 (BULLETPROOF MEMORY)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🛡️ FIX 1: Ošetření velkých sitemap (chunked DB check).
 * 🛡️ FIX 2: Explicitní hlášení chyb Supabase do výstupu.
 * 🛡️ FIX 3: Ochrana proti duplicitám v rámci jedné sitemapy.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const parser = new XMLParser();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Bezpečnostní klíč (tvůj IndexNow klíč)
  const providedKey = searchParams.get('key') || searchParams.get('auth_bypass');
  const validKey = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";

  if (providedKey !== validKey && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Guru Security: Invalid Key" }, { status: 401 });
  }

  const limit = Math.min(parseInt(searchParams.get('limit') || '13', 10), 500); 
  const apiKey = process.env.SEZNAM_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "Chybí SEZNAM_API_KEY!" }, { status: 400 });

  const baseUrl = 'https://thehardwareguru.cz';
  const masterSitemapUrl = `${baseUrl}/guru-sitemap.xml`;

  try {
    // 1. ZÍSKÁNÍ SEZNAMU VŠECH SITEMAP
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

    let urlsToProcess = [];
    let activeSitemapName = "";

    // 2. CRAWLING: HLEDÁME PRVNÍ SITEMAPU, KTERÁ MÁ NEZPRACOVANÉ ADRESY
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

        // 🚀 GURU CHUNK CHECK: PostgREST má limit na délku URL, takže checkujeme po 200 kusech
        const chunkSize = 200;
        let processedUrlsInDb = [];
        
        for (let i = 0; i < allUrls.length; i += chunkSize) {
            const chunk = allUrls.slice(i, i + chunkSize);
            const { data: existing } = await supabase
                .from('seznam_indexed_urls')
                .select('url')
                .in('url', chunk);
            if (existing) processedUrlsInDb.push(...existing.map(e => e.url));
        }
        
        const existingSet = new Set(processedUrlsInDb);
        const virginUrls = allUrls.filter(u => !existingSet.has(u));

        if (virginUrls.length > 0) {
            urlsToProcess = virginUrls.slice(0, limit);
            activeSitemapName = sUrl.split('/').pop(); 
            break; 
        }
    }

    if (urlsToProcess.length === 0) {
        return NextResponse.json({ guru_status: "TOTAL_FINISHED", message: "Všechny adresy z celého webu již jsou v paměti." });
    }

    const results = [];
    const successfulUrls = [];

    // 3. ODESÍLÁNÍ DO SEZNAMU (600ms delay)
    for (const url of urlsToProcess) {
        try {
            const targetUrl = `https://reporter.seznam.cz/wm-api/web/document/reindex?key=${apiKey}&url=${encodeURIComponent(url)}`;
            const seznamRes = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                body: ''
            });

            const ok = seznamRes.status === 200 || seznamRes.status === 201;
            if (ok) successfulUrls.push({ url });

            results.push({ url, status: seznamRes.status, ok });
        } catch (err) {
            results.push({ url, error: err.message, ok: false });
        }
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // 4. ZÁPIS DO SUPABASE + VERIFIKACE
    let dbStatus = "Not attempted";
    if (successfulUrls.length > 0) {
        const { error: upsertError } = await supabase
            .from('seznam_indexed_urls')
            .upsert(successfulUrls, { onConflict: 'url' });
        
        dbStatus = upsertError ? `ERROR: ${upsertError.message}` : "SUCCESS_SAVED";
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        sitemap_processed: activeSitemapName,
        sent_count: successfulUrls.length,
        memory_write: dbStatus,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
