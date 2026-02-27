import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: term } = await supabase.from('slovnik').select('*').eq('slug', slug).single();
  if (!term) return { title: 'Pojem nenalezen | The Hardware Guru' };
  return { title: `${term.title} – Co to je? | Slovník Guru` };
}

export default async function DictionaryTermPage({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: term } = await supabase.from('slovnik').select('*').eq('slug', slug).single();

  if (!term) {
    return (
      <div style={{ color: '#fff', padding: '100px', textAlign: 'center', background: '#0b0c10', minHeight: '100vh' }}>
        <h1>Pojem ve slovníku neexistuje 🧩</h1>
        <Link href="/slovnik" style={{ color: '#66fcf1' }}>Zpět do slovníku</Link>
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
        backgroundAttachment: 'fixed'
    }}>
      <style>{`
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .back-btn { display: inline-block; margin-bottom: 20px; color: #66fcf1; text-decoration: none; font-weight: bold; }
        .term-container { background: rgba(31, 40, 51, 0.8); border: 1px solid #45a29e; padding: 40px; border-radius: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', textAlign: 'center' }}>
        <Link href="/" className="nav-link">Zpět na hlavní web</Link>
        <Link href="/slovnik" className="nav-link" style={{color: '#66fcf1'}}>Slovník pojmů</Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        <Link href="/slovnik" className="back-btn">← Zpět do seznamu pojmů</Link>
        <div className="term-container">
          <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900' }}>
            {term.title}
          </h1>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#e0e0e0' }}>
            {term.description}
          </div>
        </div>
      </main>
    </div>
  );
}
