import { createClient } from '@supabase/supabase-js';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 86400;

export async function GET(){

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const base = "https://thehardwareguru.cz";

const { data, error } = await supabase
.from("herni_kalendar")
.select("name")
.not("name","is",null);

if(error){
console.error("CALENDAR SITEMAP ERROR:", error);
return new Response("Supabase error",{ status:500 });
}

let urls = "";

data.forEach(game => {

const slug = game.name
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9]+/g,"-")
.replace(/^-|-$/g,"");

urls += `<url>
<loc>${base}/kalendar/${slug}</loc>
</url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{
headers:{
"Content-Type":"text/xml; charset=utf-8"
}
});

}
