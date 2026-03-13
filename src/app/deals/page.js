import React from 'react';
import { 
  Flame, 
  Calendar, 
  Tag, 
  ChevronRight,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU DEALS ENGINE V1.3
 * Cesta: src/app/deals/page.js
 * 🚀 CÍL: Hlavní komponenta pro zobrazení slev z tabulky 'game_deals'.
 * 🛡️ FIX: Přidána globální CTA tlačítka (HRK Affiliate a Podpora Guru) na konec stránky.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn ? 'Best Game Deals & Discounts | The Hardware Guru' : 'Nejlepší herní slevy a akce | The Hardware Guru',
    description: isEn 
      ? 'Curated list of the best PC game deals, discounts, and hardware offers. Verified by Guru.' 
      : 'Ručně vybírané slevy na PC hry a hardware. Ušetřete stovky korun s ověřenými nabídkami od Guru týmu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/deals',
      languages: {
        'en': 'https://thehardwareguru.cz/en/deals',
        'cs': 'https://thehardwareguru.cz/deals',
        'x-default': 'https://thehardwareguru.cz/deals'
      }
    }
  };
}

export default async function DealsPage(props) {
  // isEn přijímáme jako prop, pokud je komponenta volána z /en/deals proxy
  const isEn = props?.isEn === true;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: deals, error } = await supabase
    .from('game_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("GURU DEALS FETCH ERROR:", error);
  }

  const safeDeals = deals || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '50px', background: 'rgba(249, 115, 22, 0.1)' }}>
            <Flame size={16} /> GURU HOT DEALS
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'GAME' : 'HERNÍ'} <span style={{ color: '#f97316', textShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}>{isEn ? 'DEALS' : 'SLEVY'}</span>
          </h1>
          <p style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Hand-picked game keys and hardware discounts. Instant delivery, 100% verified stores.' 
              : 'Ručně vybírané slevy na herní klíče a hardware. Okamžité doručení, 100% ověřené obchody.'}
          </p>
        </header>

        {safeDeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(15, 17, 21, 0.8)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Tag size={48} color="#4b5563" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#d1d5db', textTransform: 'uppercase' }}>
                    {isEn ? 'NO ACTIVE DEALS RIGHT NOW' : 'MOMENTÁLNĚ ŽÁDNÉ AKTIVNÍ SLEVY'}
                </h2>
                <p style={{ color: '#6b7280' }}>
                    {isEn ? 'Check back later for new epic discounts.' : 'Zkuste to později, slevy pravidelně aktualizujeme.'}
                </p>
            </div>
        ) : (
            <div className="deals-grid">
                {safeDeals.map((deal) => {
                    const title = isEn && deal.title_en ? deal.title_en : deal.title;
                    const desc = isEn && deal.description_en ? deal.description_en : deal.description_cs;
                    const price = isEn && deal.price_en ? deal.price_en : deal.price_cs;
                    const fallbackImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000';

                    return (
                        <a key={deal.id} href={deal.affiliate_link || '#'} target="_blank" rel="nofollow sponsored" className="deal-card">
                            <div className="deal-image-wrapper">
                                <img src={deal.image_url || fallbackImg} alt={title} className="deal-image" />
                                <div className="deal-price-badge">
                                    {price || (isEn ? 'Check Price' : 'Ověřit cenu')}
                                </div>
                            </div>
                            <div className="deal-content">
                                <div className="deal-date">
                                    <Calendar size={12} /> {new Date(deal.created_at).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                                </div>
                                <h3 className="deal-title">{title}</h3>
                                <p className="deal-desc">{desc}</p>
                                <div className="deal-cta">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={16} /> {isEn ? 'GET DEAL' : 'ZÍSKAT SLEVU'}</span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        )}

        {/* 🚀 GLOBÁLNÍ CTA TLAČÍTKA (Affiliate & Podpora) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Podpoř naši databázi nákupem her nebo příspěvkem."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .deals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        
        .deal-card { display: flex; flex-direction: column; background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .deal-card:hover { transform: translateY(-8px); border-color: rgba(249, 115, 22, 0.4); box-shadow: 0 20px 50px rgba(249, 115, 22, 0.2); }
        
        .deal-image-wrapper { position: relative; width: 100%; height: 220px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .deal-image { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .deal-card:hover .deal-image { transform: scale(1.05); }
        
        .deal-price-badge { position: absolute; bottom: 15px; right: 15px; background: #f97316; color: #fff; padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 16px; text-transform: uppercase; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        
        .deal-content { padding: 30px; display: flex; flex-direction: column; flex: 1; }
        .deal-date { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; }
        .deal-title { margin: 0 0 10px 0; font-size: 1.4rem; font-weight: 950; color: #fff; line-height: 1.2; text-transform: uppercase; }
        .deal-desc { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; margin: 0 0 25px 0; flex: 1; }
        
        .deal-cta { display: flex; align-items: center; justify-content: space-between; color: #f97316; font-weight: 950; font-size: 14px; text-transform: uppercase; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; transition: 0.3s; }
        .deal-card:hover .deal-cta { color: #fff; }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        @media (max-width: 768px) {
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
        }
      `}} />
    </div>
  );
}
