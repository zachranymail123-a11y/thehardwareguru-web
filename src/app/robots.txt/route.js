export function GET(){

const base="https://thehardwareguru.cz";

const txt=`
User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`;

return new Response(txt,{headers:{'Content-Type':'text/plain'}});
}
