"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Monitor, Loader2, Eye, Zap, ArrowRight, Info } from 'lucide-react';

/**
 * 🚀 GURU EXPECTED GAMES ARCHIVE - MASTER NAVIGATION UPDATE
 * Vyřešeno: Nefunkční proskoky na slug a ošetření chybějících dat.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ExpectedGamesArchive() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'expected') // GURU CORE: Filtrujeme pouze technické preview
          .order('created_at', { ascending: false });
        
        if (!error && data) setItems(data);
        
        document.title = isEn 
          ? 'Expected Tech Hits | Guru Previews' 
          : 'Očekávané pecky | Guru Technické Preview';
      } catch (err) {
        console.error("GURU DB FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={archiveWrapper}>
      <style>{`
        .expected-card { 
            background: rgba(10, 11, 13, 0.94); 
            border: 1px solid rgba(102, 252, 241, 0.2); 
            border-radius: 32px; 
            overflow: hidden; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            height: 100%; 
            display: flex; 
            flex-direction: column; 
            backdrop-filter: blur(15px); 
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7); 
            text-decoration: none; 
            position: relative;
        }
        .expected-card:hover { 
            transform: translateY(-12px) scale(1.02); 
            border-color: #66fcf1; 
            box-shadow: 0 20px 60px rgba(102, 252, 241, 0.2); 
        }
        .card-image-wrapper {
            width: 100%;
            height: 240px;
            overflow: hidden;
            position: relative;
            background: #000;
        }
        .desc-text {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 25px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
      `}</style>

      <header style={headerStyle}>
        <div style={headerContentBox}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
            <Monitor size={48} color="#66fcf1" style={{ filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>EXPECTED <span style={{ color: '#66fcf1' }}>GAMES</span></> : <>OČEKÁVANÉ <span style={{ color: '#66fcf1' }}>HRY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Technical breakdowns of upcoming hardware-crushing titles.' 
              : 'Technické rozbory titulů, které v blízké době prověří tvůj hardware.'}
          </p>
        </div>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={center}><Loader2 className="animate-spin" size={64} color="#66fcf1" /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', opacity: 0.4 }}>
             <Zap size={48} style={{ margin: '0 auto 20px' }} />
             <h2>{isEn ? 'NO PREVIEWS GENERATED' : 'ZATÍM ŽÁDNÉ ROZBORY'}</h2>
          </div>
        ) : (
          <div style={grid}>
            {items.map((item) => {
              // GURU NAV ENGINE: Pokud chybí slug, karta je nepoužitelná
              const actualSlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
              if (!actualSlug) return null;

              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;

              return (
                <Link 
                  key={item.id} 
                  href={isEn ? `/en/ocekavane-hry/${actualSlug.trim()}` : `/ocekavane-hry/${actualSlug.trim()}`} 
                  prefetch={false}
                  style={{ textDecoration: 'none' }}
                >
                  <article className="expected-card">
                    <div className="card-image-wrapper">
                       <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                        alt={displayTitle} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                       />
                       <div style={techBadge}>
                          <Info size={12} /> {isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}
                       </div>
                    </div>

                    <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      
                      <p className="desc-text">
                        {displayDesc || (isEn ? 'Detailed technical analysis of the upcoming title.' : 'Detailní technický rozbor připravovaného titulu.')}
                      </p>

                      <div style={moreBtn}>
                         {isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIT ROZBOR'} <ArrowRight size={18} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// --- MASTER STYLES ---
const archiveWrapper = { minHeight: '100vh', padding: '120px 20px 80px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const headerStyle = { maxWidth: '1000px', margin: '0 auto 80px', textAlign: 'center' };
const headerContentBox = { background: 'rgba(0,0,0,0.7)', padding: '50px 30px', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.15)', backdropFilter: 'blur(10px)' };
const titleStyle = { fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', margin: 0, letterSpacing: '-2px' };
const subtitleStyle = { marginTop: '25px', color: '#d1d5db', fontWeight: '700', fontSize: '22px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' };
const cardTitleStyle = { fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', lineHeight: '1.1' };
const techBadge = { position: 'absolute', top: '20px', left: '20px', background: 'rgba(102, 252, 241, 0.9)', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' };
const moreBtn = { color: '#66fcf1', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', textTransform: 'uppercase', letterSpacing: '1px' };
const center = { textAlign: 'center', padding: '100px' };
