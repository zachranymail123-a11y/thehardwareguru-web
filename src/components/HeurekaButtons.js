"use client";
import React, { useRef, useMemo } from 'react';
import { Cpu, Monitor, Layers, Database, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false }) {
    const pathname = usePathname() || '';
    const clickLockRef = useRef(false);
    
    // 🔥 FIX: Okamžitý lock platformy bez čekání na useEffect
    const platform = isEn ? 'amazon' : 'heureka';

    // Deterministický intent
    const intent = useMemo(() => {
        const lower = pathname.toLowerCase();
        if (lower.includes('bottleneck')) return 'calc';
        if (lower.includes('gpu')) return 'gpu';
        if (lower.includes('cpu')) return 'cpu';
        return 'generic';
    }, [pathname]);

    // 🔥 FIX: Heureka linky s prioritou pro haff ID (prevence ztráty prokliku)
    const getLink = (category) => {
        const subId = `v10-${platform}-${category}-${intent}`;
        
        if (platform === 'amazon') {
            const queries = { cpu: "Ryzen+9+9950X", gpu: "RTX+5080", mb: "X870E+AM5", ram: "DDR5+8000MT" };
            return `https://www.amazon.com/s?k=${queries[category]}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }
        
        const queries = { cpu: "ryzen+9950x", gpu: "rtx+5080", mb: "am5+zakladni+deska", ram: "ddr5+64gb" };
        // Parametry v pořadí, které Heureka preferuje pro affiliate
        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${queries[category]}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
    };

    const handleAction = (category) => {
        if (clickLockRef.current) return;
        clickLockRef.current = true;

        const targetUrl = getLink(category);
        const payload = { platform, category: `static_${category}`, sub_id: `v10-${category}`, page: pathname };

        // 1. Tichý tracking (sendBeacon je pro proklik nejstabilnější)
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        // 2. 🔥 FIX: Krátký timeout (150ms) zajistí, že browser stihne odeslat pakety s trackingem
        // a Heureka/Supabase tě nezahodí jako "robotický" okamžitý proklik.
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);

        // Reset locku pro případ, že user zůstane na stránce
        setTimeout(() => { clickLockRef.current = false; }, 1000);
    };

    const buttons = [
        { id: 'cpu', icon: Cpu, cz: 'Procesory', en: 'Processors', sub: '9000 SERIES' },
        { id: 'gpu', icon: Monitor, cz: 'Grafiky', en: 'Graphics', sub: 'RTX 50 SERIES' },
        { id: 'mb', icon: Layers, cz: 'Desky', en: 'Motherboards', sub: 'AM5 NEXT-GEN' },
        { id: 'ram', icon: Database, cz: 'Paměti', en: 'Memory', sub: 'DDR5 8000MT' }
    ];

    return (
        <div className="guru-buttons-container">
            {buttons.map((btn) => {
                const Icon = btn.icon;
                return (
                    <div
                        key={btn.id}
                        role="button"
                        onClick={() => handleAction(btn.id)}
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
                    background: rgba(10, 10, 10, 0.9);
                    border: 1px solid rgba(147, 51, 234, 0.2);
                    padding: 22px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                }
                .guru-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    border-color: #9333ea;
                    box-shadow: 0 15px 40px rgba(147, 51, 234, 0.25);
                }
                .guru-card-glow {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
                    opacity: 0; transition: opacity 0.3s;
                }
                .guru-card:hover .guru-card-glow { opacity: 1; }
                .guru-icon-wrapper {
                    background: #1a1a1a;
                    padding: 14px;
                    border-radius: 16px;
                    margin-right: 18px;
                    color: #9333ea;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s;
                }
                .guru-card:hover .guru-icon-wrapper {
                    background: #9333ea;
                    color: #fff;
                    transform: rotate(-8deg);
                }
                .guru-content {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .guru-label {
                    color: #fff;
                    font-weight: 900;
                    font-size: 17px;
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }
                .guru-sub {
                    color: #a855f7;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    margin-top: 3px;
                }
                .guru-arrow {
                    color: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s;
                }
                .guru-card:hover .guru-arrow {
                    transform: translateX(5px);
                    color: #fff;
                }
                @media (max-width: 640px) {
                    .guru-buttons-container { grid-template-columns: 1fr; }
                }
            `}} />
        </div>
    );
}
