import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  
  // Ošetření slugu - nahradí vše divné pomlčkami
  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-'); // sjednotí pomlčky
  
  // Záchytná síť proti pádům
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    // Pokud nenajde přesně, zkusí najít "přibližně" (např. když chybí písmeno)
    if (!post) {
       const shortSlug = cleanSlug.split('-').slice(0, 3).join('-');
       if (shortSlug.length > 5) {
         const { data: fallback } = await supabase
           .from('posts')
           .select('*')
           .ilike('slug', `%${shortSlug}%`)
           .limit(1)
           .single();
         if (fallback) post = fallback;
       }
    }

    // Vykreslení vlastní chybové stránky místo pádu aplikace
    if (!post || error) {
      return (
        <div style={{ padding: '50px', background: '#000', color: 'red', fontFamily: 'monospace', height: '100vh' }}>
          <h1>⚠️ OMLOUVÁME SE, ČLÁNEK NENALEZEN</h1>
          <p>Systém nenašel článek pro adresu: <br/><strong style={{color:'white'}}>{cleanSlug}</strong></p>
          <hr style={{borderColor:'#333', margin:'20px 0'}}/>
          <p style={{color:'gray'}}>Technické info: {error ? error.message : 'Post is null'}</p>
          <a href="/" style={{color:'white', textDecoration:'underline'}}>ZPĚT NA HLAVNÍ STRÁNKU</a>
        </div>
      );
    }

    // ÚSPĚCH - VYKRESLENÍ ČLÁNKU
    return (
      <div style={{ backgroundColor: '#000', color: '#ccc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <header style={{ padding: '20px', borderBottom: '1px solid #333', textAlign: 'center' }}>
          <a href="/" style={{ color: '#ff0000', fontWeight: 'bold' }}>← ZPĚT NA HOME</a>
        </header>
        <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px' }}>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ lineHeight: '1.8' }} />
        </main>
      </div>
    );

  } catch (err) {
    // Pokud se stane cokoliv strašného, zobrazíme to, ale nepadneme
    return (
      <div style={{ padding: '50px', background: '#300', color: '#fff' }}>
        <h1>KRITICKÁ CHYBA</h1>
        <p>{err.message}</p>
      </div>
    );
  }
}
