import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClanekPage({ params }) {
  // Tady ošetříme tu koncovku .html, která ti hází 404
  const rawSlug = params.slug;
  const cleanSlug = rawSlug.endsWith('.html') ? rawSlug.replace('.html', '') : rawSlug;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  if (!post || error) {
    notFound();
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ textDecoration: 'none', color: '#ff0000', fontWeight: 'bold' }}>← ZPĚT NA HOME</a>
        <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginTop: '20px' }}>{post.title}</h1>
      </header>
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.8', fontSize: '1.1rem' }}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </div>
  );
}
