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
      {/* 🚀 PŘIDÁNO: CSS pravidlo, které zaručí, že se iframe reklamy na mobilu přizpůsobí a neustřihne se z něj ani pixel */}
      <style>{`#${divId} iframe { max-width: 100% !important; height: auto !important; }`}</style>
      
      <div 
        id={divId} 
        /* 🚀 PŘIDÁNO: maxWidth: '100%', aby kontejner nikdy nepřetekl z okraje mobilu */
        style={{ minWidth: width, maxWidth: '100%', minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        className="overflow-hidden flex justify-center items-center"
      >
      </div>
    </div>
  );
}
