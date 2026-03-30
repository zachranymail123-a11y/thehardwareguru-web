import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Book, ChevronRight, Search, Heart, Flame, ShieldCheck } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU GLOSSARY ENGINE V2.4 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchor, eliminace hluchých míst + Heureka konverze.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Hardware Glossary & Tech Terms | Guru Base' : 'Hardware Slovník a Technické Pojmy | Guru Databáze';
  const desc = isEn 
    ? 'Comprehensive dictionary of hardware terms, PC specifications and gaming technology explained.' 
    : 'Kompletní slovník hardwarových pojmů, PC specifikací a herních technologií. Rozluštěte technický žargon s Guruem.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/slovnik`,
      languages: {
        'en': `${baseUrl}/en/slovnik`,
        'cs': `${baseUrl}/slovnik`,
        'x-default': `${baseUrl}/slovnik`
      }
    }
  };
}

export default async function SlovnikPage(props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const isEn = props?.isEn === true;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  let dbQuery = supabase
    .from('slovnik')
    .select('*')
    .order('title', { ascending: true });

  const { data: pojmy, error } = await dbQuery;

  if (error) {
    console.error("GURU GLOSSARY FETCH FAIL:", error);
  }

  const allItems = pojmy || [];

  const filteredItems = allItems.filter(item => {
    const title = (isEn && item.title_en ? item.title_en : item.title).toLowerCase();
    return title.includes(query.toLowerCase());
  });

  // Google Golden Rich: ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredItems.slice(0, 20).map((pojem, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}slovnik/${isEn ? (pojem.slug_en || pojem.slug) : pojem.slug}`,
      "name": isEn ? (pojem.title_en || pojem.title) : pojem.title
    }))
  };

  return (
    <div className="guru-glossary-wrapper" style={pageWrapper}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <main className="inner-container" style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header className="header-box" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Book size={64} color="#a855f7" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))' }} />
            <h1 className="title-h1" style={titleStyle}>
              {isEn ? <>GURU <span style={{ color: '#a855f7' }}>GLOSSARY</span></> : <>GURU HARDWARE <span style={{ color: '#a855f7' }}>SLOVNÍK</span></>}
            </h1>
            <p className="subtitle-p" style={{ marginTop: '20px', color: '#d1d5db', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Elite technical knowledge starts here.' : 'Tvé technické znalosti začínají zde.'}
            </p>
        </header>

        <form action={isEn ? "/en/slovnik" : "/slovnik"} method="GET" className="search-container">
          <Search size={24} color="#a855f7" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            name="q"
            type="text" 
            defaultValue={query}
            placeholder={isEn ? "Decode technical terms..." : "Hledat v databázi pojmů..."} 
            className="search-input"
          />
        </form>

        {/* 🔥 PŘIDÁNO: Heureka tlačítka pod vyhledáváním 🔥 */}
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

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO TERMS MATCH YOUR SEARCH' : 'HLEDANÝ POJEM NENALEZEN'}
          </div>
        ) : (
          <div className="term-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredItems.map((pojem) => {
              const displayTitle = (isEn && pojem.title_en) ? pojem.title_en : pojem.title;
              const displayDesc = (isEn && pojem.description_en) ? pojem.description_en : pojem.description;
              const displaySlug = (isEn && pojem.slug_en) ? pojem.slug_en : pojem.slug;

              return (
                    <Link key={pojem.id} href={isEn ? `/en/slovnik/${displaySlug}` : `/slovnik/${displaySlug}`} className="term-card">
                        <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                            {displayTitle}
                        </h2>
                        <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {displayDesc}
                        </p>
                        <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isEn ? 'DECRYPT DETAIL' : 'ZOBRAZIT DETAIL'} <ChevronRight size={18} />
                        </div>
                    </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Want to expand your hardware knowledge? Support the Guru project." : "Chceš dál rozšiřovat své HW znalosti? Podpoř projekt Guru."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
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

      <footer className="footer-box" style={footerStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px', letterSpacing: '-1px' }}>
            {isEn ? 'ABOUT GURU PROJECT' : 'O PROJEKTU'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px', fontWeight: '500' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology and hardcore hardware. Mission: help you build better PCs and understand complex technical systems."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií a hardwarem. Moje mise je jednoduchá: pomáhat ti stavět lepší PC a chápat složité pojmy."
            }
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '50px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK STREAM</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2' }}>DISCORD</a>
          </div>
          
          <p style={{ fontSize: '13px', color: '#444', fontWeight: 'bold', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH DATABASE
          </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .term-card { 
            background: rgba(10, 11, 13, 0.9); 
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 30px; 
            border-radius: 28px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .term-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); 
            transform: translateY(-8px) scale(1.02); 
        }
        .search-container { width: 100%; max-width: 600px; margin: 0 auto 60px; position: relative; }
        .search-input { width: 100%; padding: 18px 25px 18px 60px; background: rgba(0,0,0,0.8); border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 20px; color: #fff; outline: none; font-size: 17px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .search-input:focus { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        
        .social-btn { padding: 12px 24px; text-decoration: none; font-weight: 900; border-radius: 14px; transition: 0.3s; font-size: 12px; display: inline-block; border: 1px solid currentColor; text-transform: uppercase; letter-spacing: 1px; }
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

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-glossary-wrapper { padding-top: 80px !important; padding-bottom: 160px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .header-box { margin-bottom: 40px !important; }
            .title-h1 { font-size: 2.2rem !important; }
            .subtitle-p { font-size: 1rem !important; }
            .search-container { margin-bottom: 40px !important; }
            .search-input { font-size: 15px !important; padding: 15px 20px 15px 50px !important; }
            .term-grid { gap: 20px !important; }
            .term-card { padding: 25px !important; border-radius: 20px !important; }
            .term-card h2 { font-size: 1.3rem !important; }
            .footer-box h2 { font-size: 1.8rem !important; }
        }
      `}} />
    </div>
  );
}

const pageWrapper = { 
  minHeight: '100vh', 
  backgroundColor: '#0a0b0d', 
  backgroundImage: 'url("/bg-guru.png")', 
  backgroundSize: 'cover', 
  backgroundAttachment: 'fixed', 
  color: '#fff',
  display: 'flex',
  flexDirection: 'column'
};

const titleStyle = { 
  fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
  fontWeight: '950', 
  textTransform: 'uppercase', 
  letterSpacing: '-2px', 
  margin: 0,
  lineHeight: '0.9'
};

const footerStyle = { 
  padding: '120px 20px 60px', 
  background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 100%)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};
