import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  try {

    const [posts, rady, gpuDuels, cpuDuels] = await Promise.all([
      supabase
        .from("posts")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("rady")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("gpu_duels")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("cpu_duels")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    const items = [];

    (posts.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/clanky/${p.slug}`,
        en: `${baseUrl}/en/clanky/${p.slug}`,
        date: p.created_at
      });
    });

    (rady.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/rady/${p.slug}`,
        en: `${baseUrl}/en/rady/${p.slug}`,
        date: p.created_at
      });
    });

    (gpuDuels.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/gpuvs/${p.slug}`,
        en: `${baseUrl}/en/gpuvs/${p.slug}`,
        date: p.created_at
      });
    });

    (cpuDuels.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/cpuvs/${p.slug}`,
        en: `${baseUrl}/en/cpuvs/${p.slug}`,
        date: p.created_at
      });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    const latest = items.slice(0, 60);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const item of latest) {

      const date = item.date
        ? new Date(item.date).toISOString()
        : new Date().toISOString();

      xml += `<url>\n`;
      xml += `  <loc>${escapeXml(item.cz)}</loc>\n`;
      xml += `  <lastmod>${date}</lastmod>\n`;
      xml += `  <changefreq>daily</changefreq>\n`;
      xml += `  <priority>1.0</priority>\n`;
      xml += `  <xhtml:link rel="alternate" hreflang="cs" href="${escapeXml(item.cz)}"/>\n`;
      xml += `  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(item.en)}"/>\n`;
      xml += `</url>\n`;

      xml += `<url>\n`;
      xml += `  <loc>${escapeXml(item.en)}</loc>\n`;
      xml += `  <lastmod>${date}</lastmod>\n`;
      xml += `  <changefreq>daily</changefreq>\n`;
      xml += `  <priority>0.9</priority>\n`;
      xml += `  <xhtml:link rel="alternate" hreflang="cs" href="${escapeXml(item.cz)}"/>\n`;
      xml += `  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(item.en)}"/>\n`;
      xml += `</url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {

    console.error("LATEST SITEMAP ERROR:", error);

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return new NextResponse(fallback, {
      headers: {
        "Content-Type": "application/xml"
      }
    });
  }
}
function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  try {

    const [
      posts,
      rady,
      gpuDuels,
      cpuDuels
    ] = await Promise.all([

      supabase
        .from("posts")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("rady")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("gpu_duels")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("cpu_duels")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(10)

    ]);

    const items = [];

    // articles
    (posts.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/clanky/${p.slug}`,
        en: `${baseUrl}/en/clanky/${p.slug}`,
        date: p.created_at
      });
    });

    // rady
    (rady.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/rady/${p.slug}`,
        en: `${baseUrl}/en/rady/${p.slug}`,
        date: p.created_at
      });
    });

    // gpu comparisons
    (gpuDuels.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/gpuvs/${p.slug}`,
        en: `${baseUrl}/en/gpuvs/${p.slug}`,
        date: p.created_at
      });
    });

    // cpu comparisons
    (cpuDuels.data || []).forEach(p => {
      if (!p.slug) return;

      items.push({
        cz: `${baseUrl}/cpuvs/${p.slug}`,
        en: `${baseUrl}/en/cpuvs/${p.slug}`,
        date: p.created_at
      });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    const latest = items.slice(0, 60);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const item of latest) {

      const date = item.date
        ? new Date(item.date).toISOString()
        : new Date().toISOString();

      xml += `
<url>
<loc>${escapeXml(item.cz)}</loc>
<lastmod>${date}</lastmod>
<changefreq>daily</changefreq>
<priority>1.0</priority>
<xhtml:link rel="alternate" hreflang="cs" href="${escapeXml(item.cz)}"/>
<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(item.en)}"/>
</url>

<url>
<loc>${escapeXml(item.en)}</loc>
<lastmod>${date}</lastmod>
<changefreq>daily</changefreq>
<priority>0.9</priority>
<xhtml:link rel="alternate" hreflang="cs" href="${escapeXml(item.cz)}"/>
<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(item.en)}"/>
</url>
`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
      }
    });

  } catch (error) {

    console.error("LATEST SITEMAP ERROR:", error);

    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return new NextResponse(empty, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8"
      }
    });

  }
}
