"use client";

import { useEffect } from 'react';

/**
 * GURU OVERLAY AD ENGINE V1.2
 * 🚀 CÍL: Oprava nulových zobrazení u Vinět a Interstitialů přes SSP API.
 * Zóny: 408681 (Mobilní viněta), 408684 (Interstitial)
 */

export default function SeznamInterstitial() {
  useEffect(() => {
    const triggerOverlays = () => {
      // Kontrola, zda je ssp.js načten v okně
      if (window.sssp && typeof window.sssp.getAds === 'function') {
        window.sssp.getAds([
          { 
            zoneId: 408681, // Mobilní viněta (z tvého screenu)
            callback: (data) => console.log("Guru Viněta status:", data.status)
          },
          { 
            zoneId: 408684, // Interstitial (z tvého screenu)
            callback: (data) => console.log("Guru Interstitial status:", data.status)
          }
        ]);
      }
    };

    // 2 vteřiny delay: Dáme webu čas se vykreslit, než tam Guru „vystřelí“ reklamu
    const timer = setTimeout(triggerOverlays, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Komponenta je technický spouštěč, nic nevykresluje
}
