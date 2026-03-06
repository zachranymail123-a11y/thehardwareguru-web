"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Activity, Zap } from 'lucide-react';

// GURU ENGINE: Připojení k DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌍 MULTILINGUAL LOGIC
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

        // 🚀 SEO GURU: Dynamický Title
        document.title = isEn 
          ? 'Professional Hardware Guides | The Hardware Guru' 
          : 'Profesionální Hardware Rady | The Hardware Guru';
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
            background: rgba(10, 11, 13, 0.98); 
            border: 1px solid rgba(102, 252, 241, 0.2); 
            border-radius: 20px; 
            overflow: hidden; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
            text-decoration: none;
        }
        .rada-card:hover { 
            transform: translateY(-5px); 
            border-color: #66fcf1; 
            box-shadow: 0 0 25px rgba(102, 252, 241, 0.3); 
        }
        .rada-img-container {
            width: 100%;
            height: 180px;
            overflow: hidden;
            background: #000;
            position: relative;
            border-bottom: 2px solid rgba(102, 252, 241, 0.1);
        }
        .rada-img-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: 0.6s;
            opacity: 0.85;
        }
        .rada-card:hover .rada-img-container img {
            transform: scale(1.1);
            opacity: 1;
        }
        .guru-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            border: 1px solid #66fcf1;
            color: #66fcf1;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 5px;
            z-index: 2;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
             <ShieldCheck size={48} color="#66fcf1" style={{ filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'No generic trash. Real technical solutions from field practice.' 
              : 'Žádnej generickej odpad. Reálná technická řešení přímo z praxe.'}
          </p>
        </div>
      </header>

      {/* --- GRID --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={64} color="#66fcf1" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
              
              // Ořezání popisu pro čistý vzhled archivu
              const shortDesc = displayDesc?.length > 100 ? displayDesc.substring(0, 100) + '...' : displayDesc;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    {/* GURU DB IMAGE ENGINE */}
                    <div className="rada-img-container">
                      <div className="guru-badge">
                        <Zap size={10} fill="#66fcf1" /> GURU BASE
                      </div>
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000'} 
                        alt={displayTitle} 
                      />
                    </div>

                    <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      <p style={cardDescStyle}>{shortDesc}</p>
                      
                      <div style={moreStyle}>
                        {isEn ? 'DECRYPT GUIDE' : 'OTEVŘÍT RADU'} <ChevronRight size={18} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer style={footerStyle}>
        <div style={footerContentBox}>
          <h2 style={{ color: '#66fcf1', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900', fontSize: '28px' }}>
             20 YEARS OF FIELD-WORK
          </h2>
          <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#9ca3af', maxWidth: '700px', margin: '0 auto' }}>
            {isEn ? 'Decades of testing and fixing. Welcome to the base.' : 'Dvě dekády testování a oprav. Vítej na základně.'}
          </p>
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
    padding: '120px 20px 0px' 
};

const headerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto 60px', 
    textAlign: 'center' 
};

const headerContentBox = {
    background: 'rgba(0,0,0,0.8)',
    padding: '40px 20px',
    borderRadius: '30px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(102, 252, 241, 0.15)'
};

const titleStyle = { 
    fontSize: 'clamp(32px, 6vw, 64px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1.5px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { 
    marginTop: '20px', 
    color: '#d1d5db', 
    fontWeight: '600', 
    fontSize: '18px'
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const cardTitleStyle = { 
    fontSize: '22px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '12px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '14px', 
    lineHeight: '1.5', 
    flexGrow: 1, 
    marginBottom: '20px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '950', 
    fontSize: '13px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { marginTop: '80px', paddingBottom: '60px' };
const footerContentBox = {
    maxWidth: '900px', 
    margin: '0 auto',
    background: 'rgba(0,0,0,0.9)',
    padding: '50px 20px',
    borderRadius: '40px 40px 0 0',
    border: '1px solid rgba(102, 252, 241, 0.1)',
    textAlign: 'center'
};
