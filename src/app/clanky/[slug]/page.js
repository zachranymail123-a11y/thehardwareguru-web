import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  
  // Tohle odstraní .html i případné mezery, co by tam dělaly bordel
  const cleanSlug = slug.replace('.html', '').trim();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Hledáme článek - zkusíme ho najít podle slugu
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  if (!post || error) {
    console.error("Clanek nenalezen pro slug:", cleanSlug);
    notFound();
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '20px', borderBottom: '2px solid #ff0000' }}>
        <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>← ZPĚT</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#ff0000' }}>{post.title}</h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '30px' }} 
             dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </div>
  );
}
