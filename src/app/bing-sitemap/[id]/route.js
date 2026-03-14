import { createClient } from '@supabase/supabase-js';

/**
 * GURU BING CHUNKER V1.0 (EXCLUSIVE RESET BRANCH)
 * Cesta: src/app/bing-sitemap/[id]/route.js
 * 🚀 CÍL: Odbavit 119k+ URL pro Bing pod novou adresou.
 * 🛡️ FIX: Striktní Next.js 15 compliance (await params).
 */

export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(supabaseUrl, supabaseKey);

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

export async function GET(req, props) {
    const params = await props.params;
    const id = params.id; 
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    if (!id || !id.endsWith('.xml')) return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });

    const type = id.replace('.xml', '');
    const routes = [];

    try {
        if (type === 'pages') {
            const staticPaths = ['/', '/clanky', '/gpuvs', '/cpuvs', '/gpuvs/ranking', '/cpuvs/ranking', '/gpu-index', '/cpu-index', '/deals', '/support'];
            staticPaths.forEach(p => {
                routes.push({ url: `${baseUrl}${p}`, priority: '1.0' });
                routes.push({ url: `${baseUrl}/en${p}`, priority: '0.9' });
            });
        } else if (type === 'posts') {
            const { data } = await supabase.from('posts').select('slug');
            data?.forEach(p => {
                if (p.slug) {
                    routes.push({ url: `${baseUrl}/clanky/${p.slug}`, priority: '0.9' });
                    routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, priority: '0.8' });
                }
            });
        } else if (type === 'cpu') {
            const { data: cpus } = await supabase.from('cpus').select('name');
            cpus?.forEach(c => {
                const s = slugify(c.name);
                routes.push({ url: `${baseUrl}/cpu/${s}`, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/cpu/${s}`, priority: '0.8' });
            });
        } else if (type === 'gpu') {
            const { data: gpus } = await supabase.from('gpus').select('name, slug');
            gpus?.forEach(g => {
                const s = cleanGpuSlug(g.slug, g.name);
                routes.push({ url: `${baseUrl}/gpu/${s}`, priority: '0.9' });
                routes.push({ url: `${baseUrl}/en/gpu/${s}`, priority: '0.8' });
            });
        } else if (!isNaN(parseInt(type, 10))) {
            const chunkId = parseInt(type, 10);
            const limit = 5; 
            const offset = (chunkId - 1) * limit;
            const { data: cpus } = await supabase.from('cpus').select('name').range(offset, offset + limit - 1);
            if (!cpus || cpus.length === 0) return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });

            const [gRes, gamesRes] = await Promise.all([supabase.from('gpus').select('name, slug'), supabase.from('games').select('slug')]);
            const gpus = gRes.data || [];
            const games = gamesRes.data?.map(g => g.slug) || ['cyberpunk-2077'];

            cpus.forEach(cpu => {
                const cpuSlug = slugify(cpu.name);
                gpus.forEach(gpu => {
                    const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
                    const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
                    routes.push({ url: `${baseUrl}${pairPath}`, priority: '0.6' });
                    routes.push({ url: `${baseUrl}/en${pairPath}`, priority: '0.5' });
                    games.forEach(game => {
                        routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: '0.5' });
                    });
                });
            });
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        routes.forEach(r => {
            xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;

        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    } catch (err) {
        return new Response(emptyXml, { headers: { 'Content-Type': 'application/xml' } });
    }
}
