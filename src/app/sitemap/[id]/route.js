import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V27.0 (PURE API ROUTE)
 * Cesta: src/app/sitemap/[id]/route.js
 * 🛡️ FIX 1: Čistá API Routa. Imunní vůči 405 Method Not Allowed.
 * 🛡️ FIX 2: Pokud chunk (např. 34.xml) nemá data, vrátí prázdné XML místo 404.
 * 🛡️ FIX 3: Striktní ošetření `await props.params` pro Next.js 15.
 */

export const revalidate = 86400; // Stabilní cache na 1 den

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

export async function GET(req, props) {
    // 🚀 GURU FIX: Next.js 15 Promise resolution
    const params = await props.params;
    const id = params.id; // např. "pages.xml" nebo "1.xml"

    // Ochrana před nesmyslnými requesty - pokud chybí .xml, vrátíme 404
    if (!id || !id.endsWith('.xml')) {
        return new Response('Not found', { status: 404 });
    }

    const type = id.replace('.xml', '');
    const routes = [];
    
    // 🚀 GURU FIX: Toto je ultimátní obrana proti 404 pro prázdné chunky. 
    // Prázdné XML projde přes GSC bez chyby a neshodí build.
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    try {
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0', changefreq: 'daily' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9', changefreq: 'daily' });
            });
        } else if (type === 'posts') {
            const { data } = await supabase.from('posts').select('slug, created_at');
            data?.forEach(p => {
                const d = p.created_at ? new Date(p.created_at).toISOString() : null;
                if (p.slug) {
                    routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastmod: d, priority: '0.9', changefreq: 'weekly' });
                    routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastmod: d, priority: '0.8', changefreq: 'weekly' });
                }
            });
        } else if (type === 'cpu') {
            const { data } = await supabase.from('cpus').select('name, slug, created_at');
            const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
            data?.forEach(c => {
                const s = c.slug || slugify(c.name);
                const d = c.created_at ? new Date(c.created_at).toISOString() : null;
                routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/cpu-recommend/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
                    routes.push({ url: `${baseUrl}/en/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.6', changefreq: 'monthly' });
                });
            });
        } else if (type === 'gpu') {
            const { data } = await supabase.from('gpus').select('name, slug, created_at');
            const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
            data?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = g.created_at ? new Date(g.created_at).toISOString() : null;
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/gpu-recommend/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
                    routes.push({ url: `${baseUrl}/en/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.6', changefreq: 'monthly' });
                });
            });
        } else if (type === 'duels') {
            const [cpuDuels, gpuDuels] = await Promise.all([
                supabase.from('cpu_duels').select('slug, slug_en, created_at'),
                supabase.from('gpu_duels').select('slug, slug_en, created_at')
            ]);
            cpuDuels.data?.forEach(d => {
                const dt = d.created_at ? new Date(d.created_at).toISOString() : null;
                if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            gpuDuels.data?.forEach(d => {
                const dt = d.created_at ? new Date(d.created_at).toISOString() : null;
                if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
        } else if (type === 'upgrades') {
            const [cpuUpg, gpuUpg] = await Promise.all([
                supabase.from('cpu_upgrades').select('slug, slug_en, created_at'),
                supabase.from('gpu_upgrades').select('slug, slug_en, created_at')
            ]);
            cpuUpg.data?.forEach(u => {
                const dt = u.created_at ? new Date(u.created_at).toISOString() : null;
                if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            gpuUpg.data?.forEach(u => {
                const dt = u.created_at ? new Date(u.created_at).toISOString() : null;
                if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
        } else if (!isNaN(parseInt(type, 10))) {
            // ČÍSELNÉ CHUNKY BOTTLENECKU (např. 1.xml, 34.xml atd.)
            const chunkId = parseInt(type, 10);
            
            // Pojistka rozsahu chunků
            if (chunkId < 1 || chunkId > 60) {
                return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
            }

            const limit = 2; // 2 CPU per file (~5000 URLs)
            const offset = (chunkId - 1) * limit;

            const { data: cpus } = await supabase.from('cpus').select('name, slug').order('performance_index', { ascending: false }).range(offset, offset + limit - 1);
            
            // 🚀 GURU FIX 404: Pokud offset přesáhne počet CPU, vracíme prázdné XML
            if (!cpus || cpus.length === 0) {
                return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400' } });
            }

            const [gpusRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);

            const gpus = gpusRes.data || [];
            const games = gamesRes?.data?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = cpu.slug || slugify(cpu.name);
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    if (!cpuSlug || !gpuSlug) return;

                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6', changefreq: 'monthly' });
                    routes.push({ url: `${baseUrl}/en${pairPath}`, priority: '0.5', changefreq: 'monthly' });

                    games.forEach(game => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: '0.5', changefreq: 'monthly' });
                        routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, priority: '0.4', changefreq: 'monthly' });
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.5', changefreq: 'monthly' });
                            routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, priority: '0.4', changefreq: 'monthly' });
                        });
                    });
                });
            });
        } else {
            return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
        }

        // Pokud je v dotazu chyba (kategorie nic nevyplivla), vrátíme empty xml (žádná 404)
        if (routes.length === 0) {
            return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
        }

        // Sestavení finálního validního XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
            if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
            xml += `    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { 
            headers: { 
                'Content-Type': 'application/xml; charset=utf-8', 
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' 
            } 
        });

    } catch (err) {
        console.error("GURU SITEMAP ERROR:", err);
        return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }
}
