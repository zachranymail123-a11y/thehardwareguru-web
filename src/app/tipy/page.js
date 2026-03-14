import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Bookmark, Heart, Flame, ShieldCheck } from 'lucide-react';

/**
 * GURU TIP ARCHIVE ENGINE V2.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/tipy/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace podstránek.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO autoritu.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Podpora CZ/EN varianty a absolutních Canonical URL.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy pro archiv
export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Hardware Guru Tips | Tech Knowledge Base' : 'Guru Hardware Tipy | Databáze moudrosti';
  const desc = isEn 
    ? 'Quick hacks, performance optimizations and hardware wisdom for every tech enthusiast.' 
    : 'Rychlé hacky, optimalizace výkonu a hardwarová moudra pro každého technického nadšence.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/tipy`,
      languages: {
        'en': `${baseUrl}/en/tipy`,
        'cs': `${baseUrl}/tipy`,
        'x-default': `${baseUrl}/tipy`
      }
    }
  };
}

export default async function TipyArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GURU FETCH: Získání dat přímo na serveru
  const { data: items, error } = await supabase
    .from('tipy')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU TIPS FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam rad)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Hardware & PC Tips" : "Hardware a PC Tipy",
    "description": isEn ? "Collection of technical tips and tricks." : "Sbírka technických tipů a triků.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/tipy/${isEn && item.slug_en ? item.slug_en : item.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Tips" : "Tipy", "item": `${baseUrl}${isEn ? '/en' : ''}/tipy` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={archiveWrapper}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
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
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />

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
        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO TIPS FOUND IN DATABASE' : 'V DATABÁZI NENALEZENY ŽÁDNÉ TIPY'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {safeItems.map((item) => {
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
                        loading="lazy"
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

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA (Golden standard) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Did these tips help you? Support us by buying games at the best prices." : "Pomohly ti tyto tipy? Podpoř nás nákupem her za ty nejlepší ceny."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- GURU MASTER STYLES (Zachovány dle zadání) ---
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
