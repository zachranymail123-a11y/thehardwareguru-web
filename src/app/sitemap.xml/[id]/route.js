import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - DYNAMIC CHUNK GENERATOR V20.0
 * Cesta: src/app/sitemap/[id]/route.js
 * 🚀 CÍL: Generování samotných URL adres pro konkrétní ID sitemapy.
 * 🛡️ ARCH: Tento soubor reálně "chroustá" databázi a tvoří XML sety odkazů.
 */

// Vynucení dynamiky pro Route Handler
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://thehardwareguru.cz';

// Ochranné escapování speciálních znaků do XML, aby sitemapa byla validní
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;'; 
            case '>': return '&gt;'; 
            case '&': return '&amp;';
            case '\'': return '&apos;'; 
            case '"': return '&quot;'; 
            default: return c;
        }
    });
};

const slugify = (text) => text ? text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim() : '';
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

export async function GET(request, { params }) {
    const resolvedParams = await params;
    const idParam = resolvedParams.id || '0';
    
    // Ošetření koncovky .xml v URL (Google může volat /sitemap/0.xml)
    const currentId = parseInt(idParam.replace('.xml', ''), 10);
    const currentDate = new Date().toISOString();
    const routes = [];

    try {
        // --- 📌 ID 0: STATICKÉ STRÁNKY, ČLÁNKY, PROFILY, UPGRADY A DUELY ---
        if (currentId === 0) {
            const [posts, cpus, gpus, cpuUpg, gpuUpg, cpuDuels, gpuDuels] = await Promise.all([
                supabase.from('posts').select('slug'),
                supabase.from('cpus').select('name, slug'),
                supabase.from('gpus').select('name, slug'),
                supabase.from('cpu_upgrades').select('slug, slug_en'),
                supabase.from('gpu_upgrades').select('slug, slug_en'),
                supabase.from('cpu_duels').select('slug, slug_en'),
                supabase.from('gpu_duels').select('slug, slug_en')
            ]);

            const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en${p}`, lastModified: currentDate });
            });

            posts?.data?.forEach(p => {
                if (p.slug) {
                    routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastModified: currentDate });
                    routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastModified: currentDate });
                }
            });

            const coreGames = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

            cpus?.data?.forEach(c => {
                const safeSlug = c.slug || slugify(c.name);
                if (!safeSlug) return;
                routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/cpu-performance/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/cpu-performance/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/cpu-recommend/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/cpu-recommend/${safeSlug}`, lastModified: currentDate });
                coreGames.forEach(gm => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate });
                    routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate });
                });
            });

            gpus?.data?.forEach(g => {
                const safeSlug = cleanGpuSlug(g.slug, g.name);
                if (!safeSlug) return;
                routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/gpu-performance/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/gpu-performance/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/gpu-recommend/${safeSlug}`, lastModified: currentDate });
                routes.push({ url: `${baseUrl}/en/gpu-recommend/${safeSlug}`, lastModified: currentDate });
                coreGames.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate });
                    routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate });
                });
            });

            [...(cpuUpg?.data || [])].forEach(u => {
                if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastModified: currentDate });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastModified: currentDate });
            });
            [...(gpuUpg?.data || [])].forEach(u => {
                if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastModified: currentDate });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastModified: currentDate });
            });
            [...(cpuDuels?.data || [])].forEach(d => {
                if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastModified: currentDate });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastModified: currentDate });
            });
            [...(gpuDuels?.data || [])].forEach(d => {
                if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastModified: currentDate });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastModified: currentDate });
            });

        } else {
            // --- 📌 ID > 0: MEGA BOTTLENECK CLUSTER (Všechno se vším) ---
            const limit = 2; // Počet CPU na jeden XML soubor
            const offset = (currentId - 1) * limit;

            const cpusRes = await supabase.from('cpus').select('name, slug').order('performance_index', { ascending: false }).range(offset, offset + limit - 1);
            
            if (cpusRes.data && cpusRes.data.length > 0) {
                const [gpusRes, gamesRes] = await Promise.all([
                    supabase.from('gpus').select('name, slug'),
                    supabase.from('games').select('slug')
                ]);

                const gpus = gpusRes.data || [];
                const dbGames = gamesRes?.data?.map(g => g.slug).filter(Boolean) || [];
                const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'fortnite', 'starfield', 'cs2', 'rdr2', 'alan-wake-2', 'hogwarts-legacy'];
                const resolutions = ['1080p', '1440p', '4k'];

                cpusRes.data.forEach(c => {
                    const cpuSlug = c.slug || slugify(c.name);
                    gpus.forEach(g => {
                        const gpuSlug = cleanGpuSlug(g.slug, g.name);
                        if (!cpuSlug || !gpuSlug) return;

                        const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                        
                        routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate });
                        routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate });
                        
                        games.forEach(game => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate });
                            routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate });

                            resolutions.forEach(res => {
                                routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, lastModified: currentDate });
                                routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, lastModified: currentDate });
                            });
                        });
                    });
                });
            }
        }

        // 🛡️ Fail-safe: Pokud by z nějakého důvodu byl prázdný strom, vracíme hlavní URL místo 404
        if (routes.length === 0) {
            routes.push({ url: baseUrl, lastModified: currentDate });
        }

        // Sestavení čistého XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(route => {
            xml += `  <url>\n    <loc>${escapeXml(route.url)}</loc>\n    <lastmod>${route.lastModified}</lastmod>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { 
            headers: { 
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' 
            } 
        });

    } catch (error) {
        console.error("GURU SITEMAP ENGINE CRASH:", error);
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}</loc></url></urlset>`;
        return new Response(fallbackXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }
}
