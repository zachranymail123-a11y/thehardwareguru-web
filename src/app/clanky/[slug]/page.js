import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Page(props) {
  // 1. Ošetření parametrů pro nový Next.js (tohle opravuje bílou chybu)
  const params = await props.params;
  const { slug } = params;

  // 2. Čištění slugu (vyhodí .html, sjednotí pomlčky)
  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-');
  cleanSlug = cleanSlug.replace(/^-+|-+$/g, '');

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Hledání článku
    let { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    // 4. Fallback: Pokud nenajde přesně, zkusí najít podle části názvu
    if (!post) {
       const parts = cleanSlug.split('-');
       // Pokud je název dost dlouhý, zkusíme první 3 slova
       if (parts.length >= 3) {
         const shortSlug = parts.slice(0, 3).join('-');
         const { data: fallback } = await supabase
           .from('posts')
           .select('*')
           .ilike('slug', `%${shortSlug}%`)
           .limit(1)
           .single();
         if (fallback) post = fallback;
       }
    }

    // 5. Pokud se ani tak nenašel, zobrazíme černou chybu (místo pádu aplikace)
    if (!post || error) {
      return (
        <div style={{ padding: '50px', background: '#000', color: 'red', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1>⚠️ ČLÁNEK NENALEZEN</h1>
          <p>Hledaný slug: <strong>{cleanSlug}</strong></p>
          <hr style={{ borderColor: '#333' }} />
          <p>Systém nenašel článek v databázi.</p>
          <a href="/" style={{color:'white', textDecoration:'underline', marginTop:'20px', display:'block'}}>ZPĚT NA HOME</a>
        </div>
      );
    }

    // 6. ÚSPĚCH - VYKRESLENÍ STRÁNKY
    return (
      <div style={{ backgroundColor: '#000', color: '#ccc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* Horní lišta */}
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

          {/* ODKAZY NA SÍTĚ - TVŮJ POŽADAVEK */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" 
               style={{ flex: '1', textAlign: 'center', background: '#05ff5b', color: '#000', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
               KICK
            </a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" 
               style={{ flex: '1', textAlign: 'center', background: '#ff0000', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
               YOUTUBE
            </a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" 
               style={{ flex: '1', textAlign: 'center', background: '#5865F2', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
               DISCORD
            </a>
            <a href="https://www.instagram.com/thehardwareguru_czech/" target="_blank" 
               style={{ flex: '1', textAlign: 'center', background: '#E1306C', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', minWidth: '120px' }}>
               INSTAGRAM
            </a>
          </div>

          {/* Obsah článku */}
          <div 
            style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#ddd' }} 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

        </main>
      </div>
    );

  } catch (err) {
    // Kritická chyba kódu (záchranná brzda)
    return (
      <div style={{ padding: '50px', background: '#300', color: '#fff' }}>
        <h1>KRITICKÁ CHYBA</h1>
        <p>{err.message}</p>
      </div>
    );
  }
}
