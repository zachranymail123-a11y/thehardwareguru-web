import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vynutí načtení aktuálních dat z DB při každém refreshu
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Načteme 15 nejnovějších věcí z tabulky 'posts' (kam ti sype data cron)
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      
      {/* OPRAVENÉ SOCIÁLNÍ SÍTĚ */}
      <header style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid #ff0000' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>THE HARDWARE GURU</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
          <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" style={{ background: '#ff0000', color: '#fff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>YOUTUBE</a>
          <a href="https://www.instagram.com/thehardwareguru_czech/" target="_blank" style={{ background: '#E1306C', color: '#fff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>INSTAGRAM</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" style={{ background: '#5865F2', color: '#fff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>DISCORD</a>
          <a href="https://kick.com/thehardwareguru" target="_blank" style={{ background: '#05ff5b', color: '#000', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>KICK</a>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#ff0000', textTransform: 'uppercase', marginBottom: '30px' }}>Aktuální streamy a videa</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {posts?.map((post) => (
            <article key={post.id} style={{ background: '#111', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>{post.title}</h3>
              {/* Čistý odkaz bez .html */}
              <Link href={`/clanky/${post.slug.replace('.html', '')}`} style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ZOBRAZIT OBSAH →
              </Link>
            </article>
          ))}
          {(!posts || posts.length === 0) && <p>Zatím tu nic není. Spusť cron pro načtení videí!</p>}
        </div>
      </main>
    </div>
  );
}
