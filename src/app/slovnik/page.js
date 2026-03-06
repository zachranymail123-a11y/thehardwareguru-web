"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Loader2, ChevronRight, Bookmark, Search } from 'lucide-react';

// GURU CORE ENGINE: Napojení na tvou Supabase DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikArchivePage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 🌍 MULTILINGUÁLNÍ LOGIKA
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        // GURU SYNC: Abecední řazení pro technickou preciznost
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) throw error;
        setItems(data || []);

        // 🚀 SEO GURU: Dynamický Title
        document.title = isEn 
          ? 'Hardware Glossary | High-Tech Terms' 
          : 'Hardware Slovník | High-Tech Pojmy';
      } catch (err) {
        console.error("GURU DB ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  // FILTROVÁNÍ POJMŮ
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
            background: rgba(30, 0, 60, 0.4); /* ULTRA PRŮHLEDNÁ FIALOVÁ */
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            border-radius: 12px; 
            padding: 20px; 
            transition: all 0.2s ease-in-out; 
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            text-decoration: none;
            position: relative;
        }
        .term-card:hover { 
            transform: translateY(-5px); 
            border-color: #a855f7; 
            background: rgba(168, 85, 247, 0.15);
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.3); 
        }
        .search-container {
            max-width: 450px;
            margin: 0 auto 50px;
            position: relative;
            z-index: 10;
        }
        .search-input {
            width: 100%;
            padding: 12px 18px 12px 45px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: 0.3s;
        }
        .search-input:focus {
            border-color: #a855f7;
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
        }
      `}</style>

      {/* --- ELITNÍ HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <BookOpen size={40} color="#a855f7" style={{ margin: '0 auto 15px', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Hardware terms decoded.' : 'Technické pojmy dešifrovány.'}
          </p>
        </div>
      </header>

      {/* --- VYHLEDÁVÁNÍ --- */}
      <div className="search-container">
        <Search size={16} color="#a855f7" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={isEn ? "Filter terms..." : "Filtrovat pojmy..."} 
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID ARCHIV (STRIKTNÍ MEZERY) --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" />
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '30px' /* PEVNÁ MEZERA, ŽÁDNÉ DOTÝKÁNÍ */
          }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;
              
              // ULTRA-KOMPAKTNÍ OŘEZ TEXTU
              const shortDesc = displayDesc?.length > 70 ? displayDesc.substring(0, 70) + '...' : displayDesc;

              return (
                <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="term-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <Bookmark size={14} color="#a855f7" />
                        <span style={badgeStyle}>{isEn ? 'INFO' : 'POJEM'}</span>
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{shortDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'DECRYPT' : 'ZOBRAZIT'} <ChevronRight size={12} />
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
          <div style={{ fontSize: '10px', color: '#444', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
             Guru Technical Database v2.1 | Overlap Protected
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
    padding: '120px 20px 40px' 
};

const headerStyle = { maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.85)',
    padding: '25px 20px',
    borderRadius: '16px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.8)'
};

const titleStyle = { 
    fontSize: 'clamp(24px, 4vw, 44px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1.5px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { marginTop: '10px', color: '#9ca3af', fontWeight: '700', fontSize: '15px' };
const gridContainer = { maxWidth: '1200px', margin: '0 auto' };

const badgeStyle = { fontSize: '7px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '1px 5px', borderRadius: '3px' };

const cardTitleStyle = { 
    fontSize: '16px', 
    fontWeight: '950', 
    color: '#fff', 
    marginBottom: '8px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '12px', 
    lineHeight: '1.4', 
    flexGrow: 1, 
    marginBottom: '12px' 
};

const moreStyle = { 
    color: '#a855f7', 
    fontWeight: '950', 
    fontSize: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { marginTop: '60px', paddingBottom: '20px' };
const footerContentBox = {
    maxWidth: '600px', 
    margin: '0 auto',
    padding: '15px',
    borderTop: '1px solid rgba(168, 85, 247, 0.1)',
    textAlign: 'center'
};
