import { createClient } from '@supabase/supabase-js';

// TOTO JE DŮLEŽITÉ: Vypne cache na straně Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme posledních 20 článků
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Sestavíme XML položky
  const itemsXml = posts.map((post) => {
    // URL článku
    const postUrl = `https://thehardwareguru.cz/clanky/${post.slug}`;
    // Popis (zkrácený obsah, odstraněné HTML značky)
    const description = (post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 300) + '...';
    
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
    </item>`;
  }).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>The Hardware Guru</title>
    <link>https://thehardwareguru.cz</link>
    <description>Novinky ze světa hardwaru, videa a recenze.</description>
    <language>cs</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'text/xml',
      // TOTO JE TA OPRAVA: Říkáme prohlížeči i serveru "Nic neukládej, vždy stahuj čerstvé!"
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}
