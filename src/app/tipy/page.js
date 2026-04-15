import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play, Bookmark, Heart, Flame, ShieldCheck, ShoppingCart, AlertTriangle, Gamepad2 } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons';

/**
 * GURU TIP ARCHIVE ENGINE V2.6 (STRICT BACKUP FIX + AWAIT HEADERS FIX)
 * 🚀 CÍL: Fix Error 500 (await headers) + V10 Heureka Hard-Lock + Amazon EN. Kompletní kód.
 */

export const runtime = "nodejs";
export const revalidate = 0; // 🔥 Vypnutí cache pro okamžitou detekci jazyka

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  let isEn = props?.isEn === true;
  try {
      const headersList = await headers();
      const fullUrl = headersList.get('x-url') || headersList.get('referer') || headersList.get('x-invoke-path') || "";
      if (fullUrl.includes('/en/')) isEn = true;
  } catch (e) {}

  const title = isEn ? 'Hardware Guru Tips | Tech Knowledge Base' : 'Guru Hardware Tipy | Databáze moudrosti';
  const desc = isEn 
    ? 'Quick hacks, performance optimizations and hardware wisdom for every tech enthusiast.' 
    : 'Rychlé hacky, optimalizace výkonu a hardwarová moudra pro každého technického nadšence.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: isEn ? `${baseUrl}/en/tipy` : `${baseUrl}/tipy`,
      languages: { 'en': `${baseUrl}/en/tipy`, 'cs': `${baseUrl}/tipy` }
    }
  };
}

export default async function TipyArchivePage(props) {
  let isEn = props?.isEn === true;
  try {
      const headersList = await headers();
      const fullUrl = headersList.get('x-url') || headersList.get('referer') || headersList.get('x-invoke-path') || "";
      if (fullUrl.includes('/en/')) isEn = true;
  } catch (e) {}

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: items, error } = await supabase
    .from('tipy')
    .select('*')
    .order('created_at', { ascending: false });

  const safeItems = items || [];

  // 🔥 OPRAVA AFFILIATE LINKŮ (Amazon pro EN, V10 Hard-Lock Heureka pro CZ)
  const amazonLink = `https://www.amazon.com/s?k=gaming+pc+accessories&tag=thehardware07-20&ascsubtag=v10-tipy-archive`;
  const smartyLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz`)}`;
  const heurekaLink = `https://www.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Tips%20archive`;

  return (
    <div className="guru-tip-archive-wrapper" style={archiveWrapper}>
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

      {/* 🔥 GURU AFFILIATE BOMB 🔥 */}
      <div className="affiliate-cta-grid" style={{ maxWidth: '1000px', margin: '0 auto 40px' }}>
          <div className="affiliate-col">
              <div className="affiliate-btn-wrap">
                  {isEn ? (
                      <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                          <ShoppingCart size={16} /> Check Hardware Deals on Amazon
                      </a>
                  ) : (
                      <>
                          <a href={smartyLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                              <ShoppingCart size={16} /> Smarty.cz
                          </a>
                          <a 
                              href={heurekaLink} 
                              data-trixam-positionid="276026" 
                              data-trixam-codetype="link" 
                              target="_blank" 
                              rel="nofollow sponsored" 
                              className="guru-buy-winner-btn heureka-btn heureka-hn-link v10-hl-btn"
                          >
                              <ShoppingCart size={16} /> Heureka.cz
                          </a>
                      </>
                  )}
              </div>
          </div>
      </div>

      {/* 🔥 GURU TOOLS (KALKULAČKY) 🔥 */}
      <div className="guru-tools-small-grid" style={{ maxWidth: '1000px', margin: '0 auto 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="tool-btn-small purple-link"><AlertTriangle size={16} /> {isEn ? 'Bottleneck' : 'Bottleneck'}</a>
          <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="tool-btn-small cyan-link"><Gamepad2 size={16} /> {isEn ? 'FPS Test' : 'FPS Test'}</a>
      </div>

      {!isEn && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
              <div className="v10-hl-container" data-subid="v10-tipy-archive-widget" data-cat="tips">
                  <HeurekaButtons isEn={false} positionId="276026" />
              </div>
          </div>
      )}

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
            {isEn ? 'NO TIPS FOUND' : 'ŽÁDNÉ TIPY NENALEZENY'}
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
                        <img src={item.image_url} alt={displayTitle} style={imgStyle} loading="lazy" />
                      </div>
                      <div className="tip-content-box" style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={categoryBadge}><Bookmark size={14} /> {isEn ? (item.category_en || 'OPTIMIZATION') : (item.category || 'OPTIMALIZACE')}</div>
                        <h3 style={cardTitleStyle}>{displayTitle}</h3>
                        <p style={cardDescStyle}>{displayDesc}</p>
                        <div style={moreStyle}>{isEn ? 'LEARN MORE' : 'ZJISTIT VÍCE'} <ChevronRight size={16} /></div>
                      </div>
                    </article>
                  </Link>
              );
            })}
          </div>
        )}

        <div className="footer-cta-box" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <Link href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPORIT GURU'}</Link>
          </div>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tip-card { transition: 0.3s; background: rgba(15, 17, 21, 0.95); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); display: flex; flexDirection: column; height: 100%; }
        .tip-card:hover { transform: translateY(-10px); border-color: #a855f7; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .video-badge { position: absolute; top: 15px; right: 15px; background: #ff0000; color: #fff; padding: 5px 12px; border-radius: 50px; font-size: 10px; font-weight: 900; display: flex; align-items: center; gap: 5px; z-index: 10; }
        
        .affiliate-cta-grid { background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; box-sizing: border-box; }
        .affiliate-btn-wrap { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 15px; text-transform: uppercase; transition: 0.3s; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; width: 100%; max-width: 400px; }

        .tool-btn-small { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 12px; font-weight: 950; text-transform: uppercase; text-decoration: none; font-size: 12px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .purple-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
        .cyan-link { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border-color: rgba(102, 252, 241, 0.2); }
        .tool-btn-small:hover { transform: translateY(-2px); filter: brightness(1.2); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; transition: 0.3s; text-transform: uppercase; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; transition: 0.3s; text-transform: uppercase; background: #eab308; color: #000; }

        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-tip-archive-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 2.2rem !important; }
            .tip-grid { grid-template-columns: 1fr !important; }
            .affiliate-btn-wrap { flex-direction: column; }
            .guru-buy-winner-btn { max-width: 100%; }
        }
      `}} />
    </div>
  );
}

const archiveWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '120px 20px 160px' };
const headerStyle = { maxWidth: '1000px', margin: '0 auto 40px', textAlign: 'center' };
const headerContentBox = { background: 'rgba(0,0,0,0.7)', padding: '40px 20px', borderRadius: '32px', backdropFilter: 'blur(12px)', border: '1px solid rgba(168, 85, 247, 0.15)' };
const titleStyle = { fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', color: '#fff', lineHeight: '0.9' };
const subtitleStyle = { marginTop: '25px', color: '#d1d5db', fontWeight: '600', fontSize: '19px', maxWidth: '600px', margin: '25px auto 0' };
const gridContainer = { maxWidth: '1200px', margin: '0 auto' };
const imgContainerStyle = { width: '100%', height: '220px', overflow: 'hidden', position: 'relative' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const categoryBadge = { display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '18px' };
const cardTitleStyle = { fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase' };
const cardDescStyle = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' };
const moreStyle = { color: '#a855f7', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto' };
