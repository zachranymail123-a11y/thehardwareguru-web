import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V23.1 (CHATGPT SECURITY & CACHE FIX)
 * Cesta: src/app/sitemap/[id]/route.js
 * 🛡️ FIX 1: Odstraněno force-dynamic a nahrazeno revalidate = 86400.
 * 🛡️ FIX 2: Odstraněn SERVICE_ROLE_KEY z veřejného endpointu.
 * 🛡️ FIX 3: lastmod používá POUZE reálné datum z DB (žádný Date.now() fallback).
 * 🛡️ FIX 4: Prázdný <urlset> fallback, aby si GSC nestěžoval při pádu.
 * 🛡️ FIX 5: Vylepšené hlavičky Cache-Control.
 */

export const revalidate = 86400; // 🚀 GURU FIX: Stabilní cache na 1 den, žádné force-dynamic

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 🚀 GURU FIX: Pouze ANON_KEY, protože tento endpoint je veřejně přístupný přes URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';
const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// 🚀 GURU: Cache držená v paměti bleskově odbaví sekvenční requesty robota
let cachedGpus = null;
let cachedGames = null;

export async function GET(req, { params }) {
  const { id } = params; 
  const currentId = parseInt(id.replace('.xml', ''), 10);
  const routes = [];

  try {
    if (currentId === 0) {
      // 📌 ID 0: HUBY, ČLÁNKY A PROFILY (Statické i Dynamické)
      const staticPaths = [
        { p: '/', pr: '1.0' }, { p: '/clanky', pr: '0.9' }, { p: '/gpuvs/ranking', pr: '0.9' }, 
        { p: '/cpuvs/ranking', pr: '0.9' }, { p: '/cpu-index', pr: '0.9' }, { p: '/deals', pr: '0.8' }, { p: '/support', pr: '0.8' }
      ];
      
      // Statické cesty nemají DB lastmod, proto ho vynecháváme (aby se neaktualizoval s každým crawlem)
      staticPaths.forEach(path => {
          routes.push({ url: `${baseUrl}${path.p}`, lastmod: null, priority: path.pr, changefreq: 'daily' });
          routes.push({ url: `${baseUrl}/en${path.p}`, lastmod: null, priority: (parseFloat(path.pr) - 0.1).toFixed(1), changefreq: 'daily' });
      });

      const [posts, cpus, gpus, cpuUpg, gpuUpg, cpuDuels, gpuDuels] = await Promise.all([
          supabase.from('posts').select('slug, created_at'),
          supabase.from('cpus').select('name, slug, created_at'),
          supabase.from('gpus').select('name, slug, created_at'),
          supabase.from('cpu_upgrades').select('slug, created_at'),
          supabase.from('gpu_upgrades').select('slug, created_at'),
          supabase.from('cpu_duels').select('slug, created_at'),
          supabase.from('gpu_duels').select('slug, created_at')
      ]);

      // Články
      posts.data?.forEach(p => {
          // 🚀 GURU FIX: Datum POUZE pokud reálně existuje v DB
          const d = p.created_at ? new Date(p.created_at).toISOString() : null;
          routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastmod: d, priority: '0.9', changefreq: 'weekly' });
          routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastmod: d, priority: '0.8', changefreq: 'weekly' });
      });

      // Procesory
      cpus.data?.forEach(c => {
          const s = c.slug || slugify(c.name);
          const d = c.created_at ? new Date(c.created_at).toISOString() : null;
          routes.push({ url: `${baseUrl}/cpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/cpu-performance/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/cpu-recommend/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/cpu/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
      });

      // Grafiky
      gpus.data?.forEach(g => {
          const s = cleanGpuSlug(g.slug, g.name);
          const d = g.created_at ? new Date(g.created_at).toISOString() : null;
          routes.push({ url: `${baseUrl}/gpu/${s}`, lastmod: d, priority: '0.8', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/gpu-performance/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/gpu-recommend/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/gpu/${s}`, lastmod: d, priority: '0.7', changefreq: 'monthly' });
      });

      // Upgrady & Duely
      [...(cpuUpg?.data || []), ...(gpuUpg?.data || [])].forEach(u => {
          const d = u.created_at ? new Date(u.created_at).toISOString() : null;
          const basePath = u.slug?.includes('cpu') ? '/cpu-upgrade' : '/gpu-upgrade';
          if (u.slug) routes.push({ url: `${baseUrl}${basePath}/${u.slug}`, lastmod: d, priority: '0.6', changefreq: 'monthly' });
      });
      [...(cpuDuels?.data || []), ...(gpuDuels?.data || [])].forEach(d => {
          const dTime = d.created_at ? new Date(d.created_at).toISOString() : null;
          const basePath = d.slug?.includes('cpu') ? '/cpuvs' : '/gpuvs';
          if (d.slug) routes.push({ url: `${baseUrl}${basePath}/${d.slug}`, lastmod: dTime, priority: '0.6', changefreq: 'monthly' });
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

      const dbGames = cachedGames.map(g => g.slug).filter(Boolean);
      const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
      const res = ['1080p', '1440p', '4k'];
      
      // Výpočet kolik CPU dává cca 5000 URL
      const urlsPerCpu = cachedGpus.length * games.length * 3 * 2;
      const cpusPerChunk = Math.max(1, Math.floor(5000 / urlsPerCpu));
      const offset = (currentId - 1) * cpusPerChunk;

      const { data: cpus } = await supabase.from('cpus').select('name, slug, created_at').range(offset, offset + cpusPerChunk - 1);

      cpus?.forEach(cpu => {
          const cSlug = cpu.slug || slugify(cpu.name);
          // 🚀 GURU FIX: lastmod se přidá pouze pokud reálně existuje, jinak crawler web throttling
          const d = cpu.created_at ? new Date(cpu.created_at).toISOString() : null;

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
      xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
      // 🚀 GURU FIX: lastmod se vygeneruje POUZE pokud není null
      if (r.lastmod) {
          xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;

    return new Response(xml, { 
        headers: { 
            'Content-Type': 'application/xml; charset=utf-8', 
            // 🚀 GURU FIX: Definitivní CDN hlavička
            'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600' 
        } 
    });

  } catch (err) {
    // 🚀 GURU FIX: Bezpečný fallback, který Googlebot vezme jako prázdnou sitemapu, 
    // místo aby si stěžoval na error nebo 404 (odstraněna lokální URL).
    console.error("GURU CHUNK SITEMAP ERROR:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, 
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}
