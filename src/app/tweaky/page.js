"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, Activity, Loader2, ShieldCheck, Heart } from 'lucide-react';

// GURU ENGINE: Připojení k databázi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TweaksArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka z URL (CZ/EN hybrid)
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('tweaky')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error("GURU ERROR: Tweaky load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
    return url;
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .tweak-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(234, 179, 8, 0.2); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; }
        .tweak-card:hover { transform: translateY(-8px); box-shadow: 0 0 30px rgba(234, 179, 8, 0.3); border-color: #eab308; }
      `}</style>

      {/* --- HLAVIČKA ARCHIVU --- */}
      <header style={{ maxWidth: '800px', margin: '20px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          {isEn ? (
            <>GURU <span style={{ color: '#eab308' }}>TWEAKS</span></>
          ) : (
            <>GURU <span style={{ color: '#eab308' }}>TWEAKY</span></>
          )}
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn 
            ? 'Advanced technical fixes, registry optimizations and gaming performance boosts.' 
            : 'Pokročilé technické fixy, optimalizace registrů a herní výkonnostní boosty.'}
        </p>
      </header>

      {/* --- STATISTIKA --- */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '0 20px', textAlign: 'right' }}>
        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>
          {isEn ? 'Total tweaks: ' : 'Celkem tweaků: '} <span style={{ color: '#eab308' }}>{items.length}</span>
        </div>
      </section>

      {/* --- VÝPIS TWEAKŮ --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#eab308" style={{ margin: '0 auto' }} />
            <p style={{marginTop: '20px', color: '#eab308', fontWeight: 'bold'}}>{isEn ? 'GURU is tuning engines...' : 'Guru ladí motory...'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {items.map((item) => (
              <Link key={item.id} href={isEn ? `/en/tweaky/${item.slug}` : `/tweaky/${item.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tweak-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '180px', width: '100%', background: '#0b0c10', overflow: 'hidden' }}>
                    <img src={getSafeImage(item.image_url)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                      <Activity size={14} /> {isEn ? 'OPTIMIZATION' : 'OPTIMALIZACE'}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 12px 0', color: '#fff', lineHeight: '1.2' }}>{item.title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px', flex: 1 }}>
                      {isEn && item.description_en ? item.description_en : item.description}
                    </p>
                    <div style={{ marginTop: 'auto', color: '#eab308', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                      {isEn ? 'OPEN GURU FIX' : 'OTEVŘÍT GURU FIX'} →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* --- SUPPORT BANNER --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ padding: '40px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '28px', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' }}>
          <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#eab308', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
            {isEn ? 'Tweak Your Support' : 'Vylaď svou podporu'}
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            {isEn 
              ? 'Developing these tweaks takes hundreds of hours of testing. Help us keep the servers running and the hardware coming!'
              : 'Vývoj těchto tweaků stojí stovky hodin testování. Pomoz nám udržet servery v chodu a železo na stole!'
            }
          </p>
          <Link href={isEn ? "/en/support" : "/support"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
            <Heart size={20} fill="#000" /> {isEn ? 'SUPPORT PROJECT' : 'PODPOŘIT PROJEKT'}
          </Link>
        </div>
      </section>

      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#666', fontSize: '12px' }}>© {new Date().getFullYear()} THE HARDWARE GURU. {isEn ? 'Pure performance, no lag.' : 'Čistý výkon, žádný lag.'}</p>
      </footer>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' };
