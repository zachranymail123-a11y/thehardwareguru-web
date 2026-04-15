import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 1. Vytáhneme hity z predikcí (filtrované)
    const { data: hits, error: hitsError } = await supabase
        .from('generated_predictions')
        .select('full_url, last_requested')
        .order('last_requested', { ascending: false });

    // 2. Vytáhneme uložené benchmarky pro indexaci výsledků
    const { data: benchmarks, error: benchError } = await supabase
        .from('guru_benchmarks')
        .select('slug, created_at')
        .order('created_at', { ascending: false });

    if (hitsError || benchError) return new Response('Error fetching data', { status: 500 });

    const baseUrl = "https://thehardwareguru.cz";
    const now = new Date().toISOString();

    // Statické entry-pointy (přidány hlavní stránky benchmarku)
    const staticPages = [
        { url: `${baseUrl}/bottleneck-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/bottleneck-calculator`, priority: '1.0' },
        { url: `${baseUrl}/fps-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/fps-calculator`, priority: '1.0' },
        { url: `${baseUrl}/benchmark`, priority: '0.9' },
        { url: `${baseUrl}/en/benchmark`, priority: '0.9' }
    ];

    // Filtrování hitů z predikcí
    const validHits = (hits || []).filter(hit => hit.full_url.includes('cpuId='));

    // Generování URL pro výsledky benchmarků (CZ i EN verze)
    const benchmarkResults = (benchmarks || []).flatMap(b => [
        { url: `${baseUrl}/benchmark/result/${b.slug}`, date: b.created_at },
        { url: `${baseUrl}/en/benchmark/result/${b.slug}`, date: b.created_at }
    ]);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${page.url}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}

    ${validHits.map(hit => `
    <url>
        <loc>${hit.full_url.replace(/&/g, '&amp;')}</loc>
        <lastmod>${new Date(hit.last_requested).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}

    ${benchmarkResults.map(b => `
    <url>
        <loc>${b.url}</loc>
        <lastmod>${new Date(b.date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60'
        },
    });
}
