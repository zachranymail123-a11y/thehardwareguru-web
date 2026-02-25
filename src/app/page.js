import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [postsResponse, reportsResponse] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(4)
  ]);

  const posts = postsResponse.data;
  const reports = reportsResponse.data;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      
      {/* POŘÁDNEJ HEADER S ODKAZY NA STREAMY */}
      <header style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid #ff0000', background: 'linear-gradient(to bottom, #1a1a1a, #000)' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>THE HARDWARE GURU</h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginTop: '10px' }}>GAMING | TECH | AUTOMATION</p>
        
        {/* TVOJE SOCIÁLNÍ SÍTĚ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
          <a href="https://www.youtube.com/@TheHardwareGuru" target="_blank" style={{ background: '#ff0000', color: '#fff', padding: '12px 25px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>YOUTUBE</a>
          <a href="https://kick.com/thehardwareguru" target="_blank" style={{ background: '#05ff5b', color: '#000', padding: '12px 25px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>KICK STREAM</a>
          <a href="https://discord.gg/tvoje-pozvanka" target="_blank" style={{ background: '#5865F2', color: '#fff', padding: '12px 25px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>DISCORD</a>
          <a href="https://instagram.com/thehardwareguru" target="_blank" style={{ background: '#E1306C', color: '#fff', padding: '12px 25px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>INSTAGRAM</a>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        
        {/* LEVÝ SLOUPER: ČLÁNKY */}
        <section>
          <h2 style={{ color: '#ff0000', textTransform: 'uppercase', borderLeft: '5px solid #ff0000', paddingLeft: '15px' }}>Nejnovější články</h2>
          <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
            {posts?.map((post) => (
              <article key={post.id} style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{post.title}</h3>
                <Link href={`/clanky/${post.slug}`} style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>ČÍST ČLÁNEK →</Link>
              </article>
            ))}
          </div>
        </section>

        {/* PRAVÝ SLOUPER: AI REPORTY */}
        <aside>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '20px' }}>AI Tech Reporty</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {reports?.map((report) => (
              <Link href="/reports" key={report.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#222', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff0000' }}>
                  <span style={{ fontSize: '0.9rem', color: '#fff' }}>{report.title}</span>
                </div>
              </Link>
            ))}
            <Link href="/reports" style={{ color: '#666', fontSize: '0.9rem', textAlign: 'right', display: 'block' }}>Všechny reporty</Link>
          </div>
        </aside>

      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#444', borderTop: '1px solid #222' }}>
        &copy; {new Date().getFullYear()} THE HARDWARE GURU | Všechna práva vyhrazena
      </footer>
    </div>
  );
}
