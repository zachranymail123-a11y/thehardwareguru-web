import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Vytáhneme hity, ale FILTRUJEME ty, co jsou rozbité (nemají parametry)
    const { data: hits, error } = await supabase
        .from('generated_predictions')
        .select('full_url, last_requested')
        .order('last_requested', { ascending: false });

    if (error) return new Response('Error', { status: 500 });

    const baseUrl = "https://thehardwareguru.cz";
    const now = new Date().toISOString();

    // 1. Statické entry-pointy
    const staticPages = [
        { url: `${baseUrl}/bottleneck-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/bottleneck-calculator`, priority: '1.0' },
        { url: `${baseUrl}/fps-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/fps-calculator`, priority: '1.0' }
    ];

    // 2. Filtrování hitů - Google nesmí vidět nic, co by mu hodilo 404
    // Povolíme jen URL, které mají v sobě parametry (cpuId), ty staré bez nich letí pryč
    const validHits = (hits || []).filter(hit => hit.full_url.includes('cpuId='));

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
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60'
        },
    });
}
