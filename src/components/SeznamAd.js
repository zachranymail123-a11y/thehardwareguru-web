"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SeznamAd({ zoneId, width, height, className = "" }) {
  const pathname = usePathname();
  const [divId, setDivId] = useState("");

  useEffect(() => {
    // Generujeme ID na klientovi
    setDivId(`ssp-zone-${zoneId}-${Math.random().toString(36).substring(2, 9)}`);
  }, [zoneId]);

  useEffect(() => {
    if (!divId) return;

    const loadAd = () => {
      if (typeof window !== 'undefined' && window.sssp) {
        // SPA Tracking - započítání PageView
        if (!window.guruSspPageTracked || window.guruSspPageTracked !== pathname) {
          window.sssp.setPageViewId();
          window.guruSspPageTracked = pathname;
        }

        // Zavolání reklamy
        window.sssp.getAds([
          {
            zoneId: zoneId,
            id: divId,
            width: width,
            height: height,
          }
        ]);
      }
    };

    // 1. Pokus o načtení hned po renderu
    const timer = setTimeout(loadAd, 400);

    // 2. OPRAVA BUGU: Posluchač pro návrat tlačítkem ZPĚT (bfcache)
    const handlePageShow = (event) => {
      // event.persisted je true, pokud se stránka načetla z paměti (tlačítko zpět)
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
    <div className={`flex justify-center items-center my-6 w-full ${className}`}>
      {/* 🚀 ČISTÝ CSS FIX: Pouze na malých mobilech pod 380px aplikuje 85% zmenšení, aby se reklama neořízla. Žádné další divy. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 380px) {
          #${divId} {
            transform: scale(0.85);
            transform-origin: center center;
          }
        }
      `}} />
      
      <div 
        id={divId} 
        style={{ minWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        className="overflow-hidden flex justify-center items-center"
      >
      </div>
    </div>
  );
}
