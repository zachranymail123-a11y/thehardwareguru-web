import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GURU FRESH SITEMAP ENGINE V1.1 (HREFLANG EDITION)
 * Cesta: src/app/latest.xml/route.js
 * 🚀 CÍL: Fresh sitemap pro crawler priority.
 * ✔ hreflang CZ/EN
 * ✔ daily changefreq
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = "https://thehardwareguru.cz";

const escapeXmlUrl = (url) => (url ? url.replace(/&/g, "&amp;") : "");

export async function GET() {
  try {
    const [posts, tipy, tweaky] = await Promise.all([
      supabase
        .from("posts")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("tipy")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("tweaky")
        .select("slug, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const allItems = [];

    (posts.data || []).forEach((p) => {
      if (p.slug)
        allItems.push({
          url: `${baseUrl}/clanky/${p.slug}`,
          enUrl: `${baseUrl}/en/clanky/${p.slug}`,
          date: p.created_at,
        });
    });

    (tipy.data || []).forEach((t) => {
      if (t.slug)
        allItems.push({
          url: `${baseUrl}/tipy/${t.slug}`,
          enUrl: `${baseUrl}/en/tipy/${t.slug}`,
          date: t.created_at,
        });
    });

    (tweaky.data || []).forEach((tw) => {
      if (tw.slug)
        allItems.push({
          url: `${baseUrl}/tweaky/${tw.slug}`,
          enUrl: `${baseUrl}/en/tweaky/${tw.slug}`,
          date: tw.created_at,
        });
    });

    allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    const latestItems = allItems.slice(0, 25);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset 
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    latestItems.forEach((item) => {
      const dateStr = item.date
        ? new Date(item.date).toISOString()
        : new Date().toISOString();

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXmlUrl(item.url)}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="cs" href="${escapeXmlUrl(
        item.url
      )}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXmlUrl(
        item.enUrl
      )}" />\n`;
      xml += `  </url>\n`;

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXmlUrl(item.enUrl)}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="cs" href="${escapeXmlUrl(
        item.url
      )}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXmlUrl(
        item.enUrl
      )}" />\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("GURU LATEST SITEMAP ERROR:", error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
