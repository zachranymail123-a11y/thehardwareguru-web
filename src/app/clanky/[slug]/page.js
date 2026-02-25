import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Page(props) {
  const params = await props.params;
  const { slug } = params;

  let cleanSlug = slug.replace('.html', '').trim();
  cleanSlug = cleanSlug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  if (!post) {
    const parts = cleanSlug.split('-');
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

  if (!post || error) {
    return (
      <div style={{ padding: '50px', background: '#0b0c10', color: '#66fcf1', minHeight: '100vh' }}>
        <h1>⚠️ ČLÁNEK NENALEZEN</h1>
        <a href="/" style={{color:'#fff'}}>Zpět na hlavní stránku</a>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      
      {/* --- NAVIGACE --- */}
      <nav style={{ padding: '15px 40px', borderBottom: '1px solid #1f2833', background: '#0b0c10' }}>
        <a href="/" style={{ color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '1.2rem' }}>
          ← THEHARDWEREGURU
        </a>
      </nav>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Obsah článku */}
        <article>
          <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: '900', marginBottom: '10px', lineHeight: '1.2' }}>
            {post.title}
          </h1>
          <div style={{ color: '#45a29e', marginBottom: '30px', fontWeight: 'bold' }}>
            PUBLIKOVÁNO: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
          </div>

          <div 
            style={{ lineHeight: '1.8', fontSize: '1.15rem', color: '#ddd' }} 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>

        {/* --- TVŮJ PROFIL (SEKCE O MNĚ) NA KONCI ČLÁNKU --- */}
        <hr style={{ borderColor: '#1f2833', margin: '60px 0' }} />
        
        <section style={{ 
          background: '#1f2833', padding: '30px', borderRadius: '20px', 
          border: '1px solid #66fcf1', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center',
          boxShadow: '0 0 20px rgba(102, 252, 241, 0.05)'
        }}>
          {/* Avatar */}
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', background: '#0b0c10', 
            border: '3px solid #66fcf1', flexShrink: 0, margin: '0 auto',
            backgroundImage: 'url("https://github.com/shadcn.png")', backgroundSize: 'cover'
          }}></div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{ color: '#66fcf1', fontSize: '1.6rem', marginBottom: '10px', textTransform: 'uppercase' }}>
              TheHardwareGuru
            </h2>
            <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#fff', margin: 0 }}>
              Jsem <strong>45letý chill gamer, ministreamer a HW nadšenec</strong>. Na mém streamu najdeš unikátní <strong>umělou inteligenci</strong>, která komunikuje s chatem a komentuje hru – věc, kterou v CZ/SK jinde neuvidíš!
            </p>
            
            {/* Rychlé odkazy pod textem */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>● KICK</a>
              <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>● YOUTUBE</a>
              <a href="https://discord.com/invite/n7xThr8" target="_blank" style={{ color: '#5865F2', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>● DISCORD</a>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
        &copy; {new Date().getFullYear()} TheHardwareGuru
      </footer>
    </div>
  );
}
