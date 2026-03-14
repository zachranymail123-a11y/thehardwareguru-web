import { createClient } from '@supabase/supabase-js';

/**
 * GURU BING CHUNKER V1.5 (TOTAL DOMINATION & CHUNKED DUELS)
 * Cesta: src/app/bing-sitemap/[id]/route.js
 * 🚀 CÍL: 100% pokrytí celého webu (200k+ URL) bez narážení na limity Supabase.
 * 🛡️ FIX 1: Implementován chunking pro 'duels-N' a 'upgrades-N' (limit 800 per file).
 * 🛡️ FIX 2: Používá SERVICE_ROLE_KEY pro neomezený přístup k datům.
 * 🛡️ FIX 3: Striktní Next.js 15 compliance (await props.params).
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

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 
    const xmlHeaders = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' };
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) return new Response(emptyXml, { headers: xmlHeaders });

    const type = id.replace('.xml', '');
    const routes = [];

    try {
        // --- 1. STATICKÉ STRÁNKY ---
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs', '/cpuvs', '/gpuvs/ranking', '/cpuvs/ranking', '/gpu-index', '/cpu-index', '/deals', '/support', '/tipy', '/tweaky', '/rady', '/slovnik'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9' });
            });
        } 
        
        // --- 2. ČLÁNKY A PŘÍSPĚVKY ---
        else if (type === 'posts') {
            const [pRes, tRes, twRes, rRes, sRes] = await Promise.all([
                supabase.from('posts').select('slug'),
                supabase.from('tipy').select('slug'),
                supabase.from('tweaky').select('slug'),
                supabase.from('rady').select('slug'),
                supabase.from('slovnik').select('slug')
            ]);
            const add = (data, path) => data?.forEach(i => {
                if (i.slug) {
                    routes.push({ url: `${baseUrl}/${path}/${i.slug}`, priority: '0.9' });
                    routes.push({ url: `${baseUrl}/en/${path}/${i.slug}`, priority: '0.8' });
                }
            });
            add(pRes.data, 'clanky'); add(tRes.data, 'tipy'); add(twRes.data, 'tweaky'); add(rRes.data, 'rady'); add(sRes.data, 'slovnik');
        } 
        
        // --- 3. CPU PROFILY A FPS ---
        else if (type === 'cpu') {
            const { data: cpus } = await supabase.from('cpus').select('name');
            const { data: gamesRes } = await supabase.from('games').select('slug');
            const games = gamesRes?.map(g => g.slug) || ['cyberpunk-2077'];
            cpus?.forEach(c => {
                const s = slugify(c.name);
                routes.push({ url: `${baseUrl}/cpu/${s}`, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, priority: '0.8' });
                games.forEach(g => {
                    routes.push({ url: `${baseUrl}/cpu-fps/${s}/${g}`, priority: '0.7' });
                    routes.push({ url: `${baseUrl}/en/cpu-fps/${s}/${g}`, priority: '0.6' });
                });
            });
        } 
        
        // --- 4. GPU PROFILY A FPS ---
        else if (type === 'gpu') {
            const { data: gpus } = await supabase.from('gpus').select('name, slug');
            const { data: gamesRes } = await supabase.from('games').select('slug');
            const games = gamesRes?.map(g => g.slug) || ['cyberpunk-2077'];
            gpus?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                routes.push({ url: `${baseUrl}/gpu/${s}`, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, priority: '0.8' });
                games.forEach(gm => {
                    routes.push({ url: `${baseUrl}/gpu-fps/${s}/${gm}`, priority: '0.7' });
                    routes.push({ url: `${baseUrl}/en/gpu-fps/${s}/${gm}`, priority: '0.6' });
                });
            });
        } 
        
        // --- 5. CHUNKED DUELS (SROVNÁNÍ) ---
        else if (type.startsWith('duels-')) {
            const pageNum = parseInt(type.replace('duels-', ''), 10);
            const limit = 800;
            const offset = (pageNum - 1) * limit;

            const [gpuDuels, cpuDuels] = await Promise.all([
                supabase.from('gpu_duels').select('slug').order('created_at').range(offset, offset + limit - 1),
                supabase.from('cpu_duels').select('slug').order('created_at').range(offset, offset + limit - 1)
            ]);
            
            gpuDuels.data?.forEach(d => {
                routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/gpuvs/en-${d.slug}`, priority: '0.6' });
            });
            cpuDuels.data?.forEach(d => {
                routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/cpuvs/en-${d.slug}`, priority: '0.6' });
            });
        }

        // --- 6. CHUNKED UPGRADES ---
        else if (type.startsWith('upgrades-')) {
            const pageNum = parseInt(type.replace('upgrades-', ''), 10);
            const limit = 800;
            const offset = (pageNum - 1) * limit;

            const [gpuUpg, cpuUpg] = await Promise.all([
                supabase.from('gpu_upgrades').select('slug').order('created_at').range(offset, offset + limit - 1),
                supabase.from('cpu_upgrades').select('slug').order('created_at').range(offset, offset + limit - 1)
            ]);

            gpuUpg.data?.forEach(u => {
                routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/gpu-upgrade/en-${u.slug}`, priority: '0.6' });
            });
            cpuUpg.data?.forEach(u => {
                routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, priority: '0.7' });
                routes.push({ url: `${baseUrl}/en/cpu-upgrade/en-${u.slug}`, priority: '0.6' });
            });
        }

        // --- 7. MEGA BOTTLENECK MATICE (Numerické chunky) ---
        else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 2; // Stabilita pro Bingbot
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

        if (routes.length === 0) return new Response(emptyXml, { headers: xmlHeaders });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml.trim(), { headers: xmlHeaders });
    } catch (err) {
        return new Response(emptyXml, { headers: xmlHeaders });
    }
}
