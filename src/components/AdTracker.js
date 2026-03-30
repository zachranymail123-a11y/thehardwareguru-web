'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * GURU MONETIZATION ENGINE - AD TRACKER V1.1 (SUSPENSE FIX)
 * 🚀 CÍL: Záchrana 0 zobrazení u mobilních Vinět a Interstitial reklam v Next.js SPA.
 */

function AdTrackerLogic() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Ochrana před chybami na serveru (SSR)
        if (typeof window === 'undefined') return;

        // Krátký timeout zajišťuje, že se nová stránka (DOM) plně vykreslí, 
        // než Seznam skript začne hledat zóny a počítat viewability.
        const timer = setTimeout(() => {
            if (window.sssp) {
                try {
                    // 1. Vyčištění fronty a starých reklam (zabrání memory leakům v SPA)
                    window.sssp.push(['_flush']);
                    
                    // 2. Ruční trigger pro znovunačtení reklamních zón a mobilních formátů
                    if (typeof window.sssp.getAds === 'function') {
                        window.sssp.getAds();
                    }
                } catch (e) {
                    console.error('GURU SSP Tracker Error:', e);
                }
            }
        }, 300); 

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return null; // Logika nemá UI
}

export default function AdTracker() {
    return (
        // 🚀 GURU FIX: Next.js 14 vyžaduje Suspense pro useSearchParams při buildu
        <Suspense fallback={null}>
            <AdTrackerLogic />
        </Suspense>
    );
}
