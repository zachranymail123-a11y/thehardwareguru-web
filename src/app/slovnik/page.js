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
        // GURU SYNC: Řadíme abecedně pro snadnou orientaci ve slovníku
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) throw error;
        setItems(data || []);

        // 🚀 SEO GURU: Dynamický Title
        document.title = isEn 
          ? 'Hardware Glossary | Technical Terms Decoded' 
          : 'Hardware Slovník | Technické pojmy dešifrovány';
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
            background: rgba(5, 7, 10, 0.96); 
            border: 1px solid rgba(168, 85, 247, 0.15); 
            border-radius: 16px; 
            padding: 25px; 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(12px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
            text-decoration: none;
            position: relative;
            overflow: hidden;
        }
        .term-card:hover { 
            transform: translateY(-4px); 
            border-color: #a855f7; 
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); 
        }
        .search-container {
            max-width: 600px;
            margin: 0 auto 50px;
            position: relative;
        }
        .search-input {
            width: 100%;
            padding: 15px 20px 15px 50px;
            background: rgba(17, 19, 24, 0.9);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
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
          <BookOpen size={56} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Hardware terms decoded for professional geeks.' : 'Technické pojmy dešifrované pro profi geeky.'}
          </p>
        </div>
      </header>

      {/* --- SEARCH BAR --- */}
      <div className="search-container">
        <Search size={20} color="#a855f7" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={isEn ? "Search terms (e.g. DDR5, Latency)..." : "Hledej pojmy (např. DDR5, Latence)..."} 
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID ARCHIV --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={64} color="#a855f7" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;
              
              // KOMPAKTNÍ OŘEZ TEXTU: Jen to nejdůležitější pro archiv
              const shortDesc = displayDesc?.length > 100 ? displayDesc.substring(0, 100) + '...' : displayDesc;

              return (
                <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="term-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <Bookmark size={20} color="#a855f7" fill="rgba(168, 85, 247, 0.1)" />
                        <span style={badgeStyle}>{isEn ? 'DEFINED' : 'POJEM'}</span>
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{shortDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'DECODE' : 'ZOBRAZIT VÝKLAD'} <ChevronRight size={16} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {!loading && filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', color: '#444', padding: '40px', fontWeight: '900', textTransform: 'uppercase' }}>
            {isEn ? 'No terms found in database.' : 'V databázi jsem nic nenašel.'}
        </div>
      )}

      {/* --- ELITNÍ FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerContentBox}>
          <div style={{ fontSize: '12px', color: '#333', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>
             Guru Technical Intelligence 🦾 Knowledge Base
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

const headerStyle = { maxWidth: '1000px', margin: '0 auto 40px', textAlign: 'center' };
const headerContentBox = {
    background: 'rgba(0,0,0,0.85)',
    padding: '40px 20px',
    borderRadius: '24px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
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

const subtitleStyle = { marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '18px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };

const badgeStyle = { fontSize: '9px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 8px', borderRadius: '4px' };

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
    color: '#9ca3af', 
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

const footerStyle = { marginTop: '80px', paddingBottom: '60px' };
const footerContentBox = {
    maxWidth: '800px', 
    margin: '0 auto',
    padding: '30px 20px',
    borderTop: '1px solid rgba(168, 85, 247, 0.1)',
    textAlign: 'center'
};
