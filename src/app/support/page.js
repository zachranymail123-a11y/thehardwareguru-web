import React from 'react';
import { ChevronLeft, ShieldCheck, Heart, Flame, ShoppingCart, Info, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import Link from 'next/link';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 IMPORT PŘIDÁN

/**
 * GURU SUPPORT ENGINE V3.1 - SIDE-BY-SIDE LAYOUT
 * 🚀 CÍL: Podpora a vyhledávače vedle sebe, plně vycentrované a responzivní.
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

  return (
    <div className="guru-support-page-root">
      {/* GURU SPA SWG ATTACHMENT SCRIPT */}
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
        .guru-support-page-root {
          background-color: #0a0b0d;
          background-image: url("/bg-guru.png");
          background-size: cover;
          background-attachment: fixed;
          min-height: 100vh;
          color: #fff;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px 160px;
          width: 100%;
          box-sizing: border-box;
        }

        .centered-vessel {
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .support-header-text {
          text-align: center;
          margin-bottom: 40px;
        }

        .main-h1 {
          font-size: clamp(26px, 5vw, 40px);
          font-weight: 950;
          text-transform: uppercase;
          margin: 10px 0;
          line-height: 1.1;
        }

        /* 🔥 SIDE-BY-SIDE GRID PRO DESKTOP 🔥 */
        .support-content-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
          width: 100%;
          align-items: center;
        }

        .support-card-wrapper {
          width: 100%;
          max-width: 450px;
        }

        .heureka-wrapper {
          width: 100%;
          max-width: 700px;
        }

        /* Hack na zrušení defaultního horního marginu u HeurekaButtons aby to lícovalo s podporou */
        .heureka-wrapper > div {
          margin-top: 0 !important;
        }

        @media (min-width: 1024px) {
          .support-content-grid {
            flex-direction: row;
            align-items: flex-start;
            justify-content: center;
          }
        }

        .guru-central-card {
          background: rgba(17, 19, 24, 0.97);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(234, 179, 8, 0.3);
          border-radius: 32px;
          padding: 45px 35px;
          width: 100%;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          text-align: center;
          box-sizing: border-box;
        }

        .qr-section { margin-bottom: 35px; }

        .qr-frame {
          background: #fff;
          padding: 12px;
          border-radius: 20px;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          margin-top: 15px;
        }

        .method-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .guru-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 20px;
          border-radius: 18px;
          text-decoration: none;
          font-weight: 950;
          font-size: 14px;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background-color: #161920;
          color: #fff;
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        .guru-btn:hover {
          transform: translateY(-3px) scale(1.02);
          filter: brightness(1.2);
          border-color: #eab308;
        }

        .btn-partners {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(102, 252, 241, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5) !important;
        }

        .ad-row {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        .sticky-money-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 11, 13, 0.99);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          padding: 10px 0;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .guru-central-card { padding: 30px 20px; border-radius: 24px; }
          .desktop-only-ad { display: none !important; }
          .mobile-only-ad { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-only-ad { display: flex !important; }
          .mobile-only-ad { display: none !important; }
        }
      `}} />

      <div className="centered-vessel">
        <header className="support-header-text">
          <div style={{ color: '#eab308', fontSize: '11px', letterSpacing: '3px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>
            {isEn ? "PROJECT SUPPORT" : "PODPORA PROJEKTU"}
          </div>
          <h1 className="main-h1">
            {isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', maxWidth: '400px', margin: '0 auto' }}>
            {isEn ? "Contributions go directly to community development." : "Příspěvky jdou přímo na propagaci webu a rozvoj největší HW databáze."}
          </p>
        </header>

        {/* TOP AD */}
        <div className="ad-row desktop-only-ad">
          <SeznamAd zoneId={408654} width={970} height={210} />
        </div>
        <div className="ad-row mobile-only-ad">
          <SeznamAd zoneId={408651} width={300} height={250} />
        </div>

        {/* 🔥 SIDE-BY-SIDE ROZLOŽENÍ 🔥 */}
        <div className="support-content-grid">
            
            {/* LÁVA - PODPORA KARTA */}
            <div className="support-card-wrapper">
                <div className="guru-central-card">
                  <div className="qr-section">
                    <h3 style={{ color: '#eab308', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
                      {isEn ? "Quick QR payment" : "Rychlá QR platba (CZ)"}
                    </h3>
                    <div className="qr-frame">
                      <img src="/qr-platba.png" alt="QR" style={{ width: '180px', height: '180px', display: 'block' }} />
                    </div>
                  </div>

                  <div className="method-stack">
                    {/* GOOGLE */}
                    <div className="guru-btn" style={{ position: 'relative' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      <span>{isEn ? 'Google Pay' : 'Přispět s Googlem'}</span>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001 }}>
                        <button id="support-page-swg-btn" swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
                      </div>
                    </div>

                    {/* STRIPE */}
                    <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn">💳 {isEn ? "Card / Apple Pay" : "Karta / Apple Pay"}</a>
                    
                    {/* REVOLUT */}
                    <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn">
                      <span style={{ background: '#fff', color: '#0075eb', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>R</span> 
                      Revolut.me
                    </a>

                    {/* PARTNEŘI */}
                    <Link href={isEn ? "/en/sestavy" : "/sestavy"} className="guru-btn btn-partners">
                      <Award size={18} color="#eab308" /> <span>{isEn ? "Our Partners" : "Naši partneři"}</span>
                    </Link>
                  </div>
                </div>
            </div>

            {/* PRAVÁ - HEUREKA BUTTONS */}
            <div className="heureka-wrapper">
                <HeurekaButtons isEn={isEn} />
            </div>
            
        </div>

        <div style={{ marginTop: '60px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
          © {new Date().getFullYear()} THE HARDWARE GURU • MISSION: BUILD THE BEST DB
        </div>
      </div>

      {/* STICKY BOTTOM AD */}
      <div className="sticky-money-bar">
        <div className="desktop-only-ad">
          <SeznamAd zoneId={408654} width={970} height={90} />
        </div>
        <div className="mobile-only-ad">
          <SeznamAd zoneId={408651} width={300} height={100} />
        </div>
      </div>
    </div>
  );
}
