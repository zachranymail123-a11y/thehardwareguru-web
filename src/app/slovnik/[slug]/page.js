import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vynutíme čerstvá data při každém načtení
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlovnikPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Načtení dat
  const { data: pojmy, error } = await supabase
    .from('slovnik')
    .select('*')
    .order('title', { ascending: true });

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
        .term-card { 
          background: rgba(31, 40, 51, 0.6); 
          border: 1px solid #45a29e; 
          padding: 25px; 
          border-radius: 12px; 
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .term-card:hover { 
          border-color: #66fcf1; 
          box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); 
          transform: translateY(-5px);
          background: rgba(31, 40, 51, 0.8);
        }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1' }}> THE HARDWARE GURU </Link>
        <Link href="/" className="nav-link">ZPĚT NA WEB</Link>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                GURU HARDWARE <span style={{ color: '#66fcf1' }}>SLOVNÍK</span>
            </h1>
            <p style={{ color: '#45a29e', fontSize: '1.1rem' }}> 🛠️ Dynamický seznam pojmů z tvojí databáze. </p>
        </div>

        {/* CHYBOVÁ HLÁŠKA PRO LADĚNÍ */}
        {error && (
          <div style={{ color: '#ff4444', textAlign: 'center', padding: '20px', border: '1px solid #ff4444', borderRadius: '10px', marginBottom: '20px' }}>
            <strong>Chyba databáze:</strong> {error.message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {pojmy && pojmy.length > 0 ? (
            pojmy.map((pojem) => (
              <Link key={pojem.id} href={`/slovnik/${pojem.slug}`} className="term-card">
                <h2 style={{ color: '#66fcf1', margin: '0 0 15px 0', fontSize: '1.3rem', textTransform: 'uppercase', fontWeight: '800' }}>
                  {pojem.title}
                </h2>
                <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  {pojem.description.length > 160 ? pojem.description.substring(0, 160) + '...' : pojem.description}
                </p>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#45a29e' }}>
                {!error && "V databázi nebyly nalezeny žádné pojmy. Zkontroluj tabulku 'slovnik'."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
