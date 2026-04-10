"use client";
import { useEffect } from 'react';

export default function OneSignalActivator() {
    useEffect(() => {
        // Funkce, která vyvolá zobrazení okna s žádostí o notifikace
        const triggerOneSignal = () => {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async function(OneSignal) {
                // Slidedown prompt je hezčí a méně agresivní než nativní okno, 
                // navíc se neblokuje tak snadno v prohlížečích.
                await OneSignal.Slidedown.promptPush();
            });
        };

        // Zkontrolujeme, jestli uživatel odklepl cookies už někdy dřív
        const consent = localStorage.getItem('guru_cookie_consent');
        if (consent === 'true' || consent === 'accepted') {
            triggerOneSignal();
        }

        // Posloucháme, jestli to náhodou neodklikne právě teď
        window.addEventListener('guruConsentGranted', triggerOneSignal);

        return () => window.removeEventListener('guruConsentGranted', triggerOneSignal);
    }, []);

    return null; // Tato komponenta nemá žádné UI, je neviditelná
}
