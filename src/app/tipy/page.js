"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, Loader2, ChevronRight, Play, Bookmark } from 'lucide-react';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TipyArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('tipy')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) setItems(data);

        // GURU SEO: Dynamický titulek stránky
        document.title = isEn ? 'Hardware Guru Tips | Knowledge Base' : 'Guru Hardware Tipy | Databáze moudrosti';
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
        .tip-card { 
            background: rgba(10, 11, 13, 0.92); 
            border: 1px solid rgba(168, 85, 247, 0.25); 
            border-radius: 28px; 
            overflow: hidden; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            height: 100%;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            text-decoration: none;
            cursor: pointer;
        }
        .tip-card:hover { 
            transform: translateY(-10px) scale(1.02); 
            border-color: #a855f7; 
            box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3); 
        }
        .tip-image-container {
            width: 100%; 
            height: 220px; 
            overflow: hidden; 
            position: relative;
            background: #000;
        }
        .video-badge { 
            position: absolute; 
            top: 15px; 
            right: 15px; 
            background: #ff0000; 
            color: #fff; 
            padding: 6px 12px; 
            border-radius: 8px; 
            font-weight: 900; 
            font-size: 10px; 
            display: flex; 
            align-items: center; 
            gap: 5px; 
            z-index: 5; 
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
            letter-spacing: 1px;
        }
      `}</style>

      <header style={headerStyle}>
        <div style={headerContentBox}>
          <Lightbulb size={48} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }} />
          <h1 style={titleStyle}>
            GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY'}</span>
          </h1>
          <p style={subtitleStyle}>
            {isEn 
              ? 'Quick hacks and hardware wisdom for every tech enthusiast.' 
              : 'Rychlé hacky a hardwarová moudra pro každého technického nadšence.'}
          </p>
        </div>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/tipy/${displaySlug}` : `/tipy/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="tip-card">
                    <div className="tip-image-container">
                      {item.video_id && item.video_id.length > 5 && (
                        <div className="video-badge"><Play size={12} fill="#fff" /> VIDEO</div>
                      )}
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc'} 
                        alt={displayTitle} 
                        style={imgStyle} 
                      />
                    </div>

                    <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={categoryBadge}>
                        <Bookmark size={14} /> {isEn ? (item.category_en || 'OPTIMIZATION') : (item.category || 'OPTIMALIZACE')}
                      </div>
                      
                      <h3 style={cardTitleStyle}>{displayTitle}</h3>
                      <p style={cardDescStyle}>{displayDesc}</p>
                      
                      <div style={moreStyle}>
                        {isEn ? 'LEARN MORE' : 'ZJISTIT VÍCE'} <ChevronRight size={16} />
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

const imgStyle = { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    opacity: 0.9 
};

const categoryBadge = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    color: '#a855f7', 
    fontSize: '11px', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: '18px', 
    letterSpacing: '1px' 
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
