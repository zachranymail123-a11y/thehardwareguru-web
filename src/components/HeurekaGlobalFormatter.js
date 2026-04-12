"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud už odkaz obsahuje tvůj haff a začíná správně, neřešíme
            if (href.includes('www.heureka.cz') && href.includes('haff=276049')) return;

            try {
                // Vypreparujeme z původního odkazu hledané slovo (z f:q:, h[fraze] nebo slug)
                const decodedHref = decodeURIComponent(href);
                let query = "";

                if (decodedHref.includes('h[fraze]=')) {
                    query = decodedHref.split('h[fraze]=')[1].split('&')[0];
                } else if (decodedHref.includes('q:')) {
                    // Chytne q: z f:q: i f:2806:q:
                    query = decodedHref.split('q:')[1].split(/[/?&;]/)[0];
                } else {
                    const parts = decodedHref.split('/').filter(Boolean);
                    query = parts[parts.length - 1];
                }

                if (!query || query.length < 2) query = "hardwarovy guru";

                // Čistý dotaz pro vyhledávání (pluska místo mezer)
                const safeQuery = query.toLowerCase().replace('cena', '').trim().replace(/\s+/g, '+');

                // Zachování utm_content pro tvůj tracking
                let subId = 'global-rewrite-v11';
                if (href.includes('utm_content=')) {
                    subId = href.split('utm_content=')[1].split('&')[0];
                }

                // 🔥 FINÁLNÍ ŘEŠENÍ: Všechno na hlavní doménu www.heureka.cz 🔥
                // Tímhle vynutíme zapsání affiliate cookie hned při startu.
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

        // Spustit hned
        runFix();

        // Sledovat každou změnu (Next.js překreslování)
        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['href'] 
        });

        // Agresivní fallback interval (každých 500ms)
        const interval = setInterval(runFix, 500);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
