"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud už odkaz obsahuje tvůj haff, nešahej na něj, ať to nerozbiješ víc
            if (href.includes('haff=276049')) return;

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // Extrakce hledaného slova z jakéhokoliv formátu (f:q:, h[fraze] atd.)
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    // Tahle regex potvora vytáhne slovo i z f:q:ryzen nebo f:2806:q:ryzen
                    const fqMatch = url.pathname.match(/q:([^/&?]+)/);
                    if (fqMatch) {
                        query = decodeURIComponent(fqMatch[1]);
                    } else {
                        query = url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
                    }
                }

                if (!query || query.length < 2) query = "PC komponenty";
                
                // Čistý dotaz (pluska místo mezer)
                const safeQuery = query.toLowerCase().replace('cena', '').trim().replace(/\s+/g, '+');

                // 🔥 FINÁLNÍ FIX PODLE ADMINU HEUREKY 🔥
                // Sestavíme to jako čistý search na dané subdoméně s parametry, které Heureka nesmaže
                const subId = url.searchParams.get('utm_content') || 'global-v10-final';
                
                // Použijeme formát, který Heureka doporučuje pro přímé odkazy
                const newHref = `https://${url.hostname}/?h%5Bfraze%5D=${safeQuery}&haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;

                el.setAttribute('href', newHref);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'nofollow sponsored');
                el.dataset.guruFixed = "true";
            } catch (e) {
                // Tichý error
            }
        };

        const runFix = () => {
            document.querySelectorAll('a[href*="heureka.cz"]:not([data-guru-fixed="true"])').forEach(fixHeurekaLink);
        };

        runFix();

        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['href'] 
        });

        const interval = setInterval(runFix, 1000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
