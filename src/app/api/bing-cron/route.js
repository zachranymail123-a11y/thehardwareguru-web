import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// 🔥 GURU CONFIG
const MODE = 'FULL'; // 'FULL' projde web jednou a ZASTAVÍ SE | 'SMART' bere náhodný vzorek
const BATCH_SIZE = 500; 
const MAX_RETRIES = 3;

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

async function sendToIndexNow(payload) {
    const endpoints = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
        'https://search.yandex.com/indexnow'
    ];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const results = await Promise.all(
                endpoints.map(url =>
                    fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json; charset=utf-8' },
                        body: JSON.stringify(payload)
                    })
                )
            );

            if (results[0].ok || results[1].ok) {
                console.log(`[INDEXNOW SUCCESS] Pokus č. ${attempt}`);
                return true;
            }
        } catch (err) {
            console.error(`[INDEXNOW ATTEMPT ${attempt} FAILED]`, err);
        }
        if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, attempt * 1000));
    }
    return false;
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
            global: { fetch: (...args) => fetch(args[0], { ...args[1], cache: 'no-store' }) }
        });

        // 1. Načtení state
        let { data: state, error: stateError } = await supabase
            .from('seo_cron_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (stateError && stateError.code !== 'PGRST116') {
            return NextResponse.json({ error: stateError.message }, { status: 500 });
        }

        if (!state) {
            const initialState = {
                id: 1,
                current_sitemap_index: 0,
                current_url_index: 0,
                total_submitted: 0,
                is_running: false,
                full_push_done: false
            };
            await supabase.from('seo_cron_state').insert(initialState);
            state = initialState;
        }

        // 🔥 2. HARD STOP + UNLOCK (Kritická ochrana proti spamu)
        if (MODE === 'FULL' && state.full_push_done) {
            // Pokud by náhodou zůstal viset zámek, uvolníme ho
            if (state.is_running) {
                await supabase.from('seo_cron_state').update({ is_running: false }).eq('id', 1);
            }
            return NextResponse.json({ 
                message: '🛑 FULL PUSH DONE – Cron deaktivován proti spamu. Bing zpracovává data.' 
            }, { status: 200 });
        }

        // 3. Kontrola zámku
        if (state.is_running) {
            return NextResponse.json({ message: 'Cron už běží' }, { status: 429 });
        }

        // 4. ZAMKNI DB
        await supabase.from('seo_cron_state').update({ is_running: true }).eq('id', 1);

        const mainSitemaps = [
            "https://thehardwareguru.cz/guru-sitemap.xml",
            "https://thehardwareguru.cz/latest.xml",
            "https://thehardwareguru.cz/sitemap-hity.xml"
        ];

        let leafSitemaps = [];
        for (const url of mainSitemaps) {
            const data = await fetchSitemapData(url);
            if (data.isIndex) leafSitemaps.push(...data.urls);
            else leafSitemaps.push(url);
        }
        leafSitemaps = [...new Set(leafSitemaps)];

        let urlsToSend = [];
        let iter_sitemap_index = state.current_sitemap_index;
        let iter_url_index = state.current_url_index;

        if (MODE === 'SMART') {
            // Náhodný vzorek pro udržení aktivity bota bez spamu
            const randomSitemap = leafSitemaps[Math.floor(Math.random() * leafSitemaps.length)];
            const data = await fetchSitemapData(randomSitemap);
            urlsToSend = data.urls.sort(() => 0.5 - Math.random()).slice(0, BATCH_SIZE);
        } else {
            // FULL MODE: Postupná iterace
            while (urlsToSend.length < BATCH_SIZE && iter_sitemap_index < leafSitemaps.length) {
                const targetSitemap = leafSitemaps[iter_sitemap_index];
                const sitemapData = await fetchSitemapData(targetSitemap);
                const actualUrls = sitemapData.urls;

                if (actualUrls.length === 0) {
                    iter_sitemap_index++;
                    iter_url_index = 0;
                    continue;
                }

                const needed = BATCH_SIZE - urlsToSend.length;
                const chunk = actualUrls.slice(iter_url_index, iter_url_index + needed);
                urlsToSend.push(...chunk);

                iter_url_index += chunk.length;
                if (iter_url_index >= actualUrls.length) {
                    iter_sitemap_index++;
                    iter_url_index = 0;
                }
            }
            
            // 🔥 STOP CONDITION: Pokud jsme na konci, ZASTAVÍME TO NAPOŘÁD A ODEMKNEME
            if (iter_sitemap_index >= leafSitemaps.length) {
                await supabase.from('seo_cron_state').update({
                    full_push_done: true,
                    is_running: false,
                    current_sitemap_index: iter_sitemap_index,
                    current_url_index: iter_url_index,
                    total_submitted: (state.total_submitted || 0) + urlsToSend.length,
                    updated_at: new Date()
                }).eq('id', 1);

                // Odešleme poslední várku a končíme
                if (urlsToSend.length > 0) {
                    await sendToIndexNow({
                        host: "thehardwareguru.cz",
                        key: "guru-indexnow-key-2026",
                        keyLocation: "https://thehardwareguru.cz/guru-indexnow-key-2026.txt",
                        urlList: urlsToSend
                    });
                }

                return NextResponse.json({ message: '🔥 FULL PUSH HOTOV. Zápis do DB proveden, spam loop ukončen.' }, { status: 200 });
            }
        }

        if (urlsToSend.length === 0) {
            await supabase.from('seo_cron_state').update({ is_running: false }).eq('id', 1);
            return NextResponse.json({ message: 'Žádné URL k odeslání' }, { status: 200 });
        }

        // 5. ODESLÁNÍ DO INDEXNOW
        const payload = {
            host: "thehardwareguru.cz",
            key: "guru-indexnow-key-2026",
            keyLocation: "https://thehardwareguru.cz/guru-indexnow-key-2026.txt",
            urlList: urlsToSend
        };

        const success = await sendToIndexNow(payload);

        if (success) {
            const newTotal = (state.total_submitted || 0) + urlsToSend.length;
            await supabase.from('seo_cron_state').update({
                current_sitemap_index: iter_sitemap_index,
                current_url_index: iter_url_index,
                total_submitted: newTotal,
                is_running: false,
                updated_at: new Date()
            }).eq('id', 1);

            return NextResponse.json({
                success: true,
                mode: MODE,
                submitted: urlsToSend.length,
                total_historical: newTotal,
                position: `Sitemapa ${iter_sitemap_index}, URL ${iter_url_index}`
            });
        } else {
            await supabase.from('seo_cron_state').update({ is_running: false }).eq('id', 1);
            return NextResponse.json({ error: 'IndexNow endpoints unreachable' }, { status: 502 });
        }

    } catch (error) {
        console.error("[CRITICAL CRON ERROR]", error);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            await supabase.from('seo_cron_state').update({ is_running: false }).eq('id', 1);
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
