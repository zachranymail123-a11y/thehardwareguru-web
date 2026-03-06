"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Loader2, ChevronRight, Bookmark, Search, Zap } from 'lucide-react';

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
            background: rgba(20, 10, 35, 0.7); /* PRŮHLEDNÁ FIALOVÁ */
            backdrop-filter: blur(12px);
            border: 1px solid rgba(168, 85, 247, 0.2); 
            border-radius: 16px; 
            padding: 20px; 
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            text-decoration: none;
            position: relative;
        }
        .term-card:hover { 
            transform: translateY(-5px); 
            border-color: #a855f7; 
            background: rgba(168, 85, 247, 0.1);
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.25); 
        }
        .search-container {
            max-width: 500px;
            margin: 0 auto 60px;
            position: relative;
            z-index: 10;
        }
        .search-input {
            width: 100%;
            padding: 14px 20px 14px 50px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 12px;
            color: #fff;
            font-size: 15px;
            outline: none;
            transition: 0.3s;
            box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.1);
        }
        .search-input:focus {
            border-color: #a855f7;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
      `}</style>

      {/* --- ELITNÍ HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <BookOpen size={48} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Hardware terms decoded for elite geeks.' : 'Technické pojmy dešifrované pro elitní geeky.'}
          </p>
        </div>
      </header>

      {/* --- VYHLEDÁVÁNÍ --- */}
      <div className="search-container">
        <Search size={18} color="#a855f7" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={isEn ? "Search term..." : "Hledat pojem..."} 
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID ARCHIV (KOMPAKTNÍ) --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={54} color="#a855f7" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;
              
              // ULTRA-KOMPAKTNÍ OŘEZ: Jen rychlá info, detail je až uvnitř
              const shortDesc = displayDesc?.length > 85 ? displayDesc.substring(0, 85) + '...' : displayDesc;

              return (
                <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="term-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Bookmark size={16} color="#a855f7" />
                        <span style={badgeStyle}>{isEn ? 'INFO' : 'POJEM'}</span>
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{shortDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'DECRYPT' : 'ZOBRAZIT'} <ChevronRight size={14} />
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
          <div style={{ fontSize: '11px', color: '#444', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>
             Guru Technical Intelligence 🦾 Knowledge Base v2.0
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
    padding: '120px 20px 0px' 
};

const headerStyle = { maxWidth: '900px', margin: '0 auto 40px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.85)',
    padding: '30px 20px',
    borderRadius: '24px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
};

const titleStyle = { 
    fontSize: 'clamp(28px, 5vw, 54px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-2px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { marginTop: '15px', color: '#9ca3af', fontWeight: '700', fontSize: '17px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };

const badgeStyle = { fontSize: '8px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '2px 6px', borderRadius: '4px' };

const cardTitleStyle = { 
    fontSize: '18px', 
    fontWeight: '950', 
    color: '#fff', 
    marginBottom: '8px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2',
    letterSpacing: '-0.5px'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '13px', 
    lineHeight: '1.4', 
    flexGrow: 1, 
    marginBottom: '15px' 
};

const moreStyle = { 
    color: '#a855f7', 
    fontWeight: '950', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { marginTop: '80px', paddingBottom: '40px' };
const footerContentBox = {
    maxWidth: '700px', 
    margin: '0 auto',
    padding: '20px',
    borderTop: '1px solid rgba(168, 85, 247, 0.15)',
    textAlign: 'center'
};
