"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud už odkaz začíná haff kódem, považujeme ho za opravený
            if (href.includes('?haff=276049')) return;

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // 1. Vytáhneme hledaný výraz z jakéhokoli formátu
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else if (url.pathname.includes('f:q:')) {
                    query = url.pathname.split('f:q:')[1].split('/')[0];
                } else {
                    query = url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
                }

                if (!query) query = "PC komponenty";
                
                // 2. Vyčistíme dotaz (žádná "cena", jen čistý produkt a pluska)
                const safeQuery = decodeURIComponent(query)
                    .toLowerCase()
                    .replace('cena', '')
                    .trim()
                    .replace(/\s+/g, '+');

                // 3. 🔥 AGRESIVNÍ KONSTRUKCE: haff musí být PRVNÍ parametr za otazníkem 🔥
                // Tímto přebijeme redirecty Heureky na subdomény
                const utmContent = url.searchParams.get('utm_content') || 'global-formatter-v10';
                
                const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${utmContent}`;

                el.setAttribute('href', newHref);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'nofollow sponsored');
                
                // Přidáme značku, že jsme to opravili
                el.dataset.guruFixed = "true";
            } catch (e) {
                // Tichý fallback
            }
        };

        const runFix = () => {
            document.querySelectorAll('a[href*="heureka.cz"]:not([data-guru-fixed="true"])').forEach(fixHeurekaLink);
        };

        // Spustit hned
        runFix();

        // Sledovat každou změnu na stránce (Next.js překreslování)
        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['href'] 
        });

        // Poslední pojistka - interval
        const interval = setInterval(runFix, 1000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
