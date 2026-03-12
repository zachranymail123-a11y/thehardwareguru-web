import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - UNIVERSAL SITEMAP HANDLER V24.0
 * Cesta: src/app/sitemaps/[type]/route.js
 * 🚀 Tento jediný soubor vygeneruje JAKÝKOLIV typ sitemapy (pages, posts, bottleneck-1 atd.)
 * 🛡️ FIX 1: generateStaticParams předgeneruje 60 chunků, čímž eliminuje chybu 404 na Vercelu!
 * 🛡️ FIX 2: Pokud je chunk prázdný, vrátí <urlset></urlset> místo 404.
 * 🛡️ FIX 3: Striktní Next.js 15 Promise params ('await props.params').
 */

export const revalidate = 86400;
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// 🚀 ZLATÝ FIX: Vercel už NIKDY nehodí 404 na dynamické mapy, protože je zde vyjmenujeme
export async function generateStaticParams() {
    const types = ['pages.xml', 'posts.xml', 'cpu.xml', 'gpu.xml', 'duels.xml', 'upgrades.xml', 'bottleneck-index.xml'];
    // Připravíme až 60 slotů pro procesory v Bottleneck matici
    for(let i=1; i<=60; i++) types.push(`bottleneck-${i}.xml`);
    return types.map(t => ({ type: t }));
}

export async function GET(req, props) {
    const params = await props.params;
    const rawType = params.type;
    
    // Ochrana proti requestům, které nejsou XML
    if (!rawType.endsWith('.xml')) return new Response('Not found', { status: 404 });
    const type = rawType.replace('.xml', '');

    const routes = [];
    let isIndex = false;
    let indexXml = '';

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
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/cpu-recommend/${s}`, lastmod: d, priority: '0.8' });
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.7' });
                });
            });
            
        } else if (type === 'gpu') {
            const { data } = await supabase.from('gpus').select('name, slug, created_at');
            const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
            data?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = g.created_at ? new Date(g.created_at).toISOString() : null;
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/gpu-recommend/${s}`, lastmod: d, priority: '0.8' });
                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.7' });
                });
            });
            
        } else if (type === 'duels') {
            const [cpuDuels, gpuDuels] = await Promise.all([
                supabase.from('cpu_duels').select('slug, slug_en, created_at'),
                supabase.from('gpu_duels').select('slug, slug_en, created_at')
            ]);
            cpuDuels.data?.forEach(d => {
                const dt = d.created_at ? new Date(d.created_at).toISOString() : null;
                if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastmod: dt, priority: '0.7' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            gpuDuels.data?.forEach(d => {
                const dt = d.created_at ? new Date(d.created_at).toISOString() : null;
                if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastmod: dt, priority: '0.7' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            
        } else if (type === 'upgrades') {
            const [cpuUpg, gpuUpg] = await Promise.all([
                supabase.from('cpu_upgrades').select('slug, slug_en, created_at'),
                supabase.from('gpu_upgrades').select('slug, slug_en, created_at')
            ]);
            cpuUpg.data?.forEach(u => {
                const dt = u.created_at ? new Date(u.created_at).toISOString() : null;
                if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            gpuUpg.data?.forEach(u => {
                const dt = u.created_at ? new Date(u.created_at).toISOString() : null;
                if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            
        } else if (type === 'bottleneck-index') {
            isIndex = true;
            // Spočítáme kolik máme reálně CPU a dynamicky vygenerujeme indexy
            const { count } = await supabase.from('cpus').select('id', { count: 'exact', head: true });
            const cpuCount = count || 50;
            const chunks = Math.ceil(cpuCount / 2); // 2 CPU per chunk (cca 5000 URL)
            
            indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
            for(let i=1; i<=chunks; i++) {
                indexXml += `  <sitemap>\n    <loc>${baseUrl}/sitemaps/bottleneck-${i}.xml</loc>\n  </sitemap>\n`;
            }
            indexXml += `</sitemapindex>`;
            
        } else if (type.startsWith('bottleneck-')) {
            // Odbavení samotné matice (např. bottleneck-34.xml)
            const chunkId = parseInt(type.replace('bottleneck-', ''), 10);
            if (isNaN(chunkId) || chunkId < 1) return new Response('Not found', { status: 404 });
            
            const limit = 2;
            const offset = (chunkId - 1) * limit;

            const { data: cpus } = await supabase.from('cpus').select('name, slug').order('performance_index', { ascending: false }).range(offset, offset + limit - 1);
            
            // 🚀 ZLATÝ FIX: Pokud už žádná CPU nezbyla (např. dotaz na 34.xml, ale CPU máme jen 30), 
            // vrátíme validní PRÁZDNÉ XML. Googlebot si nestěžuje a Vercel nehodí 404 Error!
            if (!cpus || cpus.length === 0) {
                return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
            }

            const [gpusRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);

            const gpus = gpusRes.data || [];
            const games = gamesRes?.data?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077', 'warzone', 'starfield'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = cpu.slug || slugify(cpu.name);
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    if (!cpuSlug || !gpuSlug) return;

                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    // Pro Bottleneck Matrix vynecháváme lastmod naschvál (aby nás Google neškrtil)
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6' });
                    routes.push({ url: `${baseUrl}/en${pairPath}`, priority: '0.5' });

                    games.forEach(game => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: '0.5' });
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.4' });
                        });
                    });
                });
            });
        } else {
            return new Response('Not found', { status: 404 });
        }

        // VRACENÍ XML DAT
        if (isIndex) {
            return new Response(indexXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600' } });
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
            if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${r.changefreq || 'monthly'}</changefreq>\n`;
            if (r.priority) xml += `    <priority>${r.priority}</priority>\n`;
            xml += `  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600' } });

    } catch (err) {
        console.error("Sitemap generation error:", err);
        return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }
}
