import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export default async function ClanekPage({ params }) {
  const { slug } = params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Hledáme článek podle slugu v tabulce (např. 'posts')
  const { data: post } = await supabase
    .from('posts') 
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) notFound();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
