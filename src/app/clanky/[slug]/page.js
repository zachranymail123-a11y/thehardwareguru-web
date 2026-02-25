import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  
  // Ošetření slugů z URL adresy
  const cleanSlug = slug.replace('.html', '').trim();
  
  // Zkusí oba názvy proměnných, které tam možná máš
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  if (!post || error) {
    return notFound();
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '20px', borderBottom: '2px solid #ff0000', textAlign: 'center' }}>
        <a href="/" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>← ZPĚT NA WEB</a>
        <h1 style={{ fontSize: '2rem', marginTop: '20px' }}>{post.title}</h1>
      </header>
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.8' }}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </div>
  );
}
