'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * GURU SEZNAM AD COMPONENT V2.1 (ADBLOCK SHIELD REFRESH)
 * 🚀 CÍL: Čistší, menší fallback srozumitelnějším textem.
 */

export default function SeznamAd({ zoneId, width, height }) {
  const adRef = useRef(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Stabilní ID pro kontejner (nutné pro Seznam SSP)
  const [adId] = useState(`szn-ad-${zoneId}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // 1. Pokus o vykreslení reklamy přes Seznam SSP
    const loadAd = () => {
      try {
        if (window.ssp && window.ssp.getAds) {
          window.ssp.getAds([
            {
              zoneId: zoneId,
              id: adId,
              width: width,
              height: height,
            }
          ]);
        }
      } catch (e) {
        console.error('Seznam SSP Error:', e);
      }
    };

    loadAd();

    // 2. Guru detekce AdBlocku (kontrola po 2.5 vteřinách)
    const timer = setTimeout(() => {
      // Pokud skript ssp vůbec neexistuje (blokováno na síti) 
      // NEBO pokud reklama nedodala obsah (výška kontejneru je menší než 10px)
      if (!window.ssp || (adRef.current && adRef.current.clientHeight < 10)) {
        setIsBlocked(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [zoneId, width, height, adId]);

  return (
    <div 
      style={{ 
        width: width ? `${width}px` : '100%', 
        minHeight: height ? `${height}px` : 'auto', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {!isBlocked ? (
        // Standardní reklamní kontejner
        <div id={adId} ref={adRef} style={{ width: '100%', minHeight: height ? `${height}px` : '100%' }} />
      ) : (
        // 🔥 GURU ŠTÍT (Menší, diskrétnější fallback) 🔥
        <div 
          className="guru-ad-fallback" /* Třída pro CSS fix */
          style={{
            width: '100%',
            height: '100%',
            minHeight: height ? `${height}px` : '100px',
            background: 'linear-gradient(135deg, rgba(15, 17, 21, 0.98) 0%, rgba(10, 11, 13, 1) 100%)',
            border: '1px solid rgba(102, 252, 241, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            textAlign: 'center',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            color: '#9ca3af',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif',
          }}
        >
          <ShieldAlert size={20} color="#66fcf1" style={{ marginBottom: '8px', opacity: 0.8 }} />
          <strong style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ADBLOCK DETEKOVÁN
          </strong>
          <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '220px', color: '#d1d5db' }}>
            <span style={{ color: '#a855f7', fontWeight: 'bold' }}>The Hardware Guru</span> maká pro tebe. Podpoř nás a přidej si nás do výjimek. Díky! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
