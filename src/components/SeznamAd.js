"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SeznamAd({ zoneId, width, height, className = "" }) {
  const pathname = usePathname();
  const [divId, setDivId] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Generujeme ID na klientovi
    setDivId(`ssp-zone-${zoneId}-${Math.random().toString(36).substring(2, 9)}`);
  }, [zoneId]);

  useEffect(() => {
    if (!divId) return;

    const loadAd = () => {
      // OPRAVA: Z tvé zálohy opraveno sssp na ssp
      if (typeof window !== 'undefined' && window.ssp) {
        // SPA Tracking - započítání PageView
        if (!window.guruSspPageTracked || window.guruSspPageTracked !== pathname) {
          window.ssp.setPageViewId();
          window.guruSspPageTracked = pathname;
        }

        // Zavolání reklamy
        window.ssp.getAds([
          {
            zoneId: zoneId,
            id: divId,
            width: width,
            height: height,
          }
        ]);

        // Inteligentní detekce AdBlocku (žádné problikávání)
        setTimeout(() => {
          const el = document.getElementById(divId);
          if (el && el.innerHTML.trim().length === 0) {
            setIsBlocked(true);
          }
        }, 3000);
      } else {
        // Pojistka, pokud se Seznam script načítá pomaleji
        setTimeout(loadAd, 500);
      }
    };

    // 1. Pokus o načtení hned po renderu
    const timer = setTimeout(loadAd, 400);

    // 2. Posluchač pro návrat tlačítkem ZPĚT (bfcache)
    const handlePageShow = (event) => {
      if (event.persisted) {
        loadAd();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [zoneId, width, height, divId, pathname]);

  if (!divId) return <div style={{ minHeight: height }} className="w-full" />;

  return (
    <div className={`relative flex justify-center items-center w-full ${className}`} style={{ minWidth: width, minHeight: height }}>
      {/* 📺 Reklama - zIndex zaručuje, že překryje fallback */}
      <div 
        id={divId} 
        style={{ width: '100%', height: '100%', zIndex: 10, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        className="absolute inset-0 overflow-hidden flex justify-center items-center"
      />
      
      {/* 🛡️ Fallback - vykreslí se AŽ po 3 vteřinách a POUZE pokud je reklama prázdná */}
      {isBlocked && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-4 text-center rounded-xl" style={{ background: '#0a0b0d', border: '1px solid rgba(0, 255, 204, 0.2)' }}>
          <div style={{ color: '#00ffcc', fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontWeight: '900', color: '#fff', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>AdBlock Detekován</div>
          <div style={{ fontSize: '10px', color: '#00ffcc', fontWeight: 'bold', marginTop: '4px' }}>The Hardware Guru</div>
        </div>
      )}
    </div>
  );
}
