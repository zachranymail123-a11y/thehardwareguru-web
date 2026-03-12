import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V34.0 (FULL CONTENT COVERAGE)
 * Cesta: src/app/guru-sitemap/[id]/route.js
 * 🛡️ FIX 1: Přidány chybějící hlavní rozcestníky (/tipy, /tweaky, /rady, /slovnik) do 'pages'.
 * 🛡️ FIX 2: Do 'posts' chunku se nyní dynamicky tahají data ze všech 5 obsahových tabulek 
 * (posts, tipy, tweaky, rady, slovnik), čímž je zaručena 100% indexace celého webu.
 */

export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = 'https://thehardwareguru.cz';

// Návrat k oficiálnímu klientovi s blokací paměťových úniků (ideální pro Vercel API routy)
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

// 🚀 GURU DEBUG GENERÁTOR
const generateDebugXml = (msg) => {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- GURU DEBUG INFO: ${escapeXml(msg)} -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
};

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 

    const xmlHeaders = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' };

    if (!id || !id.endsWith('.xml')) {
        return new Response(generateDebugXml('Neplatny parametr ID (chybi koncovka .xml)'), { headers: xmlHeaders });
    }

    const type = id.replace('.xml', '');
    const routes = [];

    try {
        if (type === 'pages') {
            // 🚀 GURU FIX: Zahrnuty všechny chybějící huby pro kompletní indexaci
            const staticPaths = [
                '/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', 
                '/deals', '/support', '/tipy', '/tweaky', '/rady', '/slovnik'
            ];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0', changefreq: 'daily' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9', changefreq: 'daily' });
            });
            
        } else if (type === 'posts') {
            // 🚀 GURU FIX: Plná agregace ze všech redakčních tabulek webu!
            const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes] = await Promise.all([
                supabase.from('posts').select('slug, created_at'),
                supabase.from('tipy').select('slug, created_at'),
                supabase.from('tweaky').select('slug, created_at'),
                supabase.from('rady').select('slug, created_at'),
                supabase.from('slovnik').select('slug, created_at')
            ]);
            
            // Pomocná funkce pro bezpečné plnění routes
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
            
        } else if (type === 'cpu') {
            const { data: cpus, error: cpuErr } = await supabase.from('cpus').select('name, created_at');
            if (cpuErr) return new Response(generateDebugXml(`CPU DB ERROR: ${cpuErr.message}`), { headers: xmlHeaders });
            
            const { data: gamesData } = await supabase.from('games').select('slug');
            const dbGames = gamesData?.map(g => g.slug).filter(Boolean) || [];
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

            cpus?.forEach(c => {
                const s = slugify(c.name); 
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
            const { data: gpus, error: gpuErr } = await supabase.from('gpus').select('name, slug, created_at');
            if (gpuErr) return new Response(generateDebugXml(`GPU DB ERROR: ${gpuErr.message}`), { headers: xmlHeaders });

            const { data: gamesData } = await supabase.from('games').select('slug');
            const dbGames = gamesData?.map(g => g.slug).filter(Boolean) || [];
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

            gpus?.forEach(g => {
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
            
        } else if (type === 'duels' || type === 'upgrades') {
            const isDuels = type === 'duels';
            const tableCpu = isDuels ? 'cpu_duels' : 'cpu_upgrades';
            const tableGpu = isDuels ? 'gpu_duels' : 'gpu_upgrades';
            const pathCpu = isDuels ? 'cpuvs' : 'cpu-upgrade';
            const pathGpu = isDuels ? 'gpuvs' : 'gpu-upgrade';

            const [cpuRes, gpuRes] = await Promise.all([
                supabase.from(tableCpu).select('slug, slug_en, created_at'),
                supabase.from(tableGpu).select('slug, slug_en, created_at')
            ]);
            
            if (cpuRes.error) return new Response(generateDebugXml(`CPU ${type} ERROR: ${cpuRes.error.message}`), { headers: xmlHeaders });
            if (gpuRes.error) return new Response(generateDebugXml(`GPU ${type} ERROR: ${gpuRes.error.message}`), { headers: xmlHeaders });

            cpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathCpu}/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathCpu}/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            gpuRes.data?.forEach(d => {
                const dt = safeDate(d.created_at);
                if (d.slug) routes.push({ url: `${baseUrl}/${pathGpu}/${d.slug}`, lastmod: dt, priority: '0.7', changefreq: 'monthly' });
                if (d.slug_en) routes.push({ url: `${baseUrl}/en/${pathGpu}/${d.slug_en}`, lastmod: dt, priority: '0.6', changefreq: 'monthly' });
            });
            
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            
            if (chunkId < 1 || chunkId > 60) {
                return new Response(generateDebugXml(`Neplatne ID chunku: ${chunkId}`), { headers: xmlHeaders });
            }

            const limit = 2; 
            const offset = (chunkId - 1) * limit;

            const { data: cpus, error: cpuErr } = await supabase
                .from('cpus')
                .select('name')
                .order('name')
                .range(offset, offset + limit - 1);
            
            if (cpuErr) return new Response(generateDebugXml(`CPU MATICE CHYBA: ${cpuErr.message}`), { headers: xmlHeaders });
            if (!cpus || cpus.length === 0) return new Response(generateDebugXml(`OK - ZADNE DALSI CPU PRO OFFSET ${offset} (Konec DB)`), { headers: xmlHeaders });

            const [gpusRes, gamesRes] = await Promise.all([
                supabase.from('gpus').select('name, slug'),
                supabase.from('games').select('slug')
            ]);

            if (gpusRes.error) return new Response(generateDebugXml(`GPU MATICE CHYBA: ${gpusRes.error.message}`), { headers: xmlHeaders });

            const gpus = gpusRes.data || [];
            const dbGames = gamesRes.data?.map(g => g.slug).filter(Boolean) || [];
            const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
            const resolutions = ['1080p', '1440p', '4k'];

            cpus.forEach(cpu => {
                const cpuSlug = slugify(cpu.name); 
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
            return new Response(generateDebugXml(`Neznamy typ URL: ${type}`), { headers: xmlHeaders });
        }

        if (routes.length === 0) {
            return new Response(generateDebugXml(`SKRIPT DOBEHL, ALE POLE ROUTES JE PRAZDNE. TYP: ${type}`), { headers: xmlHeaders });
        }

        // Vše OK, generujeme ostré XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
            if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
            xml += `    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { headers: xmlHeaders });

    } catch (err) {
        console.error("SITEMAP CATCH ERROR:", err);
        return new Response(generateDebugXml(`KRITICKY CRASH SKRIPTU: ${err.message}`), { headers: xmlHeaders });
    }
}
