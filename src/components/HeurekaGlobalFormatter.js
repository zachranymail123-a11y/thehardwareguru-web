"use client";
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const formatHeurekaLink = (el) => {
            const originalHref = el.getAttribute('href');
            if (!originalHref || !originalHref.includes('heureka.cz')) return;

            // Pokud už je odkaz ve správném čistém tvaru, necháme ho být
            if (originalHref.includes('haff=276049') && originalHref.includes('h%5Bfraze%5D')) {
                attachTracking(el, new URL(originalHref, window.location.origin).searchParams.get('utm_content') || 'v10-global');
                return;
            }

            try {
                const url = new URL(originalHref, window.location.origin);
                let query = "";

                // Detekce zkurvených f:q: filtrů nebo subdomén a extrakce hledaného slova
                const pathParts = url.pathname.split('/');
                const fqPart = pathParts.find(p => p.startsWith('f:q:'));
                
                if (fqPart) {
                    query = decodeURIComponent(fqPart.replace('f:q:', ''));
                } else if (url.searchParams.has('h[fraze]')) {
                    query = url.searchParams.get('h[fraze]');
                } else {
                    // Fallback pokud je to nějaký jiný bordel odkaz
                    query = pathParts[pathParts.length - 1].replace(/-/g, ' ');
                }

                if (!query || query.length < 2) query = "PC komponenty";

                // Čisté mezery do plusů
                const safeQuery = query.trim().replace(/\s+/g, '+');
                const subId = url.searchParams.get('utm_content') || 'v10-global-rewrite';

                // 🔥 PŘEPSÁNÍ NA JEDINÝ SCHVÁLENÝ NATIVNÍ TVAR 🔥
                const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
                
                el.setAttribute('href', newHref);
                
                // Ujistíme se, že odkaz se otevře v novém okně, ať user neopustí tvůj web
                if (el.getAttribute('target') !== '_blank') {
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'nofollow sponsored');
                }

                attachTracking(el, subId);
            } catch (e) {}
        };

        const attachTracking = (el, subId) => {
            if (!el.hasAttribute('data-guru-tracked')) {
                el.setAttribute('data-guru-tracked', 'true');
                el.addEventListener('click', () => {
                    if (navigator.sendBeacon) {
                        const payload = { platform: 'heureka', category: 'global_rewrite', sub_id: subId, page: window.location.pathname };
                        navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
                    }
                }, { passive: true }); // passive = true garantuje, že to absolutně nijak nezablokuje proklik
            }
        };

        // 1. Okamžité přepsání všech existujících Heureka odkazů po načtení
        document.querySelectorAll('a[href*="heureka.cz"]').forEach(formatHeurekaLink);

        // 2. MutationObserver: Sleduje, jestli React/Next.js nevykreslil nové komponenty (např. po kliknutí na jinou stránku)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { 
                            if (node.tagName === 'A') formatHeurekaLink(node);
                            node.querySelectorAll?.('a[href*="heureka.cz"]').forEach(formatHeurekaLink);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return null; // Renderuje se úplně neviditelně
}
