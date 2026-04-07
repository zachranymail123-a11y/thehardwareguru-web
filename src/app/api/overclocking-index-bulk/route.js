import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function GET() {
    const host = "thehardwareguru.cz";
    const key = "guru-indexnow-key-2026"; 
    const keyLocation = `https://${host}/guru-indexnow-key-2026.txt`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // 🚀 GURU MASTER BYPASS: Musíš mít ve Vercelu nastavený SUPABASE_SERVICE_ROLE_KEY
    // Pokud tam není, použije se anon, ale ten tě zase uřízne na 50!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });

    try {
        let allCpus = [];
        let from = 0;
        const PAGE_SIZE = 500; // Taháme po velkých kusech, Master Key nás pustí
        let hasMore = true;

        // 🚀 GURU INFINITE VACUUM: Taháme dokud DB nevrátí nulu
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
                
                // Pokud nám to vrátilo míň, než jsme chtěli, jsme reálně na dně
                if (data.length < PAGE_SIZE) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }

            // Bezpečnostní pojistka (IndexNow bere max 10k URL)
            if (from > 10000) break;
        }

        if (allCpus.length === 0) {
            return NextResponse.json({ success: false, message: "V DB fakt nic není, nebo tě nepustil klíč." });
        }

        // CZ + EN mutace
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
            { name: "Yandex", url: "https://yandex.com/indexnow", hostHeader: "yandex.com" },
            { name: "Naver", url: "https://searchadvisor.naver.com/indexnow", hostHeader: "searchadvisor.naver.com" }
        ];

        const results = [];
        for (const engine of endpoints) {
            try {
                const response = await fetch(engine.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Host': engine.hostHeader },
                    body: JSON.stringify(payload),
                    cache: 'no-store' // 🚀 ANTI-CACHE FIX
                });
                results.push({ engine: engine.name, status: response.status, success: response.ok });
            } catch (err) {
                results.push({ engine: engine.name, error: "Network error" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "GURU ULTIMATE BULK: VŠECHNO JE VENKU!", 
            totalCpusFetched: allCpus.length,
            totalUrlsSent: urlList.length, 
            engines: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
