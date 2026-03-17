import { createClient } from '@supabase/supabase-js';

/**
 * GURU DYNAMIC SITEMAP ENGINE - V2.0 (LIVE FEEDER)
 * 🚀 CÍL: Propisovat reálně vygenerované URL z databáze přímo do sitemapy.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
    // Použijeme Service Role pro neomezený přístup
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Vytáhneme všechny vygenerované hity
    const { data: hits, error } = await supabase
        .from('generated_predictions')
        .select('full_url, last_requested')
        .order('last_requested', { ascending: false });

    if (error) {
        console.error("Sitemap fetch failed:", error);
        return new Response('Error loading predictions', { status: 500 });
    }

    // Sestavení XML - Důležité: Escapujeme ampersandy (& -> &amp;) v URL
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
            // Cache na 15 minut, aby se sitemapa aktualizovala často, ale neusmažila DB
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60'
        },
    });
}
