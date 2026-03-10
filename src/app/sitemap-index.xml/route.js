export const revalidate = 3600;

export async function GET() {

const base = "https://thehardwareguru.cz";

const maps = [
"sitemap-pages.xml",
"sitemap-posts.xml",
"sitemap-tipy.xml",
"sitemap-tweaky.xml",
"sitemap-rady.xml",
"sitemap-slovnik.xml",
"sitemap-gpus.xml",
"sitemap-gpu-recommend.xml",
"sitemap-upgrades.xml",
"sitemap-gpu-duels.xml",
"sitemap-cpu-duels.xml",
"sitemap-benchmarks.xml",
"sitemap-duel-benchmarks.xml",
"sitemap-gpu-fps.xml",
"sitemap-best-gpu.xml",
"sitemap-calendar.xml",
"sitemap-builds.xml"
];

const urls = maps
.map(m => `<sitemap><loc>${base}/${m}</loc></sitemap>`)
.join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</sitemapindex>`;

return new Response(xml, {
headers: {
"Content-Type": "application/xml; charset=utf-8",
"Cache-Control": "public, s-maxage=3600, stale-while-revalidate"
}
});

}
