export const revalidate = 3600;

export async function GET(){

const base="https://thehardwareguru.cz";

const pages=[
"/",
"/clanky",
"/tipy",
"/tweaky",
"/rady",
"/slovnik",
"/gpuvs",
"/cpuvs",
"/support",
"/sin-slavy",
"/crawl-signal",
"/gpu-index",
"/game-index",
"/hledat",
"/guru-stats",
"/reports",
"/partneri",
"/podminky-uziti",
"/ochrana-soukromi",
"/kalendar",
"/sestavy",
"/ocekavane-hry"
];

let urls="";

pages.forEach(p=>{
urls+=`
<url><loc>${base}${p}</loc></url>
<url><loc>${base}/en${p}</loc></url>`;
});

const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{headers:{'Content-Type':'application/xml'}});
}
