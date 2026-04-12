"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Cpu, Monitor, Layers, Database, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false }) {
    const pathname = usePathname() || '';
    const [platform, setPlatform] = useState(null);
    const baseMetaRef = useRef(null);
    const clickLockRef = useRef(false);
    const startTimeRef = useRef(Date.now());
    
    const subIdLockRef = useRef({});
    const linkLockRef = useRef({});

    const intent = useMemo(() => {
        if (pathname.includes('bottleneck')) return 'hot';
        if (pathname.includes('gpu')) return 'gpu';
        if (pathname.includes('cpu')) return 'cpu';
        return 'generic';
    }, [pathname]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const nav = navigator;
        const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '';
        const isCz = tz.includes('Prague') || (nav && (nav.language?.includes('cs') || nav.languages?.some(l => l.includes('cs'))));
        
        // 🔥 FIX: ŽÁDNÁ LOTERIE. CZ = Heureka, EN = Amazon. Tečka. 🔥
        setPlatform(isEn ? 'amazon' : 'heureka');

        // SPA Reset & Increment
        subIdLockRef.current = {};
        linkLockRef.current = {};
        const pages = Number(sessionStorage.getItem('guru_pages') || 0);
        sessionStorage.setItem('guru_pages', (pages + 1).toString());

        // Sync Queue
        const pending = JSON.parse(localStorage.getItem('pending_clicks') || '[]');
        if (pending.length > 0) {
            pending.forEach(p => {
                fetch(`${supabaseUrl}/rest/v1/affiliate_clicks_log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
                    body: JSON.stringify(p),
                    keepalive: true
                }).catch(() => {});
            });
            localStorage.removeItem('pending_clicks');
        }

        if (!baseMetaRef.current) {
            const device = /Mobi|Android/i.test(nav.userAgent) ? 'm' : 'd';
            baseMetaRef.current = { device, geo: isCz ? 'cz' : 'int', source: document.referrer ? 'ext' : 'dir' };
        }
    }, [pathname, isEn]);

    const buildSubId = (category) => {
        if (typeof window === 'undefined' || !baseMetaRef.current) return 'v9-safe';
        const { device, geo } = baseMetaRef.current;
        const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
        return `v9-static-${category}-${device}-${geo}-${intent}-${timeOnPage}s`;
    };

    const getLockedSubId = (category) => {
        if (!subIdLockRef.current[category]) subIdLockRef.current[category] = buildSubId(category);
        return subIdLockRef.current[category];
    };

    const generateRawLink = (category, plat, subId) => {
        if (plat === 'amazon') {
            const queries = { cpu: "Ryzen+9+9950X", gpu: "RTX+5080", mb: "X870E+AM5", ram: "DDR5+8000MT" };
            return `https://www.amazon.com/s?k=${queries[category]}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }
        const queries = { cpu: "ryzen+9950x", gpu: "rtx+5080", mb: "am5+zakladni+deska", ram: "ddr5+64gb" };
        return `https://www.heureka.cz/?h%5Bfraze%5D=${queries[category]}&haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=${subId}`;
    };

    const getLockedLink = (category, plat) => {
        const key = `${category}_${plat}`;
        if (!linkLockRef.current[key]) linkLockRef.current[key] = generateRawLink(category, plat, getLockedSubId(category));
        return linkLockRef.current[key];
    };

    const handleAction = (e, category, plat) => {
        if (clickLockRef.current) return;
        clickLockRef.current = true;
        
        const subId = getLockedSubId(category);
        const targetUrl = getLockedLink(category, plat);
        const payload = { platform: plat, category: `static_${category}`, sub_id: subId, page: pathname };

        // 🔥 FIX: Redirect ve stejném okně a okamžitý tracking 🔥
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        window.location.href = targetUrl;
    };

    const buttons = [
        { id: 'cpu', icon: Cpu, cz: 'Procesory', en: 'Processors', sub: '9000 SERIES' },
        { id: 'gpu', icon: Monitor, cz: 'Grafiky', en: 'Graphics', sub: 'RTX 50 SERIES' },
        { id: 'mb', icon: Layers, cz: 'Desky', en: 'Motherboards', sub: 'AM5 NEXT-GEN' },
        { id: 'ram', icon: Database, cz: 'Paměti', en: 'Memory', sub: 'DDR5 8000MT' }
    ];

    if (!platform) return null;

    return (
        <div className="guru-buttons-container">
            {buttons.map((btn) => {
                const Icon = btn.icon;
                return (
                    <div
                        key={btn.id}
                        role="button"
                        onClick={(e) => handleAction(e, btn.id, platform)}
                        className="guru-card"
                    >
                        <div className="guru-card-glow" />
                        <div className="guru-icon-wrapper">
                            <Icon size={28} className="guru-icon" />
                        </div>
                        <div className="guru-content">
                            <span className="guru-label">{isEn ? btn.en : btn.cz}</span>
                            <span className="guru-sub">{btn.sub}</span>
                        </div>
                        <ChevronRight size={20} className="guru-arrow" />
                    </div>
                );
            })}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                    margin: 40px 0;
                    width: 100%;
                }
                .guru-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: rgba(17, 17, 17, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }
                .guru-card:hover {
                    transform: translateY(-5px);
                    border-color: #9333ea;
                    box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
                    background: rgba(20, 20, 20, 0.9);
                }
                .guru-card-glow {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.15) 0%, transparent 50%);
                    opacity: 0; transition: opacity 0.3s;
                }
                .guru-card:hover .guru-card-glow { opacity: 1; }
                .guru-icon-wrapper {
                    background: linear-gradient(135deg, #1e1e1e 0%, #111 100%);
                    padding: 14px;
                    border-radius: 14px;
                    margin-right: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: #9333ea;
                    transition: transform 0.3s;
                }
                .guru-card:hover .guru-icon-wrapper {
                    transform: scale(1.1) rotate(-5deg);
                    color: #06b6d4;
                }
                .guru-content {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .guru-label {
                    color: #fff;
                    font-weight: 900;
                    font-size: 16px;
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }
                .guru-sub {
                    color: #9333ea;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }
                .guru-arrow {
                    color: rgba(255, 255, 255, 0.2);
                    transition: transform 0.3s, color 0.3s;
                }
                .guru-card:hover .guru-arrow {
                    transform: translateX(5px);
                    color: #06b6d4;
                }
                @media (max-width: 640px) {
                    .guru-buttons-container { grid-template-columns: 1fr; }
                    .guru-card { padding: 16px; }
                }
            `}} />
        </div>
    );
}
