import React from 'react';
import { ChevronLeft, ShieldCheck, Heart, Flame, ShoppingCart, Info, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import Link from 'next/link';

/**
 * GURU SUPPORT ENGINE V2.9 - ULTIMATE CENTERED DESIGN
 * 🚀 CÍL: Vše v jedné kartě, centrováno na střed, Partneři uvnitř panelu.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const isEn = searchParams?.lang === 'en';
  return {
    title: isEn ? 'Support Hardware Guru | VIP' : 'Podpořte Hardware Guru | VIP',
    description: 'Pomozte nám vybudovat nejlepší hardwarovou databázi.',
    alternates: { canonical: `${baseUrl}/support` }
  };
}

export default async function SupportPage(props) {
  const searchParams = await props.searchParams;
  const isEn = searchParams?.lang === 'en';

  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";
  const hrkLink = "https://www.hrkgame.com/en/#a_aid=TheHardwareGuru";

  return (
    <div className="guru-support-wrapper" style={containerStyle}>
      {/* GURU SPA SWG ATTACHMENT */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var attempts = 0;
          var attachTimer = setInterval(function() {
            attempts++;
            if (window.swgSubscriptions) {
              var btn = document.getElementById('support-page-swg-btn');
              if (btn && !btn.querySelector('iframe')) {
                window.swgSubscriptions.attachButton(btn, "contribution");
              }
              clearInterval(attachTimer);
            } else if (attempts > 30) {
              clearInterval(attachTimer);
            }
          }, 500);
        })();
      ` }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .guru-support-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 100vh; }
        .guru-support-card { 
            background: rgba(17, 19, 24, 0.95); 
            backdrop-filter: blur(15px); 
            border: 2px solid rgba(234, 179, 8, 0.3); 
            border-radius: 32px; 
            padding: 45px 40px; 
            maxWidth: 500px; 
            width: 100%; 
            textAlign: center; 
            box-shadow: 0 30px 70px rgba(0,0,0,0.8); 
            position: relative;
            z-index: 10;
        }
        .guru-btn-hover { transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .guru-btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); border-color: #eab308; }
        
        .method-btn { 
            display: flex; alignItems: center; justifyContent: center; gap: 14px; 
            padding: 18px 24px; borderRadius: 18px; textDecoration: none; 
            fontWeight: 950; fontSize: 14px; marginBottom: 10px; width: 100%; 
            boxSizing: border-box; border: 1px solid rgba(255, 255, 255, 0.05); 
            color: #fff; textTransform: uppercase; background-color: #161920;
        }

        .guru-affiliate-cta { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
            margin-top: 15px; 
            box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
        }

        /* 🔥 PARTNER BUTTON UVNITŘ PANELU */
        .partner-panel-btn {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(102, 252, 241, 0.1) 100%);
            border: 1px solid rgba(168, 85, 247, 0.4) !important;
            color: #fff !important;
        }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; margin-bottom: 40px; }
        .ad-mobile-wrapper { display: none; width: 100%; margin-bottom: 30px; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }

        @media (max-width: 768px) {
            .guru-support-wrapper { padding: 100px 15px 140px !important; }
            .guru-support-card { padding: 30px 20px !important; border-radius: 24px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; }
            .main-h1 { font-size: 2rem !important; }
        }
      `}} />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#eab308', fontSize: '13px', letterSpacing: '3px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? "PROJECT SUPPORT" : "PODPORA PROJEKTU"}</h2>
        <h1 className="main-h1" style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '950', margin: '10px 0', textTransform: 'uppercase' }}>{isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span></h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px', lineHeight: '1.6' }}>{isEn ? "Contributions go directly to community development." : "Příspěvky jdou přímo na propagaci webu a rozvoj největší HW databáze."}</p>
      </header>

      {/* --- 🚀 TOP AD SLOT --- */}
      <div className="ad-desktop-wrapper">
          <SeznamAd zoneId={408654} width={970} height={210} />
      </div>
      <div className="ad-mobile-wrapper">
          <SeznamAd zoneId={408651} width={300} height={250} />
      </div>

      {/* --- 📦 HLAVNÍ PANEL (VŠE UVNITŘ) --- */}
      <div className="guru-support-card">
        
        {/* VYCENTROVANÝ QR KÓD */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '20px', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>{isEn ? "Quick QR payment" : "Rychlá QR platba (CZ)"}</h3>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <img src="/qr-platba.png" alt="QR" style={{ width: '200px', height: '200px', display: 'block' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* GOOGLE SUBSCRIBE */}
            <div className="guru-btn-hover method-btn" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>{isEn ? 'Google Subscribe' : 'Přispět s Googlem'}</span>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}><button id="support-page-swg-btn" swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button></div>
            </div>

            {/* STRIPE */}
            <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn-hover method-btn">💳 {isEn ? "Card / Apple Pay" : "Karta / Apple Pay"}</a>

            {/* REVOLUT */}
            <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn-hover method-btn"><span style={{ background: '#fff', color: '#0075eb', width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>R</span> Revolut.me</a>

            {/* 🚀 NAŠI PARTNEŘI - NYNÍ UVNITŘ PANELU */}
            <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-btn-hover method-btn partner-panel-btn">
                <Award size={18} color="#eab308" /> <span>{isEn ? "Our Partners" : "Naši partneři"}</span>
            </Link>
        </div>

        <div style={{ margin: '25px 0', opacity: '0.1', height: '1px', background: '#fff' }}></div>

        {/* AFFILIATE HRY */}
        <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-btn-hover guru-affiliate-cta method-btn">
          <span style={{ fontSize: '18px' }}>🔥</span> {isEn ? "Buy Game - Best Deal" : "Koupit hru za nejlepší cenu"}
        </a>
      </div>

      {/* --- 🚀 STICKY BOTTOM ANCHOR --- */}
      <div className="sticky-bottom-anchor">
          <SeznamAd zoneId={408654} width={970} height={90} />
          <SeznamAd zoneId={408651} width={300} height={100} />
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center', paddingBottom: '120px' }}>
        © {new Date().getFullYear()} THE HARDWARE GURU • MISSION: BUILD THE BEST DB
      </div>
    </div>
  );
}

const containerStyle = { 
    backgroundColor: '#0a0b0d', color: '#ffffff', minHeight: '100vh', 
    fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', 
    backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '60px' 
};
