import { createClient } from '@supabase/supabase-js';

export const revalidate=3600;

export async function GET(){

const supabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

const base="https://thehardwareguru.cz";

const {data}=await supabase
.from("gpu_upgrades")
.select("slug, slug_en");

let urls="";

data?.forEach(u=>{

urls+=`<url><loc>${base}/gpu-upgrade/${u.slug}</loc></url>`;

const en=u.slug_en||`en-${u.slug}`;

urls+=`<url><loc>${base}/en/gpu-upgrade/${en}</loc></url>`;

});

const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{headers:{'Content-Type':'application/xml'}});
}
