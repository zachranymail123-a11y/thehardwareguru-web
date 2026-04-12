"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

const HIGH_END_REGEX = /5090|5080|5070|4090|ultra|high-end/;

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [funnelVariant, setFunnelVariant] = useState('gpu');
    const [isCzUser, setIsCzUser] = useState(false);
    const [useAmazon, setUseAmazon] = useState(null);
    
    const funnelLockRef = useRef(null); 
    const handleScrollRef = useRef(null);
    const clickLockRef = useRef(false);

    const isEn = pathname.startsWith('/en');
    const isHighEnd = HIGH_END_REGEX.test(pathname.toLowerCase());

    useEffect(() => {
        const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '';
        const cz = tz.includes('Prague') || navigator.language?.includes('cs');
        setIsCzUser(!!cz);
        setUseAmazon(isEn);
        
        if (typeof window !== 'undefined') {
            let variant = localStorage.getItem('sticky_funnel_variant');
            if (!variant) {
                variant = Math.random() < 0.7 ? 'gpu' : 'cpu';
                localStorage.setItem('sticky_funnel_variant', variant);
            }
            setFunnelVariant(variant);

            handleScrollRef.current = () => {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 450) {
                        setIsVisible(true);
                        window.removeEventListener('scroll', handleScrollRef.current);
                    }
                });
            };
            window.addEventListener('scroll', handleScrollRef.current, { passive: true });
        }
        return () => window.removeEventListener('scroll', handleScrollRef.current);
    }, [isEn]);

    // 🔥 FIX: Synchronizace textu a vyhledávání na RTX 50 Series (2026 Standard) 🔥
    const getFinalDecision = () => {
        if (funnelLockRef.current) return funnelLockRef.current;

        const subId = `v37-${isCzUser ? 'cz' : 'int'}-${funnelVariant}`;
        // Přesné dotazy, které v roce 2026 vrací to, co slibujeme na buttonu
        let gpuQuery = isHighEnd ? "rtx+5080" : "rtx+5060";
        let cpuQuery = isHighEnd ? "ryzen+9+9950x" : "ryzen+5+9600";
        
        const amz = `https://www.amazon.com/s?k=${gpuQuery}&tag=thehardware07-20&ascsubtag=${subId}`;
        const h_gpu = `https://graficke-karty.heureka.cz/?haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}&f=3&q=${gpuQuery}`;
        const h_cpu = `https://procesory.heureka.cz/?haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}&f=3&q=${cpuQuery}`;
        
        const target = useAmazon ? amz : (funnelVariant === 'cpu' ? h_cpu : h_gpu);
        
        const decision = { target };
        funnelLockRef.current = decision;
        return decision;
    };

    const decision = isVisible ? getFinalDecision() : null;

    const uiText = useMemo(() => {
        // RTX 50 ceny roku 2026
        const gpuPrice = isHighEnd ? "24 990 Kč" : "8 490 Kč";
        const gpuName = isHighEnd ? "RTX 5080" : "RTX 5060";
        const cpuName = isHighEnd ? "Ryzen 9 9950X" : "Ryzen 5 9600";

        if (useAmazon) return `🔥 ${gpuName} DEALS – BEST PRICE ⚡`;
        return funnelVariant === 'cpu' 
            ? `🔥 ${cpuName} SKLADEM ⚡` 
            : `🔥 ${gpuName} OD ${gpuPrice} ⚡`;
    }, [useAmazon, isHighEnd, funnelVariant]);

    const handleClick = (e) => {
        if (clickLockRef.current || !decision) return;
        clickLockRef.current = true;
        window.location.href = decision.target;
    };

    if (useAmazon === null || !isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <div className="guru-badge">
                ✔ NOVÁ GENERACE RTX 50 • SKLADEM
            </div>
            
            <button onPointerDown={handleClick} className="guru-mobile-sticky-btn">
                <Zap size={22} fill="white" />
                <span className="guru-btn-text">{uiText}</span>
            </button>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-mobile-sticky-wrapper {
                    position: fixed;
                    bottom: 115px; /* Bezpečný odstup od Google Anchor Ad */
                    left: 10px; right: 10px;
                    z-index: 2147483647;
                    display: flex; flex-direction: column; align-items: center;
                    pointer-events: none;
                }
                .guru-badge {
                    background: #22c55e; color: white; padding: 4px 12px;
                    font-size: 10px; border-radius: 20px; font-weight: 900;
                    margin-bottom: -10px; z-index: 2; border: 2px solid #000;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
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
                    font-size: 15px;
                    letter-spacing: -0.2px;
                }
                .guru-mobile-sticky-btn:active { transform: scale(0.95); filter: brightness(1.2); }
            `}} />
        </div>
    );
}
