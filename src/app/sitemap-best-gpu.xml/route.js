export const revalidate=3600;

export async function GET(){

const base="https://thehardwareguru.cz";

const categories=[
"1080p",
"1440p",
"4k",
"budget",
"midrange",
"high-end"
];

let urls="";

categories.forEach(c=>{

urls+=`<url>
<loc>${base}/best-gpu/${c}</loc>
</url>`;

});

const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{headers:{'Content-Type':'application/xml'}});
}
