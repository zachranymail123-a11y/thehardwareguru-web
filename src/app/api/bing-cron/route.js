import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU BING AUTO-FEEDER (CRON-JOB.ORG)
 * Cesta: src/app/api/seo/bing-cron/route.js
 * 🚀 CÍL: Odeslat batch až 500 nejnovějších URL do Bingu.
 */

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Zabezpečení pro externí CRON (cron-job.org)
        const { searchParams } = new URL(request.url);
        const providedKey = searchParams.get('key');
        const expectedKey = process.env.GURU_CRON_SECRET;

        // Pokud klíč v adrese nesouhlasí s tím v .env, odmítneme přístup
        if (!expectedKey || providedKey !== expectedKey) {
            return NextResponse.json({ error: 'Neplatný nebo chybějící klíč (Unauthorized)' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
        const bingApiKey = process.env.BING_API_KEY;

        if (!supabaseUrl || !supabaseKey || !bingApiKey) {
            console.error("Chybí ENV proměnné pro Bing CRON.");
            return NextResponse.json({ error: 'Missing ENV configuration' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const baseUrl = "https://thehardwareguru.cz";

        // 2. Statické / Core URL adresy
        const staticUrls = [
            `${baseUrl}/`,
            `${baseUrl}/bottleneck-kalkulacka`,
            `${baseUrl}/en/bottleneck-calculator`,
            `${baseUrl}/fps-kalkulacka`,
            `${baseUrl}/en/fps-calculator`,
            `${baseUrl}/dram-kalkulacka`,
            `${baseUrl}/gpuvs`,
            `${baseUrl}/cpuvs`,
            `${baseUrl}/en/gpuvs`,
            `${baseUrl}/en/cpuvs`,
            `${baseUrl}/ocekavane-hry`,
            `${baseUrl}/tipy`,
            `${baseUrl}/tweaky`,
            `${baseUrl}/clanky`,
            `${baseUrl}/cs/deals`
        ];

        // 3. Vytáhneme dynamické URL z DB
        const { data: hits, error } = await supabase
            .from('generated_predictions')
            .select('full_url')
            .order('last_requested', { ascending: false })
            .limit(480);

        if (error) {
            console.error("Chyba při čtení databáze:", error);
            throw error;
        }

        // 4. Sloučení a deduplikace URL adres
        const dbUrls = hits ? hits.map(h => h.full_url).filter(url => url.includes('cpuId=')) : [];
        let urlList = [...staticUrls, ...dbUrls];
        
        // Unikátní pole a tvrdý řez na 500 (Bing limit per request)
        urlList = [...new Set(urlList)].slice(0, 500);

        // 5. Sestavení payloadu pro Bing API
        const payload = {
            siteUrl: baseUrl,
            urlList: urlList
        };

        const bingEndpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingApiKey}`;

        // 6. Odeslání dávky do Bingu
        const response = await fetch(bingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': 'ssl.bing.com'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`[BING CRON] Úspěšně odesláno ${urlList.length} URL.`);
            return NextResponse.json({ 
                success: true, 
                submittedCount: urlList.length, 
                bingResponse: data 
            }, { status: 200 });
        } else {
            const errorText = await response.text();
            console.error("[BING CRON] API chyba:", errorText);
            return NextResponse.json({ 
                success: false, 
                error: 'Bing API rejected the request', 
                details: errorText 
            }, { status: response.status });
        }

    } catch (error) {
        console.error("[BING CRON] Kritická chyba:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
