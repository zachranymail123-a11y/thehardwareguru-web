import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Settings, ChevronRight, Smartphone, Monitor, Heart, Flame, ShieldCheck } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU TWEAKS ARCHIVE ENGINE V2.3 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchor, eliminace hluchých míst + Heureka konverze.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Latest Guru Tweaks | System Performance & FPS Boost' : 'Nejnovější Guru Tweaky | Výkon a FPS';
  const desc = isEn 
    ? 'Deep system modifications, Windows optimizations and hardware tweaks for maximum stability.' 
    : 'Hloubkové modifikace systému, optimalizace Windows a hardwarové tweaky pro maximální FPS a stabilitu.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/tweaky`,
      languages: {
        'en': `${baseUrl}/en/tweaky`,
        'cs': `${baseUrl}/tweaky`,
        'x-default': `${baseUrl}/tweaky`
      }
    }
  };
}

export default async function TweaksArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: items, error } = await supabase
    .from('tweaky')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU TWEAKS FETCH FAIL:", error);
  }

  const safeItems = items || [];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "System & Gaming Tweaks" : "Systémové a herní tweaky",
    "description": isEn ? "Collection of system modifications for better FPS." : "Sbírka systémových modifikací pro lepší FPS.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/tweaky/${isEn && item.slug_en ? item.slug_en : item.slug}`,
      "name": isEn && item.title_en ? item.title_en : item.title
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Tweaks" : "Tweaky", "item": `${baseUrl}${isEn ? '/en' : ''}/tweaky` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div className="guru-tweaks-archive-wrapper" style={archiveWrapper}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main className="inner-container" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header className="header-box" style={headerStyle}>
          <h1 className="main-title" style={titleStyle}>
            GURU <span style={{ color: '#eab308' }}>{isEn ? 'TWEAKS' : 'TWEAKY'}</span>
          </h1>
          <p className="main-subtitle" style={subtitleStyle}>
            {isEn 
              ? 'Deep system modifications for maximum FPS and stability.' 
              : 'Hloubkové modifikace systému pro maximální FPS a stabilitu tvé mašiny.'}
          </p>
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

        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO TWEAKS FOUND' : 'ŽÁDNÉ TWEAKY NENALEZENY'}
          </div>
        ) : (
          <div className="tweak-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {safeItems.map((item) => {
              const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
              const displayDesc = (isEn && item.description_en) ? item.description_en : item.description;
              const displaySlug = (isEn && item.slug_en) ? item.slug_en : item.slug;

              return (
                  <Link key={item.id} href={isEn ? `/en/tweaky/${displaySlug}` : `/tweaky/${displaySlug}`} style={{ textDecoration: 'none' }}>
                    <article className="tweak-card">
                      <div className="tweak-img-box" style={imageBox}>
                        <img 
                          src={item.image_url && item.image_url !== 'EMPTY' ? item.image_url : 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                          alt={displayTitle} 
                          style={imgStyle} 
                          loading="lazy"
                        />
                      </div>

                      <div style={categoryBadge}>
                        <Settings size={14} /> {isEn ? (item.category_en || 'SYSTEM') : (item.category || 'SYSTÉM')}
                      </div>

                      <h3 className="tweak-title" style={cardTitleStyle}>{displayTitle}</h3>
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

        <div className="footer-cta-box" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Want even more performance? Support us and get the best deals." : "Chceš ještě víc výkonu? Podpoř nás a získej ty nejlepší nabídky."}
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
        .tweak-card { 
            background: rgba(17, 19, 24, 0.85); 
            border: 1px solid rgba(234, 179, 8, 0.2); 
            border-radius: 32px; 
            padding: 30px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            height: 100%;
            display: flex; 
            flex-direction: column; 
            text-decoration: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .tweak-card:hover { 
            transform: translateY(-8px); 
            border-color: #eab308; 
            box-shadow: 0 20px 60px rgba(234, 179, 8, 0.2); 
        }

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

        .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; font-size: 15px; text-transform: uppercase; text-decoration: none !important; transition: 0.3s; }
        .guru-support-btn { background: #eab308; color: #000 !important; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }

        @media (max-width: 768px) {
            .guru-tweaks-archive-wrapper { padding-top: 80px !important; padding-bottom: 160px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; }
            .ad-desktop-wrapper-fixed { display: none !important; }
            .ad-mobile-wrapper-fixed { display: flex !important; }
            .main-title { font-size: 2.2rem !important; }
            .tweak-grid { grid-template-columns: 1fr !important; }
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

const headerStyle = { maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' };
const titleStyle = { fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '-1px', color: '#fff', lineHeight: '0.9' };
const subtitleStyle = { marginTop: '20px', color: '#d1d5db', fontWeight: '600', fontSize: '18px' };
const gridContainer = { maxWidth: '1200px', margin: '0 auto' };
const imageBox = { height: '200px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)', background: '#000' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 };
const categoryBadge = { display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' };
const cardTitleStyle = { fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', lineHeight: '1.2' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '20px' };
const moreStyle = { color: '#eab308', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto', textTransform: 'uppercase' };
