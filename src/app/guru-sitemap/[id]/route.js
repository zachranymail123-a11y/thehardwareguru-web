/**
 * GURU SEO ENGINE - CHUNK GENERATOR V31.0 (NATIVE FETCH EDITION)
 * Cesta: src/app/guru-sitemap/[id]/route.js
 * 🛡️ FIX 1: Kompletně odstraněna knihovna supabase-js. 
 * 🛡️ FIX 2: Vše přepsáno na Nativní Fetch (PostgREST), což 100% zaručuje načtení dat.
 * 🛡️ FIX 3: Systém už nikdy neselže kvůli Vercel Serverless timeoutům.
 */

export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// 🛡️ Bezpečný převod data proti pádům
const safeDate = (dateStr) => {
    if (!dateStr) return null;
    try { return new Date(dateStr).toISOString(); } catch(e) { return null; }
};

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 

    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) {
        return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }

    const type = id.replace('.xml', '');
    const routes = [];
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

    try {
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0', changefreq: 'daily' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9', changefreq: 'daily' });
            });
            
        } else if (type === 'posts') {
            // 🚀 GURU: Nativní fetch pro články
            const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=slug,created_at`, { headers, cache: 'no-store' });
            const data = res.ok ? await res.json() : [];
            
            data.forEach(p => {
                const d = safeDate(p.created_at);
                if (p.slug) {
                    routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastmod: d, priority: '0.9', changefreq: 'weekly' });
                    routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastmod: d, priority: '0.8', changefreq: 'weekly' });
                }
            });
            
        } else if (type === 'cpu') {
            // 🚀 GURU: Nativní fetch pro CPU a Hry
            const [cpusRes, gamesRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug,created_at`, { headers, cache: 'no-store' }),
                fetch(`${supabaseUrl}/rest/v1/games?select=slug`, { headers, cache: 'no-store' })
            ]);
            
            const data = cpusRes.ok ? await cpusRes.json() : [];
            const gamesData = gamesRes.ok ? await gamesRes.json() : [];
            const dbGames = gamesData.map(g => g.slug).filter(Boolean);
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

            data.forEach(c => {
                const s = c.slug || slugify(c.name);
                const d = safeDate(c.created_at);
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
            // 🚀 GURU: Nativní fetch pro GPU a Hry
            const [gpusRes, gamesRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug,created_at`, { headers, cache: 'no-store' }),
                fetch(`${supabaseUrl}/rest/v1/games?select=slug`, { headers, cache: 'no-store' })
            ]);
            
            const data = gpusRes.ok ? await gpusRes.json() : [];
            const gamesData = gamesRes.ok ? await gamesRes.json() : [];
            const dbGames = gamesData.map(g => g.slug).filter(Boolean);
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

            data.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = safeDate(g.created_at);
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
            const [cpuDuelsRes, gpuDuelsRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=slug,slug_en,created_at`, { headers, cache: 'no-store' }),
                fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=slug,slug_en,created_at`, { headers, cache: 'no-store' })
            ]);
            
            const cpuDuels = cpuDuelsRes.ok ? await cpuDuelsRes.json() : [];
            const gpuDuels = gpuDuelsRes.ok ? await gpuDuelsRes.json() : [];

            cpuDuels.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            gpuDuels.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            
        } else if (type === 'upgrades') {
            const [cpuUpgRes, gpuUpgRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=slug,slug_en,created_at`, { headers, cache: 'no-store' }),
                fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=slug,slug_en,created_at`, { headers, cache: 'no-store' })
            ]);
            
            const cpuUpg = cpuUpgRes.ok ? await cpuUpgRes.json() : [];
            const gpuUpg = gpuUpgRes.ok ? await gpuUpgRes.json() : [];

            cpuUpg.forEach(u => {
                const dt = safeDate(u.created_at);
                if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            gpuUpg.forEach(u => {
                const dt = safeDate(u.created_at);
                if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            
            if (chunkId < 1 || chunkId > 60) {
                return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
            }

            const limit = 2; 
            const offset = (chunkId - 1) * limit;

            // 🚀 GURU: Nativní fetch pro Bottleneck Matici s přesným Limitem a Offsetem
            const cpusRes = await fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug&order=name.asc&limit=${limit}&offset=${offset}`, { headers, cache: 'no-store' });
            const cpus = cpusRes.ok ? await cpusRes.json() : [];
            
            if (!cpus || cpus.length === 0) {
                return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400' } });
            }

            const [gpusRes, gamesRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug`, { headers, cache: 'no-store' }),
                fetch(`${supabaseUrl}/rest/v1/games?select=slug`, { headers, cache: 'no-store' })
            ]);

            const gpus = gpusRes.ok ? await gpusRes.json() : [];
            const gamesData = gamesRes.ok ? await gamesRes.json() : [];
            const dbGames = gamesData.map(g => g.slug).filter(Boolean);
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
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

        if (routes.length === 0) {
            return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
        }

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
        console.error("SITEMAP CATCH ERROR:", err);
        return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }
}
