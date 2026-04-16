import React from 'react';
import { 
  Flame, 
  Calendar, 
  ChevronRight,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';
import GameSearchWidget from '../../components/GameSearchWidget'; // 🔥 PŘIDANÝ IMPORT VYHLEDÁVAČE

/**
 * GURU DEALS ENGINE V1.6 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace slevového portálu a perfektní mobilní zobrazení.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn ? 'Best Game Deals & Discounts | The Hardware Guru' : 'Nejlepší herní slevy a akce | The Hardware Guru',
    alternates: {
      canonical: 'https://thehardwareguru.cz/deals',
      languages: { 'en': 'https://thehardwareguru.cz/en/deals', 'cs': 'https://thehardwareguru.cz/deals' }
    }
  };
}

export default async function DealsPage(props) {
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: deals, error } = await supabase
    .from('game_deals')
    .select('*')
    .order('created_at', { ascending: false });

  const safeDeals = deals || [];

  return (
    <div className="guru-deals-page" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="deals-badge">
            <Flame size={16} /> GURU HOT DEALS
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'GAME' : 'HERNÍ'} <span style={{ color: '#f97316', textShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}>{isEn ? 'DEALS' : 'SLEVY'}</span>
          </h1>
          <p className="desc-p" style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn ? 'Hand-picked game keys and hardware discounts.' : 'Ručně vybírané slevy na herní klíče a hardware.'}
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

        {safeDeals.length === 0 ? (
            /* 🔥 TADY JE TEN TVŮJ NOVÝ HERNÍ VYHLEDÁVAČ MÍSTO PRÁZDNÉHO BOXU 🔥 */
            <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
                <GameSearchWidget isEn={isEn} />
            </div>
        ) : (
            <div className="deals-grid">
                {safeDeals.map((deal, index) => {
                    const title = isEn && deal.title_en ? deal.title_en : deal.title;
                    const desc = isEn && deal.description_en ? deal.description_en : deal.description_cs;
                    const price = isEn && deal.price_en ? deal.price_en : deal.price_cs;
                    const fallbackImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000';

                    return (
                        <React.Fragment key={deal.id}>
                            <a href={deal.affiliate_link || '#'} target="_blank" rel="nofollow sponsored" className="deal-card">
                                <div className="deal-image-wrapper">
                                    <img src={deal.image_url || fallbackImg} alt={title} className="deal-image" />
                                    <div className="deal-price-badge">{price || (isEn ? 'Price' : 'Cena')}</div>
                                </div>
                                <div className="deal-content">
                                    <div className="deal-date"><Calendar size={12} /> {new Date(deal.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}</div>
                                    <h3 className="deal-title">{title}</h3>
                                    <p className="deal-desc">{desc}</p>
                                    <div className="deal-cta">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={16} /> {isEn ? 'GET DEAL' : 'ZÍSKAT SLEVU'}</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </a>

                            {/* 🔥 SEZNAM AD #2: GRID INJECTION (POUZE MOBIL) */}
                            {index === 2 && (
                                <div className="ad-mobile-wrapper" style={{ padding: '10px 0' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        )}

        <div className="footer-support-section" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Support Guru by checking these offers." : "Podpoř Guru nákupem skrze tyto odkazy."}
          </h4>
          <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            {/* 🔥 ORANŽOVÉ TLAČÍTKO ODSTRANĚNO 🔥 */}
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn">
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .deals-badge { display: inline-flex; align-items: center; gap: 8px; color: #f97316; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 50px; background: rgba(249, 115, 22, 0.1); margin-bottom: 20px; }
        .deals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        .deal-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; text-decoration: none; transition: 0.3s; height: 100%; }
        .deal-card:hover { transform: translateY(-8px); border-color: rgba(249, 115, 22, 0.4); }
        .deal-image-wrapper { position: relative; width: 100%; height: 220px; overflow: hidden; }
        .deal-image { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .deal-price-badge { position: absolute; bottom: 15px; right: 15px; background: #f97316; color: #fff; padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 16px; text-transform: uppercase; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        .deal-content { padding: 30px; display: flex; flex-direction: column; flex: 1; }
        .deal-date { font-size: 11px; color: #6b7280; font-weight: 900; display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
        .deal-title { margin: 0 0 10px 0; font-size: 1.4rem; font-weight: 950; color: #fff; line-height: 1.2; text-transform: uppercase; }
        .deal-desc { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; margin: 0 0 25px 0; flex: 1; }
        .deal-cta { display: flex; align-items: center; justify-content: space-between; color: #f97316; font-weight: 950; font-size: 14px; text-transform: uppercase; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; font-size: 15px; text-transform: uppercase; text-decoration: none; transition: 0.3s; background: #eab308; color: #000; }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-deals-page { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.8rem !important; }
            .desc-p { font-size: 1rem !important; }
            .deals-grid { gap: 15px !important; grid-template-columns: 1fr !important; }
            .deal-content { padding: 20px !important; }
            .deal-title { font-size: 1.2rem !important; }
            .footer-support-section { padding-top: 30px !important; margin-top: 50px !important; }
            .footer-btns { flex-direction: column; }
            .guru-support-btn { width: 100%; }
        }
      `}} />
    </div>
  );
}
