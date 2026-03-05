"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, Loader2, ChevronRight, ShieldCheck, Heart } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GURU PRAVIDLO: Detekce jazyka z URL
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('tipy')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error("GURU ERROR: Tipy fail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getSafeImage = (url) => {
    if (!url || !url.startsWith('http')) return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000';
    return url;
  };

  return (
    <div style={globalStyles}>
      <style>{`
        .tip-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; }
        .tip-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); border-color: #a855f7; }
      `}</style>

      {/* --- HLAVIČKA SEKCE --- */}
      <header style={{ maxWidth: '800px', margin: '20px auto 40px', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS & TRICKS' : 'TIPY & TRIKY'}</span>
        </h1>
        <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
          {isEn 
            ? 'Quick hacks and technical wisdom for every PC enthusiast.' 
            : 'Rychlé hacky a technická moudra pro každého PC nadšence.'}
        </p>
      </header>

      {/* --- VÝPIS TIPŮ --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {items.map((item) => (
              <Link key={item.id} href={isEn ? `/en/tipy/${item.slug}` : `/tipy/${item.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tip-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '220px', width: '100%', background: '#0b0c10', overflow: 'hidden' }}>
                    <img src={getSafeImage(item.image_url)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>{item.category || 'GURU TIP'}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 12px 0', color: '#fff', lineHeight: '1.2' }}>{item.title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px', flex: 1 }}>
                      {isEn && item.description_en ? item.description_en : item.description}
                    </p>
                    <div style={{ marginTop: 'auto', color: '#a855f7', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' }}>
                      {isEn ? 'LEARN MORE' : 'ZJISTIT VÍCE'} →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* --- PODPORA --- */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ padding: '40px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '28px', border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'center' }}>
          <ShieldCheck size={40} color="#a855f7" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>{isEn ? 'Boost the Guru Project' : 'Podpoř Guru projekt'}</h3>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            {isEn ? 'Each tip is handcrafted for maximum performance. If we helped you, help us back!' : 'Každý tip je ručně vybraný pro tvůj maximální výkon. Pokud jsme ti pomohli, podpoř nás!'}
          </p>
          <Link href={isEn ? "/en/support" : "/support"} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#a855f7', color: '#fff', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
            <Heart size={20} fill="#fff" /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
          </Link>
        </div>
      </section>

      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#666', fontSize: '12px' }}>© {new Date().getFullYear()} THE HARDWARE GURU. {isEn ? 'No limits, just hardware.' : 'Žádné limity, jen hardware.'}</p>
      </footer>
    </div>
  );
}

const globalStyles = { minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' };
