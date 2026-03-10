import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export async function GET(){

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const base = "https://thehardwareguru.cz";

const { data } = await supabase
.from("builds")
.select("slug");

let urls = "";

data?.forEach(b => {

if(!b.slug) return;

urls += `<url>
<loc>${base}/sestavy/${b.slug}</loc>
</url>`;

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
