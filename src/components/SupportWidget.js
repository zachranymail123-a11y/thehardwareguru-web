"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- BEZPEČNÉ NAČÍTÁNÍ NEXT.JS MODULŮ (PROTI PÁDU V NÁHLEDU) ---
let usePathname = () => '';
try {
  const nextNav = require('next/navigation');
  usePathname = nextNav.usePathname;
} catch (e) {
  // Silent catch
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  let pathname = '';
  try { pathname = usePathname() || ''; } catch (e) {}
  const isEn = (pathname || currentPath).startsWith('/en');

  const stripeLink = "https://buy.stripe.com/5kQdR900Nc115tSbTD9EI00";
  const revolutTag = "thehardwareguru";
  const hrkLink = "https://www.hrkgame.com/#a_aid=TheHardwareGuru";

  const buttonStyle = (type) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 15px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '13px',
    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: type === 'affiliate' ? 'transparent' : '#161920',
    background: type === 'affiliate' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined,
    color: '#ffffff',
    boxShadow: type === 'affiliate' ? '0 5px 15px rgba(249, 115, 22, 0.3)' : '0 4px 10px rgba(0,0,0,0.3)',
  });

  return (
    <div className="guru-support-container" style={{ position: 'fixed', zIndex: 999, fontFamily: 'sans-serif' }}>
      
      {/* --- Hlavní klikací plocha (Raketka) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0', transition: 'transform 0.3s ease'
        }}
        className="guru-main-trigger"
      >
        <div className="support-label" style={{
          color: '#fff', background: 'rgba(234, 179, 8, 0.1)', border: '2px solid #eab308',
          borderRadius: '12px', fontWeight: '900',
          letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)',
          whiteSpace: 'nowrap',
          opacity: isOpen ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}>
          {isEn ? 'Support Guru ⚡' : 'Podpořit Guru ⚡'}
        </div>

        <div className="rocket-icon" style={{
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #eab308, #ca8a04)',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          {isOpen ? '✕' : '🚀'}
        </div>
      </button>

      {/* --- Menu podpory --- */}
      <div className="guru-support-menu" style={{
        position: 'absolute', right: '0',
        backgroundColor: 'rgba(17, 19, 24, 0.98)', border: '2px solid #eab308',
        borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        backdropFilter: 'blur(15px)',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(15px)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: isOpen ? 'auto' : 'none'
      }}>
        <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>
          {isEn ? 'Feeding this ' : 'Krmíš tenhle '} <span style={{ color: '#eab308' }}>{isEn ? 'machine?' : 'stroj?'}</span>
        </h4>
        
        {/* 🚀 GURU FIX: ZMĚNA TEXTU POUZE NA PROMO WEBU, STREAMŮ A SÍTÍ 🚀 */}
        <p style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginBottom: '22px', lineHeight: '1.5' }}>
          {isEn 
            ? 'Contributions go directly to website promotion, live stream support, and social media growth.' 
            : 'Příspěvky jdou přímo na propagaci webu, podporu live streamů a rozvoj sociálních sítí.'}
        </p>

        <style>{`
          .guru-w-btn:hover { transform: translateY(-2px); filter: brightness(1.1); border-color: rgba(234, 179, 8, 0.3); }
          /* Pojištění, aby Google tlačítko neovlivňovalo styly */
          button[swg-standard-button] { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; outline: none; }
        `}</style>

        {/* 1. GOOGLE SUBSCRIBE (ČISTÝ OVERLAY BEZ HACKŮ) */}
        <div className="guru-w-btn" style={{ ...buttonStyle('google'), position: 'relative', overflow: 'hidden' }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', pointerEvents: 'none', width: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isEn ? 'Google Subscribe' : 'Přispět s Googlem'}</span>
           </div>
           {/* Přesná neviditelná vrstva, která elegantně převezme roli kliknutí */}
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}>
              <button swg-standard-button="contribution" style={{ width: '100%', height: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}></button>
           </div>
        </div>

        {/* 2. QR / PŘEVOD */}
        <Link href={isEn ? "/en/support" : "/support"} onClick={() => setIsOpen(false)} className="guru-w-btn" style={buttonStyle('qr')}>
          🤳 {isEn ? 'QR / Bank Transfer' : 'QR / Bankovní převod'}
        </Link>

        {/* 3. STRIPE (KARTA) */}
        <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-w-btn" style={buttonStyle('stripe')}>
          💳 {isEn ? 'Card / Apple / Google' : 'Karta / Apple / Google Pay'}
        </a>

        {/* 4. REVOLUT */}
        <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-w-btn" style={buttonStyle('revolut')}>
          <span style={{ background: '#fff', color: '#0075eb', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', marginRight: '4px' }}>R</span> 
          Revolut Me
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '9px', fontWeight: '900' }}>{isEn ? 'OR' : 'NEBO'}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 5. GURU AFFILIATE NÁKUP HRY */}
        <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-w-btn" style={buttonStyle('affiliate')}>
          🔥 {isEn ? 'Buy game: best price' : 'Koupit hru za nejlepší cenu'}
        </a>
      </div>

      {/* --- Styl animací a MOBILNÍ OPTIMALIZACE --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Desktop Default */
        .guru-support-container { bottom: 110px; right: 20px; }
        .rocket-icon { width: 55px; height: 55px; font-size: 26px; }
        .support-label { padding: 10px 16px; font-size: 13px; }
        .guru-support-menu { bottom: 70px; width: 300px; padding: 24px; }
        .guru-support-menu h4 { font-size: 15px; }

        /* 🔥 MOBILE OPTIMIZATION 🔥 */
        @media (max-width: 768px) {
          .guru-support-container { bottom: 20px; right: 15px; } 
          .rocket-icon { width: 45px; height: 45px; font-size: 20px; } 
          .support-label { display: none !important; } 
          .guru-support-menu { 
            bottom: 60px; 
            width: calc(100vw - 30px); 
            max-width: 320px;
            right: 0;
            padding: 20px 15px;
          }
          .guru-support-menu h4 { font-size: 14px; }
        }
      `}} />
    </div>
  );
}
