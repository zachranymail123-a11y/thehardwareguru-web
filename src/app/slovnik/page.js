"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Loader2, ChevronRight, Bookmark, Search } from 'lucide-react';

// GURU CORE ENGINE: Napojenie na tvoju Supabase DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikArchivePage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 🌍 MULTILINGVÁLNA LOGIKA
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        // GURU SYNC: Abecedné radenie pre technickú precíznosť
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) throw error;
        setItems(data || []);

        // 🚀 SEO GURU: Dynamický Title
        document.title = isEn 
          ? 'Hardware Glossary | Technical Database' 
          : 'Hardware Slovník | Technická databáza';
      } catch (err) {
        console.error("GURU DB ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  // FILTROVANIE POJMOV
  const filteredItems = items.filter(item => {
    const title = (isEn && item.title_en ? item.title_en : item.title).toLowerCase();
    const desc = (isEn && item.description_en ? item.description_en : item.description).toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  return (
    <div style={archiveWrapper}>
      <style>{`
        .term-card { 
            background: rgba(8, 4, 15, 0.98); /* TAKMER NEPRIEHLADNÁ PRE MAX ČITATEĽNOSŤ */
            backdrop-filter: blur(20px);
            border: 1px solid rgba(168, 85, 247, 0.4); 
            border-radius: 12px; 
            padding: 25px; 
            transition: all 0.2s ease-in-out; 
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9);
            text-decoration: none;
            position: relative;
            z-index: 1;
        }
        .term-card:hover { 
            transform: translateY(-5px); 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); 
            z-index: 2;
        }
        .search-container {
            max-width: 500px;
            margin: 0 auto 60px;
            position: relative;
            z-index: 10;
        }
        .search-input {
            width: 100%;
            padding: 15px 20px 15px 50px;
            background: #000;
            border: 2px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            outline: none;
            transition: 0.3s;
        }
        .search-input:focus {
            border-color: #a855f7;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
      `}</style>

      {/* --- ELITNÝ HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <BookOpen size={48} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Hardware terms decoded for elite geeks.' : 'Technické pojmy dešifrované pre elitných geekov.'}
          </p>
        </div>
      </header>

      {/* --- VYHĽADÁVANIE --- */}
      <div className="search-container">
        <Search size={20} color="#a855f7" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={isEn ? "Filter terms..." : "Filtrovať pojmy..."} 
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID ARCHÍV (FIXNÉ MEDZERY) --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={64} color="#a855f7" />
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '40px', /* MASÍVNA MEDZERA PROTI PREKRÝVANIU */
            width: '100%'
          }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;
              
              // ULTRA-KOMPAKTNÝ OREZ TEXTU
              const shortDesc = displayDesc?.length > 75 ? displayDesc.substring(0, 75) + '...' : displayDesc;

              return (
                <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="term-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <Bookmark size={18} color="#a855f7" fill="rgba(168, 85, 247, 0.2)" />
                        <span style={badgeStyle}>{isEn ? 'TECH' : 'POJEM'}</span>
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{shortDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'DECRYPT' : 'ZOBRAZIŤ'} <ChevronRight size={14} />
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
          <div style={{ fontSize: '12px', color: '#444', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>
             Guru Technical Database v2.5 | Readability Fixed
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
    padding: '120px 20px 60px' 
};

const headerStyle = { maxWidth: '1000px', margin: '0 auto 60px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.9)',
    padding: '40px 20px',
    borderRadius: '24px',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(168, 85, 247, 0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,1)'
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

const subtitleStyle = { marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '18px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };

const badgeStyle = { fontSize: '9px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(168, 85, 247, 0.5)', padding: '2px 8px', borderRadius: '4px' };

const cardTitleStyle = { 
    fontSize: '20px', 
    fontWeight: '950', 
    color: '#fff', 
    marginBottom: '10px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2',
    letterSpacing: '-0.5px'
};

const cardDescStyle = { 
    color: '#e0e0e0', /* JASNÁ BIELA PRE ČITATEĽNOSŤ */
    fontSize: '14px', 
    lineHeight: '1.5', 
    flexGrow: 1, 
    marginBottom: '20px' 
};

const moreStyle = { 
    color: '#a855f7', 
    fontWeight: '950', 
    fontSize: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { marginTop: '100px', paddingBottom: '40px' };
const footerContentBox = {
    maxWidth: '800px', 
    margin: '0 auto',
    padding: '25px',
    borderTop: '2px solid rgba(168, 85, 247, 0.2)',
    textAlign: 'center'
};
