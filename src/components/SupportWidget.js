"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- BEZPEČNÉ NAČÍTÁNÍ NEXT.JS MODULŮ ---
let usePathname = () => '';
try {
  const nextNav = require('next/navigation');
  usePathname = nextNav.usePathname;
} catch (e) {}

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

  // 🚀 GURU SPA SWG ATTACHMENT
  useEffect(() => {
    let attempts = 0;
    const attachTimer = setInterval(() => {
      attempts++;
      if (typeof window !== 'undefined' && window.swgSubscriptions) {
        const btn = document.getElementById('guru-widget-swg-btn');
        if (btn && !btn.querySelector('iframe')) {
          window.swgSubscriptions.attachButton(btn, "contribution");
        }
        clearInterval(attachTimer);
      } else if (attempts > 20) {
        clearInterval(attachTimer);
      }
    }, 500);
    return () => clearInterval(attachTimer);
  }, [isOpen]);

  const buttonStyle = (type) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 15px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '12px',
    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    marginBottom: '8px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#ffffff',
    backgroundColor: type === 'partner' ? 'transparent' : (type === 'affiliate' ? 'transparent' : '#161920'),
    background: type === 'partner' 
        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.2) 100%)' 
        : (type === 'affiliate' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined),
    boxShadow: type === 'affiliate' ? '0 5px 15px rgba(249, 115, 22, 0.3)' : (type === 'partner' ? '0 5px 15px rgba(168, 85, 247, 0.2)' : '0 4px 10px rgba(0,0,0,0.3)'),
    border: type === 'partner' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)'
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
          whiteSpace: 'nowrap', opacity: isOpen ? 0 : 1, transition: 'opacity 0.3s ease'
        }}>
          {isEn ? 'Support Guru ⚡' : 'Podpořit Guru ⚡'}
        </div>

        <div className="rocket-icon" style={{
          borderRadius: '50%', background: 'linear-gradient(45deg, #eab308, #ca8a04)',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff'
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
        <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', fontSize: '14px' }}>
          {isEn ? 'Feeding this ' : 'Krmíš tenhle '} <span style={{ color: '#eab308' }}>{isEn ? 'machine?' : 'stroj?'}</span>
        </h4>
        
        <p style={{ color: '#9ca3af', fontSize: '10px', textAlign: 'center', marginBottom: '18px', lineHeight: '1.4' }}>
          {isEn 
            ? 'Contributions support tech growth & community development.' 
            : 'Příspěvky jdou na rozvoj největší HW databáze a komunity.'}
        </p>

        <style>{`
          .guru-w-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
          button[swg-standard-button] { width: 100% !important; height: 100% !important; margin: 0 !important; cursor: pointer; }
        `}</style>

        {/* 1. GOOGLE SUBSCRIBE */}
        <div className="guru-w-btn" style={{ ...buttonStyle('google'), position: 'relative', overflow: 'hidden' }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>{isEn ? 'Google Pay' : 'Přispět s Googlem'}</span>
           </div>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.001, zIndex: 10 }}>
              <button id="guru-widget-swg-btn" swg-standard-button="contribution" style={{ background: 'transparent', border: 'none' }}></button>
           </div>
        </div>

        {/* 2. QR / SUPPORT PAGE */}
        <Link href={isEn ? "/en/support" : "/support"} onClick={() => setIsOpen(false)} className="guru-w-btn" style={buttonStyle('qr')}>
          🤳 {isEn ? 'QR / Bank' : 'QR / Převod'}
        </Link>

        {/* 3. STRIPE */}
        <a href={stripeLink} target="_blank" rel="noreferrer" className="guru-w-btn" style={buttonStyle('stripe')}>
          💳 {isEn ? 'Card / Apple Pay' : 'Karta / Apple Pay'}
        </a>

        {/* 4. REVOLUT */}
        <a href={`https://revolut.me/${revolutTag}`} target="_blank" rel="noreferrer" className="guru-w-btn" style={buttonStyle('revolut')}>
          <span style={{ background: '#fff', color: '#0075eb', width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginRight: '4px' }}>R</span> Revolut
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', opacity: '0.2' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
          <span style={{ fontSize: '8px', fontWeight: '900' }}>{isEn ? 'OR' : 'NEBO'}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#ffffff' }}></div>
        </div>

        {/* 🚀 NEW: PARTNERS / HARDWARE HUB */}
        <Link href={isEn ? "/en/sestavy" : "/sestavy"} onClick={() => setIsOpen(false)} className="guru-w-btn" style={buttonStyle('partner')}>
          🏆 {isEn ? 'Our Partners' : 'Naši partneři'}
        </Link>

        {/* 5. GURU AFFILIATE */}
        <a href={hrkLink} target="_blank" rel="nofollow sponsored" className="guru-w-btn" style={buttonStyle('affiliate')}>
          🔥 {isEn ? 'Best Game Deals' : 'Hry za nejlepší ceny'}
        </a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .guru-support-container { bottom: 110px; right: 20px; }
        .rocket-icon { width: 55px; height: 55px; font-size: 26px; }
        .support-label { padding: 10px 16px; font-size: 13px; margin-right: 12px; }
        .guru-support-menu { bottom: 70px; width: 280px; padding: 20px; }

        @media (max-width: 768px) {
          .guru-support-container { bottom: 20px; right: 15px; } 
          .rocket-icon { width: 48px; height: 48px; font-size: 22px; } 
          .support-label { display: none !important; } 
          .guru-support-menu { bottom: 60px; width: calc(100vw - 30px); max-width: 300px; right: 0; padding: 18px 15px; }
        }
      `}} />
    </div>
  );
}
