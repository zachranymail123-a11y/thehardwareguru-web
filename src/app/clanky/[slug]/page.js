import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  const cleanSlug = slug.replace('.html', '').trim();

  // DEBUG: Vypíšeme si, jestli kód vidí proměnné (jen ANO/NE, nevypisujeme klíče)
  const hasUrl = !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Zkusíme stáhnout článek
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    // POKUD NASTANE CHYBA SUPABASE
    if (error) {
      return (
        <div style={{ padding: '50px', color: 'red', background: 'black', fontFamily: 'monospace' }}>
          <h1>CHYBA DATABÁZE (SUPABASE)</h1>
          <p><strong>Slug z URL:</strong> {cleanSlug}</p>
          <p><strong>Status:</strong> {error.code}</p>
          <p><strong>Zpráva:</strong> {error.message}</p>
          <p><strong>Detaily:</strong> {error.details || 'Žádné detaily'}</p>
          <hr />
          <p>Vidím URL v env? {hasUrl ? 'ANO' : 'NE'}</p>
          <p>Vidím Key v env? {hasKey ? 'ANO' : 'NE'}</p>
        </div>
      );
    }

    // POKUD ČLÁNEK NENÍ V DATABÁZI
    if (!post) {
      return (
        <div style={{ padding: '50px', color: 'yellow', background: 'black', fontFamily: 'monospace' }}>
          <h1>ČLÁNEK NENALEZEN (404)</h1>
          <p>V databázi v tabulce 'posts' není žádný řádek, kde by sloupec 'slug' byl: <strong>{cleanSlug}</strong></p>
          <p>Zkontroluj Supabase Table Editor, jak přesně tam ty slugy vypadají.</p>
        </div>
      );
    }

    // POKUD JE VŠE OK, VYKRESLÍ SE ČLÁNEK
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <header style={{ padding: '20px', borderBottom: '2px solid #ff0000' }}>
          <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>← ZPĚT</a>
        </header>
        <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#ff0000' }}>{post.title}</h1>
          <div style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '30px' }} 
               dangerouslySetInnerHTML={{ __html: post.content }} />
        </main>
      </div>
    );

  } catch (err) {
    // POKUD SPADNE SAMOTNÝ KÓD (NEXT.JS ERROR)
    return (
      <div style={{ padding: '50px', color: 'white', background: 'darkred', fontFamily: 'monospace' }}>
        <h1>KRITICKÁ CHYBA KÓDU</h1>
        <p>{err.message}</p>
        <p>{err.stack}</p>
      </div>
    );
  }
}
