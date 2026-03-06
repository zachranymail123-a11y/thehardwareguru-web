"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronRight, Activity, Zap, ImageOff } from 'lucide-react';

// GURU ENGINE: Připojení k tvé DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌍 JAZYKOVÁ LOGIKA
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
          ? 'Hardware Guides | The Hardware Guru' 
          : 'Hardware Rady | The Hardware Guru';
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
            border-radius: 16px; 
            overflow: hidden; 
            transition: all 0.2s ease-out; 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            text-decoration: none;
        }
        .rada-card:hover { 
            transform: translateY(-4px); 
            border-color: #66fcf1; 
            box-shadow: 0 0 30px rgba(102, 252, 241, 0.2); 
        }
        .rada-img-container {
            width: 100%;
            height: 160px; /* KOMPAKTNÍ VÝŠKA */
            overflow: hidden;
            background: #000;
            position: relative;
            border-bottom: 1px solid rgba(102, 252, 241, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .rada-img-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: 0.4s;
            opacity: 0.8;
        }
        .rada-card:hover .rada-img-container img {
            opacity: 1;
            transform: scale(1.05);
        }
        .guru-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(4px);
            border: 1px solid #66fcf1;
            color: #66fcf1;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 2;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header style={headerStyle}>
        <div style={headerContentBox}>
          <ShieldCheck size={40} color="#66fcf1" style={{ margin: '0 auto 15px', filter: 'drop-shadow(0 0 8px rgba(102, 252, 241, 0.4))' }} />
          <h1 style={titleStyle}>
            {isEn ? <>PRACTICAL <span style={{ color: '#66fcf1' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#66fcf1' }}>RADY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Real technical solutions from field practice.' 
              : 'Reálná technická řešení přímo z praxe.'}
          </p>
        </div>
      </header>

      {/* --- GRID --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#66fcf1" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
              
              // Ořezání popisu na naprosté minimum pro archiv
              const shortDesc = displayDesc?.length > 80 ? displayDesc.substring(0, 80) + '...' : displayDesc;

              return (
                <Link key={item.id} href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="rada-card">
                    {/* GURU DB IMAGE ENGINE - POUZE TVOJE OBRÁZKY */}
                    <div className="rada-img-container">
                      <div className="guru-badge">
                        <Zap size={10} fill="#66fcf1" /> GURU
                      </div>
                      {item.image_url ? (
                        <img src={item.image_url} alt={displayTitle} />
                      ) : (
                        <div style={{ color: '#1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ImageOff size={32} />
                          <span style={{ fontSize: '10px', marginTop: '8px', fontWeight: '900' }}>NO IMAGE</span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      <p style={cardDescStyle}>{shortDesc}</p>
                      
                      <div style={moreStyle}>
                        {isEn ? 'OPEN' : 'OTEVŘÍT'} <ChevronRight size={16} />
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
          <div style={{ fontSize: '12px', color: '#444', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
             20 Years of field-work | Hardware Guru Base
          </div>
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
    maxWidth: '800px', 
    margin: '0 auto 40px', 
    textAlign: 'center' 
};

const headerContentBox = {
    background: 'rgba(0,0,0,0.8)',
    padding: '30px 20px',
    borderRadius: '24px',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(102, 252, 241, 0.15)'
};

const titleStyle = { 
    fontSize: 'clamp(28px, 5vw, 48px)', 
    fontWeight: '950', 
    textTransform: 'uppercase', 
    letterSpacing: '-1px', 
    color: '#fff', 
    lineHeight: '1',
    margin: 0
};

const subtitleStyle = { 
    marginTop: '15px', 
    color: '#9ca3af', 
    fontWeight: '600', 
    fontSize: '16px'
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const cardTitleStyle = { 
    fontSize: '18px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '10px', 
    textTransform: 'uppercase', 
    lineHeight: '1.2'
};

const cardDescStyle = { 
    color: '#9ca3af', 
    fontSize: '13px', 
    lineHeight: '1.5', 
    flexGrow: 1, 
    marginBottom: '15px' 
};

const moreStyle = { 
    color: '#66fcf1', 
    fontWeight: '950', 
    fontSize: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    marginTop: 'auto', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const footerStyle = { marginTop: '60px', paddingBottom: '40px' };
const footerContentBox = {
    maxWidth: '800px', 
    margin: '0 auto',
    padding: '30px 20px',
    borderTop: '1px solid rgba(102, 252, 241, 0.1)',
    textAlign: 'center'
};
