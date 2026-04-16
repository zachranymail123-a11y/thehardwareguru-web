"use client";

import React, { useEffect, useState } from 'react';
import { Cpu, Monitor, Layers, Database, ChevronRight, Search, ShoppingCart, Gamepad2, Zap, Tag, ExternalLink, Flame, TrendingDown, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HeurekaButtons({ isEn = false, manualSearch = null, positionId = null }) {
    const pathname = usePathname() || '';
    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    const handleGameSearch = (e) => {
        e.preventDefault();
        if (query.trim().length > 0) {
            setHasSearched(true);
        }
    };

    const getGameLinks = (gameName) => {
        const encoded = encodeURIComponent(gameName);
        return [
            { name: 'Instant Gaming', desc: isEn ? 'Usually the best prices & instant delivery' : 'Většinou absolutně nejnižší cena', url: `https://www.instant-gaming.com/en/search/?q=${encoded}&igr=gamer-32df929`, color: '#ff6600', badge: 'TOP VOLBA', icon: <Zap size={22} /> },
            { name: 'Gamivo', desc: isEn ? 'Huge catalog & software keys' : 'Největší výběr indie her a Windows', url: `https://www.gamivo.com/search/${encoded}?glv=d712zso6`, color: '#f36f21', badge: 'SUPER CENY', icon: <Gamepad2 size={22} /> },
            { name: 'G2A', desc: isEn ? 'World\'s largest digital marketplace' : 'Největší digitální tržiště na světě', url: `https://www.g2a.com/n/reflink-fa31d77ef6?search=${encoded}`, color: '#ff9900', badge: 'GIGANT NA TRHU', icon: <ShoppingBag size={22} /> },
            { name: 'HRK Game', desc: isEn ? 'Frequent flash sales & bundles' : 'Časté bleskové slevy a akce', url: `https://www.hrkgame.com/en/games/products/?search=${encoded}#a_aid=TheHardwareGuru`, color: '#28b3ff', badge: 'BLESKOVÉ AKCE', icon: <Tag size={22} /> }
        ];
    };

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
                        <ShoppingCart size={20} /> CHECK ON AMAZON
                    </a>
                </div>
            );
        }

        const heurekaManualLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(manualSearch)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Manual%20search`;
        
        return (
            <div className="guru-search-widget-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div 
                    className="heureka-affiliate-searchpanel" 
                    data-trixam-positionid="276035" 
                    data-trixam-codetype="iframe" 
                    data-trixam-linktarget="top"
                    style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center' }}
                ></div>

                <a 
                    href={heurekaManualLink}
                    target="_blank"
                    rel="nofollow sponsored"
                    className="heureka-hn-link guru-buy-winner-btn"
                    data-trixam-positionid={positionId || "276026"}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#0078d4', color: '#fff', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%', maxWidth: '400px' }}
                    onClick={() => handleLogClick('manual_search', 'heureka')}
                >
                    <ShoppingCart size={20} /> POROVNAT CENY NA HEUREKA.CZ
                </a>
            </div>
        );
    }

    const heurekaData = {
        search: { id: "276035", label: "Hledej HW", url: "https://www.heureka.cz/#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Search", icon: Search, sub: "NAJDI NEJLEPŠÍ CENU" },
        cpu: { id: "276027", label: "Procesory", url: "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link", icon: Cpu, sub: "9000 SERIES" },
        gpu: { id: "276026", label: "Grafiky", url: "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link", icon: Monitor, sub: "RTX 50 SERIES" },
        mb: { id: "276033", label: "Desky", url: "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link", icon: Layers, sub: "AM5 NEXT-GEN" },
        ram: { id: "276034", label: "Paměti", url: "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link", icon: Database, sub: "DDR5 8000MT" }
    };

    const buttons = [
        { key: 'search', ...heurekaData.search, en: 'Search Hardware' },
        { key: 'cpu', ...heurekaData.cpu, en: 'Processors' },
        { key: 'gpu', ...heurekaData.gpu, en: 'Graphics' },
        { key: 'mb', ...heurekaData.mb, en: 'Motherboards' },
        { key: 'ram', ...heurekaData.ram, en: 'Memory' }
    ];

    return (
        <div className="guru-buttons-container">
            {buttons.map((btn) => {
                const Icon = btn.icon;
                const finalUrl = isEn ? `https://www.amazon.com/s?k=${encodeURIComponent(btn.en)}&tag=thehardware07-20` : btn.url;

                if (btn.key === 'search' && !isEn) {
                    return (
                        <div key={btn.key} className="guru-search-card" onClick={() => handleLogClick(btn.key, 'heureka')}>
                             <div className="guru-card-glow" />
                             <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                                 <h3 style={{ color: '#66fcf1', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '1px' }}>
                                     <Search size={24} /> NAJDĚTE NEJLEPŠÍ CENU HARDWARU NA TRHU
                                 </h3>
                                 <p style={{ color: '#d1d5db', fontSize: '14px', margin: '0 auto', maxWidth: '650px', fontWeight: '600', lineHeight: '1.6' }}>
                                     Zadejte přesný název grafické karty, procesoru nebo jiné komponenty. Náš vyhledávač okamžitě porovná nabídky z tisíců ověřených českých e-shopů.
                                 </p>
                             </div>
                             
                             <div style={{ width: '100%', position: 'relative', zIndex: 2 }}>
                                 <div 
                                     className="heureka-affiliate-searchpanel" 
                                     data-trixam-positionid={btn.id} 
                                     data-trixam-codetype="iframe" 
                                     data-trixam-linktarget="top"
                                     style={{ width: '100%', minHeight: '50px', display: 'flex', justifyContent: 'center' }}
                                 ></div>
                             </div>
                        </div>
                    );
                }

                if (btn.key !== 'search') {
                    return (
                        <a
                            key={btn.key}
                            href={finalUrl}
                            target="_blank"
                            rel="nofollow sponsored"
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
                }
                return null;
            })}

            {/* 🔥 GURU GAME SEARCH DRUHÝ BLOK 🔥 */}
            <div className="guru-search-card game-search-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div className="guru-card-glow" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }} />
                <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 14px', borderRadius: '20px', color: '#ef4444', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', marginBottom: '15px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <Flame size={16} /> {isEn ? 'Extreme discounts' : 'Extrémní slevy pro pařany'}
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '1px' }}>
                        <Gamepad2 size={24} color="#a855f7" /> {isEn ? 'GURU GAME DEAL FINDER' : 'GURU VYHLEDÁVAČ HER A WINDOWS'}
                    </h3>
                </div>

                <form onSubmit={handleGameSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', zIndex: 2, marginBottom: hasSearched ? '30px' : '0' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={24} color="#a855f7" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isEn ? "Search for a game (e.g., Cyberpunk 2077...)" : "např. Pragmata, Windows 11..."}
                            style={{ width: '100%', padding: '20px 20px 20px 60px', borderRadius: '16px', border: '2px solid rgba(168, 85, 247, 0.2)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '18px', fontWeight: 'bold', outline: 'none' }}
                        />
                    </div>
                    <button
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ background: isHovered ? 'linear-gradient(90deg, #a855f7 0%, #d946ef 100%)' : 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)', color: '#fff', border: 'none', padding: '18px 30px', borderRadius: '16px', fontWeight: '950', fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                    >
                        <TrendingDown size={24} /> {isEn ? 'FIND THE LOWEST PRICE' : 'ZJISTIT NEJNIŽŠÍ CENU'}
                    </button>
                </form>

                {hasSearched && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', zIndex: 2 }}>
                        {getGameLinks(query).map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="nofollow sponsored"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${link.color}30`, borderRadius: '16px', textDecoration: 'none' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = link.color; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `${link.color}30`; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ color: link.color }}>{link.icon}</div>
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{link.name}</span>
                                    {index === 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '8px' }}>{link.badge}</span>}
                                </div>
                                <ExternalLink size={18} color="#6b7280" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 40px 0; width: 100%; }
                .guru-search-card { grid-column: 1 / -1; position: relative; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(102, 252, 241, 0.3); padding: 30px 20px; border-radius: 20px; transition: all 0.4s; overflow: hidden; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); margin-bottom: 10px; }
                .guru-card { position: relative; display: flex; align-items: center; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(147, 51, 234, 0.2); padding: 22px; border-radius: 20px; cursor: pointer; transition: all 0.4s; overflow: hidden; backdrop-filter: blur(12px); text-decoration: none; }
                .guru-card:hover { transform: translateY(-5px); border-color: #9333ea; box-shadow: 0 15px 40px rgba(147, 51, 234, 0.25); }
                .guru-card-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%); opacity: 0; transition: opacity 0.4s; }
                .guru-search-card:hover .guru-card-glow { opacity: 1; }
                .guru-icon-wrapper { background: #1a1a1a; padding: 14px; border-radius: 16px; margin-right: 18px; color: #9333ea; border: 1px solid rgba(255, 255, 255, 0.05); }
                .guru-card:hover .guru-icon-wrapper { background: #9333ea; color: #fff; }
                .guru-label { color: #fff; font-weight: 900; font-size: 15px; text-transform: uppercase; line-height: 1.2; }
                .guru-sub { color: #a855f7; font-size: 11px; font-weight: 800; margin-top: 3px; }
                .guru-arrow { color: rgba(255, 255, 255, 0.1); }
                @media (max-width: 640px) { .guru-buttons-container { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
}
