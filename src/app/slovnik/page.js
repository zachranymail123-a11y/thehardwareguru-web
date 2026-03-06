"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Loader2, ChevronRight, Bookmark, Search } from 'lucide-react';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        // GURU SYNC: Řadíme abecedně pro snadnou orientaci
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (!error && data) setItems(data);

        // GURU SEO: Dynamický titulek stránky
        document.title = isEn ? 'Hardware Glossary | Tech Terms Decoded' : 'Hardware Slovník | Technické pojmy dešifrovány';
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
        .term-card { 
            background: rgba(10, 11, 13, 0.92); 
            border: 1px solid rgba(168, 85, 247, 0.25); 
            border-radius: 28px; 
            padding: 35px; 
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            text-decoration: none;
            cursor: pointer;
        }
        .term-card:hover { 
            transform: translateY(-10px) scale(1.02); 
            border-color: #a855f7; 
            box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3); 
        }
      `}</style>

      <header style={headerStyle}>
        <div style={headerContentBox}>
          <BookOpen size={48} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>HARDWARE <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>HARDWARE <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Technical terms and abbreviations decoded into human language.' 
              : 'Technické pojmy a zkratky dešifrované do lidské řeči.'}
          </p>
        </div>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {items.map((item) => {
              // GURU ROBUST ENGINE: Fallbacky pro EN verzi
              const hasEnTitle = item.title_en && item.title_en.trim() !== "";
              const hasEnDesc = item.description_en && item.description_en.trim() !== "";
              const hasEnSlug = item.slug_en && item.slug_en.trim() !== "";

              const displayTitle = (isEn && hasEnTitle) ? item.title_en : item.title;
              const displayDesc = (isEn && hasEnDesc) ? item.description_en : item.description;
              const displaySlug = (isEn && hasEnSlug) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} prefetch={false} style={{ textDecoration: 'none' }}>
                  <article className="term-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ color: '#a855f7' }}><Bookmark size={32} fill="currentColor" fillOpacity={0.1} /></div>
                        <div style={categoryBadge}>
                            {isEn ? 'DEFINITION' : 'DEFINICE'}
                        </div>
                    </div>
                    
                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{displayDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'READ DEFINITION' : 'ZOBRAZIT VÝKLAD'} <ChevronRight size={16} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- FOOTER INFO --- */}
      {!loading && items.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#444', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn ? `TOTAL ${items.length} TERMS DECODED` : `CELKEM DEŠIFROVÁNO ${items.length} POJMŮ`}
          </div>
      )}
    </div>
  );
}

// --- GURU MASTER STYLES (PURPLE THEME) ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 80px' 
};

const headerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto 60px', 
    textAlign: 'center' 
};

const headerContentBox = {
    background: 'rgba(0,0,0,0.7)',
    padding: '40px 20px',
    borderRadius: '32px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(168, 85, 247, 0.15)'
};

const titleStyle = { 
    fontSize: 'clamp(40px, 8vw, 72px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1px', 
    color: '#fff', 
    lineHeight: '0.9' 
};

const subtitleStyle = { 
    marginTop: '25px', 
    color: '#d1d5db', 
    fontWeight: '600', 
    fontSize: '19px',
    maxWidth: '600px',
    margin: '25px auto 0'
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const categoryBadge = { 
    background: 'rgba(168, 85, 247, 0.1)', 
    color: '#a855f7', 
    padding: '4px 12px', 
    borderRadius: '6px', 
    fontSize: '10px', 
    fontWeight: '900', 
    letterSpacing: '1px',
    border: '1px solid rgba(168, 85, 247, 0.2)'
};

const cardTitleStyle = { 
    fontSize: '26px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2' 
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    flexGrow: 1, 
    marginBottom: '20px' 
};

const moreStyle = { 
    color: '#a855f7', 
    fontWeight: '900', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    marginTop: 'auto', 
    textTransform: 'uppercase' 
};
