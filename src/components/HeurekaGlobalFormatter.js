"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud už odkaz obsahuje tvůj haff a správný formát, nešahej na něj
            if (href.includes('haff=276049') && href.includes('h%5Bfraze%5D')) return;

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // Extrakce hledaného slova z jakéhokoliv formátu (f:q: nebo h[fraze])
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    const fqMatch = url.pathname.match(/f:q:([^/]+)/);
                    if (fqMatch) {
                        query = decodeURIComponent(fqMatch[1]);
                    } else {
                        // Poslední záchrana - vezmi poslední slovo z cesty
                        query = url.pathname.split('/').filter(Boolean).pop();
                    }
                }

                if (!query) query = "PC komponenty";
                const safeQuery = query.replace(/\+/g, ' ').trim().replace(/\s+/g, '+');

                // 🔥 KLÍČOVÁ ZMĚNA: Vnutíme haff přímo do URL parametrů, 
                // ale zachováme původní subdoménu (např. procesory.heureka.cz), 
                // aby Heureka už neměla důvod k dalšímu redirectu a mazání.
                const cleanBase = url.hostname; // např. procesory.heureka.cz
                const newHref = `https://${cleanBase}/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=global-fix`;

                el.setAttribute('href', newHref);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'nofollow sponsored');
            } catch (e) {
                console.error("Link fix error:", e);
            }
        };

        // Spustit hned a pak sledovat změny na stránce (MutationObserver)
        const runFix = () => document.querySelectorAll('a[href*="heureka.cz"]').forEach(fixHeurekaLink);
        runFix();

        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return null;
}
