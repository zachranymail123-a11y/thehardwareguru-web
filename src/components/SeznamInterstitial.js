"use client";

import { useEffect } from 'react';

/**
 * GURU OVERLAY AD ENGINE V1.2
 * 🚀 CÍL: Oprava nulových zobrazení u Vinět a Interstitialů.
 * Zóny z obrázku: 408681 (Mobilní viněta), 408684 (Interstitial)
 */

export default function SeznamInterstitial() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.sssp && window.sssp.getAds) {
        // Voláme speciální overlay zóny bez vazby na konkrétní div v HTML
        window.sssp.getAds([
          { 
            zoneId: 408681, // Mobilní viněta
            callback: (data) => console.log("Guru Viněta status:", data.status)
          },
          { 
            zoneId: 408684, // Interstitial (Desktop/Tablet)
            callback: (data) => console.log("Guru Interstitial status:", data.status)
          }
        ]);
      }
    }, 2000); // 2 vteřiny delay, aby se nejdřív načetl hlavní obsah webu

    return () => clearTimeout(timer);
  }, []);

  return null; // Komponenta je neviditelná, jen spouští skript
}
