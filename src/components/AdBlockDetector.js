"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Zap, ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/**
 * GURU ADBLOCK DETECTOR V2.1 (MONETIZATION FALLBACK)
 * 🚀 CÍL: Pokud uživatel blokuje reklamy, nasměrovat ho na eHUB partnery (CTR optimalizace).
 */

export default function AdBlockDetector() {
    const [isAdBlockActive, setIsAdBlockActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isEn, setIsEn] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsEn(window.location.pathname.startsWith('/en'));
        }

        const checkAdBlock = () => {
            const fakeAd = document.createElement('div');
            fakeAd.innerHTML = '&nbsp;';
            fakeAd.className = 'adsbox ad-placement ad-content doubleclick-ad pub_300x250';
            fakeAd.style.position = 'absolute';
            fakeAd.style.left = '-9999px';
            document.body.appendChild(fakeAd);

            window.setTimeout(() => {
                if (fakeAd.offsetHeight === 0 || !document.body.contains(fakeAd)) {
                    const dismissed = sessionStorage.getItem('guru_adblock_dismissed');
                    if (!dismissed) {
                        setIsAdBlockActive(true);
                        setIsVisible(true);
                    }
                }
                if (document.body.contains(fakeAd)) {
                    document.body.removeChild(fakeAd);
                }
            }, 300);
        };

        checkAdBlock();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('guru_adblock_dismissed', 'true');
    };

    if (!isAdBlockActive || !isVisible) return null;

    return (
        <div className="guru-adblock-overlay">
            <style dangerouslySetInnerHTML={{ __html: `
                .guru-adblock-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.92);
                    backdrop-filter: blur(20px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: guruOverlayFade 0.3s ease-out;
                }

                .guru-adblock-modal {
                    background: #0a0b0d;
                    border: 2px solid #eab308;
                    border-radius: 40px;
                    max-width: 550px;
                    width: 100%;
                    padding: 50px 40px;
                    text-align: center;
                    box-shadow: 0 0 100px rgba(234, 179, 8, 0.2);
                    position: relative;
                    animation: guruModalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .guru-adblock-icon {
                    width: 90px;
                    height: 90px;
                    background: rgba(234, 179, 8, 0.1);
                    color: #eab308;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 25px;
                    border: 1px solid rgba(234, 179, 8, 0.3);
                }

                .guru-adblock-modal h2 {
                    font-size: 2rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    color: #fff;
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                }

                .guru-adblock-modal p {
                    font-size: 1rem;
                    color: #9ca3af;
                    line-height: 1.6;
                    margin-bottom: 35px;
                }

                .btn-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .guru-adblock-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 18px 30px;
                    border-radius: 18px;
                    font-size: 14px;
                    font-weight: 950;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: 0.3s;
                    text-decoration: none;
                    width: 100%;
                    box-sizing: border-box;
                }

                .btn-primary {
                    background: #eab308;
                    color: #000;
                    border: none;
                    box-shadow: 0 10px 25px rgba(234, 179, 8, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(234, 179, 8, 0.5);
                }

                /* 🔥 CTR OPTIMIZED PARTNER BUTTON */
                .btn-secondary-partner {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(102, 252, 241, 0.1) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.4);
                    color: #fff;
                }

                .btn-secondary-partner:hover {
                    background: rgba(168, 85, 247, 0.3);
                    border-color: #a855f7;
                    transform: translateY(-2px);
                }

                .guru-close-icon {
                    position: absolute;
                    top: 25px;
                    right: 25px;
                    color: #4b5563;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .guru-close-icon:hover { color: #fff; }

                @keyframes guruOverlayFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes guruModalPop { from { transform: scale(0.9) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

                @media (max-width: 768px) {
                    .guru-adblock-modal { padding: 40px 25px; border-radius: 30px; margin: 15px; }
                    .guru-adblock-modal h2 { font-size: 1.5rem; }
                }
            `}} />

            <div className="guru-adblock-modal">
                <button className="guru-close-icon" onClick={handleDismiss}>
                    <X size={30} />
                </button>

                <div className="guru-adblock-icon">
                    <ShieldAlert size={48} />
                </div>
                
                <h2>{isEn ? "PERFORMANCE DROP" : "POKLES VÝKONU"}</h2>
                
                <p>
                    {isEn 
                      ? "Your AdBlocker is limiting our data feed. Support Guru by whitelisting us, or by visiting our verified hardware partners."
                      : "Tvůj AdBlock omezuje přísun HW dat. Podpoř nás vypnutím blockerů, nebo aspoň mrkni na naše prověřené partnery."
                    }
                </p>

                <div className="btn-stack">
                    {/* HLAVNÍ AKCE */}
                    <button onClick={handleDismiss} className="guru-adblock-btn btn-primary">
                        <Zap size={18} /> {isEn ? "I'll help, Guru" : "Vypnu to, Guru"}
                    </button>

                    {/* 🔥 STRATEGICKÝ NÁHRADNÍ CÍL (PARTNEŘI) */}
                    <Link 
                        href={isEn ? "/en/sestavy" : "/sestavy"} 
                        onClick={handleDismiss}
                        className="guru-adblock-btn btn-secondary-partner"
                    >
                        <ShoppingCart size={18} color="#a855f7" /> 
                        <span>{isEn ? "Visit Partners Instead" : "Mrknu radši na partnery"}</span>
                        <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
