import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function fetchSitemapData(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
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
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            global: {
                fetch: (...args) => fetch(args[0], { ...args[1], cache: 'no-store' })
            }
        });

        // 1. Načtení state
        let { data: lockRow, error: stateError } = await supabase
            .from('seo_cron_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (stateError && stateError.code !== 'PGRST116') {
            return NextResponse.json({ error: stateError.message }, { status: 500 });
        }

        if (!lockRow) {
            await supabase.from('seo_cron_state').insert({
                id: 1,
                current_sitemap_index: 0,
                current_url_index: 0,
                total_submitted: 0, // Nové počítadlo
                is_running: false
            });
            lockRow = { current_sitemap_index: 0, current_url_index: 0, total_submitted: 0, is_running: false };
        }

        // 2. Kontrola zámku
        if (lockRow?.is_running) {
            return NextResponse.json({ message: 'Cron už běží' }, { status: 429 });
        }

        // 3. ZAMKNI
        await supabase.from('seo_cron_state').upsert({
            id: 1,
            is_running: true
        });

        let iter_sitemap_index = lockRow.current_sitemap_index;
        let iter_url_index = lockRow.current_url_index;
        let current_total = lockRow.total_submitted || 0; // Načtení dosavadního počtu

        const mainSitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        let leafSitemaps = [];

        for (const url of mainSitemaps) {
            const data = await fetchSitemapData(url);
            if (data.isIndex) {
                leafSitemaps.push(...data.urls);
            } else {
                leafSitemaps.push(url);
            }
        }

        leafSitemaps = [...new Set(leafSitemaps)];

        if (leafSitemaps.length === 0) {
            await supabase.from('seo_cron_state').upsert({ id: 1, is_running: false });
            return NextResponse.json({ error: 'Nenalezeny žádné XML sitemapy' }, { status: 404 });
        }

        if (iter_sitemap_index >= leafSitemaps.length) {
            iter_sitemap_index = 0;
            iter_url_index = 0;
        }

        let urlsToSend = [];
        let processedSitemaps = [];

        while (urlsToSend.length < 500 && iter_sitemap_index < leafSitemaps.length) {
            const targetSitemap = leafSitemaps[iter_sitemap_index];
            const sitemapData = await fetchSitemapData(targetSitemap);
            const actualUrls = sitemapData.urls;

            if (actualUrls.length === 0) {
                 iter_sitemap_index++;
                 iter_url_index = 0;
                 continue;
            }

            const needed = 500 - urlsToSend.length;
            const chunk = actualUrls.slice(iter_url_index, iter_url_index + needed);

            if (chunk.length > 0) {
                urlsToSend.push(...chunk);
                if (!processedSitemaps.includes(targetSitemap)) {
                    processedSitemaps.push(targetSitemap);
                }
            }

            iter_url_index += chunk.length;

            if (iter_url_index >= actualUrls.length) {
                iter_sitemap_index++;
                iter_url_index = 0;
            }
        }

        if (urlsToSend.length === 0) {
            await supabase.from('seo_cron_state').upsert({ id: 1, is_running: false });
            return NextResponse.json({ message: 'Žádné další URL k odeslání.' }, { status: 200 });
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
            // 4. UNLOCK A ULOŽENÍ NOVÉ POZICE + PŘIČTENÍ DO CELKOVÉHO SKÓRE
            const new_total = current_total + urlsToSend.length;
            
            const { error: upsertError } = await supabase.from('seo_cron_state').upsert({
                id: 1,
                current_sitemap_index: iter_sitemap_index,
                current_url_index: iter_url_index,
                total_submitted: new_total, // Zápis nového součtu
                is_running: false,
                updated_at: new Date()
            });

            if (upsertError) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Nelze uložit pozici. Zkontroluj RLS!", 
                    details: upsertError 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                zpracovane_sitemapy: processedSitemaps,
                nova_pozice_v_db: `Sitemapa index ${iter_sitemap_index}, URL index ${iter_url_index}`,
                celkem_odeslano_historicky: new_total, // Nový údaj ve výpisu
                submittedCount: urlsToSend.length
            }, { status: 200 });
        } else {
            const errorText = await response.text();
            await supabase.from('seo_cron_state').upsert({ id: 1, is_running: false });
            return NextResponse.json({ success: false, error: 'IndexNow Error', details: errorText }, { status: response.status });
        }

    } catch (error) {
        console.error("[INDEXNOW CRON] Kritická chyba:", error);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey, { global: { fetch: (...args) => fetch(args[0], { ...args[1], cache: 'no-store' }) } });
            await supabase.from('seo_cron_state').upsert({ id: 1, is_running: false });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
