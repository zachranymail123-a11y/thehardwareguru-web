"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud je odkaz už na hlavní doméně a má haff, neřešíme ho (aby se to nezacyklilo)
            if (href.includes('www.heureka.cz') && href.includes('haff=276049') && href.includes('h%5Bfraze%5D')) return;

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // Extrakce hledaného slova z jakéhokoliv formátu (f:q:, h[fraze] nebo parametry)
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    const fqMatch = url.pathname.match(/f:q:([^/]+)/);
                    if (fqMatch) {
                        query = decodeURIComponent(fqMatch[1]);
                    } else {
                        // Poslední záchrana - vezmi poslední slovo z cesty (očištěné o pomlčky)
                        query = url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
                    }
                }

                if (!query || query.length < 2) query = "PC komponenty";
                
                // Formátování: smazat slovo "cena" (pokud tam je), vyčistit mezery a dát pluska
                const safeQuery = query.toLowerCase()
                    .replace('cena', '')
                    .trim()
                    .replace(/\s+/g, '+');

                // 🔥 FINÁLNÍ ŘEŠENÍ: Vynucení hlavní domény www.heureka.cz 🔥
                // Tady haff funguje 100% a redirect se děje až PO zapsání cookies.
                const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=global-formatter`;

                el.setAttribute('href', newHref);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'nofollow sponsored');
            } catch (e) {
                // Tichý error
            }
        };

        // 1. Spustit okamžitě
        const runFix = () => document.querySelectorAll('a[href*="heureka.cz"]').forEach(fixHeurekaLink);
        runFix();

        // 2. Agresivní MutationObserver (sleduje změny v HTML i v atributech href)
        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['href'] 
        });

        // 3. Fallback interval pro jistotu (každé 2 vteřiny)
        const interval = setInterval(runFix, 2000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
