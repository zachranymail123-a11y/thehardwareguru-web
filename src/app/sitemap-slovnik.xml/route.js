import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export async function GET() {

const supabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

const base="https://thehardwareguru.cz";

const {data}=await supabase
.from("slovnik")
.select("slug, slug_en");

let urls="";

data?.forEach(s=>{

urls+=`<url><loc>${base}/slovnik/${s.slug}</loc></url>`;

if(s.slug_en){
urls+=`<url><loc>${base}/en/slovnik/${s.slug_en}</loc></url>`;
}

});

const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{headers:{'Content-Type':'application/xml'}});
}
