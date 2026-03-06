"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Bookmark } from 'lucide-react';

// GURU ENGINE: Inicializace Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌍 JAZYKOVÁ LOGIKA: Detekce verze webu
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

        // 🚀 SEO GURU FIX: Nastavení titulku stránky
        document.title = isEn 
          ? 'Practical Hardware Guides | The Hardware Guru' 
          : 'Praktické Hardware Rady | The Hardware Guru';
      } catch (err) {
        console.error("GURU DATA ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={globalStyles}>
      <style>{`
        .rada-card { 
            background: rgba(10, 11, 13, 0.95); 
            border: 1px solid rgba(102, 252, 241, 0.2); 
            border-radius: 32px; 
            padding: 40px; 
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
            transform: translateY(-12px) scale(1.02); 
            border-color: #66fcf1; 
            box-shadow: 0 25px 60px rgba(102, 252, 241, 0.15); 
        }
      `}</style>

      {/* --- HEADER SEKCE (Bez staré navigace) --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <ShieldCheck size={64} color="#66fcf1" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.5))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Hloubková technická řešení a údržba hardwaru pro maximální životnost.' 
              : 'Hloubková technická řešení a údržba hardwaru pro maximální životnost.'}
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
              // GURU ROBUST ENGINE: Výběr polí podle jazyka
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                        <div style={{ color: '#66fcf1' }}><ShieldCheck size={48} /></div>
                        <div style={categoryBadge}>
                            {isEn ? 'GURU MASTER' : 'GURU RADA'}
                        </div>
                    </div>
                    
                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{displayDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'OPEN TECHNICAL GUIDE' : 'OTEVŘÍT GURU NÁVOD'} <ChevronRight size={22} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- ORIGINÁLNÍ GURU FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerContentBox}>
          <h2 style={{ color: '#66fcf1', marginBottom: '25px', textTransform: 'uppercase', fontWeight: '900', fontSize: '36px', letterSpacing: '-1px' }}>
            {isEn ? '20 Years of Hardware Expertise' : '20 Let Praxe v Hardware'}
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '18px', color: '#e0e0e0', marginBottom: '45px', maxWidth: '800px', margin: '0 auto 40px' }}>
            {isEn ? (
              <>Everything you see here is based on two decades of technical field-work. No generic advice, only real solutions for your PC stability and performance.</>
            ) : (
              <>Vše, co zde vidíš, stavím na dvou dekádách technické praxe v servisu. Žádné generické rady z internetu, ale reálná řešení pro tvou stabilitu a výkon.</>
            )}
          </p>
          <div style={{ fontSize: '14px', color: '#555', fontWeight: '900', letterSpacing: '2px' }}>
            THE HARDWARE GURU SYSTEM
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- GURU MASTER STYLES (Originální vizuál) ---
const globalStyles = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '40px 20px 0px' 
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
    fontSize: 'clamp(45px, 8vw, 82px)', 
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
    fontSize: '20px',
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
    padding: '6px 16px', 
    borderRadius: '10px', 
    fontSize: '12px', 
    fontWeight: '950', 
    letterSpacing: '1.5px',
    border: '1px solid rgba(102, 252, 241, 0.3)',
    textTransform: 'uppercase'
};

const cardTitleStyle = { 
    fontSize: '28px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '18px', 
    textTransform: 'uppercase', 
    lineHeight: '1.1',
    letterSpacing: '-0.5px'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '16px', 
    lineHeight: '1.7', 
    flexGrow: 1, 
    marginBottom: '30px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '950', 
    fontSize: '15px', 
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
