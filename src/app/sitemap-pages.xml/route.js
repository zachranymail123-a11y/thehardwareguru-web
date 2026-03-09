export async function GET() {

  const baseUrl = "https://thehardwareguru.cz";
  const now = new Date().toISOString();

  const pages = [
    "/",
    "/clanky",
    "/tipy",
    "/tweaky",
    "/rady",
    "/slovnik",
    "/deals",
    "/gpuvs",
    "/gpuvs/ranking",
    "/cpuvs",
    "/support",
    "/sin-slavy"
  ];

  const urls = [];

  pages.forEach((page) => {

    urls.push(`
<url>
<loc>${baseUrl}${page}</loc>
<lastmod>${now}</lastmod>
<priority>0.9</priority>
</url>`);

    urls.push(`
<url>
<loc>${baseUrl}/en${page}</loc>
<lastmod>${now}</lastmod>
<priority>0.8</priority>
</url>`);

  });

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
