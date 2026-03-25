import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🚀 GURU FIX: Smazal jsem revalidate = 86400 a dal force-dynamic. 
// Vercel ti totiž doteď vracel tu starou sračku z paměti!
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
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
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 1) return new NextResponse('Invalid ID', { status: 400 });

  const LIMIT = 1000;
  const offset = (id - 1) * LIMIT;
  const routes = [];

  try {
    const [
      pRes, tRes, twRes, rRes, sRes, cpusRes, gpusRes,
      cpuDuels, cpuUpg, gpuDuels, gpuUpg
    ] = await Promise.all([
      supabase.from('posts').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('tipy').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('tweaky').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('rady').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('slovnik').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('cpus').select('name, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('gpus').select('name, slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('cpu_duels').select('slug, slug_en, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('cpu_upgrades').select('slug, slug_en, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('gpu_duels').select('slug, slug_en, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('gpu_upgrades').select('slug, slug_en, created_at').range(offset, offset + LIMIT - 1)
    ]);

    const addRoute = (path, date) => {
      routes.push({ url: `${baseUrl}${path}`, lastmod: safeDate(date) });
    };

    if (id === 1) {
      const staticPaths = [
        '/', '/clanky', '/gpuvs', '/cpuvs', '/gpuvs/ranking', '/cpuvs/ranking', 
        '/gpu-index', '/cpu-index', '/deals', '/support', '/tipy', '/tweaky', 
        '/rady', '/slovnik', '/about', '/contact', '/privacy-policy', '/terms-of-service',
        '/fps-kalkulacka'
      ];
      staticPaths.forEach(p => {
        addRoute(p, new Date().toISOString());
        addRoute(p === '/fps-kalkulacka' ? '/en/fps-calculator' : `/en${p}`, new Date().toISOString());
      });
    }

    const addCollection = (data, prefix) => {
      data?.forEach(i => {
        if (i.slug) {
          addRoute(`/${prefix}/${i.slug}`, i.created_at);
          addRoute(`/en/${prefix}/${i.slug}`, i.created_at);
        }
      });
    };

    addCollection(pRes.data, 'clanky');
    addCollection(tRes.data, 'tipy');
    addCollection(twRes.data, 'tweaky');
    addCollection(rRes.data, 'rady');
    addCollection(sRes.data, 'slovnik');

    cpusRes.data?.forEach(c => {
      const s = slugify(c.name);
      addRoute(`/cpu/${s}`, c.created_at);
      addRoute(`/en/cpu/${s}`, c.created_at);
    });

    gpusRes.data?.forEach(g => {
      const s = cleanGpuSlug(g.slug, g.name);
      addRoute(`/gpu/${s}`, g.created_at);
      addRoute(`/en/gpu/${s}`, g.created_at);
    });

    const addVersus = (data, prefix) => {
      data?.forEach(d => {
        if (d.slug) addRoute(`/${prefix}/${d.slug}`, d.created_at);
        if (d.slug_en) addRoute(`/en/${prefix}/${d.slug_en}`, d.created_at);
      });
    };

    addVersus(cpuDuels.data, 'cpuvs');
    addVersus(cpuUpg.data, 'cpu-upgrade');
    addVersus(gpuDuels.data, 'gpuvs');
    addVersus(gpuUpg.data, 'gpu-upgrade');

    if (routes.length === 0) return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml' } });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    routes.forEach(r => {
      xml += `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n`;
      if (r.lastmod) xml += `    <lastmod>${r.lastmod}</lastmod>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;

    return new NextResponse(xml.trim(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store' // 🚀 Přidáno no-store, ať se ti to necachuje ani v prohlížeči!
      }
    });
  } catch (err) {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml' } });
  }
}
