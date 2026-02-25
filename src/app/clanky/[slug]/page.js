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

  // Pomocná funkce pro vytažení YouTube ID z textu
  const getYouTubeId = (content) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = content.match(regex);
    return match ? match[1] : null;
  };

  if (!post) {
    return <div style={{background: '#000', color: '#fff', padding: '50px'}}>Článek nenalezen</div>;
  }

  const videoId = getYouTubeId(post.content);

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <nav style={{ padding: '15px 40px', borderBottom: '1px solid #1f2833', background: '#0b0c10' }}>
        <a href="/" style={{ color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '1.2rem' }}>
          ← THEHARDWAREGURU
        </a>
      </nav>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: '900', marginBottom: '10px' }}>
          {post.title}
        </h1>
        
        <div style={{ color: '#45a29e', marginBottom: '30px', fontWeight: 'bold' }}>
          PUBLIKOVÁNO: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
        </div>

        {/* --- PŘEHRÁVAČ VIDEA (TADY JE TO VIDEO) --- */}
        {videoId ? (
          <div style={{ marginBottom: '40px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #66fcf1', boxShadow: '0 0 20px rgba(102, 252, 241, 0.3)' }}>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div style={{ padding: '20px', background: '#1f2833', borderRadius: '10px', marginBottom: '40px', textAlign: 'center' }}>
            <p>Odkaz na video naleznete v textu níže nebo na mém YouTube kanálu.</p>
          </div>
        )}

        {/* Obsah článku */}
        <div 
          style={{ lineHeight: '1.8', fontSize: '1.15rem', color: '#ddd', marginBottom: '60px' }} 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* --- TVŮJ PROFIL (SEKCE O MNĚ) --- */}
        <section style={{ 
          background: '#1f2833', padding: '30px', borderRadius: '20px', 
          border: '1px solid #66fcf1', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#0b0c10', border: '3px solid #66fcf1', flexShrink: 0, backgroundImage: 'url("https://github.com/shadcn.png")', backgroundSize: 'cover' }}></div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{ color: '#66fcf1', fontSize: '1.6rem', marginBottom: '10px' }}>TheHardwareGuru</h2>
            <p style={{ lineHeight: '1.6', color: '#fff' }}>
              Jsem 45letý chill gamer a HW nadšenec. Moje unikátní AI v chatu komunikuje s diváky a glosuje gameplay – to v CZ/SK jinde nezažiješ!
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <a href="https://kick.com/thehardwareguru" style={{ color: '#53fc18', fontWeight: 'bold', textDecoration: 'none' }}>KICK</a>
              <a href="https://www.youtube.com/@TheHardwareGuru_Czech" style={{ color: '#ff0000', fontWeight: 'bold', textDecoration: 'none' }}>YOUTUBE</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
