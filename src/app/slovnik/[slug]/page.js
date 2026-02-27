import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Zákaz cachování - Vercel musí pokaždé do DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlovnikPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: pojmy, error } = await supabase
    .from('slovnik')
    .select('*')
    .order('title', { ascending: true });

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c10', color: '#c5c6c7', fontFamily: 'sans-serif', padding: '40px' }}>
      
      {/* TATO LIŠTA TI ŘEKNE, JESTLI KOUKÁŠ NA NOVOU VERZI */}
      <div style={{ background: 'yellow', color: 'black', padding: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
        AKTIVNÍ DYNAMICKÁ VERZE (Načteno z DB: {pojmy?.length || 0} pojmů)
      </div>

      <nav style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#66fcf1', textDecoration: 'none' }}>← ZPĚT NA WEB</Link>
      </nav>

      <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '40px' }}>GURU SLOVNÍK</h1>

      {error && <p style={{ color: 'red' }}>Chyba: {error.message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {pojmy?.map((p) => (
          <Link key={p.id} href={`/slovnik/${p.slug}`} style={{ border: '1px solid #45a29e', padding: '20px', borderRadius: '10px', textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{ color: '#66fcf1', margin: '0 0 10px 0' }}>{p.title}</h2>
            <p style={{ fontSize: '0.9rem' }}>{p.description.substring(0, 100)}...</p>
          </Link>
        ))}
      </div>

      {(!pojmy || pojmy.length === 0) && <p>V databázi nic není. Zkontroluj tabulku 'slovnik'!</p>}
    </div>
  );
}
