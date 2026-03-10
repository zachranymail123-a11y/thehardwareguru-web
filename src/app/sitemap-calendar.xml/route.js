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
.select("name");

if(error){
console.error("CALENDAR SITEMAP ERROR:", error);
}

let urls = "";

data?.forEach(game => {

if(!game.name) return;

const slug = game.name
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9]+/g,"-")
.replace(/^-|-$/g,"");

urls += `
<url>
<loc>${base}/kalendar/${slug}</loc>
</url>`;

});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{
headers:{
"Content-Type":"application/xml"
}
});

}
