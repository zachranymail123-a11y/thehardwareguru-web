"use client";
import React, { useMemo } from 'react';
import { Cpu, Monitor, Layers, Database, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false, manualSearch = "" }) {
    const pathname = usePathname() || '';
    const platform = isEn ? 'amazon' : 'heureka';

    const intent = useMemo(() => {
        const lower = pathname.toLowerCase();
        if (lower.includes('bottleneck')) return 'calc';
        if (lower.includes('gpu')) return 'gpu';
        if (lower.includes('cpu')) return 'cpu';
        return 'generic';
    }, [pathname]);

    const getLink = (category) => {
        const subId = `v10-${platform}-${category}-${intent}`;
        let searchQuery = "";
        
        if (category === intent && manualSearch) {
            searchQuery = manualSearch;
        } else {
            const fallbacks = {
                cpu: "AMD Ryzen 9 9950X",
                gpu: "NVIDIA RTX 5080",
                mb: "X870E AM5",
                ram: "DDR5 64GB"
            };
            searchQuery = fallbacks[category];
        }

        if (platform === 'amazon') {
            return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=thehardware07-20&ascsubtag=${subId}&s=featured`;
        }
        
        // 🔥 ABSOLUTNĚ ČISTÝ FORMÁT PODLE TVÝCH SCREENSHOTŮ 🔥
        // Pouze www.heureka.cz a haff jako první parametr. Žádné mazání "Ryzen/Core".
        return `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(searchQuery)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
    };

    const handleLogClick = (category) => {
        const payload = { platform, category: `static_${category}`, sub_id: `v10-${category}`, page: pathname };
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
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
                    <a
                        key={btn.id}
                        href={getLink(btn.id)}
                        target="_blank"
                        rel="nofollow sponsored"
                        onClick={() => handleLogClick(btn.id)}
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
                    </a>
                );
            })}
            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 40px 0; width: 100%; }
                .guru-card { position: relative; display: flex; align-items: center; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(147, 51, 234, 0.2); padding: 22px; border-radius: 20px; cursor: pointer; transition: all 0.4s; overflow: hidden; backdrop-filter: blur(12px); text-decoration: none; }
                .guru-card:hover { transform: translateY(-5px); border-color: #9333ea; box-shadow: 0 15px 40px rgba(147, 51, 234, 0.25); }
                .guru-card-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%); opacity: 0; }
                .guru-card:hover .guru-card-glow { opacity: 1; }
                .guru-icon-wrapper { background: #1a1a1a; padding: 14px; border-radius: 16px; margin-right: 18px; color: #9333ea; border: 1px solid rgba(255, 255, 255, 0.05); }
                .guru-card:hover .guru-icon-wrapper { background: #9333ea; color: #fff; }
                .guru-content { display: flex; flex-direction: column; flex-grow: 1; }
                .guru-label { color: #fff; font-weight: 900; font-size: 17px; text-transform: uppercase; }
                .guru-sub { color: #a855f7; font-size: 11px; font-weight: 800; margin-top: 3px; }
                .guru-arrow { color: rgba(255, 255, 255, 0.1); }
                @media (max-width: 640px) { .guru-buttons-container { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
}
