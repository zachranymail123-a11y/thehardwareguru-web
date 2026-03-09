import { createClient } from '@supabase/supabase-js';

export async function GET() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const baseUrl = "https://thehardwareguru.cz";
  const now = new Date().toISOString();

  const { data: gpus } = await supabase
    .from("gpus")
    .select("slug");

  const urls = [];

  if (gpus) {

    gpus.forEach((gpu) => {

      if (!gpu.slug) return;

      urls.push(`
<url>
<loc>${baseUrl}/gpu/${gpu.slug}</loc>
<lastmod>${now}</lastmod>
<priority>0.8</priority>
</url>`);

      urls.push(`
<url>
<loc>${baseUrl}/en/gpu/${gpu.slug}</loc>
<lastmod>${now}</lastmod>
<priority>0.7</priority>
</url>`);

    });

  }

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(xml,{
    headers:{
      "Content-Type":"application/xml"
    }
  });

}
