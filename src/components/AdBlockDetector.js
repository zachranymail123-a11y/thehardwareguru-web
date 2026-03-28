"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Heart, Zap } from 'lucide-react';

/**
 * GURU ADBLOCK DETECTOR V1.0
 * 🚀 CÍL: Slušná prosba o podporu provozu bez blokování obsahu.
 */

export default function AdBlockDetector() {
    const [isAdBlockActive, setIsAdBlockActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isEn, setIsEn] = useState(false);

    useEffect(() => {
        // Detekce jazyka
        if (typeof window !== 'undefined') {
            setIsEn(window.location.pathname.startsWith('/en'));
        }

        // Funkce pro kontrolu AdBlocku
        const checkAdBlock = async () => {
            // Metoda 1: Kontrola existence falešného reklamního elementu
            const fakeAd = document.createElement('div');
            fakeAd.innerHTML = '&nbsp;';
            fakeAd.className = 'adsbox ad-placement ad-content doubleclick-ad';
            fakeAd.style.position = 'absolute';
            fakeAd.style.left = '-9999px';
            document.body.appendChild(fakeAd);

            window.setTimeout(() => {
                if (fakeAd.offsetHeight === 0 || !document.body.contains(fakeAd)) {
                    // AdBlock pravděpodobně aktivní
                    const dismissed = sessionStorage.getItem('guru_adblock_dismissed');
                    if (!dismissed) {
                        setIsAdBlockActive(true);
                        setIsVisible(true);
                    }
                }
                if (document.body.contains(fakeAd)) {
                    document.body.removeChild(fakeAd);
                }
            }, 100);
        };

        checkAdBlock();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Uložíme do session, aby Guru neotravoval při každém kliknutí, ale jen jednou za návštěvu
        sessionStorage.setItem('guru_adblock_dismissed', 'true');
    };

    if (!isAdBlockActive || !isVisible) return null;

    return (
        <div className="adblock-banner-root">
            <style dangerouslySetInnerHTML={{ __html: `
                .adblock-banner-root {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    width: 90%;
                    max-width: 600px;
                    animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .adblock-container {
                    background: rgba(15, 17, 21, 0.95);
                    backdrop-filter: blur(15px);
                    border: 2px solid #eab308;
                    border-radius: 24px;
                    padding: 25px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(234, 179, 8, 0.2);
                }

                .guru-icon-zone {
                    background: rgba(234, 179, 8, 0.1);
                    color: #eab308;
                    padding: 15px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .guru-text-zone {
                    flex: 1;
                }

                .guru-text-zone h4 {
                    margin: 0 0 5px 0;
                    color: #fff;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 16px;
                    letter-spacing: 1px;
                }

                .guru-text-zone p {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .guru-close-btn {
                    background: none;
                    border: none;
                    color: #4b5563;
                    cursor: pointer;
                    padding: 5px;
                    transition: 0.2s;
                    align-self: flex-start;
                }

                .guru-close-btn:hover {
                    color: #fff;
                }

                @keyframes slideUp {
                    from { bottom: -100px; opacity: 0; }
                    to { bottom: 20px; opacity: 1; }
                }

                @media (max-width: 600px) {
                    .adblock-container { flex-direction: column; text-align: center; padding: 20px; }
                    .adblock-banner-root { bottom: 10px; }
                    .guru-close-btn { position: absolute; top: 10px; right: 10px; }
                }
            `}} />

            <div className="adblock-container">
                <div className="guru-icon-zone">
                    <ShieldAlert size={32} />
                </div>
                
                <div className="guru-text-zone">
                    <h4>{isEn ? "SYSTEM OPTIMIZATION NEEDED" : "POTŘEBUJEME OPTIMALIZACI"}</h4>
                    <p>
                        {isEn 
                          ? "Hey Guru! We see you're using an AdBlocker. This system runs on data and electricity (and ads). If our tools help you, please consider disabling it to support further development."
                          : "Čau Guru! Vidíme, že tvůj prohlížeč blokuje reklamy. Chápeme to, ale provoz téhle mašiny a databáze něco stojí. Pokud ti naše testy pomáhají, vypni prosím AdBlock. Pomůžeš nám udržet systém v chodu."
                        }
                    </p>
                </div>

                <button onClick={handleDismiss} className="guru-close-btn" aria-label="Close">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
