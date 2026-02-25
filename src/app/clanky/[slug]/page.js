import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  // Ošetření názvu, odstranění .html
  const cleanSlug = slug.replace('.html', '').trim();

  // DEBUG: Zjistíme, jestli server vůbec vidí tvoje klíče (nevypisujeme je, jen ANO/NE)
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const keyEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const hasUrl = !!urlEnv;
  const hasKey = !!keyEnv;
  // Kontrola, jestli klíč náhodou nezačíná na "sb_publishable" (to by byla chyba)
  const isPublicKey = keyEnv?.startsWith('sb_publishable');

  try {
    if (!hasUrl || !hasKey) {
      throw new Error('Chybí Environment Variables ve Vercelu!');
    }

    const supabase = createClient(urlEnv, keyEnv);

    // Zkusíme stáhnout článek
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    // 1. CHYBA DATABÁZE (Supabase odmítl přístup nebo nenašel tabulku)
    if (error) {
      return (
        <div style={{ padding: '50px', color: 'red', background: 'black', fontFamily: 'monospace', height: '100vh' }}>
          <h1 style={{borderBottom: '1px solid red'}}>CHYBA DATABÁZE (SUPABASE)</h1>
          <p><strong>Slug z URL:</strong> {cleanSlug}</p>
          <p><strong>Status Code:</strong> {error.code}</p>
          <p><strong>Zpráva:</strong> {error.message}</p>
          <p><strong>Detaily:</strong> {error.details || 'Žádné detaily'}</p>
          <hr style={{borderColor: '#333'}}/>
          <h3>Diagnostika klíčů:</h3>
          <p>Vidím URL? {hasUrl ? 'ANO ✅' : 'NE ❌'}</p>
          <p>Vidím SERVICE KEY? {hasKey ? 'ANO ✅' : 'NE ❌'}</p>
          <p>Je klíč omylem veřejný (sb_publishable)? {isPublicKey ? 'ANO (TO JE ŠPATNĚ!) ❌' : 'NE (Vypadá ok) ✅'}</p>
        </div>
      );
    }

    // 2. ČLÁNEK NENÍ V DATABÁZI (Vše funguje, ale obsah chybí)
    if (!post) {
      return (
        <div style={{ padding: '50px', color: 'yellow', background: 'black', fontFamily: 'monospace', height: '100vh' }}>
          <h1 style={{color: 'yellow'}}>ČLÁNEK NENALEZEN (404)</h1>
          <p>Připojení k DB funguje, ale nenašel jsem řádek, kde <strong>slug</strong> = <code>{cleanSlug}</code></p>
          <p>Jdi do Supabase a zkontroluj sloupec 'slug' v tabulce 'posts'.</p>
        </div>
      );
    }

    // 3. VŠE OK - VYKRESLÍ SE ČLÁNEK
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <header style={{ padding: '20px', borderBottom: '2px solid #ff0000', textAlign: 'center' }}>
          <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>← ZPĚT NA WEB</a>
          <h1 style={{ fontSize: '2rem', marginTop: '20px' }}>{post.title}</h1>
        </header>
        <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.8' }}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </main>
      </div>
    );

  } catch (err) {
    // 4. KRITICKÁ CHYBA KÓDU
    return (
      <div style={{ padding: '50px', color: 'white', background: 'darkred', fontFamily: 'monospace', height: '100vh' }}>
        <h1>KRITICKÁ CHYBA APLIKACE</h1>
        <p><strong>Error:</strong> {err.message}</p>
        <p>Zkontroluj nastavení Environment Variables ve Vercelu.</p>
      </div>
    );
  }
}
