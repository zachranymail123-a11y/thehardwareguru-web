"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Heart } from 'lucide-react';

// GURU ENGINE: Připojení k databázi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GuidesArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka z URL (CZ/EN hybrid)
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        // GURU FIX: Načítáme vše z tabulky rady, řazeno podle data od nejnovějšího
        const { data, error } = await supabase
          .from('rady')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error("GURU ERROR: Rady load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={globalStyles}>
      <style>{`
        .guide-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(102, 252, 241, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; }
        .guide-card:hover { transform: translateY(-5px); border-color: #66fcf1; box-shadow: 0 10px 30px rgba(102, 252, 241, 0.1); }
      `}</style>

      {/* --- HLAVIČKA ARCHIVU --- */}
      <header style={{ maxWidth: '800px', margin: '20px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          {isEn ? (
            <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></>
          ) : (
            <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>
          )}
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn 
            ? 'Step-by-step technical guides for long-term hardware health and maintenance.' 
            : 'Návody krok za krokem pro dlouhověkost tvého železa a správnou údržbu.'}
        </p>
      </header>

      {/* --- STATISTIKA --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '0 20px', textAlign: 'right' }}>
        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
          {isEn ? 'Available guides: ' : 'Dostupné rady: '} <span style={{ color: '#66fcf1' }}>{items.length}</span>
        </div>
      </section>

      {/* --- VÝPIS RAD --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#66fcf1" style={{ margin: '0 auto' }} />
            <p style={{marginTop: '20px', color: '#66fcf1', fontWeight: 'bold'}}>{isEn ? 'GURU is compiling manuals...' : 'Guru sestavuje manuály...'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {items.map((item) => (
              <Link key={item.id} href={isEn ? `/en/rady/${item.slug}` : `/rady/${item.slug}`} style={{ textDecoration: 'none' }}>
                <div className="guide-card" style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#66fcf1', marginBottom: '20px' }}><ShieldCheck size={40} /></div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '15px', lineHeight: '1.3' }}>{item.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.7', flex: 1, marginBottom: '25px' }}>
                    {isEn && item.description_en ? item.description_en : item.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>
                    {isEn ? 'READ FULL GUIDE' : 'ČÍST CELOU RADU'} <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* --- SUPPORT BANNER --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ padding: '40px', background: 'rgba(102, 252, 241, 0.05)', borderRadius: '28px', border: '1px solid rgba(102, 252, 241, 0.2)', textAlign: 'center' }}>
          <h3 style={{ color: '#66fcf1', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
            {isEn ? 'Support the Guru Wisdom' : 'Podpoř Guru moudrost'}
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            {isEn 
              ? 'These guides are built on 20 years of hardware service experience. Help us keep this knowledge base free for everyone!'
              : 'Tyto rady staví na 20 letech praxe v HW servisu. Pomoz nám udržet tuto znalostní bázi zdarma pro všechny!'
            }
          </p>
          <Link href={isEn ? "/en/support" : "/support"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#66fcf1', color: '#0b0c10', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
            <Heart size={20} fill="#0b0c10" /> {isEn ? 'SUPPORT PROJECT' : 'PODPOŘIT PROJEKT'}
          </Link>
        </div>
      </section>

      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#444', fontSize: '12px' }}>© {new Date().getFullYear()} THE HARDWARE GURU. {isEn ? 'Hardware is our language.' : 'Hardware je náš jazyk.'}</p>
      </footer>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' };
