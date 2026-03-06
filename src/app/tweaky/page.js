"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// GURU ENGINE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TweaksArchivePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('tweaky')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setItems(data);
      setLoading(false);

      // GURU SEO: Dynamický titulek stránky
      document.title = isEn ? 'Latest Guru Tweaks | Performance & FPS' : 'Nejnovější Guru Tweaky | Výkon a FPS';
    }
    fetchData();
  }, [isEn]);

  return (
    <div style={archiveWrapper}>
      <style>{`
        .tweak-card { 
            background: rgba(17, 19, 24, 0.85); 
            border: 1px solid rgba(234, 179, 8, 0.2); 
            border-radius: 32px; 
            padding: 30px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            text-decoration: none;
        }
        .tweak-card:hover { 
            transform: translateY(-8px); 
            border-color: #eab308; 
            box-shadow: 0 0 30px rgba(234, 179, 8, 0.2); 
        }
      `}</style>

      <header style={headerStyle}>
        <h1 style={titleStyle}>
          GURU <span style={{ color: '#eab308' }}>{isEn ? 'TWEAKS' : 'TWEAKY'}</span>
        </h1>
        <p style={subtitleStyle}>
          {isEn 
            ? 'Deep system modifications for maximum FPS and stability.' 
            : 'Hloubkové modifikace systému pro maximální FPS a stabilitu tvé mašiny.'}
        </p>
      </header>

      <main style={gridContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="#eab308" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {items.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                <Link key={item.id} href={isEn ? `/en/tweaky/${displaySlug}` : `/tweaky/${displaySlug}`} style={{ textDecoration: 'none' }}>
                  <article className="tweak-card">
                    {/* GURU IMAGE BOX: RESTORED FROM BACKUP */}
                    <div style={imageBox}>
                      <img 
                        src={item.image_url && item.image_url !== 'EMPTY' ? item.image_url : 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                        alt={displayTitle} 
                        style={imgStyle} 
                      />
                    </div>

                    <div style={categoryBadge}>
                      <Settings size={14} /> {isEn ? (item.category_en || 'SYSTEM') : (item.category || 'SYSTÉM')}
                    </div>

                    <h3 style={cardTitleStyle}>{displayTitle}</h3>
                    <p style={cardDescStyle}>{displayDesc}</p>
                    
                    <div style={moreStyle}>
                      {isEn ? 'OPEN GURU FIX' : 'OTEVŘÍT GURU FIX'} <ChevronRight size={16} />
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

// --- GURU MASTER STYLES (GOLD THEME) ---
const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 80px' 
};

const headerStyle = { 
    maxWidth: '800px', 
    margin: '0 auto 60px', 
    textAlign: 'center' 
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
    marginTop: '20px', 
    color: '#9ca3af', 
    fontWeight: '600', 
    fontSize: '18px' 
};

const gridContainer = { 
    maxWidth: '1200px', 
    margin: '0 auto' 
};

const imageBox = { 
    height: '200px', 
    borderRadius: '20px', 
    overflow: 'hidden', 
    marginBottom: '20px', 
    border: '1px solid rgba(255,255,255,0.05)', 
    background: '#000' 
};

const imgStyle = { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    opacity: 0.8 
};

const categoryBadge = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    color: '#eab308', 
    fontSize: '11px', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: '15px', 
    letterSpacing: '1px' 
};

const cardTitleStyle = { 
    fontSize: '24px', 
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
    color: '#eab308', 
    fontWeight: '900', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    marginTop: 'auto', 
    textTransform: 'uppercase' 
};
