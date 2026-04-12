"use client";
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaGlobalFormatter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fixAllHeurekaLinks = () => {
            document.querySelectorAll('a[href*="heureka.cz"]').forEach(el => {
                const originalHref = el.getAttribute('href');
                if (!originalHref) return;

                // Pokud už jsme tento element úspěšně přepsali, přeskočíme ho
                if (el.dataset.guruFormatted === "true" && originalHref.includes('haff=276049') && !originalHref.includes('procesory.heureka.cz')) {
                    return;
                }

                try {
                    const decodedHref = decodeURIComponent(originalHref);
                    let query = "";

                    // 1. Zkusí vytáhnout výraz z čistého h[fraze]=
                    if (decodedHref.includes('h[fraze]=')) {
                        query = decodedHref.split('h[fraze]=')[1].split('&')[0];
                    } 
                    // 2. Extrakce ze zkurvených filtrů jako f:2806:7112;q:ryzen 7 5700x nebo f:q:ryzen
                    else if (decodedHref.match(/[;?&]q[:=]([^&?/;]+)/)) {
                        query = decodedHref.match(/[;?&]q[:=]([^&?/;]+)/)[1];
                    } 
                    // 3. Fallback na poslední segment cesty
                    else {
                        const urlObj = new URL(originalHref, window.location.origin);
                        const parts = urlObj.pathname.split('/').filter(Boolean);
                        if (parts.length > 0) {
                            query = parts[parts.length - 1];
                        }
                    }

                    if (!query || query.length < 2) query = "PC komponenty";

                    // Extrémně bezpečné převedení na plusa (vyčistí i neviditelné znaky a podtržítka)
                    const safeQuery = query.replace(/[-_]/g, ' ').trim().replace(/\s+/g, '+');

                    // Zachování utm_content pokud tam byl
                    let subId = 'v10-global-rewrite';
                    try {
                        const u = new URL(originalHref, window.location.origin);
                        if (u.searchParams.has('utm_content')) {
                            subId = u.searchParams.get('utm_content');
                        }
                    } catch(e) {}

                    // 🔥 TVORBA JEDINÉHO ČISTÉHO URL (PŘÍMO NA WWW.HEUREKA.CZ S HAFF) 🔥
                    const newHref = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;

                    // Přepis do DOMu
                    el.setAttribute('href', newHref);
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'nofollow sponsored');
                    el.dataset.guruFormatted = "true";

                    // Přidání tichého analytického eventu (jen poprvé)
                    if (!el.dataset.guruTracked) {
                        el.dataset.guruTracked = "true";
                        el.addEventListener('click', () => {
                            if (navigator.sendBeacon) {
                                const payload = { platform: 'heureka', category: 'global_rewrite', sub_id: subId, page: window.location.pathname };
                                navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
                            }
                        }, { passive: true });
                    }
                } catch (e) {
                    console.error("Guru Formatter failed to parse:", originalHref);
                }
            });
        };

        // 1. Spustit okamžitě
        fixAllHeurekaLinks();

        // 2. EXTRÉMNĚ AGRESIVNÍ FALLBACK (každých 500ms)
        // Tohle zajistí, že i když Next.js převede stránku a dosadí špatný link z databáze,
        // skript ho do půl vteřiny najde a nemilosrdně opraví.
        const intervalId = setInterval(fixAllHeurekaLinks, 500);

        // 3. Klasický MutationObserver pro okamžitou reakci na změny
        const observer = new MutationObserver(fixAllHeurekaLinks);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });

        return () => {
            clearInterval(intervalId);
            observer.disconnect();
        };
    }, []);

    return null;
}
