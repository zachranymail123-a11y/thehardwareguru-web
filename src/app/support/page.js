import React from 'react';
import { ChevronLeft, ShieldCheck, Heart, Flame, ShoppingCart, Info, CheckCircle2 } from 'lucide-react';

/**
 * GURU SUPPORT ENGINE V2.3 (BING SEO FIX)
 * 🚀 CÍL: Přidání unikátních meta tagů pro Bing indexaci.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = "https://thehardwareguru.cz";

export async function generateMetadata(props) {
  const p = await props.params;
  const isEn = props?.isEn === true;
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
  const isEn = props?.isEn === true;

  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";
  const hrkLink = "https://www.hrkgame.com/en/#a_aid=TheHardwareGuru";

  return (
    <div style={containerStyle}>
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

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#eab308', fontSize: '14px', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {isEn ? "PROJECT SUPPORT" : "PODPORA PROJEKTU"}
        </h2>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '950', margin: '10px 0', letterSpacing: '-1px' }}>
          {isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span>
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px' }}>
          {isEn ? "Contributions go directly to social media growth." : "Příspěvky jdou přímo na propagaci webu a rozvoj komunity."}
        </p>
      </div>

      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          .guru-btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); }
          .guru-affiliate-cta { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
          
          .guru-support-ad-slot { margin: 25px 0; padding: 15px; background: rgba(234, 179, 8, 0.02); border: 1px solid rgba(234, 179, 8, 0.1); border-radius: 20px; text-align: center; }
          .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
          .ad-desktop { display: block; } .ad-mobile { display: none; }
          @media (max-width: 768px) { .ad-desktop { display: none; } .ad-mobile { display: block; } }
        `}} />

        {/* QR KÓD SEKCE */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '18px', fontSize: '18px', fontWeight: 'bold' }}>
            {isEn ? "Quick QR payment (CZ)" : "Rychlá QR platba (CZ)"}
          </h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '24px', display: 'inline-block' }}>
            <img src="/qr-platba.png" alt="QR Platba" style={{ width: '220px', height: '220px', display: 'block' }} />
          </div>
        </div>

        {/* 🔥 ADS SLOT: INJEKCE MEZI PLATEBNÍ METODY */}
        <div className="guru-support-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        {/* GOOGLE SUBSCRIBE */}
        <div className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920', position: 'relative' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>{isEn ? 'Google Subscribe' : 'Přispět s Googlem'}</span>
             </div>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}>
                <button id="support-page-swg-btn" swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
             </div>
        </div>

        {/* STRIPE */}
        <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
          <span style={{ fontSize: '20px' }}>💳</span> {isEn ? "Credit Card / Apple Pay" : "Karta / Apple Pay"}
        </a>

        {/* REVOLUT */}
        <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
          <span style={{ background: '#fff', color: '#0075eb', width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>R</span> Revolut.me
        </a>

        <div style={{ margin: '30px 0', opacity: '0.1', height: '1px', background: '#fff' }}></div>

        {/* AFFILIATE */}
        <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-btn-hover guru-affiliate-cta" style={buttonBaseStyle}>
          <span style={{ fontSize: '20px' }}>🔥</span> {isEn ? "Buy a game for the best price" : "Koupit hru za nejlepší cenu"}
        </a>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold' }}>
        © {new Date().getFullYear()} THE HARDWARE GURU • MISSION: BUILD THE BEST DB
      </div>
    </div>
  );
}

const containerStyle = {
  backgroundColor: '#0a0b0d', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 20px 60px', fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed'
};

const cardStyle = {
  background: 'rgba(17, 19, 24, 0.95)', backdropFilter: 'blur(15px)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '32px', padding: '40px', maxWidth: '520px', width: '100%', textAlign: 'center'
};

const buttonBaseStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '18px 24px', borderRadius: '18px', textDecoration: 'none', fontWeight: '950', fontSize: '15px', transition: '0.3s', marginBottom: '12px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff', textTransform: 'uppercase'
};
