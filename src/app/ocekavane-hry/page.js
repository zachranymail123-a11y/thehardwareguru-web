import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Calendar, Monitor, Eye, Zap, ArrowRight, Info, Play, Heart, Flame, ShieldCheck } from 'lucide-react';
import ExpectedGamesGrid from '@/components/ExpectedGamesGrid'; // Pokud ji máš externě, jinak ji definujeme dole

/**
 * GURU EXPECTED GAMES ENGINE V4.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/ocekavane-hry/page.js
 * 🚀 CÍL: 100% zelená v GSC a blesková indexace technických rozborů.
 * 🛡️ FIX 1: Přepsáno na Server Component (SSR) pro maximální SEO autoritu.
 * 🛡️ FIX 2: Implementován Golden Rich standard - ItemList a BreadcrumbList JSON-LD.
 * 🛡️ FIX 3: Zachována interaktivita videí přes vnitřní klientský most.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy (Zlatý standard)
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

  // 1. GURU FETCH: Načtení dat přímo na serveru
  const { data: items, error } = await supabase
    .from('posts')
    .select('*')
    .eq('type', 'expected') 
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU EXPECTED GAMES FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (ItemList pro seznam her)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": isEn ? "Upcoming Game Tech Previews" : "Technické rozbory připravovaných her",
    "description": isEn ? "Detailed technical analysis of upcoming titles." : "Detailní technické analýzy chystaných her.",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}${isEn ? '/en' : ''}/ocekavane-hry/${isEn && item.slug_en ? item.slug_en : item.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Upcoming Games" : "Očekávané hry", "item": `${baseUrl}${isEn ? '/en' : ''}/ocekavane-hry` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={archiveWrapper}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

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
              ? 'Technical breakdowns with live video trailers.' 
              : 'Technické rozbory s interaktivními video ukázkami.'}
          </p>
        </div>
      </header>

      <main style={gridContainer}>
        {/* 🚀 GURU CLIENT BRIDGE: Předáváme data klientské komponentě pro hover videa */}
        <GamesGridClient items={safeItems} isEn={isEn} />

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA (Golden standard) */}
        <div style={{ marginTop: '100px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
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
    </div>
  );
}

// --- 🚀 VNITŘNÍ KLIENTSKÝ MOST (PRO HOVER VIDEA) ---
// Definujeme ji přímo zde pro jednoduchost nasazení v Canvasu
"use client";
function GamesGridClient({ items, isEn }) {
  const [hoveredId, setHoveredId] = React.useState(null);

  return (
    <div style={grid}>
      <style dangerouslySetInnerHTML={{ __html: `
        .expected-card { background: rgba(10, 11, 13, 0.94); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 32px; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); height: 100%; display: flex; flex-direction: column; backdrop-filter: blur(15px); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7); text-decoration: none; position: relative; }
        .expected-card:hover { transform: translateY(-12px) scale(1.02); border-color: #66fcf1; box-shadow: 0 20px 60px rgba(102, 252, 241, 0.2); }
        .expected-card:hover .play-overlay { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        .card-image-wrapper { width: 100%; height: 240px; overflow: hidden; position: relative; background: #000; }
        .play-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: rgba(102, 252, 241, 0.8); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; opacity: 0; transition: 0.3s; z-index: 10; pointer-events: none; }
        .card-video-preview { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 2; }
        .video-badge { position: absolute; top: 20px; right: 20px; background: #ff0055; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; display: flex; align-items: center; gap: 6px; z-index: 5; box-shadow: 0 0 20px rgba(255, 0, 85, 0.4); text-transform: uppercase; letter-spacing: 1px; }
        .desc-text { color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 25px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />
      
      {items.map((item) => {
        const actualSlug = (isEn && item.slug_en) ? item.slug_en : item.slug;
        const displayTitle = (isEn && item.title_en) ? item.title_en : item.title;
        const hasTrailerLink = item.trailer && item.trailer.includes('.mp4');
        const hasVideo = item.trailer || (item.video_id && item.video_id.length > 5);

        return (
          <Link 
            key={item.id} 
            href={isEn ? `/en/ocekavane-hry/${actualSlug.trim()}` : `/ocekavane-hry/${actualSlug.trim()}`} 
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ textDecoration: 'none' }}
          >
            <article className="expected-card">
              <div className="card-image-wrapper">
                {hasTrailerLink && hoveredId === item.id ? (
                  <video className="card-video-preview" src={item.trailer} autoPlay muted loop playsInline />
                ) : (
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                    alt={displayTitle} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: hasVideo ? 0.7 : 0.8 }} 
                  />
                )}
                {hasVideo && <div className="video-badge"><Play size={12} fill="#fff" /> VIDEO</div>}
                {hasVideo && hoveredId !== item.id && (
                  <div className="play-overlay"><Play size={30} fill="currentColor" /></div>
                )}
                <div style={techBadge}><Info size={12} /> {isEn ? 'TECH PREVIEW' : 'TECHNICKÝ ROZBOR'}</div>
              </div>
              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={cardTitleStyle}>{displayTitle}</h3>
                <p className="desc-text">{(isEn ? item.description_en : item.description) || (isEn ? 'Detailed technical analysis.' : 'Detailný technický rozbor.')}</p>
                <div style={moreBtn}>{isEn ? 'VIEW ANALYSIS' : 'ZOBRAZIŤ ROZBOR'} <ArrowRight size={18} /></div>
              </div>
            </article>
          </Link>
        );
      })}
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
const techBadge = { position: 'absolute', top: '20px', left: '20px', background: 'rgba(102, 252, 241, 0.9)', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', zIndex: 10 };
const moreBtn = { color: '#66fcf1', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', textTransform: 'uppercase', letterSpacing: '1px' };
