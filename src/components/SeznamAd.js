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
    <div className={`flex justify-center items-center my-6 w-full ${className}`}>
      <div 
        id={divId} 
        style={{ minWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
        // 🚀 OPRAVA: Odstraněno 'overflow-hidden'. Reklama se už nebude na mobilu z boků ořezávat.
        className="flex justify-center items-center"
      >
      </div>
    </div>
  );
}
