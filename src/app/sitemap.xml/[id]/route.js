import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V23.0 (ULTIMATE CHUNK FIX)
 * Cesta: src/app/sitemap/[id]/route.js
 * 🛡️ FIX 1: Implementována URL-count logika (5000 URL / soubor) dle ChatGPT.
 * 🛡️ FIX 2: Přidány <priority> a <changefreq> parametry.
 * 🛡️ FIX 3: Odstraněn zbytečný 'await params' pro zrychlení.
 */

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// Cache pro metadata napříč chunky v rámci jedné vlny crawlování
let cachedGpus = null;
let cachedGames = null;

export async function GET(req, { params }) {
  const { id } = params; // 🚀 GURU FIX: Next.js 14 synchronní přístup (zrychlení)
  const currentId = parseInt(id.replace('.xml', ''), 10);
  const routes = [];

  try {
    if (currentId === 0) {
      // 📌 ID 0: HUBY, ČLÁNKY A PROFILY (Priorita 0.8 - 1.0)
      const staticPaths = [
        { p: '/', pr: '1.0' }, { p: '/clanky', pr: '0.9' }, { p: '/gpuvs/ranking', pr: '0.9' }, 
        { p: '/cpuvs/ranking', pr: '0.9' }, { p: '/cpu-index', pr: '0.9' }, { p: '/deals', pr: '0.8' }
      ];
      
      staticPaths.forEach(path => {
          routes.push({ url: `${baseUrl}${path.p}`, lastmod: new Date().toISOString(), priority: path.pr, changefreq: 'daily' });
          routes.push({ url: `${baseUrl}/en${path.p}`, lastmod: new Date().toISOString(), priority: (parseFloat(path.pr) - 0.1).toFixed(1), changefreq: 'daily' });
      });

      const [posts, cpus, gpus, cpuUpg, gpuUpg] = await Promise.all([
          supabase.from('posts').select('slug, created_at'),
          supabase.from('cpus').select('name, slug, created_at'),
          supabase.from('gpus').select('name, slug, created_at'),
          supabase.from('cpu_upgrades').select('slug, created_at'),
          supabase.from('gpu_upgrades').select('slug, created_at')
      ]);

      posts.data?.forEach(p => {
          const d = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
          routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastmod: d, priority: '0.9', changefreq: 'weekly' });
          routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastmod: d, priority: '0.8', changefreq: 'weekly' });
      });

      cpus.data?.forEach(c => {
          const s = c.slug || slugify(c.name);
          const d = c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString();
          routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
      });

      gpus.data?.forEach(g => {
          const s = cleanGpuSlug(g.slug, g.name);
          const d = g.created_at ? new Date(g.created_at).toISOString() : new Date().toISOString();
          routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
      });

    } else {
      // 📌 ID > 0: MEGA BOTTLENECK MATRIX (Priorita 0.6)
      if (!cachedGpus || !cachedGames) {
          const [gRes, gmRes] = await Promise.all([
              supabase.from('gpus').select('name, slug'),
              supabase.from('games').select('slug')
          ]);
          cachedGpus = gRes.data || [];
          cachedGames = gmRes.data || [];
      }

      const games = cachedGames.map(g => g.slug);
      const res = ['1080p', '1440p', '4k'];
      
      // Výpočet kolik CPU dává 5000 URL
      const urlsPerCpu = cachedGpus.length * games.length * 3 * 2;
      const cpusPerChunk = Math.max(1, Math.floor(5000 / urlsPerCpu));
      const offset = (currentId - 1) * cpusPerChunk;

      const { data: cpus } = await supabase.from('cpus').select('name, slug, created_at').range(offset, offset + cpusPerChunk - 1);

      cpus?.forEach(cpu => {
          const cSlug = cpu.slug || slugify(cpu.name);
          const d = cpu.created_at ? new Date(cpu.created_at).toISOString() : new Date().toISOString();

          cachedGpus.forEach(gpu => {
              const gSlug = cleanGpuSlug(gpu.slug, gpu.name);
              const pair = `/bottleneck/${cSlug}-with-${gSlug}`;

              // Základní páry
              routes.push({ url: `${baseUrl}${pair}`, lastmod: d, priority: '0.6', changefreq: 'monthly' });
              routes.push({ url: `${baseUrl}/en${pair}`, lastmod: d, priority: '0.5', changefreq: 'monthly' });

              games.forEach(game => {
                  res.forEach(r => {
                      const final = `${pair}-in-${game}-at-${r}`;
                      routes.push({ url: `${baseUrl}${final}`, lastmod: d, priority: '0.5', changefreq: 'monthly' });
                      routes.push({ url: `${baseUrl}/en${final}`, lastmod: d, priority: '0.4', changefreq: 'monthly' });
                  });
              });
          });
      });
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    routes.forEach(r => {
      xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;

    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400' } });

  } catch (err) {
    return new Response(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}</loc></url></urlset>`, { headers: { 'Content-Type': 'application/xml' } });
  }
}
