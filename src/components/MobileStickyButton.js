"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

const HIGH_END_REGEX = /4090|4080|4070|7900|7800/;

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [funnelVariant, setFunnelVariant] = useState('gpu');
    const [isCzUser, setIsCzUser] = useState(false);
    const [scrollDepth, setScrollDepth] = useState(0); 
    const [useAmazon, setUseAmazon] = useState(null);
    
    const subIdLockedRef = useRef(null); 
    const funnelLockRef = useRef(null); 
    const handleScrollRef = useRef(null);
    const clickLockRef = useRef(false);

    const isEn = pathname.startsWith('/en');
    const isHighEnd = HIGH_END_REGEX.test(pathname.toLowerCase());

    // 1. Čistá detekce CZ bez async lagů
    useEffect(() => {
        const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '';
        const cz = tz.includes('Prague') || navigator.language?.includes('cs');
        setIsCzUser(!!cz);
        setUseAmazon(isEn); // Pokud je EN stránka -> Amazon, jinak default CZ (Heureka)
        setIsReturning(localStorage.getItem('visited_before') === '1');
    }, [isEn]);

    // 2. Deterministické rozhodnutí o linku (CZ = VŽDY Heureka)
    const getFinalDecision = () => {
        if (funnelLockRef.current) return funnelLockRef.current;

        const subId = `v36-${isCzUser ? 'cz' : 'int'}-${funnelVariant}`;
        let query = isHighEnd ? "rtx+4070+super" : "rtx+4060+8gb";
        
        const amz = `https://www.amazon.com/s?k=${query}&tag=thehardware07-20&ascsubtag=${subId}`;
        const h_gpu = `https://graficke-karty.heureka.cz/?haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}&f=3&min-price=${isHighEnd ? 16000 : 6000}`;
        const h_cpu = `https://procesory.heureka.cz/?haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}&f=3&min-price=${isHighEnd ? 8000 : 4000}`;
        
        const target = useAmazon ? amz : (funnelVariant === 'cpu' ? h_cpu : h_gpu);
        
        const decision = { target, platform: useAmazon ? 'amazon' : 'heureka' };
        funnelLockRef.current = decision;
        return decision;
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let variant = localStorage.getItem('sticky_funnel_variant');
        if (!variant) {
            variant = Math.random() < 0.7 ? 'gpu' : 'cpu';
            localStorage.setItem('sticky_funnel_variant', variant);
        }
        setFunnelVariant(variant);

        handleScrollRef.current = () => {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 400) {
                    setIsVisible(true);
                    window.removeEventListener('scroll', handleScrollRef.current);
                }
                setScrollDepth(window.scrollY);
            });
        };

        window.addEventListener('scroll', handleScrollRef.current, { passive: true });
        if (!localStorage.getItem('visited_before')) localStorage.setItem('visited_before', '1');

        return () => window.removeEventListener('scroll', handleScrollRef.current);
    }, []);

    const decision = isVisible ? getFinalDecision() : null;

    const uiText = useMemo(() => {
        const gpuPrice = isHighEnd ? "15 990 Kč" : "6 990 Kč";
        const gpuName = isHighEnd ? "RTX 4070 Super" : "RTX 4060";
        const cpuName = isHighEnd ? "Ryzen 7 7800X3D" : "Ryzen 5 7600";

        if (useAmazon) return `🔥 ${gpuName} DEALS – BEST PRICE ⚡`;
        return funnelVariant === 'cpu' 
            ? `🔥 ${cpuName} OD ${isHighEnd ? "8 290 Kč" : "4 490 Kč"} ⚡` 
            : `🔥 ${gpuName} OD ${gpuPrice} ⚡`;
    }, [useAmazon, isHighEnd, funnelVariant]);

    const handleClick = (e) => {
        if (clickLockRef.current || !decision) return;
        clickLockRef.current = true;
        
        // Okamžitý redirect bez delaye a bez /go (pokud ti házel 404)
        window.location.href = decision.target;
    };

    if (useAmazon === null || !isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            {/* Horní badge – posunutý aby neclonil */}
            <div className="guru-badge">
                ✔ DNES SKLADEM • ODESLÁNÍ DO 24H
            </div>
            
            <button onPointerDown={handleClick} className="guru-mobile-sticky-btn">
                <Zap size={22} fill="white" />
                <span className="guru-btn-text">{uiText}</span>
            </button>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-mobile-sticky-wrapper {
                    position: fixed;
                    bottom: 115px; /* 🔥 BEZPEČNĚ NAD ANCHOR AD 🔥 */
                    left: 10px; right: 10px;
                    z-index: 2147483647;
                    display: flex; flex-direction: column; align-items: center;
                    pointer-events: none;
                    background: transparent !important;
                }
                .guru-badge {
                    background: #22c55e; color: white; padding: 4px 12px;
                    font-size: 10px; border-radius: 20px; font-weight: 900;
                    margin-bottom: -10px; z-index: 2; border: 2px solid #000;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3); text-transform: uppercase;
                }
                .guru-mobile-sticky-btn {
                    pointer-events: auto;
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
                    background: linear-gradient(90deg, #9333ea 0%, #06b6d4 100%);
                    color: #fff; padding: 18px; border-radius: 18px;
                    font-weight: 950; text-transform: uppercase; border: none;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    cursor: pointer; -webkit-tap-highlight-color: transparent;
                }
                .guru-btn-text {
                    font-size: 15px; /* 🔥 VĚTŠÍ A ČITELNĚJŠÍ 🔥 */
                    letter-spacing: -0.3px;
                }
                .guru-mobile-sticky-btn:active { transform: scale(0.95); filter: brightness(1.2); }
            `}} />
        </div>
    );
}
