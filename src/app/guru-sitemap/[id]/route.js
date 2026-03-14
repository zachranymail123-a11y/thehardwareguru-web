import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V39.0 (404 PREVENTION FIX)
 * Cesta: src/app/guru-sitemap/[id]/route.js
 * 🛡️ FIX 1: Přidána generateStaticParams(). Next.js nyní předem zná URL pro podsitemapy, což řeší 404 Errory!
 */

export const revalidate = 3600; 
export const dynamicParams = true; // Povolí vykreslení dalších chunků za běhu

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// 🚀 GURU 404 FIX: Tímto řekneme Vercelu, jaké cesty bezpečně existují
export async function generateStaticParams() {
    const types = ['pages.xml', 'posts.xml', 'cpu.xml', 'gpu.xml', 'duels.xml', 'upgrades.xml'];
    // Předgenerujeme prvních 20 numerických chunků
    for(let i=1; i<=20; i++) types.push(`${i}.xml`);
    return types.map(t => ({ id: t }));
}

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

const safeDate = (dateStr) => {
    if (!dateStr) return null;
    try { return new Date(dateStr).toISOString(); } catch(e) { return null; }
};

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 
    const xmlHeaders = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' };
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) return new Response(emptyXml, { headers: xmlHeaders });

    const type = id.replace('.xml', '');
    const routes = [];

    try {
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs', '/cpuvs', '/gpuvs/ranking', '/cpuvs/ranking', '/gpu-index', '/cpu-index', '/deals', '/support', '/tipy', '/tweaky', '/rady', '/slovnik'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0', changefreq: 'daily' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9', changefreq: 'daily' });
            });
        } else if (type === 'posts') {
            const [pRes, tRes, twRes, rRes, sRes] = await Promise.all([
                supabase.from('posts').select('slug, created_at'),
                supabase.from('tipy').select('slug, created_at'),
                supabase.from('tweaky').select('slug, created_at'),
                supabase.from('rady').select('slug, created_at'),
                supabase.from('slovnik').select('slug, created_at')
            ]);
            const add = (data, path) => data?.forEach(i => {
                if (i.slug) {
                    routes.push({ url: `${baseUrl}/${path}/${i.slug}`, lastmod: safeDate(i.created_at), priority: '0.9', changefreq: 'weekly' });
                    routes.push({ url: `${baseUrl}/en/${path}/${i.slug}`, lastmod: safeDate(i.created_at), priority: '0.8', changefreq: 'weekly' });
                }
            });
            add(pRes.data, 'clanky'); add(tRes.data, 'tipy'); add(twRes.data, 'tweaky'); add(rRes.data, 'rady'); add(sRes.data, 'slovnik');
        } else if (type === 'cpu') {
            const { data: cpus } = await supabase.from('cpus').select('name, created_at'); 
            const { data: gamesData } = await supabase.from('games').select('slug');
            const games = gamesData?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077'];

            cpus?.forEach(c => {
                const s = slugify(c.name);
                const d = safeDate(c.created_at);
                routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.8' });
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.7' });
                });
            });
        } else if (type === 'gpu') {
            const { data: gpus } = await supabase.from('gpus').select('name, slug, created_at');
            const { data: gamesData } = await supabase.from('games').select('slug');
            const games = gamesData?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077'];
            gpus?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = safeDate(g.created_at);
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.8' });
                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.7' });
                });
            });
        } else if (type === 'duels' || type === 'upgrades') {
            // Kombinovaná logika pro duely i upgrady pro zjednodušení bloku
            const isUpg = type === 'upgrades';
            const [cpuRes, gpuRes] = await Promise.all([
                supabase.from(isUpg ? 'cpu_upgrades' : 'cpu_duels').select('slug, slug_en, created_at'),
                supabase.from(isUpg ? 'gpu_upgrades' : 'gpu_duels').select('slug, slug_en, created_at')
            ]);
            const pathCpu = isUpg ? 'cpu-upgrade' : 'cpuvs';
            const pathGpu = isUpg ? 'gpu-upgrade' : 'gpuvs';
            
            cpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathCpu}/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathCpu}/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            gpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathGpu}/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathGpu}/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 5; 
            const offset = (chunkId - 1) * limit;

            const { data: cpus } = await supabase.from('cpus').select('name').order('name').range(offset, offset + limit - 1); 
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

            const [gRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);
            const gpus = gRes.data || [];
            const games = gamesRes.data?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = slugify(cpu.name); 
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6', changefreq: 'monthly' });
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
            return new Response(emptyXml, { headers: xmlHeaders });
        }

        if (routes.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
            if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${r.changefreq || 'monthly'}</changefreq>\n`;
            xml += `    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml.trim(), { headers: xmlHeaders });
    } catch (err) {
        return new Response(emptyXml, { headers: xmlHeaders });
    }
}
