"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [activeType, setActiveType] = useState('gpu'); // Střídá 'gpu' a 'cpu'
    const handleScrollRef = useRef(null);

    const isEn = pathname.startsWith('/en');
    const platform = isEn ? 'amazon' : 'heureka';

    // 🔥 LOGIKA STŘÍDÁNÍ (každých 5 sekund)
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveType(prev => prev === 'gpu' ? 'cpu' : 'gpu');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
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
        const subId = `v15-sticky-rotate-${platform}-${activeType}`;
        const productName = activeType === 'cpu' ? "Ryzen 7 9800X3D" : "RTX 5080";
        let queryStr = productName;

        if (platform === 'heureka') {
            queryStr += activeType === 'cpu' ? " procesor" : " grafická karta";
        }
        const safeQuery = queryStr.trim().replace(/\s+/g, '+');

        if (platform === 'amazon') {
            return `https://www.amazon.com/s?k=${safeQuery}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }
        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
    };

    const handleLogClick = () => {
        const payload = { platform, category: `rotate_${activeType}`, sub_id: `v15-rotate`, page: pathname };
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
    };

    // Obsah pro jednotlivé fáze rotace
    const content = {
        gpu: {
            text: isEn ? "🔥 RTX 5080 – CHECK BEST PRICE ⚡" : "🔥 RTX 5080 – DNES NEJLEVNĚJI ⚡",
            color: "#76b900"
        },
        cpu: {
            text: isEn ? "🔥 RYZEN 7 9800X3D – DEALS ⚡" : "🔥 RYZEN 7 9800X3D – SKLADEM ⚡",
            color: "#ed1c24"
        }
    };

    if (!isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <div className="guru-badge">✔ GURU PREMIUM DOPORUČUJE</div>
            
            <a href={getLink()} target="_blank" rel="nofollow sponsored" onClick={handleLogClick} className={`guru-mobile-sticky-btn phase-${activeType}`}>
                <div className="guru-3d-icon">
                    <div className={`scene ${activeType}-active`}>
                        <div className={`cube ${activeType}-cube`}>
                            {activeType === 'gpu' ? (
                                <>
                                    <div className="face front">GeForce</div>
                                    <div className="face back">RTX</div>
                                    <div className="face right">5080</div>
                                    <div className="face left">GURU</div>
                                </>
                            ) : (
                                <>
                                    <div className="face front">RYZEN</div>
                                    <div className="face back">9800X3D</div>
                                    <div className="face right">AMD</div>
                                    <div className="face left">ZEN 5</div>
                                </>
                            )}
                            <div className="face top">CORE</div>
                            <div className="face bottom">HW</div>
                        </div>
                    </div>
                </div>
                <span className="guru-btn-text">{content[activeType].text}</span>
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
                    background: #000; border: 2px solid rgba(147, 51, 234, 0.3); color: #fff; padding: 15px; border-radius: 20px;
                    font-weight: 950; text-transform: uppercase; box-shadow: 0 12px 30px rgba(0,0,0,0.6);
                    cursor: pointer; -webkit-tap-highlight-color: transparent; text-decoration: none;
                    transition: all 0.5s ease;
                }
                .phase-gpu { border-color: #76b900; }
                .phase-cpu { border-color: #ed1c24; }
                
                .guru-btn-text { font-size: 13px; letter-spacing: -0.3px; text-align: left; flex: 1; transition: opacity 0.3s; }
                .guru-mobile-sticky-btn:active { transform: scale(0.96); }

                /* 3D ENGINE */
                .guru-3d-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
                .scene { width: 30px; height: 30px; perspective: 600px; transition: transform 0.5s; }
                .cube {
                    width: 100%; height: 100%; position: relative;
                    transform-style: preserve-3d;
                    animation: rotateCube 6s infinite linear;
                }
                @keyframes rotateCube {
                    0% { transform: rotateX(0deg) rotateY(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg); }
                }
                .face {
                    position: absolute; width: 30px; height: 30px;
                    border: 1px solid rgba(255,255,255,0.3);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 5px; font-weight: 900; text-transform: uppercase;
                }
                .face.front  { transform: rotateY(0deg) translateZ(15px); }
                .face.back   { transform: rotateY(180deg) translateZ(15px); }
                .face.right  { transform: rotateY(90deg) translateZ(15px); }
                .face.left   { transform: rotateY(-90deg) translateZ(15px); }
                .face.top    { transform: rotateX(90deg) translateZ(15px); }
                .face.bottom { transform: rotateX(-90deg) translateZ(15px); }

                .gpu-cube .face { background: rgba(118, 185, 0, 0.3); color: #fff; border-color: #76b900; }
                .cpu-cube .face { background: rgba(237, 28, 36, 0.3); color: #fff; border-color: #ed1c24; }
            `}} />
        </div>
    );
}
