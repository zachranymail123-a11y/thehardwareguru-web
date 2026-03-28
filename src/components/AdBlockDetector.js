"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

/**
 * GURU ADBLOCK DETECTOR V1.1 (MINIMAL & MOBILE OPTIMIZED)
 * 🚀 CÍL: Kompaktní a slušná prosba o podporu podle vizuálního stylu Guru.
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
        const checkAdBlock = () => {
            const fakeAd = document.createElement('div');
            fakeAd.innerHTML = '&nbsp;';
            fakeAd.className = 'adsbox ad-placement ad-content doubleclick-ad pub_300x250';
            fakeAd.style.position = 'absolute';
            fakeAd.style.left = '-9999px';
            document.body.appendChild(fakeAd);

            window.setTimeout(() => {
                if (fakeAd.offsetHeight === 0 || !document.body.contains(fakeAd)) {
                    // AdBlock aktivní
                    const dismissed = sessionStorage.getItem('guru_adblock_dismissed');
                    if (!dismissed) {
                        setIsAdBlockActive(true);
                        setIsVisible(true);
                    }
                }
                if (document.body.contains(fakeAd)) {
                    document.body.removeChild(fakeAd);
                }
            }, 150);
        };

        checkAdBlock();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('guru_adblock_dismissed', 'true');
    };

    if (!isAdBlockActive || !isVisible) return null;

    return (
        <div className="guru-adblock-root">
            <style dangerouslySetInnerHTML={{ __html: `
                .guru-adblock-root {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 10000;
                    width: 100%;
                    max-width: 420px;
                    animation: guruFadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .guru-adblock-box {
                    background: rgba(10, 11, 13, 0.96);
                    backdrop-filter: blur(12px);
                    border: 1px solid #eab308;
                    border-radius: 20px;
                    padding: 18px;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 15px rgba(234, 179, 8, 0.15);
                    position: relative;
                }

                .guru-icon-box {
                    background: rgba(234, 179, 8, 0.1);
                    color: #eab308;
                    padding: 12px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .guru-content-box {
                    padding-right: 20px;
                }

                .guru-content-box h4 {
                    margin: 0 0 4px 0;
                    color: #fff;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 14px;
                    letter-spacing: 1.5px;
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                }

                .guru-content-box p {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 12px;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .guru-close-trigger {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: none;
                    border: none;
                    color: #4b5563;
                    cursor: pointer;
                    padding: 4px;
                    transition: 0.2s;
                    display: flex;
                }

                .guru-close-trigger:hover {
                    color: #fff;
                    transform: rotate(90deg);
                }

                @keyframes guruFadeIn {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .guru-adblock-root {
                        bottom: 0;
                        right: 0;
                        left: 0;
                        max-width: 100%;
                        padding: 15px;
                        box-sizing: border-box;
                    }
                    .guru-adblock-box {
                        border-radius: 16px;
                        padding: 15px;
                    }
                    .guru-content-box h4 { font-size: 13px; }
                    .guru-content-box p { font-size: 11px; }
                }
            `}} />

            <div className="guru-adblock-box">
                <div className="guru-icon-box">
                    <ShieldAlert size={24} />
                </div>
                
                <div className="guru-content-box">
                    <h4>{isEn ? "SYSTEM OPTIMIZATION" : "POTŘEBUJEME OPTIMALIZACI"}</h4>
                    <p>
                        {isEn 
                          ? "Hey Guru! We noticed you're blocking ads. Pro-grade tech news and databases need resources. Please consider whitelist to keep us running."
                          : "Čau Guru! Vidíme aktivní AdBlock. Chápeme to, ale provoz téhle mašiny a databáze něco stojí. Pokud ti testy pomáhají, vypni ho prosím."
                        }
                    </p>
                </div>

                <button onClick={handleDismiss} className="guru-close-trigger" aria-label="Close">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
