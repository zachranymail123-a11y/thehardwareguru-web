"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Zap } from 'lucide-react';

/**
 * GURU ADBLOCK DETECTOR V2.0 (AGGRESSIVE VISIBILITY)
 * 🚀 CÍL: Maximální viditelnost přes celou obrazovku. Nepřehlédnutelné.
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
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(15px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: guruOverlayFade 0.3s ease-out;
                }

                .guru-adblock-modal {
                    background: #0a0b0d;
                    border: 4px solid #eab308;
                    border-radius: 40px;
                    max-width: 650px;
                    width: 100%;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 0 100px rgba(234, 179, 8, 0.3);
                    position: relative;
                    animation: guruModalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .guru-adblock-icon {
                    width: 110px;
                    height: 110px;
                    background: rgba(234, 179, 8, 0.1);
                    color: #eab308;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 35px;
                    border: 2px solid rgba(234, 179, 8, 0.3);
                }

                .guru-adblock-modal h2 {
                    font-size: clamp(2rem, 5vw, 3rem);
                    font-weight: 950;
                    text-transform: uppercase;
                    color: #fff;
                    margin-bottom: 25px;
                    letter-spacing: 2px;
                    line-height: 1;
                }

                .guru-adblock-modal p {
                    font-size: 1.2rem;
                    color: #d1d5db;
                    line-height: 1.8;
                    margin-bottom: 45px;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .guru-adblock-btn {
                    background: #eab308;
                    color: #000;
                    border: none;
                    padding: 22px 60px;
                    border-radius: 20px;
                    font-size: 18px;
                    font-weight: 950;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: 0.3s;
                    box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4);
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                }

                .guru-adblock-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 20px 50px rgba(234, 179, 8, 0.6);
                }

                .guru-close-icon {
                    position: absolute;
                    top: 30px;
                    right: 30px;
                    color: #4b5563;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .guru-close-icon:hover { color: #fff; transform: rotate(90deg); }

                @keyframes guruOverlayFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes guruModalPop { from { transform: scale(0.7) translateY(100px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

                @media (max-width: 768px) {
                    .guru-adblock-modal { padding: 50px 25px; border-radius: 30px; }
                    .guru-adblock-modal h2 { font-size: 1.8rem; }
                    .guru-adblock-btn { width: 100%; justify-content: center; }
                }
            `}} />

            <div className="guru-adblock-modal">
                <button className="guru-close-icon" onClick={handleDismiss}>
                    <X size={40} />
                </button>

                <div className="guru-adblock-icon">
                    <ShieldAlert size={64} />
                </div>
                
                <h2>{isEn ? "SYSTEM OPTIMIZATION" : "OPTIMALIZACE SYSTÉMU"}</h2>
                
                <p>
                    {isEn 
                      ? "Your AdBlocker is causing resource drops. To keep this machine running with 100% hardware data, please whitelist us. Every ad helps pay for server power."
                      : "Tvůj AdBlock sráží výkon našeho vývoje. Aby tahle mašina mohla dál sypat 100% data o hardwaru, potřebujeme tvou podporu. Vypni prosím blokování reklam."
                    }
                </p>

                <button onClick={handleDismiss} className="guru-adblock-btn">
                    <Zap size={22} /> {isEn ? "UNDERSTOOD, GURU" : "ROZUMÍM, GURU"}
                </button>
            </div>
        </div>
    );
}
