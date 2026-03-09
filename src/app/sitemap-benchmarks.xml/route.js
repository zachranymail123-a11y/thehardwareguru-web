import { createClient } from '@supabase/supabase-js';

export async function GET() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const baseUrl = "https://thehardwareguru.cz";
  const now = new Date().toISOString();

  const games = [
    "cyberpunk-2077",
    "warzone",
    "starfield",
    "fortnite",
    "cs2",
    "gta-5",
    "witcher-3",
    "red-dead-redemption-2",
    "baldurs-gate-3",
    "hogwarts-legacy",
    "forza-horizon-5",
    "call-of-duty-mw3",
    "elden-ring",
    "apex-legends",
    "valorant",
    "minecraft",
    "helldivers-2",
    "escape-from-tarkov",
    "overwatch-2",
    "diablo-4"
  ];

  const resolutions = ["1080p","1440p","4k"];
  const modes = ["dlss","ray-tracing","ultra","high"];

  const { data: gpus } = await supabase
    .from("gpus")
    .select("slug");

  const urls = [];

  if (gpus) {

    gpus.forEach((gpu) => {

      if (!gpu.slug) return;

      games.forEach((game) => {

        resolutions.forEach((res) => {

          urls.push(`
<url>
<loc>${baseUrl}/gpu-performance/${gpu.slug}/${game}/${res}</loc>
<lastmod>${now}</lastmod>
<priority>0.7</priority>
</url>`);

          urls.push(`
<url>
<loc>${baseUrl}/en/gpu-performance/${gpu.slug}/${game}/${res}</loc>
<lastmod>${now}</lastmod>
<priority>0.6</priority>
</url>`);

        });

        modes.forEach((mode) => {

          urls.push(`
<url>
<loc>${baseUrl}/gpu-performance/${gpu.slug}/${game}/${mode}</loc>
<lastmod>${now}</lastmod>
<priority>0.7</priority>
</url>`);

          urls.push(`
<url>
<loc>${baseUrl}/en/gpu-performance/${gpu.slug}/${game}/${mode}</loc>
<lastmod>${now}</lastmod>
<priority>0.6</priority>
</url>`);

        });

      });

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
