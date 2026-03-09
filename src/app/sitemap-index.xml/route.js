export async function GET() {

  const baseUrl = "https://thehardwareguru.cz";

  const sitemaps = [
    `${baseUrl}/sitemap-pages.xml`,
    `${baseUrl}/sitemap-gpus.xml`,
    `${baseUrl}/sitemap-benchmarks.xml`,
    `${baseUrl}/sitemap-duels.xml`,
    `${baseUrl}/sitemap-upgrades.xml`
  ];

  const body =
`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((url)=>`
<sitemap>
<loc>${url}</loc>
</sitemap>`).join("")}
</sitemapindex>`;

  return new Response(body,{
    headers:{
      "Content-Type":"application/xml"
    }
  });

}
