"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU COOKIE BANNER V1.1 (PUSH TRIGGER UPDATE)
 * Cesta: src/components/CookieBanner.js
 * 🛡️ STATUS: PRODUCTION READY
 */

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isEn, setIsEn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/en')) {
      setIsEn(true);
    }
    
    const consent = localStorage.getItem('guru_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('guru_cookie_consent', 'all');
    setIsVisible(false);
    // 🔥 TADY JE TA MAGIE: Odpálí globální event pro OneSignal a Retargeting 🔥
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('guruConsentGranted'));
    }
  };

  const handleReject = () => {
    localStorage.setItem('guru_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 99999,
      background: 'rgba(11, 12, 16, 0.98)',
      backdropFilter: 'blur(15px)',
      borderTop: '2px solid #66fcf1',
      padding: '25px 20px',
      boxShadow: '0 -10px 50px rgba(0, 0, 0, 0.9)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        fontFamily: 'sans-serif'
      }}>
        
        {/* TEXTOVÁ ČÁST */}
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', marginBottom: '8px', fontWeight: '950', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
            <ShieldAlert size={18} />
            {isEn ? 'Cookies & Privacy' : 'Cookies & Ochrana soukromí'}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            {isEn 
              ? 'We use cookies to ensure the basic functionality of the website and to enhance your online experience. By clicking "Accept All", you agree to the use of all cookies for personalized content and analytics. ' 
              : 'Naše technologická základna používá cookies k zajištění základních funkcí webu, analýze návštěvnosti a personalizaci obsahu (včetně reklam). Kliknutím na "Přijmout vše" nám pomůžeš vylepšovat Guru platformu. '}
            <Link href={isEn ? "/en/ochrana-udaju" : "/ochrana-udaju"} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold' }}>
              {isEn ? 'Read Privacy Policy' : 'Více informací'}
            </Link>.
          </p>
        </div>

        {/* TLAČÍTKA */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleReject}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '12px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={16} /> {isEn ? 'Essential Only' : 'Pouze nezbytné'}
          </button>
          
          <button 
            onClick={handleAcceptAll}
            style={{
              padding: '12px 24px',
              background: '#66fcf1',
              border: 'none',
              color: '#000',
              borderRadius: '12px',
              fontWeight: '950',
              fontSize: '12px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(102, 252, 241, 0.3)',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Check size={16} /> {isEn ? 'Accept All' : 'Přijmout vše'}
          </button>
        </div>

      </div>
    </div>
  );
}
