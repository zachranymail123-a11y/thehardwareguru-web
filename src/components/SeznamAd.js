"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SeznamAd({ zoneId, width, height, className = "" }) {
  const pathname = usePathname();
  // Vytvoříme unikátní ID pro každý banner, aby se jich mohlo načíst víc na jedné stránce
  const [divId] = useState(`ssp-zone-${zoneId}-${Math.random().toString(36).substring(2, 9)}`);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Timeout zajistí, že počkáme na načtení hlavního ssp.js skriptu
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.sssp) {
        
        // Pokud jsme zrovna přešli na novou stránku, řekneme Seznamu, ať započítá nové PageView
        if (!window.guruSspPageTracked || window.guruSspPageTracked !== pathname) {
          window.sssp.setPageViewId();
          window.guruSspPageTracked = pathname;
        }

        // Zavoláme samotnou reklamu
        window.sssp.getAds([
          {
            zoneId: zoneId,
            id: divId,
            width: width,
            height: height,
          }
        ]);
        isLoaded.current = true;
      } else {
        console.warn("Seznam SSP skript nebyl nalezen.");
      }
    }, 500); // Lehké zpoždění pro jistotu, aby se neprali s Reactem

    return () => clearTimeout(timer);
  }, [zoneId, width, height, divId, pathname]);

  return (
    <div className={`flex justify-center items-center my-6 w-full ${className}`}>
      <div 
        id={divId} 
        style={{ minWidth: width, minHeight: height, background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}
        className="overflow-hidden flex justify-center items-center"
      >
        {/* Sem Seznam střelí ten svůj iframe */}
      </div>
    </div>
  );
}
