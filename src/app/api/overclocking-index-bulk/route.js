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
        // 🚀 GURU TOTAL BULK: Žádné limity, žádné ořezávání. Bereme úplně všechno z DB.
        const { data: cpus, error } = await supabase
            .from('cpus')
            .select('slug');

        if (error) throw error;
        if (!cpus || cpus.length === 0) {
            return NextResponse.json({ success: false, message: "V databázi nejsou žádná CPU." });
        }

        // Vygenerujeme linky pro každý jeden řádek, co Supabase vyflusla
        const urlList = cpus.flatMap(cpu => [
            `https://${host}/overclocking/cpu/${cpu.slug}`,
            `https://${host}/en/overclocking/cpu/${cpu.slug}`
        ]);

        const payload = {
            host: host,
            key: key,
            keyLocation: keyLocation,
            urlList: urlList // ŽÁDNÝ .slice(0, 100) TU NENÍ, TY ZMRDE!
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
            message: "TEĎ UŽ JE TO KOMPLETNÍ NÁLOŽ!", 
            totalUrlsSent: urlList.length, // Tady uvidíš to reálný číslo
            engines: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.toString() }, { status: 500 });
    }
}
