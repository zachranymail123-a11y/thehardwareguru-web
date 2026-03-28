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
      // OPRAVA: Tvůj původní sssp překlep byl opraven na ssp
      if (typeof window !== 'undefined' && window.ssp) {
        // SPA Tracking
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

        // Kontrola AdBlocku (neničí DOM, jen přepne stav)
        setTimeout(() => {
          const el = document.getElementById(divId);
          if (el && el.innerHTML.trim().length === 0) {
            setIsBlocked(true);
          }
        }, 3000);
      } else {
        setTimeout(loadAd, 500);
      }
    };

    const timer = setTimeout(loadAd, 400);

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
    <div className={`relative flex justify-center items-center my-6 w-full ${className}`} style={{ minHeight: height }}>
      {/* 📺 PŮVODNÍ FUNKČNÍ SLOT (Bez narušení toku dokumentu) */}
      <div 
        id={divId} 
        style={{ minWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        className="overflow-hidden flex justify-center items-center relative z-10"
      >
      </div>

      {/* 🛡️ FALLBACK (Zobrazí se nad slotem, jen když je blokováno) */}
      {isBlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center rounded-xl" style={{ background: '#0a0b0d', border: '1px solid rgba(0, 255, 204, 0.2)', minWidth: width, minHeight: height }}>
          <div style={{ color: '#00ffcc', fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontWeight: '900', color: '#fff', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>AdBlock Detekován</div>
          <div style={{ fontSize: '10px', color: '#00ffcc', fontWeight: 'bold', marginTop: '4px' }}>The Hardware Guru</div>
        </div>
      )}
    </div>
  );
}
