import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Pro případ, že máš tisíce CPU

export async function GET() {
    const host = "thehardwareguru.cz";
    const key = "thehardwareguru-indexnow-2026"; // Tvůj klíč z IndexNow
    const keyLocation = `https://${host}/${key}.txt`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Vytáhneme VŠECHNY procesory z databáze (žádné limity, žádné datumy)
        const { data: cpus, error } = await supabase
            .from('cpus')
            .select('slug');

        if (error) throw error;
        if (!cpus || cpus.length === 0) {
            return NextResponse.json({ success: false, message: "V databázi nejsou žádná CPU." });
        }

        // 2. Vygenerujeme hromadný seznam URL (CZ i EN mutace)
        const urlList = cpus.flatMap(cpu => [
            `https://${host}/overclocking/cpu/${cpu.slug}`,
            `https://${host}/en/overclocking/cpu/${cpu.slug}`
        ]);

        // 3. Příprava pro odeslání do 5 vyhledávačů najednou
        const payload = {
            host: host,
            key: key,
            keyLocation: keyLocation,
            urlList: urlList // Tady je ten hromadný nášup všech adres
        };

        const endpoints = [
            { name: "Seznam", url: "https://search.seznam.cz/indexnow", hostHeader: "search.seznam.cz" },
            { name: "Bing", url: "https://www.bing.com/indexnow", hostHeader: "www.bing.com" },
            { name: "Yandex", url: "https://yandex.com/indexnow", hostHeader: "yandex.com" },
            { name: "Naver", url: "https://searchadvisor.naver.com/indexnow", hostHeader: "searchadvisor.naver.com" },
            { name: "Yep", url: "https://indexnow.yep.com", hostHeader: "indexnow.yep.com" }
        ];

        const results = [];

        // 4. Projedeme všechny endpointy a pošleme jim to tam
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
                results.push({ engine: engine.name, error: "Network/Timeout chyba" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "HROMADNÉ ODESLÁNÍ OVERCLOCKINGU DOKONČENO.", 
            totalUrlsSent: urlList.length,
            engines: results,
            urlPreview: urlList.slice(0, 5) // Jen pro kontrolu prvních pár kusů
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
