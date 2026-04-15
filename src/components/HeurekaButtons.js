"use client";

import React, { useEffect } from 'react';
import { Cpu, Monitor, Layers, Database, ChevronRight, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false, manualSearch = null, positionId = null }) {
    const pathname = usePathname() || '';

    // Inicializace Heureka skriptu pro iframe search bar a dynamická tlačítka
    useEffect(() => {
        if (!isEn && typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = "//serve.affiliate.heureka.cz/js/trixam.min.js";
            script.async = true;
            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        }
    }, [isEn]);

    const handleLogClick = (category, platform) => {
        const payload = { platform, category: `static_${category}`, sub_id: `v11-${category}`, page: pathname };
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
    };

    // 🔥 MÓD 1: MANUÁLNÍ VYHLEDÁVÁNÍ (Vygeneruje vyhledávací pole podle dodaných fotek - ID 276035)
    // Pokud je předáno manualSearch, chceme zobrazit i dedikované tlačítko a vyhledávací Searchbar Heureky.
    if (manualSearch) {
        if (isEn) {
            return (
                <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <a 
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(manualSearch)}&tag=thehardware07-20&ascsubtag=v10-search-fallback`}
                        target="_blank"
                        rel="nofollow sponsored"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f59e0b', color: '#000', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }}
                        onClick={() => handleLogClick('manual_search', 'amazon')}
                    >
                        <Search size={20} /> CHECK ON AMAZON
                    </a>
                </div>
            );
        }

        const heurekaManualLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(manualSearch)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Manual%20search`;
        
        return (
            <div className="guru-search-widget-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                
                {/* 🔥 HEUREKA SEARCHBAR (Z obrázku 3 a 4 - ID: 276035) 🔥 */}
                <div 
                    className="heureka-affiliate-searchpanel" 
                    data-trixam-positionid="276035" 
                    data-trixam-codetype="iframe" 
                    data-trixam-linktarget="top"
                    style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center' }}
                ></div>

                {/* Manuální tlačítko jako pojistka s V10 Hard-Lock formátem (#) */}
                <a 
                    href={heurekaManualLink}
                    target="_blank"
                    rel="nofollow sponsored"
                    className="heureka-hn-link guru-buy-winner-btn"
                    data-trixam-positionid={positionId || "276026"}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#0078d4', color: '#fff', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%', maxWidth: '400px' }}
                    onClick={() => handleLogClick('manual_search', 'heureka')}
                >
                    <Search size={20} /> POROVNAT CENY NA HEUREKA.CZ
                </a>
            </div>
        );
    }

    // 🔥 PŘESNÁ DATA Z ADMINU HEUREKY (Z TVÝCH SCREENSHOTŮ) 🔥
    const heurekaData = {
        search: {
            id: "276035",
            label: "Hledej HW",
            url: "https://www.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Search",
            icon: Search,
            sub: "NAJDI NEJLEPŠÍ CENU"
        },
        cpu: {
            id: "276027",
            label: "Procesory",
            url: "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link",
            icon: Cpu,
            sub: "9000 SERIES"
        },
        gpu: {
            id: "276026",
            label: "Grafiky",
            url: "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link",
            icon: Monitor,
            sub: "RTX 50 SERIES"
        },
        mb: {
            id: "276033",
            label: "Desky",
            url: "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link",
            icon: Layers,
            sub: "AM5 NEXT-GEN"
        },
        ram: {
            id: "276034",
            label: "Paměti",
            url: "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link",
            icon: Database,
            sub: "DDR5 8000MT"
        }
    };

    const buttons = [
        { key: 'search', ...heurekaData.search, en: 'Search Hardware' },
        { key: 'cpu', ...heurekaData.cpu, en: 'Processors' },
        { key: 'gpu', ...heurekaData.gpu, en: 'Graphics' },
        { key: 'mb', ...heurekaData.mb, en: 'Motherboards' },
        { key: 'ram', ...heurekaData.ram, en: 'Memory' }
    ];

    // 🔥 MÓD 2: PĚT TLAČÍTEK VČETNĚ SEARCHBARU (Výchozí)
    return (
        <div className="guru-buttons-container">
            {buttons.map((btn) => {
                const Icon = btn.icon;
                
                // EN verze jede na Amazon (pokud nemáš EN Heureku), CZ verze jede PŘESNĚ podle screenů
                const finalUrl = isEn 
                    ? `https://www.amazon.com/s?k=${encodeURIComponent(btn.en)}&tag=thehardware07-20`
                    : btn.url;

                // Vyhledávací pole Heureky v CZ
                if (btn.key === 'search' && !isEn) {
                    return (
                        <div key={btn.key} className="guru-card search-card" onClick={() => handleLogClick(btn.key, 'heureka')}>
                             <div className="guru-card-glow" />
                             <div className="guru-icon-wrapper" style={{ marginRight: '10px', padding: '10px' }}>
                                 <Icon size={24} className="guru-icon" />
                             </div>
                             <div className="guru-content" style={{ width: '100%' }}>
                                 <div 
                                     className="heureka-affiliate-searchpanel" 
                                     data-trixam-positionid={btn.id} 
                                     data-trixam-codetype="iframe" 
                                     data-trixam-linktarget="top"
                                     style={{ width: '100%', height: '50px', display: 'flex', alignItems: 'center' }}
                                 ></div>
                             </div>
                        </div>
                    );
                }

                // Standardní tlačítka
                return (
                    <a
                        key={btn.key}
                        href={finalUrl}
                        target="_blank"
                        rel="nofollow sponsored"
                        // 🔥 KLÍČOVÉ PRO HEUREKA TRACKING 🔥
                        className={isEn ? "guru-card" : "heureka-hn-link guru-card"}
                        data-trixam-positionid={isEn ? undefined : btn.id}
                        onClick={() => handleLogClick(btn.key, isEn ? 'amazon' : 'heureka')}
                    >
                        <div className="guru-card-glow" />
                        <div className="guru-icon-wrapper">
                            <Icon size={28} className="guru-icon" />
                        </div>
                        <div className="guru-content">
                            <span className="guru-label">
                                {isEn ? btn.en : `${btn.label} za nejnižší ceny`}
                            </span>
                            <span className="guru-sub">{btn.sub}</span>
                        </div>
                        <ChevronRight size={20} className="guru-arrow" />
                    </a>
                );
            })}
            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 40px 0; width: 100%; }
                .search-card { grid-column: 1 / -1; padding: 10px 20px; } /* Search bar na celou šířku nahoře */
                .guru-card { position: relative; display: flex; align-items: center; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(147, 51, 234, 0.2); padding: 22px; border-radius: 20px; cursor: pointer; transition: all 0.4s; overflow: hidden; backdrop-filter: blur(12px); text-decoration: none; }
                .guru-card:hover { transform: translateY(-5px); border-color: #9333ea; box-shadow: 0 15px 40px rgba(147, 51, 234, 0.25); }
                .guru-card-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%); opacity: 0; }
                .guru-card:hover .guru-card-glow { opacity: 1; }
                .guru-icon-wrapper { background: #1a1a1a; padding: 14px; border-radius: 16px; margin-right: 18px; color: #9333ea; border: 1px solid rgba(255, 255, 255, 0.05); }
                .guru-card:hover .guru-icon-wrapper { background: #9333ea; color: #fff; }
                .guru-content { display: flex; flex-direction: column; flex-grow: 1; }
                .guru-label { color: #fff; font-weight: 900; font-size: 15px; text-transform: uppercase; line-height: 1.2; }
                .guru-sub { color: #a855f7; font-size: 11px; font-weight: 800; margin-top: 3px; }
                .guru-arrow { color: rgba(255, 255, 255, 0.1); }
                @media (max-width: 640px) { .guru-buttons-container { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
}
