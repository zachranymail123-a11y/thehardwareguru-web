import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 86400;

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

const base="https://thehardwareguru.cz";

const games=[
"cyberpunk-2077","warzone","starfield","fortnite","cs2",
"valorant","apex-legends","baldurs-gate-3","hogwarts-legacy",
"alan-wake-2","red-dead-redemption-2","assassins-creed-mirage",
"far-cry-6","forza-horizon-5","f1-23","the-last-of-us-part-1",
"helldivers-2","dragons-dogma-2","kingdom-come-deliverance-2","stalker-2"
];

const resolutions=["1080p","1440p","4k"];

export async function GET(){

const {data,error}=await supabase
.from("gpu_duels")
.select("slug")
.not("slug","is",null)
.order("slug")
.range(0,149);

if(error){
console.error(error);
return new Response("Supabase error",{status:500});
}

let urls="";

data?.forEach(duel=>{

const safeSlug=duel.slug
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;");

games.forEach(game=>{
resolutions.forEach(res=>{
urls+=`<url><loc>${base}/gpuvs/${safeSlug}/${game}/${res}</loc></url>`;
});
});

});

const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

return new Response(xml,{
headers:{ "Content-Type":"text/xml; charset=utf-8" }
});

}
