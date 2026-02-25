import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage(props) {
  // Tady je ta změna - musíme počkat na parametry
  const params = await props.params;
  const { slug } = params;

  // Ošetření slugu
  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-'); 

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

    // Pokud nenajde přesně, zkusí najít podobný
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

    if (!post || error) {
      return (
        <div style={{ padding: '50px', background: '#000', color: 'red', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1>⚠️ ČLÁNEK NENALEZEN</h1>
          <p>Hledám slug: <strong>{cleanSlug}</strong></p>
          <a href="/" style={{color:'white'}}>ZPĚT NA HOME</a>
        </div>
      );
    }

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
    return (
      <div style={{ padding: '50px', background: '#300', color: '#fff' }}>
        <h1>KRITICKÁ CHYBA</h1>
        <p>{err.message}</p>
      </div>
    );
  }
}
