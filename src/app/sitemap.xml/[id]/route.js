import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - CHUNK GENERATOR V22.1 (ChatGPT ChangeFreq Fix)
 * Cesta: src/app/sitemap/[id]/route.js
 * 🛡️ FIX 1: Přidána doporučená <changefreq> optimalizace pro programmatic SEO.
 * Články = weekly, HW matice = monthly.
 */

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://thehardwareguru.cz';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';

const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();

const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// 🚀 GURU OPTIMALIZACE: Globální in-memory cache pro route handler.
// Může být na Vercelu resetována, ale při hromadném crawlování zachytí velkou část dotazů.
let cachedGpus = null;
let cachedGames = null;

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const idParam = resolvedParams.id || '0';
  const currentId = parseInt(idParam.replace('.xml', ''), 10);
  const fallbackNow = new Date().toISOString();
  const routes = [];

  try {
    if (currentId === 0) {
      // 📌 ID 0: STATICKÉ STRÁNKY, ČLÁNKY, PROFILY, UPGRADY A DUELY (CZ i EN)
      const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
      staticPaths.forEach(p => {
          routes.push({ url: `${baseUrl}${p}`, lastmod: fallbackNow, changefreq: 'weekly' });
          routes.push({ url: `${baseUrl}/en${p}`, lastmod: fallbackNow, changefreq: 'weekly' });
      });

      // Fetch všeho důležitého s timestampy pro správný Google lastmod
      const [posts, cpus, gpus, cpuUpg, gpuUpg, cpuDuels, gpuDuels] = await Promise.all([
          supabase.from('posts').select('slug, created_at'),
          supabase.from('cpus').select('name, slug, created_at'),
          supabase.from('gpus').select('name, slug, created_at'),
          supabase.from('cpu_upgrades').select('slug, slug_en, created_at'),
          supabase.from('gpu_upgrades').select('slug, slug_en, created_at'),
          supabase.from('cpu_duels').select('slug, slug_en, created_at'),
          supabase.from('gpu_duels').select('slug, slug_en, created_at')
      ]);

      posts?.data?.forEach(p => {
          if (p.slug) {
              const d = p.created_at ? new Date(p.created_at).toISOString() : fallbackNow;
              routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastmod: d, changefreq: 'weekly' });
              routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastmod: d, changefreq: 'weekly' });
          }
      });

      const coreGames = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];

      cpus?.data?.forEach(c => {
          const safeSlug = c.slug || slugify(c.name);
          if (!safeSlug) return;
          const d = c.created_at ? new Date(c.created_at).toISOString() : fallbackNow;

          routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/cpu-performance/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/cpu-performance/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/cpu-recommend/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/cpu-recommend/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          coreGames.forEach(gm => {
              routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastmod: d, changefreq: 'monthly' });
              routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastmod: d, changefreq: 'monthly' });
          });
      });

      gpus?.data?.forEach(g => {
          const safeSlug = cleanGpuSlug(g.slug, g.name);
          if (!safeSlug) return;
          const d = g.created_at ? new Date(g.created_at).toISOString() : fallbackNow;

          routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/gpu-performance/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/gpu-performance/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/gpu-recommend/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          routes.push({ url: `${baseUrl}/en/gpu-recommend/${safeSlug}`, lastmod: d, changefreq: 'monthly' });
          coreGames.forEach(gm => {
              routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastmod: d, changefreq: 'monthly' });
              routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastmod: d, changefreq: 'monthly' });
          });
      });

      [...(cpuUpg?.data || [])].forEach(u => {
          const d = u.created_at ? new Date(u.created_at).toISOString() : fallbackNow;
          if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastmod: d, changefreq: 'monthly' });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastmod: d, changefreq: 'monthly' });
      });
      [...(gpuUpg?.data || [])].forEach(u => {
          const d = u.created_at ? new Date(u.created_at).toISOString() : fallbackNow;
          if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastmod: d, changefreq: 'monthly' });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastmod: d, changefreq: 'monthly' });
      });
      [...(cpuDuels?.data || [])].forEach(d => {
          const dTime = d.created_at ? new Date(d.created_at).toISOString() : fallbackNow;
          if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastmod: dTime, changefreq: 'monthly' });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastmod: dTime, changefreq: 'monthly' });
      });
      [...(gpuDuels?.data || [])].forEach(d => {
          const dTime = d.created_at ? new Date(d.created_at).toISOString() : fallbackNow;
          if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastmod: dTime, changefreq: 'monthly' });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastmod: dTime, changefreq: 'monthly' });
      });

    } else {
      // 📌 ID > 0: MEGA BOTTLENECK CLUSTER
      const limit = 2;
      const offset = (currentId - 1) * limit;

      const { data: cpus } = await supabase
        .from('cpus')
        .select('name, slug, created_at')
        .range(offset, offset + limit - 1);

      // Fail-safe - chunk neodpovídá datům
      if (!cpus || cpus.length === 0) {
        routes.push({ url: baseUrl, lastmod: fallbackNow, changefreq: 'weekly' });
      } else {
        // Zde využíváme CHATGPT CACHE LOGIKU, zamezujeme tak stovkám requestů do Supabase
        if (!cachedGpus || !cachedGames) {
          const [gpusRes, gamesRes] = await Promise.all([
            supabase.from('gpus').select('name, slug'),
            supabase.from('games').select('slug')
          ]);
          cachedGpus = gpusRes.data || [];
          cachedGames = gamesRes?.data?.map(g => g.slug).filter(Boolean) || [];
        }

        const gpus = cachedGpus;
        const dbGames = cachedGames;
        const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
        const resolutions = ['1080p','1440p','4k'];

        cpus.forEach(cpu => {
          const cpuSlug = cpu.slug || slugify(cpu.name);
          const cpuDate = cpu.created_at ? new Date(cpu.created_at).toISOString() : fallbackNow;

          gpus.forEach(gpu => {
            const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
            if (!cpuSlug || !gpuSlug) return;

            const basePath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;

            routes.push({ url: `${baseUrl}${basePath}`, lastmod: cpuDate, changefreq: 'monthly' });
            routes.push({ url: `${baseUrl}/en${basePath}`, lastmod: cpuDate, changefreq: 'monthly' });

            games.forEach(game => {
              routes.push({ url: `${baseUrl}${basePath}-in-${game}`, lastmod: cpuDate, changefreq: 'monthly' });
              routes.push({ url: `${baseUrl}/en${basePath}-in-${game}`, lastmod: cpuDate, changefreq: 'monthly' });

              resolutions.forEach(res => {
                routes.push({ url: `${baseUrl}${basePath}-in-${game}-at-${res}`, lastmod: cpuDate, changefreq: 'monthly' });
                routes.push({ url: `${baseUrl}/en${basePath}-in-${game}-at-${res}`, lastmod: cpuDate, changefreq: 'monthly' });
              });
            });
          });
        });
      }
    }

    if (routes.length === 0) {
      routes.push({ url: baseUrl, lastmod: fallbackNow, changefreq: 'weekly' });
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    routes.forEach(r => {
      xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    ${r.changefreq ? `<changefreq>${r.changefreq}</changefreq>\n` : ''}  </url>\n`;
    });
    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error("SITEMAP ROUTE ERROR:", error);
    const errXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${fallbackNow}</lastmod>\n  </url>\n</urlset>`;
    return new Response(errXml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}
