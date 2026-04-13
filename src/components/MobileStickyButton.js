"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 TOTÁLNÍ ELIMINACE MAINSRTEAMU PRO KALKULAČKY A HIGH-END ČLÁNKY
const HIGH_END_REGEX = /5090|5080|4090|ultra|high-end|9950x|9900x|9800x3d|bottleneck|kalkulacka/i;

export default function MobileStickyButton() {
    const pathname = usePathname() || '';
    const [isVisible, setIsVisible] = useState(false);
    const [funnelVariant, setFunnelVariant] = useState('gpu');
    const handleScrollRef = useRef(null);

    const isEn = pathname.startsWith('/en');
    const isHighEnd = HIGH_END_REGEX.test(pathname.toLowerCase());
    const platform = isEn ? 'amazon' : 'heureka';

    const intent = useMemo(() => {
        const lower = pathname.toLowerCase();
        if (lower.includes('bottleneck')) return 'calc';
        if (lower.includes('gpu')) return 'gpu';
        if (lower.includes('cpu')) return 'cpu';
        return 'generic';
    }, [pathname]);

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
        const subId = `v10-sticky-${platform}-${funnelVariant}-${intent}`;
        
        // 🔥 ŽÁDNÉ SCHOVÁVÁNÍ: NATVRDO HIGH-END PRO RELEVANTNÍ STRÁNKY
        let productName = "";
        if (isHighEnd) {
            productName = funnelVariant === 'cpu' ? "Ryzen 7 9800X3D" : "RTX 5080";
        } else {
            productName = funnelVariant === 'cpu' ? "Ryzen 5 9600" : "RTX 5070";
        }

        let queryStr = productName;
        if (platform === 'heureka') {
            queryStr += funnelVariant === 'cpu' ? " procesor" : " grafická karta";
        }

        const safeQuery = queryStr.trim().replace(/\s+/g, '+');

        if (platform === 'amazon') {
            return `https://www.amazon.com/s?k=${safeQuery}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }

        // 🔥 V10 GOLDEN FORMAT (haff hned za otazníkem)
        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${safeQuery}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}&o=3`;
    };

    const handleLogClick = () => {
        const payload = { 
            platform, 
            category: `sticky_${funnelVariant}`, 
            sub_id: `v10-sticky`, 
            page: pathname 
        };

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(
                `${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, 
                new Blob([JSON.stringify(payload)], { type: 'text/plain' })
            );
        }
    };

    const uiText = useMemo(() => {
        if (isHighEnd) {
            if (isEn) return `🔥 ${funnelVariant === 'cpu' ? "RYZEN 7 9800X3D" : "RTX 5080"} DEALS ⚡`;
            return funnelVariant === 'cpu' 
                ? `🔥 RYZEN 7 9800X3D SKLADEM ⚡` 
                : `🔥 RTX 5080 – NEJLEVNĚJI ⚡`;
        }

        if (isEn) return `🔥 ${funnelVariant === 'cpu' ? "RYZEN 5 9600" : "RTX 5070"} DEALS ⚡`;
        return funnelVariant === 'cpu' 
            ? `🔥 RYZEN 5 9600 SKLADEM ⚡` 
            : `🔥 RTX 5070 OD 13 490 Kč ⚡`;
    }, [isEn, isHighEnd, funnelVariant]);

    if (!isVisible) return null;

    return (
        <div className="guru-mobile-sticky-wrapper">
            <div className="guru-badge">✔ GURU DOPORUČUJE • SKLADEM</div>
            
            <a 
                href={getLink()}
                target="_blank"
                rel="nofollow sponsored"
                onClick={handleLogClick}
                className="guru-mobile-sticky-btn"
                style={{ textDecoration: 'none' }}
            >
                <Zap size={22} fill="white" />
                <span className="guru-btn-text">{uiText}</span>
            </a>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-mobile-sticky-wrapper {
                    position: fixed;
                    bottom: 115px;
                    left: 12px; right: 12px;
                    z-index: 2147483647;
                    display: flex; flex-direction: column; align-items: center;
                    pointer-events: none;
                }
                .guru-badge {
                    background: #22c55e; color: white; padding: 4px 14px;
                    font-size: 10px; border-radius: 20px; font-weight: 900;
                    margin-bottom: -10px; z-index: 2; border: 2px solid #000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    text-transform: uppercase;
                }
                .guru-mobile-sticky-btn {
                    pointer-events: auto;
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
                    background: #000;
                    border: 2px solid #9333ea;
                    color: #fff; padding: 18px; border-radius: 20px;
                    font-weight: 950; text-transform: uppercase;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.6);
                    cursor: pointer; -webkit-tap-highlight-color: transparent;
                }
                .guru-btn-text {
                    font-size: 14px;
                    letter-spacing: -0.3px;
                }
                .guru-mobile-sticky-btn:active { transform: scale(0.96); }
            `}} />
        </div>
    );
}
