import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function GET() {
    const host = "thehardwareguru.cz";
    const key = "guru-indexnow-key-2026"; 
    const keyLocation = `https://${host}/guru-indexnow-key-2026.txt`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 🚀 GURU BRUTE FORCE FETCH: Taháme všechno v cyklu, abysme obešli limity
        let allCpus = [];
        let from = 0;
        let to = 999;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('cpus')
                .select('slug')
                .range(from, to)
                .order('slug', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                allCpus = [...allCpus, ...data];
                // Pokud jsme dostali plný nášup (1000), zkusíme další várku
                if (data.length === 1000) {
                    from += 1000;
                    to += 1000;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            
            // Bezpečnostní pojistka proti nekonečné smyčce (max 10k CPU)
            if (from > 10000) hasMore = false;
        }

        if (allCpus.length === 0) {
            return NextResponse.json({ success: false, message: "V databázi nejsou žádná CPU." });
        }

        // Vygenerujeme CZ i EN linky pro každej řádek z DB
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
            { name: "Naver", url: "https://searchadvisor.naver.com/indexnow", hostHeader: "searchadvisor.naver.com" },
            { name: "Yep", url: "https://indexnow.yep.com", hostHeader: "indexnow.yep.com" }
        ];

        const results = [];

        for (const engine of endpoints) {
            try {
                const response = await fetch(engine.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Host': engine.hostHeader
                    },
                    body: JSON.stringify(payload)
                });
                
                results.push({
                    engine: engine.name,
                    status: response.status,
                    success: response.ok
                });
            } catch (err) {
                results.push({ engine: engine.name, error: "Network error" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "GURU BRUTE FORCE ODESLÁNÍ DOKONČENO!", 
            totalUrlsSent: urlList.length, 
            engines: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
