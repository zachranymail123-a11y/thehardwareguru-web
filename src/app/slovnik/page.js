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
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) throw error;
        setItems(data || []);

        document.title = isEn 
          ? 'Hardware Glossary | Tech Database' 
          : 'Hardware Slovník | Technická databáze';
      } catch (err) {
        console.error("GURU DB ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  const filteredItems = items.filter(item => {
    const title = (isEn && item.title_en ? item.title_en : item.title).toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q);
  });

  return (
    <div style={archiveWrapper}>
      <style>{`
        .term-card { 
            background: rgba(15, 5, 25, 0.92); /* TEMNÁ PRŮHLEDNÁ FIALOVÁ PRO ČITELNOST */
            backdrop-filter: blur(12px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            border-radius: 12px; 
            padding: 15px; 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
            text-decoration: none;
            width: 100%; /* FIX: Karta vyplní grid a nepřelézá */
        }
        .term-card:hover { 
            transform: translateY(-4px); 
            border-color: #a855f7; 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); 
        }
        .search-container {
            max-width: 400px;
            margin: 0 auto 40px;
            position: relative;
        }
        .search-input {
            width: 100%;
            padding: 10px 15px 10px 40px;
            background: #000;
            border: 1px solid rgba(168, 85, 247, 0.4);
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            outline: none;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <BookOpen size={32} color="#a855f7" style={{ margin: '0 auto 10px' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>{isEn ? 'Hardware terms decoded.' : 'Technické pojmy dešifrovány.'}</p>
        </div>
      </header>

      {/* --- VYHLEDÁVÁNÍ --- */}
      <div className="search-container">
        <Search size={16} color="#a855f7" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={isEn ? "Filter..." : "Hledat..."} 
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID (ULTRA KOMPAKTNÍ A BEZ PŘEKRÝVÁNÍ) --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" />
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '25px', 
            width: '100%'
          }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;
              
              // ULTRA-KOMPAKTNÍ OŘEZ TEXTU (MAX 60 ZNAKŮ)
              const shortDesc = displayDesc?.length > 60 ? displayDesc.substring(0, 60) + '...' : displayDesc;

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

      <footer style={footerStyle}>
        <div style={{ fontSize: '10px', color: '#444', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
           Guru Technical Database v2.6 | Fixed
        </div>
      </footer>
    </div>
  );
}

// --- MASTER STYLES ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 40px' 
};

const headerStyle = { maxWidth: '800px', margin: '0 auto 30px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.9)',
    padding: '20px',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(168, 85, 247, 0.2)'
};

const titleStyle = { 
    fontSize: 'clamp(24px, 4vw, 42px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1.5px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { marginTop: '10px', color: '#9ca3af', fontWeight: '700', fontSize: '14px' };
const gridContainer = { maxWidth: '1200px', margin: '0 auto' };

const badgeStyle = { fontSize: '7px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '1px 4px', borderRadius: '3px' };

const cardTitleStyle = { 
    fontSize: '15px', 
    fontWeight: '950', 
    color: '#fff', 
    marginBottom: '8px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2'
};

const cardDescStyle = { 
    color: '#e0e0e0', /* JASNÁ PRO ČITELNOST */
    fontSize: '12px', 
    lineHeight: '1.4', 
    flexGrow: 1, 
    marginBottom: '10px' 
};

const moreStyle = { 
    color: '#a855f7', 
    fontWeight: '950', 
    fontSize: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    marginTop: 'auto', 
    textTransform: 'uppercase'
};

const footerStyle = { padding: '40px 20px', textAlign: 'center' };
