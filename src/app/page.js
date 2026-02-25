import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// DŮLEŽITÉ: Tohle zajistí, že se stránka nebude kešovat a ukáže vždy nové věci
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Načteme klasické články
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Načteme ty tvoje nové AI reporty z YouTube
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <main style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '5px solid #ff0000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>THE HARDWARE GURU</h1>
        <p>Servis, technika a automatické AI reporty</p>
      </header>

      <section>
        <h2 style={{ color: '#ff0000' }}>Nejnovější články</h2>
        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          {posts?.map((post) => (
            <article key={post.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
              {/* Odkaz směřuje na tvou dynamickou trasu /clanky/[slug] */}
              <Link href={`/clanky/${post.slug}`} style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'none' }}>
                Číst článek →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px' }}>
        <h2 style={{ color: '#ff0000' }}>AI Reporty z YouTube</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {reports?.map((report) => (
            <div key={report.id} style={{ padding: '10px', borderLeft: '3px solid #ccc' }}>
              <strong>{report.title}</strong>
              <br />
              <Link href="/reports" style={{ fontSize: '0.8rem', color: '#666' }}>Zobrazit detail v reportech</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
