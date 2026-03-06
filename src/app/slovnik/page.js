"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, Activity, ChevronRight, Zap } from 'lucide-react';

// GURU CORE ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌍 MULTILINGUAL LOGIC: Detekce jazyka z URL
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('rady')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setItems(data || []);

        // 🚀 SEO GURU: Dynamický titulek stránky
        document.title = isEn 
          ? 'Technical Solutions & Guides | The Hardware Guru' 
          : 'Technická řešení a rady | The Hardware Guru';
      } catch (err) {
        console.error("GURU DB ERROR:", err);
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
            background: #05070a; 
            border: 1px solid #1f2937; 
            border-radius: 28px; 
            overflow: hidden; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            text-decoration: none;
        }
        .rada-card:hover { 
            transform: translateY(-8px); 
            border-color: #66fcf1; 
            box-shadow: 0 0 40px rgba(102, 252, 241, 0.15); 
        }
        .img-box {
            width: 100%;
            height: 200px;
            position: relative;
            background: #000;
            overflow: hidden;
            border-bottom: 1px solid rgba(102, 252, 241, 0.1);
        }
        .img-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.75;
            transition: 0.5s;
        }
        .rada-card:hover .img-box img { 
            opacity: 1; 
            transform: scale(1.05); 
        }
        
        .guru-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(4px);
            border: 1px solid #66fcf1;
            color: #66fcf1;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 950;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 5;
        }
      `}</style>

      {/* --- GURU HEADER (Bez navigace, počítá s 90px Navbarem) --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <ShieldCheck size={56} color="#66fcf1" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>GURU <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Technical solutions for every hardware crisis.' : 'Technická řešení pro každou hardwarovou krizi.'}
          </p>
        </div>
      </header>

      {/* --- HLAVNÍ GRID ARCHIVU --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={64} color="#66fcf1" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '35px' }}>
            {items.map((rada) => {
              // GURU LOGIKA: Výběr polí podle aktuálního jazyka
              const displayTitle = (isEn && rada.title_en) ? rada.title_en : rada.title;
              const displayDesc = (isEn && rada.description_en) ? rada.description_en : rada.description;
              const displaySlug = (isEn && rada.slug_en) ? rada.slug_en : rada.slug;
              
              // Zkrácení popisu pro archiv (plný text je až v detailu)
              const shortDesc = displayDesc?.length > 110 ? displayDesc.substring(0, 110) + '...' : displayDesc;

              return (
                <Link key={rada.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    {/* OBRÁZEK STRIKTNĚ Z DB SLOUPECE 'image_url' */}
                    <div className="img-box">
                      <div className="guru-badge">
                        <Zap size={12} fill="#66fcf1" /> {isEn ? 'GURU BASE' : 'GURU ZÁKLADNA'}
                      </div>
                      {rada.image_url ? (
                        <img src={rada.image_url} alt={displayTitle} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={48} color="#1f2937" />
                        </div>
                      )}
                    </div>

                    {/* TEXTOVÝ OBSAH KARTY */}
                    <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      <p style={cardDescStyle}>
                        <strong style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px' }}>
                          {isEn ? 'PROBLEM:' : 'PROBLÉM:'}
                        </strong> {shortDesc}
                      </p>
                      
                      <div style={moreStyle}>
                        {isEn ? 'VIEW FULL GUIDE' : 'ZOBRAZIT CELOU RADU'} <ChevronRight size={18} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer style={footerStyle}>
        <div style={{ fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Hardware Guru Technical Base 🦾 20 Years of field-tested Expertise
        </div>
      </footer>
    </div>
  );
}

// --- GURU MASTER STYLES (MATCHING SCREENSHOT 6) ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 40px' 
};

const headerStyle = { maxWidth: '1000px', margin: '0 auto 60px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.85)',
    padding: '40px 20px',
    borderRadius: '35px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(102, 252, 241, 0.15)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
};

const titleStyle = { 
    fontSize: 'clamp(32px, 6vw, 64px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-2px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { 
    marginTop: '20px', 
    color: '#9ca3af', 
    fontWeight: '700', 
    fontSize: '18px',
    letterSpacing: '0.5px'
};

const gridContainer = { maxWidth: '1300px', margin: '0 auto' };

const cardTitleStyle = { 
    fontSize: '22px', 
    fontWeight: '950', 
    color: '#fff', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2',
    letterSpacing: '-0.5px'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    flexGrow: 1, 
    marginBottom: '25px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '950', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { padding: '60px 20px', textAlign: 'center' };
