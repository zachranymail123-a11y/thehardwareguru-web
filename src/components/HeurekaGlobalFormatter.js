"use client";
import { useEffect } from 'react';

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixHeurekaLink = (el) => {
            const href = el.getAttribute('href');
            if (!href || !href.includes('heureka.cz')) return;
            
            // Pokud už odkaz začíná haff kódem na správné doméně, neřešíme ho
            if (href.includes('www.heureka.cz') && href.includes('haff=276049')) return;

            try {
                const url = new URL(href, window.location.origin);
                let query = "";

                // Tahání výrazu z jakéhokoli bordelu (f:q:, h[fraze], nebo slug)
                if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    const fqMatch = url.pathname.match(/q[:=]([^/&?]+)/) || url.pathname.match(/f:q:([^/&?]+)/);
                    if (fqMatch) {
                        query = decodeURIComponent(fqMatch[1]);
                    } else {
                        query = url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
                    }
                }

                if (!query || query.length < 2) query = "PC komponenty";
                
                // Vyčištění dotazu od slova "cena" a mezer
                const safeQuery = query.toLowerCase().replace('cena', '').trim().replace(/\s+/g, '+');

                // 🔥 TADY JE TA MAGIE: Všechno na WWW a haff hned za otazník 🔥
                // Tímhle vynutíme zapsání cookies dřív, než Heureka stihne cokoli redirectnout.
                const subId = url.searchParams.get('utm_content') || 'global-v10-hardfix';
                const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;

                el.setAttribute('href', newHref);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'nofollow sponsored');
                el.dataset.guruFixed = "true";
            } catch (e) {
                // Ticho po pěšině
            }
        };

        const runFix = () => {
            // Najde všechno s heureka.cz, co jsme ještě neopravili
            document.querySelectorAll('a[href*="heureka.cz"]:not([data-guru-fixed="true"])').forEach(fixHeurekaLink);
        };

        // Spustit okamžitě při načtení
        runFix();

        // Sledovat změny v DOMu (Next.js routing, kalkulačky atd.)
        const observer = new MutationObserver(runFix);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['href'] 
        });

        // Poslední pojistka: každejch 1500ms to projistotu proskenujeme znovu
        const interval = setInterval(runFix, 1500);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
