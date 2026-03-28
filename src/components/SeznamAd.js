"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SeznamAd({ zoneId, width, height, className = "" }) {
  const pathname = usePathname();
  const [divId, setDivId] = useState("");
  // 🚀 PŘIDÁNO: Stav pro výpočet 100% zmenšení reklamy na mobilu
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Generujeme ID na klientovi
    setDivId(`ssp-zone-${zoneId}-${Math.random().toString(36).substring(2, 9)}`);
  }, [zoneId]);

  // 🚀 PŘIDÁNO: Matematika pro zmenšení - pokud je displej menší než reklama, vypočítá se poměr (Scale)
  useEffect(() => {
    if (!width) return;
    const calculateScale = () => {
      const availableWidth = window.innerWidth - 30; // Rezerva na okraje
      if (availableWidth < width) {
        setScale(availableWidth / width); // Zmenší (např. na 0.35x), aby se vešla 100%
      } else {
        setScale(1); // Na desktopu nechá původní velikost
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [width]);

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

  // 🚀 PŘIDÁNO: Výška placeholderu se zmenší podle scale, aby nevznikla obří díra
  if (!divId) return <div style={{ minHeight: height ? height * scale : height }} className="w-full" />;

  return (
    // 🚀 PŘIDÁNO: Obal, který aplikuje CSS Scale, zmenší vše na 100 % viditelnost a zamezí ořezání.
    <div className={`flex justify-center items-start my-6 w-full ${className}`} style={{ height: height ? height * scale : 'auto', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: width, height: height }}>
        
        {/* TVŮJ PŮVODNÍ KÓD - absolutně beze změny */}
        <div 
          id={divId} 
          style={{ minWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
          className="overflow-hidden flex justify-center items-center"
        >
        </div>

      </div>
    </div>
  );
}
