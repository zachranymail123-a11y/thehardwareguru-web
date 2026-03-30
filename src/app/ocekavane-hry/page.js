import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Monitor, Info, Play, Heart, Flame, ShieldCheck, ArrowRight, Zap, CalendarDays } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU EXPECTED GAMES ARCHIVE - V5.9 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchor, eliminace hluchých míst + Heureka konverze.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Expected Hardware Hits | Game Tech Previews' : 'Očekávané pecky | Guru Technické Preview';
  const desc = isEn 
    ? 'In-depth technical analysis and benchmark predictions for the most anticipated upcoming games.' 
    : 'Hloubkové technické rozbory a odhady výkonu pro nejočekávanější připravované herní hity.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/ocekavane-hry`,
      languages: {
        'en': `${baseUrl}/en/ocekavane-hry`,
        'cs': `${baseUrl}/ocekavane-hry`,
        'x-default': `${baseUrl}/ocekavane-hry`
      }
    }
  };
}

export default async function ExpectedGamesArchive(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: items, error } = await supabase
    .from('posts')
    .select('*')
    .eq('type', 'expected') 
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU EXPECTED GAMES FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // Google Golden Rich: ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}ocekavane-hry/${isEn ? (item.slug_en || item.slug) : item.slug}`,
      "name": isEn ? (item.title_en || item.title) : item.title
    }))
  };

  return (
    <div className="guru-archive-wrapper" style={{ minHeight: '100vh', padding: '120px 20px 160px', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <header style={headerStyle}>
        <div className="header-box" style={headerContentBox}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
            <Monitor size={48} color="#66fcf1" style={{ filter: 'drop-shadow(0 0 10px rgba(102, 252, 241, 0.5))' }} />
          </div>
          <h1 className="title-h1" style={titleStyle}>
            {isEn ? <>EXPECTED <span style={{ color: '#66fcf1' }}>GAMES</span></> : <>OČEKÁVANÉ <span style={{ color: '#66fcf1' }}>HRY</span></>}
          </h1>
          <p className="subtitle-p" style={subtitleStyle}>
            {isEn ? 'Technical breakdowns and next-gen predictions.' : 'Technické rozbory a predikce výkonu herní budoucnosti.'}
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
        <div className="archive-grid" style={grid}>
          {safeItems.map((item) => {
            const actualSlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
            const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
            const hasVideo = item.trailer || (item.video_id && item.video_id.length > 5);
            const hasMp4 = item.trailer && item.trailer.includes('.mp4');

            return (
                <Link key={item.id} href={isEn ? `/en/ocekavane-hry/${actualSlug}` : `/ocekavane-hry/${actualSlug}`} style={{ textDecoration: 'none' }}>
                  <article className="expected-card">
                    <div className="card-image-wrapper">
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                        alt={displayTitle} 
                        className="card-poster"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: '0.3s' }} 
                      />
                      {hasMp4 && (
                        <video className="card-video-hover" src={item.trailer} muted loop playsInline autoPlay />
                      )}
                      {hasVideo && <div className="video-badge"><Play size={12} fill="#fff" /> VIDEO</div>}
                      <div style={techBadge}><Zap size={12} /> {isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}</div>
                    </div>
                    
                    <div className="card-content" style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 className="card-title" style={cardTitleStyle}>{displayTitle}</h3>
                      {item.release_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '12px', fontWeight: '950', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          <CalendarDays size={14} />
                          {isEn ? 'RELEASE: ' : 'VYDÁNÍ: '} {new Date(item.release_date).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                        </div>
                      )}
                      <p className="desc-text" style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {(isEn ? item.description_en : item.description) || (isEn ? 'Detailed technical analysis.' : 'Detailní technický rozbor.')}
                      </p>
                      <div style={moreBtn}>{isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIT ROZBOR'} <ArrowRight size={18} /></div>
                    </div>
                  </article>
                </Link>
            );
          })}
        </div>

        <div className="footer-silo" style={{ marginTop: '100px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Want to see more hardware tests? Support the Guru project." : "Chceš vidět další technické rozbory? Podpoř projekt Guru."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </Link>
          </div>
        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
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
        .card-image-wrapper { width: 100%; height: 240px; overflow: hidden; position: relative; background: #000; }
        .card-video-hover { 
            width: 100%; height: 100%; object-fit: cover; 
            position: absolute; top: 0; left: 0; z-index: 2; 
            display: none; opacity: 0; transition: opacity 0.3s;
        }
        .expected-card:hover .card-video-hover { display: block; opacity: 1; }
        .video-badge { position: absolute; top: 20px; right: 20px; background: #ff0055; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; display: flex; align-items: center; gap: 6px; z-index: 5; box-shadow: 0 0 20px rgba(255, 0, 85, 0.4); text-transform: uppercase; letter-spacing: 1px; }
        
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }

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

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .header-box { padding: 30px 15px !important; border-radius: 24px !important; }
            .title-h1 { font-size: 2.2rem !important; }
            .subtitle-p { font-size: 1rem !important; margin-top: 15px !important; }
            .archive-grid { gap: 20px !important; }
            .card-image-wrapper { height: 180px !important; }
            .expected-card { border-radius: 24px !important; }
            .card-content { padding: 20px !important; }
            .card-title { font-size: 1.3rem !important; }
            .footer-silo { margin-top: 60px !important; padding-top: 30px !important; }
        }
      `}} />
    </div>
  );
}

const headerStyle = { maxWidth: '1000px', margin: '0 auto 40px', textAlign: 'center' };
const headerContentBox = { background: 'rgba(0,0,0,0.7)', padding: '50px 30px', borderRadius: '40px', border: '1px solid rgba(102, 252, 241, 0.15)', backdropFilter: 'blur(10px)' };
const titleStyle = { fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', margin: 0, letterSpacing: '-2px', lineHeight: 1 };
const subtitleStyle = { marginTop: '25px', color: '#d1d5db', fontWeight: '700', fontSize: '22px' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' };
const cardTitleStyle = { fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', lineHeight: '1.1' };
const techBadge = { position: 'absolute', top: '20px', left: '20px', background: 'rgba(102, 252, 241, 0.9)', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', zIndex: 10 };
const moreBtn = { color: '#66fcf1', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', textTransform: 'uppercase', letterSpacing: '1px' };
