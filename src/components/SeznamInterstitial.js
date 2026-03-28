'use client';
import { useEffect } from 'react';

/**
 * GURU INTERSTITIAL TRIGGER (VINĚTA)
 * 🚀 CÍL: Aktivace nejvýdělečnějšího formátu od Seznamu.
 */
export default function SeznamInterstitial() {
  useEffect(() => {
    const triggerVineta = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        window.ssp.getAds([
          {
            zoneId: 408659, // 👈 Tady si v Seznam Partner najdi ID pro "Viněta" a vlož ho sem
            id: 'szn-interstitial',
            type: 'interstitial'
          }
        ]);
      }
    };

    // Malý timeout, aby se nejdřív nadechl hlavní obsah
    const timer = setTimeout(triggerVineta, 1500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
