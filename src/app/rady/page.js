"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Activity } from 'lucide-react';

// GURU ENGINE: Inicializace Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌍 JAZYKOVÁ LOGIKA
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('rady')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) setItems(data);

        // 🚀 SEO GURU: Titulek stránky
        document.title = isEn 
          ? 'Elite Hardware Guides | Hardware Guru Base' 
          : 'Elitní Hardware Rady | Hardware Guru Základna';
      } catch (err) {
        console.error("GURU DATA FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={archiveWrapper}>
      <style>{`
        .rada-card { 
            background: rgba(10, 11, 13, 0.95); 
            border: 1px solid rgba(102, 252, 241, 0.2); 
            border-radius: 32px; 
            overflow: hidden; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(12px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            text-decoration: none;
            cursor: pointer;
        }
        .rada-card:hover { 
            transform: translateY(-10px) scale(1.02); 
            border-color: #66fcf1; 
            box-shadow: 0 25px 60px rgba(102, 252, 241, 0.15); 
        }
        .rada-image-box {
            width: 100%;
            height: 220px;
            overflow: hidden;
            background: #000;
            border-bottom: 1px solid rgba(102, 252, 241, 0.1);
        }
        .rada-image-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.8;
            transition: 0.5s;
        }
        .rada-card:hover .rada-image-box img {
            opacity: 1;
            transform: scale(1.05);
        }
      `}</style>

      {/* --- ELITNÍ HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <ShieldCheck size={64} color="#66fcf1" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.4))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Elite technical solutions and deep hardware maintenance for pro geeks.' 
              : 'Elitní technická řešení a hloubková údržba hardwaru pro profi geeky.'}
          </p>
        </div>
      </header>

      {/* --- HLAVNÍ GRID --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '120px' }}>
            <Loader2 className="animate-spin" size={64} color="#66fcf1" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '40px' }}>
            {items.map((item) => {
              // GURU ROBUST ENGINE: Výběr polí a zkrácení popisu
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
              
              // Zkrátíme popis pro archiv, aby okna nebyla obří
              const shortDesc = displayDesc?.length > 150 ? displayDesc.substring(0, 150) + '...' : displayDesc;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} prefetch={false} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    {/* GURU IMAGE ENGINE: Návrat obrázků do oken */}
                    <div className="rada-image-box">
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000'} 
                        alt={displayTitle} 
                      />
                    </div>

                    <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={categoryBadge}>
                        <Activity size={14} /> {isEn ? 'GURU BASE' : 'GURU ZÁKLADNA'}
                      </div>
                      
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      
                      {/* ZDE JE OPRAVA: Jen krátký popis pro čistý archiv */}
                      <p style={cardDescStyle}>{shortDesc}</p>
                      
                      <div style={moreStyle}>
                        {isEn ? 'VIEW FULL GUIDE' : 'ZOBRAZIT CELOU RADU'} <ChevronRight size={20} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- GURU FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerContentBox}>
          <h2 style={{ color: '#66fcf1', marginBottom: '25px', textTransform: 'uppercase', fontWeight: '900', fontSize: '32px', letterSpacing: '-1px' }}>
            {isEn ? '20 Years of Expertise' : '20 Let Praxe v Oboru'}
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '17px', color: '#e0e0e0', marginBottom: '45px', maxWidth: '800px', margin: '0 auto 40px' }}>
            {isEn ? (
              <>Field-tested solutions for your PC stability and long-term hardware health.</>
            ) : (
              <>Praxí ověřená řešení pro tvou stabilitu a dlouhodobé zdraví tvého hardwaru.</>
            )}
          </p>
          <div style={{ fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '2px' }}>
            THE HARDWARE GURU SYSTEM 🦾
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- GURU MASTER STYLES ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '130px 20px 0px' 
};

const headerStyle = { 
    maxWidth: '1100px', 
    margin: '0 auto 80px', 
    textAlign: 'center' 
};

const headerContentBox = {
    background: 'rgba(0,0,0,0.85)',
    padding: '60px 40px',
    borderRadius: '40px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 252, 241, 0.15)',
    boxShadow: '0 30px 100px rgba(0,0,0,0.8)'
};

const titleStyle = { 
    fontSize: 'clamp(40px, 8vw, 76px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-2px', 
    color: '#fff', 
    lineHeight: '0.85',
    margin: 0
};

const subtitleStyle = { 
    marginTop: '30px', 
    color: '#9ca3af', 
    fontWeight: '700', 
    fontSize: '19px',
    maxWidth: '700px',
    margin: '30px auto 0',
    lineHeight: '1.5'
};

const gridContainer = { 
    maxWidth: '1300px', 
    margin: '0 auto' 
};

const categoryBadge = { 
    background: 'rgba(102, 252, 241, 0.1)', 
    color: '#66fcf1', 
    padding: '5px 14px', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '950', 
    letterSpacing: '1.5px',
    border: '1px solid rgba(102, 252, 241, 0.2)',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
    width: 'fit-content'
};

const cardTitleStyle = { 
    fontSize: '26px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    lineHeight: '1.1',
    letterSpacing: '-0.5px'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    flexGrow: 1, 
    marginBottom: '30px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '950', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { 
    marginTop: '120px',
    paddingBottom: '80px'
};

const footerContentBox = {
    maxWidth: '1000px', 
    margin: '0 auto',
    background: 'rgba(0,0,0,0.9)',
    padding: '80px 40px',
    borderRadius: '50px 50px 0 0',
    border: '1px solid rgba(102, 252, 241, 0.1)',
    borderBottom: 'none',
    textAlign: 'center',
    backdropFilter: 'blur(30px)'
};
