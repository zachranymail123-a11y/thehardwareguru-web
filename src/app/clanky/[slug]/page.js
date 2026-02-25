import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Hledáme článek v tabulce 'posts' podle slugu
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  // Pokud článek neexistuje, ukaž 404
  if (!post || error) {
    notFound();
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <a href="/" style={{ textDecoration: 'none', color: '#ff0000', fontWeight: 'bold' }}>← ZPĚT NA HOME</a>
        <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginTop: '20px' }}>{post.title}</h1>
        <div style={{ height: '3px', backgroundColor: '#ff0000', width: '100px', margin: '20px auto' }}></div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.8', fontSize: '1.1rem' }}>
        {/* Vykreslení obsahu článku - počítá s HTML formátem ze Supabase */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </div>
  );
}
