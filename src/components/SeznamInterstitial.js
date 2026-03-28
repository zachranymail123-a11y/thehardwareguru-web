'use client';
import { useEffect } from 'react';

/**
 * GURU SMART INTERSTITIAL V1.0
 * 🚀 Aktivace nejvýdělečnějších formátů podle Seznam Partner IDs.
 */
export default function SeznamInterstitial() {
  useEffect(() => {
    const triggerAd = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        const isMobile = window.innerWidth <= 768;
        
        // IDs z tvého screenshotu
        const zoneId = isMobile ? 408681 : 408684;

        window.ssp.getAds([
          {
            zoneId: zoneId,
            id: 'szn-interstitial',
            type: 'interstitial'
          }
        ]);
      }
    };

    // Spuštění po 2 vteřinách, aby se user nejdřív nadechl
    const timer = setTimeout(triggerAd, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
