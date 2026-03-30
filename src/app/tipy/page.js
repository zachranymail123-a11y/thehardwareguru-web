import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Bookmark, Heart, Flame, ShieldCheck } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU TIP ARCHIVE ENGINE V2.3 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchor, eliminace hluchých míst + Heureka konverze.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

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

  const { data: items, error } = await supabase
    .from('tipy')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU TIPS FETCH FAIL:", error);
  }

  const safeItems = items || [];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Hardware & PC Tips" : "Hardware a PC Tipy",
    "description": isEn ? "Collection of technical tips and tricks." : "Sbírka technických tipů a triků.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/tipy/${isEn && item.slug_en ? item.slug_en : item.slug}`,
      "name": isEn && item.title_en ? item.title_en : item.title
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
    <div className="guru-tip-archive-wrapper" style={archiveWrapper}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <header style={headerStyle}>
        <div className="header-box" style={headerContentBox}>
          <Lightbulb size={48} color="#a855f7" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }} />
          <h1 className="main-title" style={titleStyle}>
            GURU <span style={{ color: '#a855f7' }}>{isEn ? 'TIPS' : 'TIPY'}</span>
          </h1>
          <p className="main-subtitle" style={subtitleStyle}>
            {isEn 
              ? 'Quick hacks and hardware wisdom for every tech enthusiast.' 
              : 'Rychlé hacky a hardwarová moudra pro každého technického nadšence.'}
          </p>
        </div>
      </header>

      {/* 🔥 PŘIDÁNO: Heureka tlačítka pod hlavičkou 🔥 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <HeurekaButtons isEn={isEn} />
      </div>

      {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
      <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={210} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={250} />
          </div>
      </div>

      <main style={gridContainer}>
        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO TIPS FOUND IN DATABASE' : 'V DATABÁZI NENALEZENY ŽÁDNÉ TIPY'}
          </div>
        ) : (
          <div className="tip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {safeItems.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                  <Link key={item.id} href={isEn ? `/en/tipy/${displaySlug}` : `/tipy/${displaySlug}`} style={{ textDecoration: 'none' }}>
                    <article className="tip-card">
                      <div className="tip-img-container" style={imgContainerStyle}>
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

                      <div className="tip-content-box" style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={categoryBadge}>
                          <Bookmark size={14} /> {isEn ? (item.category_en || 'OPTIMIZATION') : (item.category || 'OPTIMALIZACE')}
                        </div>
                        
                        <h3 className="tip-card-title" style={cardTitleStyle}>{displayTitle}</h3>
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

        <div className="footer-cta-box" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Did these tips help you? Support us by buying games at the best prices." : "Pomohly ti tyto tipy? Podpoř nás nákupem her za ty nejlepší ceny."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn">
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn">
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
          </div>
        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper-fixed">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper-fixed">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tip-card { transition: 0.3s; }
        .tip-card:hover { transform: translateY(-10px); border-color: #a855f7; }
        
        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        .ad-desktop-wrapper-fixed { display: flex; }
        .ad-mobile-wrapper-fixed { display: none; }

        @media (max-width: 768px) {
            .guru-tip-archive-wrapper { padding-top: 80px !important; padding-bottom: 160px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .ad-desktop-wrapper-fixed { display: none !important; }
            .ad-mobile-wrapper-fixed { display: flex !important; }
            .main-title { font-size: 2.2rem !important; }
            .tip-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}

const archiveWrapper = { 
    minHeight: '100vh', 
    backgroundColor: '#0a0b0d', 
    backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', 
    backgroundAttachment: 'fixed', 
    padding: '120px 20px 80px' 
};

const headerStyle = { maxWidth: '1000px', margin: '0 auto 60px', textAlign: 'center' };
const headerContentBox = { background: 'rgba(0,0,0,0.7)', padding: '40px 20px', borderRadius: '32px', backdropFilter: 'blur(12px)', border: '1px solid rgba(168, 85, 247, 0.15)' };
const titleStyle = { fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '-1px', color: '#fff', lineHeight: '0.9' };
const subtitleStyle = { marginTop: '25px', color: '#d1d5db', fontWeight: '600', fontSize: '19px', maxWidth: '600px', margin: '25px auto 0' };
const gridContainer = { maxWidth: '1200px', margin: '0 auto' };
const imgContainerStyle = { width: '100%', height: '220px', overflow: 'hidden', position: 'relative', background: '#000' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 };
const categoryBadge = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '18px', letterSpacing: '1px' };
const cardTitleStyle = { fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', lineHeight: '1.2' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '20px' };
const moreStyle = { color: '#a855f7', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto', textTransform: 'uppercase' };
