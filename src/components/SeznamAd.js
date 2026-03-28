'use client';
import { useEffect, useState } from 'react';

/**
 * GURU SMART AD V2.0 (ANTI-FALLBACK HELL)
 * 🚀 Dynamické zapínání třídy guru-ad-fallback jen při detekci blokování.
 */
export default function SeznamAd({ zoneId, width, height }) {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkAd = () => {
      // 1. Pokud script ssp.js vůbec není v okně, je to jasnej block
      if (typeof window !== 'undefined' && !window.ssp) {
        setIsBlocked(true);
        return;
      }

      // 2. Volání Seznam SSP
      if (window.ssp && window.ssp.getAds) {
        window.ssp.getAds([{
          zoneId: zoneId,
          id: `ssp-zone-${zoneId}`,
          width: width,
          height: height
        }]);

        // 3. Pojistka: Pokud je po 2.5s slot prázdný nebo má nulovou výšku, zapneme fallback
        setTimeout(() => {
          const container = document.getElementById(`ssp-zone-${zoneId}`);
          if (container && (container.offsetHeight === 0 || container.innerHTML.trim() === "")) {
            setIsBlocked(true);
          }
        }, 2500);
      }
    };

    checkAd();
  }, [zoneId, width, height]);

  return (
    <div 
      className={isBlocked ? "guru-ad-fallback" : ""} 
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : 'auto',
        minHeight: isBlocked ? '250px' : '0',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div id={`ssp-zone-${zoneId}`} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
