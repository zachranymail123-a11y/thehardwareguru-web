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
      <div 
        id={divId} 
        /* OPRAVA ZDE: minWidth nahrazeno za width 100% a maxWidth */
        style={{ width: '100%', maxWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        /* OPRAVA ZDE: přidáno [&_*]:!max-w-full pro donucení Seznam obalů ke zmenšení na mobilech */
        className="overflow-hidden flex justify-center items-center [&_*]:!max-w-full [&_iframe]:!h-auto"
      >
      </div>
    </div>
  );
}
