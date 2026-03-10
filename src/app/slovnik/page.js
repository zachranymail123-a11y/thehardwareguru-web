"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, ChevronRight, Loader2, Search } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SlovnikPage() {
  const [pojmy, setPojmy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('slovnik')
          .select('*')
          .order('title', { ascending: true });
        
        if (!error && data) setPojmy(data);
        document.title = isEn ? 'Hardware Glossary | Guru Base' : 'Guru Hardware Slovník | Databáze';
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  // GURU FILTER: Hledáme v CZ i EN názvech
  const filteredItems = pojmy.filter(item => {
    const title = (isEn && item.title_en ? item.title_en : item.title).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={pageWrapper}>
      <style>{`
        .term-card { 
            background: rgba(10, 11, 13, 0.9); 
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 30px; 
            border-radius: 28px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .term-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); 
            transform: translateY(-8px) scale(1.02); 
        }
        .search-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 60px;
            position: relative;
        }
        .search-input {
            width: 100%;
            padding: 18px 25px 18px 60px;
            background: rgba(0,0,0,0.8);
            border: 2px solid rgba(168, 85, 247, 0.2);
            border-radius: 20px;
            color: #fff;
            outline: none;
            font-size: 17px;
            transition: 0.3s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .search-input:focus { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        .social-btn { 
            padding: 12px 24px; 
            text-decoration: none; 
            font-weight: 900; 
            border-radius: 14px; 
            transition: 0.3s; 
            font-size: 12px; 
            display: inline-block; 
            border: 1px solid currentColor;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .social-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
      `}</style>

      {/* --- HLAVNÍ OBSAH --- */}
      <main style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Book size={64} color="#a855f7" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))' }} />
            <h1 style={titleStyle}>
              {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU HARDWARE <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
            </h1>
            <p style={{ marginTop: '20px', color: '#9ca3af', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Elite technical knowledge starts here.' : 'Tvé technické znalosti začínají zde.'}
            </p>
        </header>

        {/* --- VYHLEDÁVÁNÍ (GURU UX IMPROVEMENT) --- */}
        <div className="search-container">
          <Search size={24} color="#a855f7" style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder={isEn ? "Decode technical terms..." : "Hledat v databázi pojmů..."} 
            className="search-input"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={64} color="#a855f7" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;

              return (
                <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} className="term-card">
                  <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                    {displayTitle}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1 }}>
                    {displayDesc && displayDesc.length > 140 ? displayDesc.substring(0, 140) + '...' : displayDesc}
                  </p>
                  <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isEn ? 'DECRYPT DETAIL' : 'ZOBRAZIT DETAIL'} <ChevronRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- GURU FOOTER (RESTORED & MULTI-LANG) --- */}
      <footer style={footerStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px', letterSpacing: '-1px' }}>
            {isEn ? 'ABOUT GURU PROJECT' : 'O PROJEKTU'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px', fontWeight: '500' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology and hardcore hardware. Mission: help you build better PCs and understand complex technical systems."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií a hardwarem. Moje mise je jednoduchá: pomáhat ti stavět lepší PC a chápat složité pojmy."
            }
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '50px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK STREAM</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2' }}>DISCORD</a>
          </div>
          
          <p style={{ fontSize: '13px', color: '#444', fontWeight: 'bold', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH DATABASE
          </p>
        </div>
      </footer>
    </div>
  );
}

const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column'
};

const titleStyle = { 
  fontSize: 'clamp(40px, 8vw, 72px)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  letterSpacing: '-2px', 
  margin: 0,
  lineHeight: '0.9'
};

const footerStyle = { 
  padding: '120px 20px 60px', 
  background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 100%)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};
