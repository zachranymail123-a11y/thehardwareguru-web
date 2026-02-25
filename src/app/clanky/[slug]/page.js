import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single();

  if (!post) {
    return { title: 'Článek nenalezen | The Hardware Guru' };
  }

  const imageUrl = post.video_id 
    ? `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`
    : 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';

  const plainText = (post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

  return {
    title: `${post.title} | The Hardware Guru`,
    description: plainText,
    openGraph: {
      title: post.title,
      description: plainText,
      images: [{ url: imageUrl }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: plainText,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Započítání návštěvy
  await supabase.rpc('increment_total_visits');

  const [{ data: post }, { data: stats }] = await Promise.all([
    supabase.from('posts').select('*').eq('slug', slug).single(),
    supabase.from('stats').select('value').eq('name', 'total_visits').single()
  ]);

  const celkemNavstev = stats?.value || 0;

  if (!post) {
    return (
      <div style={{ color: '#fff', padding: '50px', textAlign: 'center', background: '#0b0c10', minHeight: '100vh' }}>
        <h1>Článek nenalezen 😕</h1>
        <Link href="/" style={{ color: '#66fcf1' }}>Zpět na hlavní stránku</Link>
      </div>
    );
  }

  return (
    // ZMĚNA POZADÍ - IMGUR ODKAZ
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.imgur.com/VR3903p.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      
      <style>{`
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; margin-right: 10px; margin-bottom: 10px; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .article-content a { color: #66fcf1; }
        .article-content h2 { color: #fff; margin-top: 30px; border-bottom: 1px solid #45a29e; padding-bottom: 10px; }
        .article-content ul { background: rgba(31, 40, 51, 0.8); padding: 20px 40px; border-radius: 10px; border-left: 4px solid #66fcf1; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
            THE HARDWARE GURU
            </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="nav-link" style={{color: '#66fcf1'}}>zpět na web</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="nav-link">INSTAGRAM</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', fontSize: '2.8rem', marginBottom: '20px', lineHeight: '1.2', fontWeight: '900', textShadow: '0 0 10px rgba(102, 252, 241, 0.3)' }}>
          {post.title}
        </h1>

        <div style={{ color: '#45a29e', marginBottom: '40px', fontSize: '1rem', borderBottom: '1px solid #1f2833', paddingBottom: '20px' }}>
          Publikováno: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
        </div>

        {post.video_id && (
          <div style={{ marginBottom: '50px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #45a29e', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${post.video_id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Text článku s podkladem pro čitelnost */}
        <div 
          className="article-content"
          style={{ 
              lineHeight: '1.8', 
              fontSize: '1.15rem', 
              color: '#e0e0e0', 
              marginBottom: '80px',
              background: 'rgba(11, 12, 16, 0.7)', // Poloprůhledný podklad pod textem
              padding: '20px',
              borderRadius: '15px'
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div style={{ padding: '40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95), rgba(11, 12, 16, 0.95))', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '150px', height: '150px', background: '#0b0c10', borderRadius: '50%', border: '3px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <span style={{color: '#45a29e', fontSize: '3rem', fontWeight: 'bold'}}>HG</span>
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ color: '#66fcf1', fontSize: '1.8rem', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>
                    THE HARDWARE GURU
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px', color: '#c5c6c7' }}>
                    Líbil se ti článek? Jsem 45letý HW nadšenec a streamer. 
                    Nezapomeň, že na mém <strong>KICK streamu</strong> běží unikátní AI, která reaguje na chat. 
                </p>
                <div>
                    <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn">SLEDOVAT NA KICKU</a>
                    <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn">PŘIPOJIT SE NA DISCORD</a>
                </div>
            </div>
        </div>
      </main>

      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
            <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="nav-link">INSTAGRAM</a>
          </div>

          <div style={{ marginBottom: '20px', color: '#66fcf1', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
             WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #45a29e' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>

          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
