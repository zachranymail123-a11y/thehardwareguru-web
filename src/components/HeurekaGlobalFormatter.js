"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud je to už správně na www.heureka.cz s haff, necháme to být
            if (href.includes('www.heureka.cz') && href.includes('haff=276049') && href.includes('h%5Bfraze%5D')) {
                return;
            }

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // Extrakce hledaného slova z jakéhokoli zkurveného formátu
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    // Chytne to f:q: i f:2806:7112;q: a podobný bordely
                    const fqMatch = url.pathname.match(/[;q:]q[:=]([^/&?]+)/) || url.pathname.match(/f:q:([^/&?]+)/);
                    if (fqMatch) {
                        query = decodeURIComponent(fqMatch[1]);
                    } else {
                        query = url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
                    }
                }

                if (!query || query.length < 2) query = "PC komponenty";
                
                // Čistý dotaz bez sraček jako "cena" a s pluskama
                const safeQuery = query.toLowerCase().replace('cena', '').trim().replace(/\s+/g, '+');

                // 🔥 TOTÁLNÍ FIX: Všechno posíláme na WWW.HEUREKA.CZ 🔥
                // Žádný procesory.heureka.cz nebo pameti.heureka.cz - ty to bourají.
                const subId = url.searchParams.get('utm_content') || 'global-v10-fix';
                const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;

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

        // Agresivní interval pro jistotu
        const interval = setInterval(runFix, 1000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
