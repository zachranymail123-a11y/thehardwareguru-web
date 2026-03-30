import React from 'react';
import { ChevronLeft, ShieldCheck, Heart, Flame, ShoppingCart, Info, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import Link from 'next/link';

/**
 * GURU SUPPORT ENGINE V2.7 (BACKUP RESTORE + MONEY FIX)
 * 🚀 CÍL: 100% zachování tvé ranní zálohy + Seznam Ads + Long Partner Button.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const isEn = searchParams?.lang === 'en';
  
  return {
    title: isEn ? 'Support The Hardware Guru | Join the VIP Community' : 'Podpořte The Hardware Guru | Staňte se VIP členem',
    description: isEn 
      ? 'Help us build the ultimate hardware database. Support the project via QR code, Apple Pay, Stripe, or by using our partner affiliate links.' 
      : 'Pomozte nám vybudovat nejlepší hardwarovou databázi. Podpořte projekt přes QR platbu, Apple Pay, Stripe nebo využitím našich partnerských odkazů.',
    alternates: {
      canonical: `${baseUrl}/support`,
      languages: { 'en': `${baseUrl}/en/support`, 'cs': `${baseUrl}/support` }
    }
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
      {/* GURU SPA SWG ATTACHMENT SCRIPT - ZACHOVÁNO ZE ZÁLOHY */}
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
        .guru-support-card { background: rgba(17, 19, 24, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 32px; padding: 40px; maxWidth: 520px; width: 100%; textAlign: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .guru-btn-hover { transition: 0.3s; }
        .guru-btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); }
        .guru-affiliate-cta { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; }
        
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; margin-bottom: 40px; }
        .ad-mobile-wrapper { display: none; width: 100%; margin-bottom: 30px; }

        /* 🔥 CTR OPTIMIZED LONG PARTNER BUTTON */
        .guru-long-partner-btn {
          width: 100%; max-width: 520px; margin-top: 30px;
          background: linear-gradient(90deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%);
          border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 20px;
          padding: 22px 28px; display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        .guru-long-partner-btn:hover { border-color: #eab308; background: rgba(234, 179, 8, 0.25); transform: scale(1.02); }
        .p-btn-content { display: flex; align-items: center; gap: 18px; text-align: left; }
        .p-btn-text { display: flex; flex-direction: column; }
        .p-btn-main { color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .p-btn-sub { color: #9ca3af; font-size: 12px; font-weight: 600; margin-top: 3px; }

        /* 🔥 STICKY ANCHOR */
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }

        @media (max-width: 768px) {
            .guru-support-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; }
            .guru-support-card, .guru-long-partner-btn { padding: 30px 20px !important; border-radius: 24px !important; }
            .main-h1 { font-size: 2.2rem !important; }
            .p-btn-main { font-size: 12px !important; }
        }
      `}} />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#eab308', fontSize: '13px', letterSpacing: '3px', fontWeight: '900', textTransform: 'uppercase' }}>
          {isEn ? "PROJECT SUPPORT" : "PODPORA PROJEKTU"}
        </h2>
        <h1 className="main-h1" style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '950', margin: '10px 0', letterSpacing: '-1px', textTransform: 'uppercase' }}>
          {isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span>
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px', lineHeight: '1.6' }}>
          {isEn ? "Contributions go directly to community development and tech database growth." : "Příspěvky jdou přímo na propagaci webu a rozvoj největší HW databáze."}
        </p>
      </header>

      {/* --- 🚀 TOP AD SLOT (Today's Change) --- */}
      <div className="ad-desktop-wrapper">
          <SeznamAd zoneId={408654} width={970} height={210} />
      </div>
      <div className="ad-mobile-wrapper">
          <SeznamAd zoneId={408651} width={300} height={250} />
      </div>

      <div className="guru-support-card">
        {/* QR KÓD SEKCE - ZACHOVÁNO ZE ZÁLOHY */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '18px', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>
            {isEn ? "Quick QR payment (CZ)" : "Rychlá QR platba (CZ)"}
          </h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <img src="/qr-platba.png" alt="QR Platba" className="qr-image" style={{ width: '220px', height: '220px', display: 'block' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* GOOGLE SUBSCRIBE */}
            <div className="guru-btn-hover method-btn" style={{ ...buttonBaseStyle, backgroundColor: '#161920', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>{isEn ? 'Google Pay' : 'Přispět s Googlem'}</span>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}>
                    <button id="support-page-swg-btn" swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
                </div>
            </div>

            {/* STRIPE */}
            <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn-hover method-btn" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
              <span style={{ fontSize: '20px' }}>💳</span> {isEn ? "Credit Card / Apple Pay" : "Karta / Apple Pay"}
            </a>

            {/* REVOLUT */}
            <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn-hover method-btn" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
              <span style={{ background: '#fff', color: '#0075eb', width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>R</span> Revolut.me
            </a>
        </div>

        <div style={{ margin: '30px 0', opacity: '0.1', height: '1px', background: '#fff' }}></div>

        {/* AFFILIATE */}
        <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-btn-hover guru-affiliate-cta method-btn" style={buttonBaseStyle}>
          <span style={{ fontSize: '20px' }}>🔥</span> {isEn ? "Buy a game - Best Deal" : "Koupit hru za nejlepší cenu"}
        </a>
      </div>

      {/* --- 🚀 DLOUHÉ PARTNER TLAČÍTKO (Today's Change) --- */}
      <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-long-partner-btn">
          <div className="p-btn-content">
            <Award color="#eab308" size={36} />
            <div className="p-btn-text">
                <span className="p-btn-main">
                  {isEn ? "OUR VERIFIED PARTNERS" : "NAŠI PARTNEŘI"}
                </span>
                <span className="p-btn-sub">
                  {isEn 
                    ? "Support Hardware Guru by shopping through our links" 
                    : "Nákupem přes tyto odkazy podpoříte provoz webu"}
                </span>
            </div>
          </div>
          <ChevronRight color="#eab308" size={28} />
      </Link>

      {/* --- 🚀 STICKY BOTTOM ANCHOR (Today's Change) --- */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper" style={{marginBottom: 0}}>
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper" style={{marginBottom: 0}}>
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
        © {new Date().getFullYear()} THE HARDWARE GURU • MISSION: BUILD THE BEST DB
      </div>
    </div>
  );
}

const containerStyle = {
  backgroundColor: '#0a0b0d', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 20px 160px', fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed'
};

const buttonBaseStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '18px 24px', borderRadius: '18px', textDecoration: 'none', fontWeight: '950', fontSize: '15px', marginBottom: '4px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff', textTransform: 'uppercase'
};
