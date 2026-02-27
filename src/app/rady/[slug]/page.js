import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: rada } = await supabase.from('rady').select('*').eq('slug', slug).single();
  if (!rada) return { title: 'Návod nenalezen | The Hardware Guru' };
  return { title: `${rada.title} | Praktické rady Guru` };
}

export default async function RadaDetailPage({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: rada } = await supabase.from('rady').select('*').eq('slug', slug).single();

  if (!rada) {
    return (
      <div style={{ color: '#fff', padding: '100px', textAlign: 'center', background: '#0b0c10', minHeight: '100vh' }}>
        <h1>Návod nebyl nalezen 🧩</h1>
        <Link href="/rady" style={{ color: '#66fcf1' }}>Zpět na seznam rad</Link>
      </div>
    );
  }

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.95), rgba(11, 12, 16, 0.9)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .back-btn { display: inline-block; margin-bottom: 20px; color: #66fcf1; text-decoration: none; font-weight: bold; }
        .term-container { background: rgba(31, 40, 51, 0.8); border: 1px solid #45a29e; padding: 40px; border-radius: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .social-btn { padding: 10px 20px; text-decoration: none; font-weight: 900; border-radius: 5px; text-transform: uppercase; transition: transform 0.2s; }
        .social-btn:hover { transform: scale(1.05); }
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', textAlign: 'center' }}>
        <Link href="/" className="nav-link">Zpět na web</Link>
        <Link href="/rady" className="nav-link" style={{color: '#66fcf1'}}>Praktické rady</Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', flex: '1 0 auto', width: '100%' }}>
        <Link href="/rady" className="back-btn">← Zpět na seznam rad</Link>
        <div className="term-container">
          <h1 style={{ color: '#66fcf1', fontSize: '2.2rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900' }}>
            {rada.title}
          </h1>
          <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>
            {rada.description}
          </div>
        </div>
      </main>

      <footer style={{ padding: '40px 20px', background: 'rgba(11, 12, 16, 0.98)', borderTop: '1px solid #45a29e', textAlign: 'center', marginTop: '60px' }}>
        <h2 style={{ color: '#66fcf1', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>O mně</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#53fc18', color: '#000' }}>KICK STREAM</a>
          <a href="https://youtube.com/@thehardwareguru" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#ff0000', color: '#fff' }}>YOUTUBE</a>
          <a href="https://discord.gg/tvoje-id" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>DISCORD</a>
        </div>
      </footer>
    </div>
  );
}
