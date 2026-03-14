import React from 'react';
import { ChevronLeft, ShieldCheck, Heart, Flame, ShoppingCart, Info, CheckCircle2 } from 'lucide-react';

/**
 * GURU SUPPORT ENGINE V2.1 (BUILD FIX & GOLDEN RICH)
 * Cesta: src/app/support/page.js
 * 🚀 CÍL: 100% zelená v Google Search Console + Oprava Vercel Build Error.
 * 🛡️ FIX 1: Odstraněn neexistující import SupportClient (řeší Module not found).
 * 🛡️ FIX 2: Přechod na čistý Server Component s inline skriptem pro Google Subscribe.
 * 🛡️ FIX 3: Implementace Golden Rich standardu (Organization, FAQ, Breadcrumbs, Image Arrays).
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU SEO: Dynamické Meta Tagy (Zlatý standard)
export async function generateMetadata(props) {
  const params = await props.params;
  const isEn = params?.slug?.startsWith('en-') || props?.isEn === true;
  
  const title = isEn ? 'Support Hardware Guru | Help us build the database' : 'Podpoř Hardware Guru | Pomoz nám budovat databázi';
  const desc = isEn 
    ? 'Support our work and help us promote technical news, live streams and hardware benchmarks.' 
    : 'Podpořte naši práci a pomozte nám s propagací novinek, streamů a hardwarových benchmarků.';

  return {
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/support`,
      languages: {
        'en': `${baseUrl}/en/support`,
        'cs': `${baseUrl}/support`,
        'x-default': `${baseUrl}/support`
      }
    }
  };
}

export default async function SupportPage(props) {
  const isEn = props?.isEn === true;

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (Organization, FAQ, Breadcrumbs)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Hardware Guru",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": [`${baseUrl}/logo.png`],
    "sameAs": [
      "https://kick.com/thehardwareguru",
      "https://youtube.com/@TheHardwareGuru_Czech"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? "How can I support Hardware Guru?" : "Jak mohu podpořit Hardware Guru?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn 
            ? "You can support us via QR payment, Stripe (Credit Card/Apple Pay), Revolut or Google Subscribe." 
            : "Podpořit nás můžete přes QR platbu, Stripe (kartou/Apple Pay), Revolut nebo Google Subscribe."
        }
      },
      {
        "@type": "Question",
        "name": isEn ? "What are the contributions used for?" : "Na co jsou použity příspěvky?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn 
            ? "Contributions go directly to website promotion, live stream support, and community growth." 
            : "Příspěvky jdou přímo na propagaci webu, podporu live streamů a rozvoj komunity."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Support" : "Podpora", "item": `${baseUrl}${isEn ? '/en' : ''}/support` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  // Konfigurace pro klientské linky
  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";
  const hrkLink = "https://www.hrkgame.com/en/#a_aid=TheHardwareGuru";

  return (
    <div style={containerStyle}>
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      {/* 🚀 GURU SPA SWG ATTACHMENT SCRIPT (Bypassuje nutnost separátního client souboru) */}
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
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '900', margin: '10px 0', letterSpacing: '-1px' }}>
          {isEn ? "FEEDING THIS " : "KRMÍŠ TENHLE "} <span style={{ color: '#eab308' }}>{isEn ? "MACHINE" : "STROJ"}</span>
        </h1>
        
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '20px auto', fontSize: '15px', lineHeight: '1.6' }}>
          {isEn ? (
            "Contributions go directly to website promotion, live stream support, and social media growth."
          ) : (
            "Příspěvky jdou přímo na propagaci webu, podporu live streamů a rozvoj sociálních sítí."
          )}
        </p>
      </div>

      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          .guru-btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); border-color: rgba(234, 179, 8, 0.4); }
          .guru-affiliate-cta { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4); }
          button[swg-standard-button] { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; outline: none; }
        `}} />

        {/* QR KÓD SEKCE */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ color: '#eab308', marginBottom: '18px', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isEn ? "Quick QR payment (CZ)" : "Rychlá QR platba (CZ)"}
          </h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '24px', display: 'inline-block', marginBottom: '12px', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
            <img 
              src="/qr-platba.png" 
              alt="QR Platba" 
              style={{ width: '220px', height: '220px', display: 'block' }} 
            />
          </div>
          <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>{isEn ? "Account number:" : "Číslo účtu:"} 1269059093/0800</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 1. MOŽNOST: GOOGLE SUBSCRIBE */}
        <div style={{ marginBottom: '12px' }}>
          <div className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920', position: 'relative', overflow: 'hidden' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', pointerEvents: 'none', width: '100%' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{isEn ? 'Google Subscribe' : 'Přispět s Googlem'}</span>
             </div>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}>
                <button id="support-page-swg-btn" swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
             </div>
          </div>
        </div>

        {/* 🚀 2. MOŽNOST: STRIPE / KARTA */}
        <div style={{ marginBottom: '12px' }}>
          <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
            <span style={{ fontSize: '20px' }}>💳</span> {isEn ? "Credit Card / Apple / Google Pay" : "Karta / Apple / Google Pay"}
          </a>
        </div>

        {/* 🚀 3. MOŽNOST: REVOLUT */}
        <div style={{ marginBottom: '25px' }}>
          <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-btn-hover" style={{ ...buttonBaseStyle, backgroundColor: '#161920' }}>
            <span style={{ background: '#fff', color: '#0075eb', width: '22px', height: '22px', borderRadius: '50%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>R</span> 
            Revolut.me
          </a>
          <p style={{ fontSize: '11px', color: '#60a5fa', marginTop: '10px', fontWeight: '900', letterSpacing: '1px' }}>@{revolutTag}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{isEn ? "OR" : "NEBO"}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 4. MOŽNOST: GURU AFFILIATE */}
        <div>
          <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-btn-hover guru-affiliate-cta" style={buttonBaseStyle}>
            <span style={{ fontSize: '20px' }}>🔥</span> {isEn ? "Buy a game for the best price" : "Koupit hru za nejlepší cenu"}
          </a>
        </div>
      </div>

      <div style={{ marginTop: '50px', fontSize: '10px', color: '#4b5563', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}>
        {isEn ? "PROJECT SUPPORT: WEBSITE • LIVE STREAM • SOCIAL NETWORKS" : "PODPORA PROJEKTU: WEB • LIVE STREAM • SOCIÁLNÍ SÍTĚ"}
      </div>
    </div>
  );
}

// --- GURU STYLES ---
const containerStyle = {
  backgroundColor: '#0a0b0d', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 20px 60px', fontFamily: 'sans-serif', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed'
};

const cardStyle = {
  background: 'rgba(17, 19, 24, 0.95)', backdropFilter: 'blur(15px)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '32px', padding: '40px', maxWidth: '520px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', textAlign: 'center'
};

const buttonBaseStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '18px 24px', borderRadius: '18px', textDecoration: 'none', fontWeight: '900', fontSize: '15px', transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', marginBottom: '12px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff'
};
