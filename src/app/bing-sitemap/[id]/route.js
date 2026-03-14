import { createClient } from '@supabase/supabase-js';

/**
 * GURU BING CHUNKER V1.2 (TOTAL PARITY FIX)
 * Cesta: src/app/bing-sitemap/[id]/route.js
 * 🚀 CÍL: 100% shoda s funkčním guru-sitemap enginem (tisíce URL).
 * 🛡️ FIX 1: Doplněna chybějící smyčka pro rozlišení (1080p, 1440p, 4k).
 * 🛡️ FIX 2: Supabase client s vypnutou persistencí (server-safe).
 * 🛡️ FIX 3: Přidáno řazení .order('name') pro stabilní chunky.
 */

export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const baseUrl = 'https://thehardwareguru.cz';

// 🚀 GURU FIX: Server-safe inicializace bez pokusů o localStorage
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

const safeDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    try { return new Date(dateStr).toISOString(); } catch(e) { return new Date().toISOString(); }
};

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });

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
                routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: safeDate(c.created_at), priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: safeDate(c.created_at), priority: '0.8' });
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: safeDate(c.created_at), priority: '0.7' });
                });
            });
        } else if (type === 'gpu') {
            const { data: gpus } = await supabase.from('gpus').select('name, slug, created_at');
            const { data: gamesData } = await supabase.from('games').select('slug');
            const games = gamesData?.map(g => g.slug).filter(Boolean) || ['cyberpunk-2077'];
            gpus?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: safeDate(g.created_at), priority: '0.9', changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: safeDate(g.created_at), priority: '0.8' });
                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: safeDate(g.created_at), priority: '0.7' });
                });
            });
        } else if (type === 'duels') {
            const [gpuDuels, cpuDuels] = await Promise.all([
                supabase.from('gpu_duels').select('slug, created_at'),
                supabase.from('cpu_duels').select('slug, created_at')
            ]);
            gpuDuels.data?.forEach(d => {
                routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastmod: safeDate(d.created_at), priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/gpuvs/en-${d.slug}`, lastmod: safeDate(d.created_at), priority: '0.6' });
            });
            cpuDuels.data?.forEach(d => {
                routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastmod: safeDate(d.created_at), priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/cpuvs/en-${d.slug}`, lastmod: safeDate(d.created_at), priority: '0.6' });
            });
        } else if (type === 'upgrades') {
            const [gpuUpg, cpuUpg] = await Promise.all([
                supabase.from('gpu_upgrades').select('slug, created_at'),
                supabase.from('cpu_upgrades').select('slug, created_at')
            ]);
            gpuUpg.data?.forEach(u => {
                routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastmod: safeDate(u.created_at), priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/gpu-upgrade/en-${u.slug}`, lastmod: safeDate(u.created_at), priority: '0.6' });
            });
            cpuUpg.data?.forEach(u => {
                routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastmod: safeDate(u.created_at), priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/cpu-upgrade/en-${u.slug}`, lastmod: safeDate(u.created_at), priority: '0.6' });
            });
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 5; 
            const offset = (chunkId - 1) * limit;
            
            // 🚀 GURU FIX: Přidáno .order('name') pro stabilitu chunků
            const { data: cpus } = await supabase.from('cpus').select('name').order('name').range(offset, offset + limit - 1);
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });

            const [gRes, gamesRes] = await Promise.all([supabase.from('gpus').select('name, slug'), supabase.from('games').select('slug')]);
            const gpus = gRes.data || [];
            const games = gamesRes.data?.map(g => g.slug) || ['cyberpunk-2077'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = slugify(cpu.name);
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6' });
                    routes.push({ url: `${baseUrl}/en${pairPath}`, priority: '0.5' });
                    
                    games.forEach(game => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: '0.5' });
                        // 🚀 GURU FIX: Přidán cyklus pro rozlišení (násobí počet URL 3x!)
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.4' });
                        });
                    });
                });
            });
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
            if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${r.changefreq || 'monthly'}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    } catch (err) {
        return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });
    }
}
