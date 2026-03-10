import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET(){

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const base = "https://thehardwareguru.cz";

const { data, error } = await supabase
.from("herni_kalendar")
.select("*");

if(error){
console.error("SITEMAP CALENDAR ERROR:", error);
}

let urls = "";

if(Array.isArray(data)){
data.forEach(row => {

const slug =
row.slug ||
row.slug_cz ||
row.slug_en ||
row.game_slug ||
row.url_slug;

if(!slug) return;

urls += `<url>
<loc>${base}/kalendar/${slug}</loc>
</url>`;

});
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{
headers:{
"Content-Type":"application/xml; charset=utf-8"
}
});

}
