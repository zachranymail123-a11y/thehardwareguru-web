import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function fetchSitemapData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return { isIndex: false, urls: [] };
        const text = await res.text();
        
        const locs = [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1])
            .filter(u => !u.endsWith('.rss') && !u.includes('/rss') && !u.includes('/feed'));

        const isIndex = text.includes('<sitemapindex');
        return { isIndex, urls: locs };
    } catch (e) {
        console.error(`[INDEXNOW] Chyba stahování ${url}:`, e);
        return { isIndex: false, urls: [] };
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const providedKey = searchParams.get('key');
        const expectedKey = process.env.GURU_CRON_SECRET;

        if (!expectedKey || providedKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Chybí Supabase env proměnné' }, { status: 500 });
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        let { data: stateData, error: stateError } = await supabase
            .from('seo_cron_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (stateError || !stateData) {
            stateData = { current_sitemap_index: 0, current_url_index: 0 };
        }

        let { current_sitemap_index, current_url_index } = stateData;

        // HLAVNÍ SITEMAPY V PŘESNÉM POŘADÍ
        const mainSitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        let leafSitemaps = [];

        // Nasajeme všechno v PŘIROZENÉM pořadí bez jakéhokoliv míchání nebo řazení!
        for (const url of mainSitemaps) {
            const data = await fetchSitemapData(url);
            if (data.isIndex) {
                leafSitemaps.push(...data.urls);
            } else {
                leafSitemaps.push(url);
            }
        }

        // Odstraníme případné duplicity, ale ZACHOVÁME pořadí
        leafSitemaps = [...new Set(leafSitemaps)];

        if (leafSitemaps.length === 0) {
             return NextResponse.json({ error: 'Nenalezeny žádné XML sitemapy' }, { status: 404 });
        }

        if (current_sitemap_index >= leafSitemaps.length) {
            current_sitemap_index = 0;
            current_url_index = 0;
        }

        const targetSitemap = leafSitemaps[current_sitemap_index];
        const sitemapData = await fetchSitemapData(targetSitemap);
        const actualUrls = sitemapData.urls;

        const urlsToSend = actualUrls.slice(current_url_index, current_url_index + 500);

        let next_sitemap_index = current_sitemap_index;
        let next_url_index = current_url_index + 500;

        if (next_url_index >= actualUrls.length) {
            next_sitemap_index++;
            next_url_index = 0;
        }

        if (urlsToSend.length === 0) {
            await supabase.from('seo_cron_state').upsert({ 
                id: 1, current_sitemap_index: next_sitemap_index, current_url_index: next_url_index, updated_at: new Date()
            });
            return NextResponse.json({ message: `Sitemapa ${targetSitemap} je prázdná, posouvám se dál.` }, { status: 200 });
        }

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
            await supabase.from('seo_cron_state').upsert({ 
                id: 1, 
                current_sitemap_index: next_sitemap_index, 
                current_url_index: next_url_index,
                updated_at: new Date()
            });

            return NextResponse.json({ 
                success: true, 
                sitemap_zpracovana: targetSitemap,
                progress: `Odeslány indexy URL ${current_url_index} až ${current_url_index + urlsToSend.length} (Celkem v této sitemapě: ${actualUrls.length})`,
                submittedCount: urlsToSend.length
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
