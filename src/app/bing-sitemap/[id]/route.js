import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 86400; // Cache na 24 hodin

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(req, { params }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 1) return new NextResponse('Invalid ID', { status: 400 });

  // 🚀 CHATGPT FIX 1: Změna limitu na 500
  const LIMIT = 500;
  const offset = (id - 1) * LIMIT;

  try {
    // 🚀 CHATGPT FIX 2: Taháme jen základní entity, ŽÁDNÉ kombinování VS, FPS atd.
    const [cpus, gpus, games, posts] = await Promise.all([
      supabase.from('cpus').select('slug, updated_at').range(offset, offset + LIMIT - 1),
      supabase.from('gpus').select('slug, updated_at').range(offset, offset + LIMIT - 1),
      supabase.from('games').select('slug, created_at').range(offset, offset + LIMIT - 1),
      supabase.from('posts').select('slug, updated_at').range(offset, offset + LIMIT - 1)
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addUrl = (path, date) => {
      xml += `  <url>\n`;
      xml += `    <loc>https://thehardwareguru.cz${path}</loc>\n`;
      if (date) xml += `    <lastmod>${new Date(date).toISOString()}</lastmod>\n`;
      xml += `  </url>\n`;
    };

    // Hlavní sekce webu nacpeme jen do prvního souboru
    if (id === 1) {
      addUrl('', new Date().toISOString());
      addUrl('/cpu', new Date().toISOString());
      addUrl('/gpu', new Date().toISOString());
      addUrl('/clanky', new Date().toISOString());
      addUrl('/hry', new Date().toISOString());
    }

    // CPU profily
    if (cpus.data) {
      cpus.data.forEach(cpu => {
        if (cpu.slug) addUrl(`/cpu/${cpu.slug}`, cpu.updated_at);
      });
    }

    // GPU profily
    if (gpus.data) {
      gpus.data.forEach(gpu => {
        if (gpu.slug) addUrl(`/gpu/${gpu.slug}`, gpu.updated_at);
      });
    }

    // Herní profily
    if (games.data) {
      games.data.forEach(game => {
        if (game.slug) addUrl(`/game/${game.slug}`, game.created_at);
      });
    }

    // Články
    if (posts.data) {
      posts.data.forEach(post => {
        if (post.slug) addUrl(`/clanky/${post.slug}`, post.updated_at);
      });
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (err) {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
