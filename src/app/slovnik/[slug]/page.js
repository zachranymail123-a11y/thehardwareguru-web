import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlovnikPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Pokus o načtení dat
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
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', textAlign: 'center' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase' }}>ZPĚT NA HLAVNÍ WEB</Link>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
                GURU HARDWARE <span style={{ color: '#66fcf1' }}>SLOVNÍK</span>
            </h1>
            <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #66fcf1', display: 'inline-block', padding: '2px 10px', borderRadius: '20px' }}>
                REŽIM: DYNAMICKÁ DATABÁZE
            </div>
        </div>

        {/* LADĚNÍ CHYB */}
        {error && (
          <div style={{ background: 'rgba(255,0,0,0.2)', padding: '20px', border: '1px solid red', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#ff4444' }}>Chyba při spojení se Supabase:</h2>
            <p>{error.message}</p>
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
                  {pojem.description}
                </p>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#45a29e' }}>
                {!error && "Databáze je prázdná nebo se tabulka nejmenuje 'slovnik'. 🛠️"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
