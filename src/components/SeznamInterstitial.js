'use client';
import { useEffect } from 'react';

export default function SeznamInterstitial() {
  useEffect(() => {
    const loadInterstitial = () => {
      if (typeof window !== 'undefined' && window.ssp && window.ssp.getAds) {
        const isMobile = window.innerWidth <= 768;
        window.ssp.getAds([
          {
            zoneId: isMobile ? 408681 : 408684,
            id: 'szn-interstitial-slot',
            type: 'interstitial'
          }
        ]);
      } else if (typeof window !== 'undefined') {
        setTimeout(loadInterstitial, 500);
      }
    };

    loadInterstitial();
  }, []);

  return <div id="szn-interstitial-slot" style={{ display: 'none' }} />;
}
