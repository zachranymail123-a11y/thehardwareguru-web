"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Cpu, Monitor, Layers, Database } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false }) {
    const pathname = usePathname() || '';
    const [isCzUser, setIsCzUser] = useState(false);
    const [platform, setPlatform] = useState(null);
    const baseMetaRef = useRef(null);
    const clickLockRef = useRef(false);
    const startTimeRef = useRef(Date.now()); // 🔥 FIX #2: Lock startu session pro konzistentní čas
    
    // Perzistentní locky
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
        const isMobile = /Mobi|Android/i.test(nav.userAgent);
        
        setIsCzUser(isCz);
        startTimeRef.current = Date.now(); // Reset času při mountu/navigaci

        // Engagement tracking
        const pages = Number(sessionStorage.getItem('guru_pages') || 0);
        sessionStorage.setItem('guru_pages', (pages + 1).toString());

        // Routing Logic
        if (isEn || !isCz) {
            setPlatform('amazon');
        } else if (intent === 'hot') {
            setPlatform('amazon'); 
        } else {
            const amazonBias = isMobile ? 0.3 : 0.15;
            setPlatform(Math.random() < amazonBias ? 'amazon' : 'heureka');
        }

        // SPA Reset
        subIdLockRef.current = {};
        linkLockRef.current = {};

        // Sync queue
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
            const device = isMobile ? 'm' : 'd';
            const host = window.location.hostname;
            const ref = document.referrer;
            const source = ref && host && ref.includes(host) ? 'internal' : ref ? 'external' : 'direct';
            baseMetaRef.current = { device, geo: isCz ? 'cz' : 'int', source };
        }
    }, [pathname, isEn, intent]);

    // SubId Builder (v8)
    const buildSubId = (category) => {
        if (typeof window === 'undefined' || !baseMetaRef.current) return 'v8-safe';
        const { device, geo, source } = baseMetaRef.current;
        const pages = typeof sessionStorage !== 'undefined' ? Number(sessionStorage.getItem('guru_pages') || 1) : 1;
        const engagement = pages > 3 ? 'hot' : 'cold';

        // 🔥 FIX #2: Konzistentní výpočet času od vstupu na stránku
        const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const timeIntent = timeOnPage > 60 ? 'engaged' : (timeOnPage > 20 ? 'warm' : 'cold');
        
        return `v8-static-${category}-${device}-${geo}-${source}-${engagement}-${intent}-${timeIntent}`;
    };

    const getLockedSubId = (category) => {
        if (!subIdLockRef.current[category]) {
            subIdLockRef.current[category] = buildSubId(category);
        }
        return subIdLockRef.current[category];
    };

    const generateRawLink = (category, plat, subId) => {
        if (plat === 'amazon') {
            const queries = { cpu: "Ryzen+9+9950X", gpu: "RTX+5080+16GB", mb: "X870E+motherboard", ram: "DDR5+8000MHz" };
            const params = new URLSearchParams({ k: queries[category], tag: 'thehardware07-20', ascsubtag: subId, s: 'featured' });
            return `https://www.amazon.com/s?${params.toString()}`;
        } else {
            const queries = { cpu: "ryzen+9950x", gpu: "rtx+5080", mb: "zakladni+deska+am5", ram: "ddr5+64gb" };
            return `https://www.heureka.cz/?h%5Bfraze%5D=${queries[category]}&haff=276049&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        }
    };

    const getLockedLink = (category, plat) => {
        const key = `${category}_${plat}`;
        if (!linkLockRef.current[key]) {
            const subId = getLockedSubId(category);
            linkLockRef.current[key] = generateRawLink(category, plat, subId);
        }
        return linkLockRef.current[key];
    };

    const handleAction = (e, category, plat) => {
        if (clickLockRef.current) return;
        clickLockRef.current = true;
        setTimeout(() => { clickLockRef.current = false; }, 800);

        if (e && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }

        const nav = typeof navigator !== 'undefined' ? navigator : null;
        if (nav?.vibrate) nav.vibrate(5);

        const subId = getLockedSubId(category);
        const targetUrl = getLockedLink(category, plat);

        // 🔥 FIX #3: Inteligentní prefetch bez duplikací
        if (!document.querySelector(`link[href="${targetUrl}"]`)) {
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = targetUrl;
            document.head.appendChild(prefetch);
        }

        const payload = { platform: plat, category: `static_${category}`, sub_id: subId, page: pathname };
        const beaconUrl = `${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`;

        let sent = false;
        if (nav?.sendBeacon) {
            sent = nav.sendBeacon(beaconUrl, new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' }));
        }

        if (!sent) {
            fetch(beaconUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => {
                const q = JSON.parse(localStorage.getItem('pending_clicks') || '[]');
                q.push(payload);
                localStorage.setItem('pending_clicks', JSON.stringify(q));
            });
        }

        let newTab = null;
        try {
            newTab = window.open('about:blank', '_blank', 'noopener,noreferrer');
        } catch (err) {}

        if (newTab && !newTab.closed) {
            newTab.location.href = targetUrl;
        } else {
            window.location.href = targetUrl;
        }
    };

    const buttons = [
        { id: 'cpu', icon: Cpu, cz: 'Procesory', en: 'Processors', sub: '9000 SERIES' },
        { id: 'gpu', icon: Monitor, cz: 'Grafiky', en: 'Graphics', sub: 'RTX 50 SERIES' },
        { id: 'mb', icon: Layers, cz: 'Desky', en: 'Motherboards', sub: 'NEXT-GEN AM5' },
        { id: 'ram', icon: Database, cz: 'Paměti', en: 'Memory', sub: 'DDR5 8000+' }
    ];

    if (!platform || !baseMetaRef.current) return null;

    return (
        <div className="heureka-global-buttons">
            {buttons.map((btn) => {
                const Icon = btn.icon;
                
                return (
                    /* 🔥 FIX #1: Změna z <a> na div[role=button] pro eliminaci double-open bugu 🔥 */
                    <div
                        key={btn.id}
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => handleAction(e, btn.id, platform)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAction(e, btn.id, platform)}
                        className={`h-banner-btn ${platform === 'amazon' ? 'amazon-btn' : ''}`}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={`h-icon-box ${platform === 'amazon' ? 'amazon-icon-box' : ''}`}>
                            <Icon size={24} />
                        </div>
                        <div className="h-text-col">
                            <span className={`h-title ${platform === 'amazon' ? 'amazon-title' : ''}`}>
                                {isEn ? btn.en : btn.cz}
                            </span>
                            <span className="h-subtitle">🔥 {btn.sub}</span>
                        </div>
                    </div>
                );
            })}

            <style dangerouslySetInnerHTML={{__html: `
                .heureka-global-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px; margin: 25px 0; width: 100%;
                }
                .h-banner-btn {
                    display: flex; align-items: center; gap: 12px;
                    background: #fff; border: 2px solid #e5e7eb;
                    padding: 16px; border-radius: 18px; color: #111;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                }
                .h-banner-btn:hover {
                    transform: translateY(-4px); border-color: #9333ea;
                    box-shadow: 0 12px 20px -8px rgba(147, 51, 234, 0.2);
                }
                .h-banner-btn:active { transform: scale(0.95); filter: brightness(1.1); }
                .h-icon-box {
                    background: #f3f4f6; padding: 10px; border-radius: 12px; color: #9333ea;
                    display: flex; align-items: center; justify-content: center;
                }
                .amazon-icon-box { background: #fff3e0; color: #ff9900; }
                .h-text-col { display: flex; flex-direction: column; }
                .h-title { font-weight: 950; font-size: 15px; text-transform: uppercase; letter-spacing: -0.3px; }
                .h-subtitle { font-size: 10px; font-weight: 800; color: #6b7280; letter-spacing: 0.5px; }
                .amazon-btn:hover { border-color: #ff9900; }
                .amazon-title { color: #e67e22; }
                @media (max-width: 640px) { .heureka-global-buttons { grid-template-columns: 1fr 1fr; } }
            `}} />
        </div>
    );
}
