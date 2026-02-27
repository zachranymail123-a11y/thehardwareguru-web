import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlovnikPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Stáhneme všechny pojmy seřazené podle abecedy
  const { data: pojmy } = await supabase
    .from('slovnik')
    .select('*')
    .order('title', { ascending: true });

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      <style>{`
        .term-card { 
          background: rgba(31, 40, 51, 0.9); 
          border: 1px solid #45a29e; 
          padding: 20px; 
          border-radius: 10px; 
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .term-card:hover { 
          border-color: #66fcf1; 
          box-shadow: 0 0 15px rgba(102, 252, 241, 0.3); 
          transform: translateY(-3px);
        }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1' }}>
          THE HARDWARE GURU
        </Link>
        <Link href="/" className="nav-link">Zpět na hlavní web</Link>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', fontSize: '3rem', textAlign: 'center', marginBottom: '10px', fontWeight: '900', textShadow: '0 0 10px #66fcf1' }}>
          GURU SLOVNÍK
        </h1>
        <p style={{ textAlign: 'center', color: '#45a29e', marginBottom: '50px', fontSize: '1.2rem' }}>
          Všechny HW a gaming pojmy, kterým jsi doteď nerozuměl, na jednom místě.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {pojmy?.map((pojem) => (
            <Link key={pojem.id} href={`/slovnik/${pojem.slug}`} className="term-card">
              <h2 style={{ color: '#66fcf1', margin: '0 0 10px 0', fontSize: '1.4rem' }}>{pojem.title}</h2>
              <p style={{ color: '#c5c6c7', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {pojem.description.substring(0, 100)}...
              </p>
              <div style={{ marginTop: '15px', color: '#45a29e', fontSize: '0.8rem', fontWeight: 'bold' }}>ZJISTIT VÍCE →</div>
            </Link>
          ))}
        </div>

        {(!pojmy || pojmy.length === 0) && (
          <p style={{ textAlign: 'center', padding: '50px' }}>Slovník se právě krmí daty. Zkus to za chvilku!</p>
        )}
      </main>
    </div>
  );
}
