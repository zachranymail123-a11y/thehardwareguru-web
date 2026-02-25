import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// TOTO JE KLÍČOVÉ: Vypne cache pro detail článku, takže se změny projeví hned
export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }) {
  const { slug } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Najdeme článek podle slugu
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) {
    return (
      <div style={{ color: '#fff', padding: '50px', textAlign: 'center', background: '#0b0c10', minHeight: '100vh' }}>
        <h1>Článek nenalezen 😕</h1>
        <Link href="/" style={{ color: '#66fcf1' }}>Zpět na hlavní stránku</Link>
      </div>
    );
  }

  // Funkce pro získání náhledovky
  const thumbnail = post.video_id 
    ? `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`
    : '/placeholder.jpg';

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid #1f2833', background: '#0b0c10' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#66fcf1', textDecoration: 'none' }}>
          ← ZPĚT NA WEB
        </Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* TITULEK */}
        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '20px', lineHeight: '1.2' }}>
          {post.title}
        </h1>

        {/* INFO */}
        <div style={{ color: '#45a29e', marginBottom: '30px', fontSize: '0.9rem' }}>
          Publikováno: {new Date(post.created_at).toLocaleDateString('cs-CZ')}
        </div>

        {/* VIDEO */}
        {post.video_id && (
          <div style={{ marginBottom: '40px', borderRadius: '15px', overflow: 'hidden', border: '1px solid #45a29e' }}>
            <iframe
              width="100%"
              height="450"
              src={`https://www.youtube.com/embed/${post.video_id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* TEXT ČLÁNKU (ZDE SE VYPISUJE TO HTML Z DATABÁZE) */}
        <div 
          style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#e0e0e0' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </main>
    </div>
  );
}
