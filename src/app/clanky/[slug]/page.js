import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClanekPage(props) {
  // Bezpečné načtení parametrů (funguje pro starý i nový Next.js)
  const params = await props.params; 
  const { slug } = params;

  // 1. Očistíme slug od bordelu
  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-'); // sjednotí dvojité pomlčky
  cleanSlug = cleanSlug.replace(/^-|-$/g, ''); // ořízne pomlčky na krajích

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Najdeme článek
    let { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    // 3. Pokud nenajdeme přesně, zkusíme najít podobný (ZÁCHRANA)
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

    // 4. Pokud se ani tak nenašel, ukážeme černou chybu (žádná bílá smrt)
    if (!post || error) {
      return (
        <div style={{ padding: '50px', background: '#000', color: 'red', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1>⚠️ ČLÁNEK NENALEZEN</h1>
          <p>Hledaný slug: <strong>{cleanSlug}</strong></p>
          <a href="/" style={{color:'white', textDecoration:'underline', marginTop:'20px', display:'block'}}>ZPĚT NA HOME</a>
        </div>
      );
    }

    // 5. VYKRESLENÍ (S ODKAZY NA SÍTĚ)
    return (
      <div style={{ backgroundColor: '#000', color: '#ccc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* Lišta nahoře */}
        <header style={{ padding: '20px', borderBottom: '1px solid #333', background: '#050505', textAlign: 'center' }}>
            <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
              ← ZPĚT NA HLAVNÍ STRÁNKU
            </a>
        </header>

        <main style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
          
          {/* Nadpis */}
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '20px' }}>
            {post.title}
          </h1>

          {/* ODKAZY NA SÍTĚ (PŘÍMO V KÓDU) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
            <a href="
