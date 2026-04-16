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
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(manualSearch)}&tag=thehardware07-20&ascsubtag=v10-search-fallback`} target="_blank" rel="nofollow sponsored" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f59e0b', color: '#000', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }} onClick={() => handleLogClick('manual_search', 'amazon')}>
                        <ShoppingCart size={20} /> CHECK ON AMAZON
                    </a>
                </div>
            );
        }
        const heurekaManualLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(manualSearch)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Manual%20search`;
        return (
            <div className="guru-search-widget-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div className="heureka-affiliate-searchpanel" data-trixam-positionid="276035" data-trixam-codetype="iframe" data-trixam-linktarget="top" style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center' }}></div>
                <a href={heurekaManualLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link guru-buy-winner-btn" data-trixam-positionid={positionId || "276026"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#0078d4', color: '#fff', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%', maxWidth: '400px' }} onClick={() => handleLogClick('manual_search', 'heureka')}>
                    <ShoppingCart size={20} /> POROVNAT CENY NA HEUREKA.CZ
                </a>
            </div>
        );
    }

    const buttons = [
        { key: 'cpu', label: "Procesory", id: "276027", sub: "9000 SERIES", icon: Cpu, url: "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", en: 'Processors' },
        { key: 'gpu', label: "Grafiky", id: "276026", sub: "RTX 50 SERIES", icon: Monitor, url: "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", en: 'Graphics' },
        { key: 'mb', label: "Desky", id: "276033", sub: "AM5 NEXT-GEN", icon: Layers, url: "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", en: 'Motherboards' },
        { key: 'ram', label: "Paměti", id: "276034", sub: "DDR5 8000MT", icon: Database, url: "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", en: 'Memory' }
    ];

    return (
        <div className="guru-buttons-container">
            {/* HEUREKA HARDWARE */}
            {!isEn && (
                <div className="guru-search-card" onClick={() => handleLogClick('search_heureka', 'heureka')}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#66fcf1', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>NAJDĚTE NEJLEPŠÍ CENU HARDWARU NA TRHU</h3>
                        <p style={{ color: '#d1d5db', fontSize: '14px', marginTop: '10px' }}>Náš vyhledávač okamžitě porovná nabídky z tisíců českých e-shopů.</p>
                    </div>
                    <div className="heureka-affiliate-searchpanel" data-trixam-positionid="276035" data-trixam-codetype="iframe" data-trixam-linktarget="top" style={{ width: '100%', minHeight: '50px' }}></div>
                </div>
            )}

            {/* GURU GAME & SOFTWARE SEARCH */}
            <div className="guru-search-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase' }}>{isEn ? 'GURU GAME & SOFTWARE SEARCH' : 'GURU VYHLEDÁVAČ HER A SOFTWARU'}</h3>
                </div>
                <form onSubmit={handleGameSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={22} color="#a855f7" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isEn ? "Search game or software..." : "např. Pragmata, Windows 11..."} style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.2)', outline: 'none' }} />
                    </div>
                    <button type="submit" style={{ background: 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)', color: '#fff', padding: '15px', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', border: 'none', textTransform: 'uppercase' }}>{isEn ? 'FIND THE LOWEST PRICE' : 'ZJISTIT NEJNIŽŠÍ CENU'}</button>
                </form>
                {hasSearched && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {getGameLinks(query).map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="nofollow sponsored" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${link.color}40`, textDecoration: 'none', transition: '0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: link.color }}>{link.icon}</div>
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{link.name}</span>
                                </div>
                                <ExternalLink size={18} color="#6b7280" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* HARDWARE GRID */}
            {buttons.map((btn) => (
                <a key={btn.key} href={isEn ? `https://www.amazon.com/s?k=${encodeURIComponent(btn.en)}&tag=thehardware07-20` : btn.url} target="_blank" rel="nofollow sponsored" className={isEn ? "guru-card" : "heureka-hn-link guru-card"} data-trixam-positionid={isEn ? undefined : btn.id} onClick={() => handleLogClick(btn.key, isEn ? 'amazon' : 'heureka')}>
                    <div className="guru-content">
                        <span className="guru-label">{isEn ? btn.en : `${btn.label} za nejnižší ceny`}</span>
                        <span className="guru-sub">{btn.sub}</span>
                    </div>
                    <ChevronRight size={20} />
                </a>
            ))}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 40px 0; width: 100%; }
                .guru-search-card { grid-column: 1 / -1; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(102, 252, 241, 0.3); padding: 30px 20px; border-radius: 20px; }
                .guru-card { display: flex; align-items: center; justify-content: space-between; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(147, 51, 234, 0.2); padding: 22px; border-radius: 20px; text-decoration: none; color: #fff; transition: 0.3s; }
                .guru-card:hover { border-color: #9333ea; transform: translateY(-3px); }
                .guru-content { display: flex; flex-direction: column; }
                .guru-label { font-weight: 900; text-transform: uppercase; font-size: 14px; }
                .guru-sub { color: #a855f7; font-size: 11px; font-weight: 800; }
                @media (max-width: 640px) { .guru-buttons-container { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
}
