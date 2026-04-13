"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [funnelVariant, setFunnelVariant] = useState('gpu');
    const handleScrollRef = useRef(null);

    const isEn = pathname.startsWith('/en');
    const platform = isEn ? 'amazon' : 'heureka';

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
                if (window.scrollY > 450) {
                    setIsVisible(true);
                    window.removeEventListener('scroll', handleScrollRef.current);
                }
            });
        };

        window.addEventListener('scroll', handleScrollRef.current, { passive: true });
        return () => {
            if (handleScrollRef.current) window.removeEventListener('scroll', handleScrollRef.current);
        };
    }, []);

    const getLink = () => {
        const subId = `v14-sticky-3d-${platform}-${funnelVariant}`;
        const productName = funnelVariant === 'cpu' ? "Ryzen 7 9800X3D" : "RTX 5080";

        let queryStr = productName;
        if (platform === 'heureka') {
            queryStr += funnelVariant === 'cpu' ? " procesor" : " grafická karta";
        }

        const safeQuery = queryStr.trim().replace(/\s+/g, '+');

        if (platform === 'amazon') {
            return `https://www.amazon.com/s?k=${safeQuery}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }

        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
    };

    const handleLogClick = () => {
        const payload = { platform, category: `sticky_3d_${funnelVariant}`, sub_id: `v14-sticky-3d`, page: pathname };
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
    };

    const uiText = useMemo(() => {
        if (isEn) {
            const name = funnelVariant === 'cpu' ? "RYZEN 7 9800X3D" : "RTX 5080";
            return `🔥 ${name} – CHECK BEST PRICE TODAY ⚡`;
        }
        return funnelVariant === 'cpu' 
            ? `🔥 RYZEN 7 9800X3D – OVĚŘIT CENU ⚡` 
            : `🔥 RTX 5080 – DNES NEJLEVNĚJI ⚡`;
    }, [isEn, funnelVariant]);

    // 🔥 CSS Modely pro Mistrovské dílo
    const GpuModel = () => (
        <div className="scene gpu-scene">
            <div className="cube gpu-cube">
                <div className="face front">GeForce</div>
                <div className="face back">RTX</div>
                <div className="face right">5080</div>
                <div className="face left">GURU</div>
                <div className="face top">FANS</div>
                <div className="face bottom">PCB</div>
            </div>
        </div>
    );

    const CpuModel = () => (
        <div className="scene cpu-scene">
            <div className="cube cpu-cube">
                <div className="face front">RYZEN</div>
                <div className="face back">9800X3D</div>
                <div className="face right">AMD</div>
                <div className="face left">ZEN 5</div>
                <div className="face top">IHS</div>
                <div className="face bottom">PINS</div>
            </div>
        </div>
    );

    if (!isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper v14-masterpiece">
            <div className="guru-badge">✔ GURU PREMIUM DOPORUČENÍ • SKLADEM</div>
            
            <a href={getLink()} target="_blank" rel="nofollow sponsored" onClick={handleLogClick} className="guru-mobile-sticky-btn">
                {/* 🔥 Rotující 3D Model */}
                <div className="guru-3d-icon">
                    {funnelVariant === 'cpu' ? <CpuModel /> : <GpuModel />}
                </div>
                <span className="guru-btn-text">{uiText}</span>
            </a>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-mobile-sticky-wrapper {
                    position: fixed; bottom: 115px; left: 12px; right: 12px;
                    z-index: 2147483647; display: flex; flex-direction: column; align-items: center;
                    pointer-events: none;
                }
                .guru-badge {
                    background: #22c55e; color: white; padding: 4px 14px;
                    font-size: 10px; border-radius: 20px; font-weight: 900;
                    margin-bottom: -10px; z-index: 2; border: 2px solid #000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4); text-transform: uppercase;
                }
                .guru-mobile-sticky-btn {
                    pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 15px;
                    background: #000; border: 2px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 20px;
                    font-weight: 950; text-transform: uppercase; box-shadow: 0 12px 30px rgba(0,0,0,0.6);
                    cursor: pointer; -webkit-tap-highlight-color: transparent; text-decoration: none;
                }
                .guru-btn-text { font-size: 13px; letter-spacing: -0.3px; text-align: left; flex: 1; }
                .guru-mobile-sticky-btn:active { transform: scale(0.96); }

                /* 🔥 3D ENGINE (Pure CSS) */
                .guru-3d-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
                .scene { width: 30px; height: 30px; perspective: 600px; }
                .cube {
                    width: 100%; height: 100%; position: relative;
                    transform-style: preserve-3d;
                    animation: rotateCube 8s infinite linear;
                }
                @keyframes rotateCube {
                    0% { transform: rotateX(0deg) rotateY(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg); }
                }
                .face {
                    position: absolute; width: 30px; height: 30px;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 5px; font-weight: 900; color: white; text-transform: uppercase;
                }
                .face.front  { transform: rotateY(0deg) translateZ(15px); }
                .face.back   { transform: rotateY(180deg) translateZ(15px); }
                .face.right  { transform: rotateY(90deg) translateZ(15px); }
                .face.left   { transform: rotateY(-90deg) translateZ(15px); }
                .face.top    { transform: rotateX(90deg) translateZ(15px); }
                .face.bottom { transform: rotateX(-90deg) translateZ(15px); }

                /* GPU Specifics */
                .gpu-cube .face { background: rgba(118, 185, 0, 0.2); border-color: rgba(118, 185, 0, 0.5); color: #76b900; }
                /* CPU Specifics */
                .cpu-cube .face { background: rgba(237, 28, 36, 0.15); border-color: rgba(237, 28, 36, 0.4); color: #ed1c24; }
            `}} />
        </div>
    );
}
