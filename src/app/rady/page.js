import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { PenTool, ChevronRight, Zap, ShieldCheck, Heart, Flame, Info, Monitor } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU GUIDES ARCHIVE ENGINE V2.2 (MOBILE OPTIMIZED & ADS SEPARATION)
 * 🚀 CÍL: 100% monetizace technických návodů a perfektní mobilní UX.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  const title = isEn ? 'Hardware Guru Guides | Technical Knowledge Base' : 'Guru Hardware Rady | Technická základna';
  const desc = isEn 
    ? 'Field-tested guides, technical solutions and hardware tips for every PC enthusiast.' 
    : 'Prověřené návody z praxe, technická řešení a hardwarové tipy pro každého PC nadšence.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/rady`,
      languages: {
        'en': `${baseUrl}/en/rady`,
        'cs': `${baseUrl}/rady`,
        'x-default': `${baseUrl}/rady`
      }
    }
  };
}

export default async function RadyArchivePage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: items, error } = await supabase
    .from('rady')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU GUIDES FETCH FAIL:", error);
  }

  const safeItems = items || [];

  // Google Golden Rich: ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": safeItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}rady/${isEn ? (item.slug_en || item.slug) : item.slug}`,
      "name": isEn ? (item.title_en || item.title) : item.title
    }))
  };

  return (
    <div className="guru-archive-wrapper" style={pageWrapper}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .rada-card { 
            background: rgba(10, 11, 13, 0.9); 
            backdrop-filter: blur(15px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 35px; 
            border-radius: 28px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .rada-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); 
            transform: translateY(-8px) scale(1.02); 
        }
        .icon-box {
            background: rgba(168, 85, 247, 0.1); 
            width: fit-content; 
            padding: 12px; 
            border-radius: 15px; 
            margin-bottom: 25px;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-archive-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .header-box { margin-bottom: 30px !important; }
            .title-h1 { font-size: 2.2rem !important; }
            .subtitle-p { font-size: 1rem !important; }
            .rada-grid { gap: 20px !important; }
            .rada-card { padding: 25px !important; border-radius: 20px !important; }
            .rada-card h2 { font-size: 1.2rem !important; }
            .footer-box { padding: 60px 20px !important; }
            .footer-box h2 { font-size: 1.8rem !important; }
        }
      `}} />

      <main style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', width: '100%', flex: '1 0 auto' }}>
        <header className="header-box" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
               <ShieldCheck size={56} color="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }} />
               <Zap size={56} color="#eab308" style={{ filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.4))' }} />
            </div>
            <h1 className="title-h1" style={titleStyle}>
              {isEn ? <>PRACTICAL <span style={{ color: '#a855f7' }}>GUIDES</span></> : <>PRAKTICKÉ <span style={{ color: '#a855f7' }}>RADY</span></>}
            </h1>
            <p className="subtitle-p" style={{ marginTop: '20px', color: '#d1d5db', fontWeight: '700', fontSize: '20px' }}>
              {isEn ? 'Field-tested tips and technical solutions for every geek.' : '🛠️ Tipy a triky z praxe. Od diagnostiky až po čištění PC.'}
            </p>
        </header>

        {/* 🔥 SEZNAM AD #1: TOP LEADERBOARD (STRIKTNÍ SEPARACE) */}
        <div style={{ marginBottom: '60px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#4b5563', fontWeight: 'bold' }}>
            {isEn ? 'NO GUIDES FOUND IN DATABASE' : 'V DATABÁZI NENALEZENY ŽÁDNÉ RADY'}
          </div>
        ) : (
          <div className="rada-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
            {safeItems.map((rada, index) => {
              const displayTitle = (isEn && rada.title_en) ? rada.title_en : rada.title;
              const displayDesc = (isEn && rada.description_en) ? rada.description_en : rada.description;
              const displaySlug = (isEn && rada.slug_en) ? rada.slug_en : rada.slug;

              return (
                <React.Fragment key={rada.id}>
                    <Link href={isEn ? `/en/rady/${displaySlug}` : `/rady/${displaySlug}`} className="rada-card">
                        <div className="icon-box">
                            <PenTool size={28} color="#a855f7" />
                        </div>
                        <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>
                            {displayTitle}
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {displayDesc}
                        </p>
                        <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isEn ? 'VIEW GUIDE' : 'ZOBRAZIT NÁVOD'} <ChevronRight size={18} />
                        </div>
                    </Link>

                    {/* 🔥 SEZNAM AD #2: GRID INJECTION (POUZE MOBIL) */}
                    {index === 1 && (
                        <div className="ad-mobile-wrapper" style={{ margin: '10px 0' }}>
                            <SeznamAd zoneId={408651} width={300} height={250} />
                        </div>
                    )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* 🚀 GURU GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Did these guides help you? Support us by buying games at the best prices." : "Pomohly ti tyto rady? Podpoř nás nákupem her za ty nejlepší ceny."}
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

      <footer className="footer-box" style={footerStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '30px', textTransform: 'uppercase', fontWeight: '950', fontSize: '36px' }}>
            {isEn ? 'ABOUT GURU' : 'O MNĚ'}
          </h2>
          <p style={{ lineHeight: '1.9', fontSize: '18px', color: '#e5e7eb', marginBottom: '45px' }}>
            {isEn 
              ? "Welcome to The Hardware Guru! I am your guide to modern technology, hardcore hardware, and gaming. This guide section was created so that you too can become the master of your hardware."
              : "Vítej ve světě The Hardware Guru! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. Tato sekce rad vznikla proto, aby ses i ty stal pánem svého hardwaru."
            }
          </p>
          <p style={{ fontSize: '13px', color: '#444', fontWeight: '900', letterSpacing: '2px' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE TECH BASE
          </p>
        </div>
      </footer>
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
  lineHeight: '1'
};

const footerStyle = { 
  padding: '120px 20px 60px', 
  background: 'rgba(0, 0, 0, 0.9)', 
  borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
  textAlign: 'center', 
  marginTop: '80px' 
};
