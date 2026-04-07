import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function GET() {
    const host = "thehardwareguru.cz";
    const key = "guru-indexnow-key-2026"; 
    const keyLocation = `https://${host}/guru-indexnow-key-2026.txt`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Tady je ideální použít SERVICE_ROLE_KEY, pokud ho máš, aby nás nebrzdilo RLS
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Nejdřív zjistíme, kolik jich tam KURVA reálně je celkem
        const { count, error: countError } = await supabase
            .from('cpus')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        
        const totalRows = count || 0;
        let allCpus = [];
        let from = 0;
        const PAGE_SIZE = 1000; // Taháme po velkých kusech

        // 2. Taháme v cyklu, dokud nemáme přesně tolik záznamů, kolik nahlásil COUNT
        while (allCpus.length < totalRows) {
            const { data, error } = await supabase
                .from('cpus')
                .select('slug')
                .range(from, from + PAGE_SIZE - 1)
                .order('slug', { ascending: true });

            if (error) throw error;
            if (!data || data.length === 0) break;

            allCpus = [...allCpus, ...data];
            from += PAGE_SIZE;
        }

        if (allCpus.length === 0) {
            return NextResponse.json({ success: false, message: "V databázi fakt nic není." });
        }

        // 3. Vygenerujeme linky (CZ + EN)
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
                    body: JSON.stringify(payload)
                });
                results.push({ engine: engine.name, status: response.status, success: response.ok });
            } catch (err) {
                results.push({ engine: engine.name, error: "Network error" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "GURU FINAL BOSS BULK: ODESLÁNO VŠE!", 
            realRowsInDb: totalRows,
            cpusFetched: allCpus.length,
            totalUrlsSent: urlList.length, 
            engines: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
