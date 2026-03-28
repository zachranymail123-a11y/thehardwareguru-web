'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * GURU SEZNAM AD COMPONENT V2 (ADBLOCK SHIELD)
 * 🚀 CÍL: Vykreslení reklamy + automatická detekce AdBlocku s komunitní výzvou.
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
        // 🔥 GURU ŠTÍT (Fallback pro AdBlock) 🔥
        <div style={{
          width: '100%',
          height: '100%',
          minHeight: height ? `${height}px` : '250px',
          background: 'linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, rgba(10, 11, 13, 0.95) 100%)',
          border: '1px dashed rgba(102, 252, 241, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          color: '#9ca3af',
          boxSizing: 'border-box'
        }}>
          <ShieldAlert size={32} color="#66fcf1" style={{ marginBottom: '12px', opacity: 0.8 }} />
          <strong style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            GURU ŠTÍT AKTIVOVÁN
          </strong>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '250px' }}>
            Šéfe, servery a testy něco stojí. Hoď si <span style={{ color: '#a855f7', fontWeight: 'bold' }}>The Hardware Guru</span> do výjimek v AdBlocku, ať tu můžeme dál drtit hardware. Díky! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
