import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;

  // 1. Zkusíme slug vyčistit (odstranit .html a dvojité pomlčky)
  let cleanSlug = slug.replace('.html', '').trim();
  // Nahradí všechny dvojité a trojité pomlčky jednou
  cleanSlug = cleanSlug.replace(/-+/g, '-'); 
  // Odstraní pomlčky na začátku a na konci
  cleanSlug = cleanSlug.replace(/^-+|-+$/g, '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 2. Hledáme článek
  let { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  // 3. ZÁCHRANA: Pokud ho nenajde přesně, zkusí ho najít "přibližně" (podle části názvu)
  if (!post) {
     const parts = cleanSlug.split('-');
     if (parts.length > 2) {
        // Zkusíme najít článek, který obsahuje první 3 slova ze slugu
        const searchSlug = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const { data: fallbackPost } = await supabase
          .from('posts')
          .select('*')
          .ilike('slug', `%${searchSlug}%`)
          .limit(1)
          .single();
        
        if (fallbackPost) post = fallbackPost;
     }
  }

  // 4. Pokud se ani tak nenašel, vypíšeme "černou" chybu (ne bílou smrt)
  if (!post || error) {
    return (
      <div style={{ padding: '40px', background: '#000', color: '#ff0000', fontFamily: 'monospace', minHeight: '100vh' }}>
        <h1 style={{ borderBottom: '1px solid red', paddingBottom: '10px' }}>⚠️ ČLÁNEK NENALEZEN</h1>
        <p>Hledaný slug: <strong style={{ color: '#fff' }}>{cleanSlug}</strong></p>
        <p>Původní URL: {slug}</p>
        <div style={{ marginTop: '20px', padding: '10px', background: '#111' }}>
           <strong>Tip pro tebe:</strong> V databázi se ten článek asi jmenuje trochu jinak.
           <br/>Zkus se podívat do Supabase do tabulky <em>posts</em> na sloupec <em>slug</em>.
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: '30px', color: '#fff', textDecoration: 'underline' }}>← Zpět na hlavní stránku</a>
      </div>
    );
  }

  // 5. VYKRESLENÍ ČLÁNKU
  return (
    <div style={{ backgroundColor: '#000', color: '#ccc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ padding: '20px', borderBottom: '1px solid #333', background: '#050505' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ← ZPĚT NA HOME
          </a>
        </div>
      </header>

      {/* Obsah */}
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '10px' }}>
          {post.title}
        </h1>
        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          Publikováno: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
        </div>
        
        {/* Samotný text/video */}
        <div 
          style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#ddd' }} 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </main>

    </div>
  );
}
