import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vynutí aktualizaci dat při každém načtení
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Načteme články i reporty najednou
  const [postsResponse, reportsResponse] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  const posts = postsResponse.data;
  const reports = reportsResponse.data;

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* TVŮJ DESIGN HEADERU */}
      <header style={{ textAlign: 'center', padding: '40px 20px 20px 20px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>THE HARDWARE GURU</h1>
        <p style={{ fontSize: '1.1rem', color: '#333', margin: '10px 0 20px 0' }}>Servis, technika a automatické AI reporty</p>
        <div style={{ height: '5px', backgroundColor: '#ff0000', width: '100%', maxWidth: '800px', margin: '0 auto' }}></div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {/* SEKCE ČLÁNKŮ */}
        <section>
          <h2 style={{ color: '#ff0000', fontSize: '1.8rem', marginBottom: '25px' }}>Nejnovější články</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {posts?.map((post) => (
              <div key={post.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{post.title}</h3>
                <Link href={`/clanky/${post.slug}`} style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Číst článek →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SEKCE REPORTŮ - Tady jsou ty nové věci */}
        <section style={{ marginTop: '50px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
          <h2 style={{ color: '#ff0000', fontSize: '1.8rem', marginBottom: '20px' }}>AI Technické Reporty</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {reports?.map((report) => (
              <Link href="/reports" key={report.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '15px', borderLeft: '4px solid #ff0000', backgroundColor: '#fff', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{report.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Klikni pro zobrazení detailu</span>
                </div>
              </Link>
            ))}
            <Link href="/reports" style={{ textAlign: 'center', display: 'block', marginTop: '10px', color: '#ff0000', fontWeight: 'bold' }}>
              Zobrazit všechny reporty →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
