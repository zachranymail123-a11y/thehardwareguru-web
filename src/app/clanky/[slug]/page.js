import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export default async function ClanekPage({ params }) {
  // params.slug je ten název v adrese (např. top-30-zaklinac-3-faktu...)
  const { slug } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Tady hledáme v tabulce (např. 'posts') řádek, kde se slug rovná tomu z adresy
  const { data: post, error } = await supabase
    .from('posts') // Nebo jak se jmenuje tvoje tabulka s články
    .select('*')
    .eq('slug', slug)
    .single();

  // Pokud článek v databázi není, hoď 404
  if (!post || error) {
    notFound();
  }

  return (
    <article style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{post.title}</h1>
      <div 
        style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </article>
  );
}
