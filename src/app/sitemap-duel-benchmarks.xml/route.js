import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export async function GET(){

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const base = "https://thehardwareguru.cz";

const games = [
"cyberpunk-2077",
"warzone",
"starfield",
"fortnite",
"cs2",
"gta-5",
"witcher-3",
"red-dead-redemption-2",
"baldurs-gate-3",
"hogwarts-legacy",
"forza-horizon-5",
"call-of-duty-mw3",
"elden-ring",
"apex-legends",
"valorant",
"minecraft",
"helldivers-2",
"escape-from-tarkov",
"overwatch-2",
"diablo-4"
];

const resolutions = ["1080p","1440p","4k"];

const { data } = await supabase
.from("gpu_duels")
.select("slug");

let urls = "";

data?.forEach(d => {

if(!d.slug) return;

games.forEach(game => {

resolutions.forEach(res => {

urls += `<url>
<loc>${base}/gpuvs/${d.slug}/${game}/${res}</loc>
</url>`;

});

});

});

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
