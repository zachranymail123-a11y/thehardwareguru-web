export async function GET() {

const sitemap = encodeURIComponent(
"https://thehardwareguru.cz/sitemap-index.xml"
);

await fetch(`https://www.google.com/ping?sitemap=${sitemap}`);

return new Response("Ping sent", { status: 200 });

}
