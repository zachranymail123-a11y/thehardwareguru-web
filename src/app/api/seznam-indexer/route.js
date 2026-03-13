import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEZNAM AUTO-INDEXER V3.0 (WITH PERMANENT MEMORY)
 * Cesta: src/app/api/seznam-indexer/route.js
 * 🚀 CÍL: Posílat Seznamu pokaždé unikátní URL adresy a pamatovat si je v DB.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sitemapName = searchParams.get('sitemap') || 'pages'; 
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 500); 

  const apiKey = process.env.SEZNAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chybí SEZNAM_API_KEY ve Vercelu!" }, { status: 400 });
  }

  const baseUrl = 'https://thehardwareguru.cz';
  const sitemapUrl = `${baseUrl}/guru-sitemap/${sitemapName}.xml`;

  try {
    // 1. NAČTENÍ JIŽ ODESLANÝCH URL Z DATABÁZE (PAMĚŤ)
    const { data: alreadyIndexed } = await supabase
        .from('seznam_indexed_urls')
        .select('url');
    
    const indexedSet = new Set(alreadyIndexed?.map(item => item.url) || []);

    // 2. STÁHNUTÍ SITEMAPY
    const sitemapRes = await fetch(sitemapUrl, { cache: 'no-store' });
    if (!sitemapRes.ok) {
       return NextResponse.json({ error: `Nelze načíst sitemapu: ${sitemapUrl}. HTTP ${sitemapRes.status}` });
    }
    const xmlData = await sitemapRes.text();

    // 3. PARSOVÁNÍ URL
    const parser = new XMLParser();
    const parsed = parser.parse(xmlData);

    let allUrlsFromSitemap = [];
    if (parsed.urlset && parsed.urlset.url) {
        const rawUrls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
        allUrlsFromSitemap = rawUrls.map(u => u.loc);
    }

    if (allUrlsFromSitemap.length === 0) return NextResponse.json({ message: `Sitemapa ${sitemapName}.xml je prázdná.` });

    // 4. FILTRACE - VYBEREME JEN TY, KTERÉ JSME JEŠTĚ NEPOSLALI
    const urlsToProcess = allUrlsFromSitemap
        .filter(url => !indexedSet.has(url))
        .slice(0, limit);

    if (urlsToProcess.length === 0) {
        return NextResponse.json({ 
            guru_status: "FINISHED", 
            message: `Všechny adresy ze sitemapy ${sitemapName}.xml již byly Seznamu odeslány.` 
        });
    }

    const results = [];
    const successfulUrls = [];

    // 5. CYKLUS ODESÍLÁNÍ S DELAYEM
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

            if (ok) {
                successfulUrls.push({ url });
            }

            results.push({
                url,
                status: seznamRes.status,
                ok: ok
            });

        } catch (err) {
            results.push({ url, error: err.message, status: 500, ok: false });
        }
        
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // 6. ZÁPIS ÚSPĚŠNÝCH URL DO PAMĚTI (SUPABASE)
    if (successfulUrls.length > 0) {
        await supabase
            .from('seznam_indexed_urls')
            .upsert(successfulUrls, { onConflict: 'url' });
    }

    return NextResponse.json({
        guru_status: "SUCCESS",
        processed_count: results.length,
        new_indexed_count: successfulUrls.length,
        message: `Odesláno ${successfulUrls.length} nových URL.`,
        results: results
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
