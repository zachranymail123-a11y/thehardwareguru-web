import { createClient } from '@supabase/supabase-js';

/**
 * GURU DYNAMIC SITEMAP ENGINE - V2.1 (HYBRID FEEDER)
 * 🚀 CÍL: Automatické indexování všech dynamických HW kombinací i hlavních vstupů kalkulaček.
 * 🛡️ FIX: Přidány statické entry-pointy pro Bottleneck (CZ/EN).
 */

export const dynamic = 'force-dynamic';

export async function GET() {
    // Použijeme Service Role pro neomezený přístup
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Vytáhneme všechny vygenerované hity (GTA 6 + Bottleneck)
    const { data: hits, error } = await supabase
        .from('generated_predictions')
        .select('full_url, last_requested')
        .order('last_requested', { ascending: false });

    if (error) {
        console.error("Sitemap fetch failed:", error);
        return new Response('Error loading predictions', { status: 500 });
    }

    const baseUrl = "https://thehardwareguru.cz";
    const now = new Date().toISOString();

    // 1. Definujeme hlavní vstupní stránky, které chceme mít v sitemapě vždy
    const staticPages = [
        { url: `${baseUrl}/bottleneck-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/bottleneck-calculator`, priority: '1.0' },
        { url: `${baseUrl}/fps-kalkulacka`, priority: '1.0' },
        { url: `${baseUrl}/en/fps-calculator`, priority: '1.0' }
    ];

    // 2. Sestavení XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${page.url}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}

    ${hits?.map(hit => `
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
            // Cache na 15 minut pro ochranu DB, ale čerstvé SEO
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60'
        },
    });
}
