import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// --- TATO FUNKCE GENERUJE DATA PRO GOOGLE ---
export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('slug', slug.replace('.html', ''))
    .single();

  if (!post) return { title: 'Článek nenalezen | TheHardwareGuru' };

  // Vyčistíme text od HTML značek pro popisek (description)
  const cleanDescription = post.content
    ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
    : 'Hardware, gaming a streamy od TheHardwareGuru_Czech.';

  return {
    title: `${post.title} | TheHardwareGuru`,
    description: cleanDescription,
    openGraph: {
      title: post.title,
      description: cleanDescription,
      url: `https://www.thehardwareguru.cz/clanky/${slug}`,
      type: 'article',
      // Tady by mohl být i odkaz na obrázek náhledu (thumbnail)
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanDescription,
    },
  };
}

// --- SAMOTNÁ STRÁNKA ČLÁNKU ---
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

  const getYouTubeId = (content) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = content?.match(regex);
    return match ? match[1] : null;
  };

  if (!post || error) {
    return <div style={{background: '#0b0c10', color: '#66fcf1', padding: '50px', height: '100vh'}}>⚠️ Článek nenalezen.</div>;
  }

  const videoId = post.video_id || getYouTubeId(post.content);

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid #1f2833', background: '#0b0c10' }}>
        <a href="/" style={{ color: '#66fcf1', textDecoration: 'none', fontWeight: '900', fontSize: '1.4rem' }}>
          THE HARDWARE GURU
        </a>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: '900', marginBottom: '10px', lineHeight: '1.1' }}>
          {post.title}
        </h1>
        
        <div style={{ color: '#45a29e', marginBottom: '30px', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Publikováno: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
        </div>

        {videoId && (
          <div style={{ marginBottom: '40px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #66fcf1' }}>
            <iframe
              width="100%"
              height="560"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div 
          style={{ lineHeight: '1.9', fontSize: '1.2rem', color: '#ddd', marginBottom: '60px' }} 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* SEKCE O MNĚ */}
        <section style={{ background: '#1f2833', padding: '40px', borderRadius: '24px', border: '1px solid #66fcf1', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#0b0c10', border: '4px solid #66fcf1', backgroundImage: 'url("https://github.com/shadcn.png")', backgroundSize: 'cover' }}></div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: '#66fcf1', fontSize: '2rem', marginBottom: '15px' }}>TheHardwareGuru</h2>
            <p style={{ lineHeight: '1.7', fontSize: '1.1rem', color: '#fff' }}>
              45letý chill gamer, ministreamer a HW nadšenec. Moje unikátní AI v chatu komunikuje jako divák – to v CZ/SK jinde neuvidíš!
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '25px' }}>
              <a href="https://kick.com/thehardwareguru" target="_blank" style={{ color: '#53fc18', textDecoration: 'none', fontWeight: '900' }}>● KICK</a>
              <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: '900' }}>● YOUTUBE</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
