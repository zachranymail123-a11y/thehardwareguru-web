import { createClient } from '@supabase/supabase-js';

/**
 * GURU BING CHUNKER V1.7 (RECOVERY & FULL EN COVERAGE)
 * Cesta: src/app/bing-sitemap/[id]/route.js
 * 🚀 CÍL: Překonat 200k+ URL adres a obnovit indexaci článků.
 * 🛡️ FIX 1: Obnovena zmizelá sekce 'posts' (Články, Tipy, Tweaky).
 * 🛡️ FIX 2: Doplněny EN verze do VŠECH smyček (FPS, Bottleneck, Performance).
 * 🛡️ FIX 3: Snížen limit na 2 CPU per chunk pro eliminaci Bing timeoutů.
 */

export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const baseUrl = 'https://thehardwareguru.cz';

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
    const xmlHeaders = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' };
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) return new Response(emptyXml, { headers: xmlHeaders });

    const type = id.replace('.xml', '');
    const routes = [];

    try {
        // --- 1. ZÁKLADNÍ STRÁNKY ---
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs', '/cpuvs', '/gpuvs/ranking', '/cpuvs/ranking', '/gpu-index', '/cpu-index', '/deals', '/support', '/tipy', '/tweaky', '/rady', '/slovnik'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9' });
            });
        } 
        
        // --- 2. ČLÁNKY (OBNOVENO) ---
        else if (type === 'posts') {
            const [pRes, tRes, twRes, rRes, sRes] = await Promise.all([
                supabase.from('posts').select('slug, created_at'),
                supabase.from('tipy').select('slug, created_at'),
                supabase.from('tweaky').select('slug, created_at'),
                supabase.from('rady').select('slug, created_at'),
                supabase.from('slovnik').select('slug, created_at')
            ]);
            const add = (data, path) => data?.forEach(i => {
                if (i.slug) {
                    const dt = safeDate(i.created_at);
                    routes.push({ url: `${baseUrl}/${path}/${i.slug}`, lastmod: dt, priority: '0.9' });
                    routes.push({ url: `${baseUrl}/en/${path}/${i.slug}`, lastmod: dt, priority: '0.8' });
                }
            });
            add(pRes.data, 'clanky'); add(tRes.data, 'tipy'); add(twRes.data, 'tweaky'); add(rRes.data, 'rady'); add(sRes.data, 'slovnik');
        }

        // --- 3. CPU PROFILY & VARIANTY ---
        else if (type === 'cpu') {
            const { data: cpus } = await supabase.from('cpus').select('name, created_at');
            const { data: gamesRes } = await supabase.from('games').select('slug');
            const games = gamesRes?.map(g => g.slug) || ['cyberpunk-2077'];
            cpus?.forEach(c => {
                const s = slugify(c.name);
                const d = safeDate(c.created_at);
                routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/en/cpu-performance/${s}`, lastmod: d, priority: '0.7' });
                
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.7' });
                    routes.push({ url: `${baseUrl}/en/cpu-fps/${s}/${g}`, lastmod: d, priority: '0.6' });
                });
            });
        } 
        
        // --- 4. GPU PROFILY & VARIANTY ---
        else if (type === 'gpu') {
            const { data: gpus } = await supabase.from('gpus').select('name, slug, created_at');
            const { data: gamesRes } = await supabase.from('games').select('slug');
            const games = gamesRes?.map(g => g.slug) || ['cyberpunk-2077'];
            gpus?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                const d = safeDate(g.created_at);
                routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.8' });
                routes.push({ url: `${baseUrl}/en/gpu-performance/${s}`, lastmod: d, priority: '0.7' });

                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.7' });
                    routes.push({ url: `${baseUrl}/en/gpu-fps/${s}/${gm}`, lastmod: d, priority: '0.6' });
                });
            });
        } 
        
        // --- 5. DUELY & UPGRADY ---
        else if (type.startsWith('duels-') || type.startsWith('upgrades-')) {
            const isUpg = type.startsWith('upgrades-');
            const table = isUpg ? 'gpu_upgrades' : 'gpu_duels';
            const pageNum = parseInt(type.split('-')[1], 10);
            const limit = 800;
            const offset = (pageNum - 1) * limit;

            const { data } = await supabase.from(table).select('slug, created_at').order('created_at').range(offset, offset + limit - 1);
            data?.forEach(d => {
                const dt = safeDate(d.created_at);
                const path = isUpg ? 'gpu-upgrade' : 'gpuvs';
                routes.push({ url: `${baseUrl}/${path}/${d.slug}`, lastmod: dt, priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/${path}/en-${d.slug}`, lastmod: dt, priority: '0.6' });
            });
        } 

        // --- 6. MEGA BOTTLENECK MATICE ---
        else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 2; 
            const offset = (chunkId - 1) * limit;
            const { data: cpus } = await supabase.from('cpus').select('name').order('name').range(offset, offset + limit - 1);
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

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
                        routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, priority: '0.4' });
                        resolutions.forEach(res => {
                            routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: '0.4' });
                            routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, priority: '0.3' });
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

        return new Response(xml.trim(), { headers: xmlHeaders });
    } catch (err) {
        return new Response(emptyXml, { headers: xmlHeaders });
    }
}
