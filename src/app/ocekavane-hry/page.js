"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Monitor, Loader2, Eye, Zap, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ExpectedGamesArchive() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'expected')
          .order('created_at', { ascending: false });
        
        if (!error && data) setItems(data);
        document.title = isEn ? 'Expected Tech Hits | Guru Previews' : 'Očekávané pecky | Guru Technické Preview';
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={archiveWrapper}>
      <style>{`
        .expected-card { background: rgba(10, 11, 13, 0.94); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 28px; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); height: 100%; display: flex; flexDirection: column; backdrop-filter: blur(15px); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7); text-decoration: none; }
        .expected-card:hover { transform: translateY(-12px) scale(1.02); border-color: #66fcf1; box-shadow: 0 20px 60px rgba(102, 252, 241, 0.2); }
      `}</style>

      <header style={headerStyle}>
        <div style={headerContentBox}>
          <h1 style={titleStyle}>
            {isEn ? <>EXPECTED <span style={{ color: '#66fcf1' }}>GAMES</span></> : <>OČEKÁVANÉ <span style={{ color: '#66fcf1' }}>HRY</span></>}
          </h1>
          <p style={subtitleStyle}>{isEn ? 'Hardware-crushing titles incoming.' : 'Budoucí technologické milníky v herním světě.'}</p>
        </div>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={center}><Loader2 className="animate-spin" size={64} color="#66fcf1" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '40px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
              return (
                <Link key={item.id} href={isEn ? `/en/ocekavane-hry/${displaySlug}` : `/ocekavane-hry/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="expected-card">
                    <img src={item.image_url} alt={displayTitle} style={{ width: '100%', height: '230px', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ padding: '30px' }}>
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      <div style={moreBtn}>{isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIT ROZBOR'} <ArrowRight size={18} /></div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const archiveWrapper = { minHeight: '100vh', padding: '120px 20px 80px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const headerStyle = { maxWidth: '1000px', margin: '0 auto 80px', textAlign: 'center' };
const headerContentBox = { background: 'rgba(0,0,0,0.7)', padding: '50px 30px', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.15)' };
const titleStyle = { fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', margin: 0 };
const subtitleStyle = { marginTop: '25px', color: '#9ca3af', fontWeight: '700', fontSize: '22px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };
const cardTitleStyle = { fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '20px', textTransform: 'uppercase' };
const moreBtn = { color: '#66fcf1', fontWeight: '950', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' };
const center = { textAlign: 'center', padding: '100px' };
