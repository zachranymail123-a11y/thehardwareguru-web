import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V37.0 (ULTIMATE GSC EDITION)
 * Cesta: src/app/guru-sitemap/[id]/route.js
 * 🛡️ FIX 1: Absolutně čisté XML bez komentářů pro 100% validitu v GSC.
 * 🛡️ FIX 2: Limit 5 CPU na soubor (shoda s Master Indexem).
 * 🛡️ FIX 3: Plná podpora sekcí Tipy, Tweaky, Rady a Slovník.
 * 🛡️ FIX 4: Dynamické načítání her z DB pro všechny FPS podstránky.
 */

export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

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
        // --- 1. STATICKÉ HUBY ---
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support', '/tipy', '/tweaky', '/rady', '/slovnik'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0', changefreq: 'daily' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9', changefreq: 'daily' });
            });

        // --- 2. KOMPLETNÍ REDAKČNÍ OBSAH (5 TABULEK) ---
        } else if (type === 'posts') {
            const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes] = await Promise.all([
                supabase.from('posts').select('slug, created_at'),
                supabase.from('tipy').select('slug, created_at'),
                supabase.from('tweaky').select('slug, created_at'),
                supabase.from('rady').select('slug, created_at'),
                supabase.from('slovnik').select('slug, created_at')
            ]);
            const addContentRoutes = (data, basePath) => {
                data?.forEach(p => {
                    const d = safeDate(p.created_at);
                    if (p.slug) {
                        routes.push({ url: `${baseUrl}/${basePath}/${p.slug}`, lastmod: d, priority: '0.9', changefreq: 'weekly' });
                        routes.push({ url: `${baseUrl}/en/${basePath}/${p.slug}`, lastmod: d, priority: '0.8', changefreq: 'weekly' });
                    }
                });
            };
            addContentRoutes(postsRes.data, 'clanky');
            addContentRoutes(tipyRes.data, 'tipy');
            addContentRoutes(tweakyRes.data, 'tweaky');
            addContentRoutes(radyRes.data, 'rady');
            addContentRoutes(slovnikRes.data, 'slovnik');

        // --- 3. CPU PROFILY + FPS ---
        } else if (type === 'cpu') {
            const [cpusRes, gamesRes] = await Promise.all([
                supabase.from('cpus').select('name, created_at'),
                supabase.from('games').select('slug')
            ]);
            const dbGames = gamesRes.data?.map(g => g.slug).filter(Boolean) || [];
            cpusRes.data?.forEach(c => {
                const s = slugify(c.name);
                const d = safeDate(c.created_at);
                routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/cpu-recommend/${s}`, lastmod: d, priority: '0.8' });
                dbGames.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.7' });
                });
            });

        // --- 4. GPU PROFILY + FPS ---
        } else if (type === 'gpu') {
            const [gpusRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug, created_at'),
                supabase.from('games').select('slug')
            ]);
            const dbGames = gamesRes.data?.map(g => g.slug).filter(Boolean) || [];
            gpusRes.data?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = safeDate(g.created_at);
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/gpu-recommend/${s}`, lastmod: d, priority: '0.8' });
                dbGames.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.7' });
                });
            });

        // --- 5. DUELY A UPGRADY ---
        } else if (type === 'duels' || type === 'upgrades') {
            const isDuels = type === 'duels';
            const [cpuRes, gpuRes] = await Promise.all([
                supabase.from(isDuels ? 'cpu_duels' : 'cpu_upgrades').select('slug, slug_en, created_at'),
                supabase.from(isDuels ? 'gpu_duels' : 'gpu_upgrades').select('slug, slug_en, created_at')
            ]);
            const pathCpu = isDuels ? 'cpuvs' : 'cpu-upgrade';
            const pathGpu = isDuels ? 'gpuvs' : 'gpu-upgrade';
            cpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathCpu}/${d.slug}`, lastmod: dt, priority: '0.7' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathCpu}/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });
            gpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathGpu}/${d.slug}`, lastmod: dt, priority: '0.7' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathGpu}/${d.slug_en}`, lastmod: dt, priority: '0.6' });
            });

        // --- 6. MEGA BOTTLENECK MATICE (CHUNKY 1..N) ---
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 5; 
            const offset = (chunkId - 1) * limit;

            const { data: cpus } = await supabase.from('cpus').select('name').order('name').range(offset, offset + limit - 1);
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

            const [gpusRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);
            const gpus = gpusRes.data || [];
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
                        routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, priority: '0.4' });
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.5' });
                            routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, priority: '0.4' });
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

        return new Response(xml, { headers: xmlHeaders });
    } catch (err) {
        return new Response(emptyXml, { headers: xmlHeaders });
    }
}
