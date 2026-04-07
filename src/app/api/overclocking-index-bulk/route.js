import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function GET() {
    const host = "thehardwareguru.cz";
    const key = "guru-indexnow-key-2026"; 
    const keyLocation = `https://${host}/guru-indexnow-key-2026.txt`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // 🚀 GURU MASTER BYPASS: Teď už žádný fallback. Buď Service Key, nebo smrt.
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey || supabaseKey.length < 20) {
        return NextResponse.json({ 
            success: false, 
            message: "CHYBA: Vercel nemá načtený SUPABASE_SERVICE_ROLE_KEY! Udělej REDEPLOY ve Vercelu, ty zmrde!" 
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let allCpus = [];
        let from = 0;
        const PAGE_SIZE = 100; // Bezpečný krok
        let hasMore = true;

        // 🚀 GURU BRUTE FORCE LOOP: Taháme dokud tam něco je
        while (hasMore) {
            const { data, error } = await supabase
                .from('cpus')
                .select('slug')
                .range(from, from + PAGE_SIZE - 1)
                .order('slug', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                allCpus = [...allCpus, ...data];
                from += data.length;
                
                // Pokud jsme dostali míň než PAGE_SIZE, jsme na konci
                if (data.length < PAGE_SIZE) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            if (from > 10000) break;
        }

        const urlList = allCpus.flatMap(cpu => [
            `https://${host}/overclocking/cpu/${cpu.slug}`,
            `https://${host}/en/overclocking/cpu/${cpu.slug}`
        ]);

        const payload = {
            host: host,
            key: key,
            keyLocation: keyLocation,
            urlList: urlList
        };

        const endpoints = [
            { name: "Seznam", url: "https://search.seznam.cz/indexnow", hostHeader: "search.seznam.cz" },
            { name: "Bing", url: "https://www.bing.com/indexnow", hostHeader: "www.bing.com" },
            { name: "Yandex", url: "https://yandex.com/indexnow", hostHeader: "yandex.com" }
        ];

        const results = [];
        for (const engine of endpoints) {
            try {
                const response = await fetch(engine.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Host': engine.hostHeader },
                    body: JSON.stringify(payload)
                });
                results.push({ engine: engine.name, status: response.status, success: response.ok });
            } catch (err) {
                results.push({ engine: engine.name, error: "Network error" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "TEĎ UŽ JE TO KURVA VŠECHNO!", 
            totalCpusFetched: allCpus.length,
            totalUrlsSent: urlList.length, 
            engines: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
