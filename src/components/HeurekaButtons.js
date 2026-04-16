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
            return () => { if (document.body.contains(script)) document.body.removeChild(script); };
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
        if (query.trim().length > 0) setHasSearched(true);
    };

    const getGameLinks = (gameName) => {
        const encoded = encodeURIComponent(gameName);
        return [
            { name: 'Instant Gaming', desc: isEn ? 'Best prices' : 'Většinou nejnižší cena', url: `https://www.instant-gaming.com/en/search/?q=${encoded}&igr=gamer-32df929`, color: '#ff6600', badge: 'TOP VOLBA', Icon: Zap },
            { name: 'Gamivo', desc: isEn ? 'Huge catalog' : 'Největší výběr her a Windows', url: `https://www.gamivo.com/search/${encoded}?glv=d712zso6`, color: '#f36f21', badge: 'VELKÝ VÝBĚR', Icon: Gamepad2 },
            // 🔥 OPRAVENÝ G2A LINK PRO VYHLEDÁVÁNÍ 🔥
            { name: 'G2A', desc: isEn ? 'Largest marketplace' : 'Největší tržiště na světě', url: `https://www.g2a.com/n/reflink-fa31d77ef6?search=${encoded}`, color: '#ff9900', badge: 'GIGANT', Icon: ShoppingBag },
            { name: 'HRK Game', desc: isEn ? 'Flash sales' : 'Časté bleskové slevy', url: `https://www.hrkgame.com/en/games/products/?search=${encoded}#a_aid=TheHardwareGuru`, color: '#28b3ff', badge: 'BLESKOVÉ AKCE', Icon: Tag }
        ];
    };

    if (manualSearch) {
        if (isEn) {
            return (
                <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(manualSearch)}&tag=thehardware07-20`} target="_blank" rel="nofollow sponsored" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f59e0b', color: '#000', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }}>
                        <ShoppingCart size={20} /> CHECK ON AMAZON
                    </a>
                </div>
            );
        }
        const heurekaManualLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(manualSearch)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Manual%20search`;
        return (
            <div className="guru-search-widget-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div className="heureka-affiliate-searchpanel" data-trixam-positionid="276035" data-trixam-codetype="iframe" data-trixam-linktarget="top" style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center' }}></div>
                <a href={heurekaManualLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link guru-buy-winner-btn" data-trixam-positionid={positionId || "276026"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#0078d4', color: '#fff', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', width: '100%', maxWidth: '400px' }}>
                    <ShoppingCart size={20} /> POROVNAT CENY NA HEUREKA.CZ
                </a>
            </div>
        );
    }

    const buttons = [
        { key: 'cpu', id: "276027", label: "Procesory", url: "https://www.heureka.cz/?h%5Bfraze%5D=procesor#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", icon: Cpu, sub: "9000 SERIES", en: 'Processors' },
        { key: 'gpu', id: "276026", label: "Grafiky", url: "https://www.heureka.cz/?h%5Bfraze%5D=graficka+karta#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", icon: Monitor, sub: "RTX 50 SERIES", en: 'Graphics' },
        { key: 'mb', id: "276033", label: "Desky", url: "https://www.heureka.cz/?h%5Bfraze%5D=zakladni+deska#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", icon: Layers, sub: "AM5 NEXT-GEN", en: 'Motherboards' },
        { key: 'ram', id: "276034", label: "Paměti", url: "https://www.heureka.cz/?h%5Bfraze%5D=ram+pamet#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842", icon: Database, sub: "DDR5 8000MT", en: 'Memory' }
    ];

    return (
        <div className="guru-buttons-container">
            {!isEn && (
                <div className="guru-search-card">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#66fcf1', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>NAJDĚTE NEJLEPŠÍ CENU HARDWARU</h3>
                    </div>
                    <div className="heureka-affiliate-searchpanel" data-trixam-positionid="276035" data-trixam-codetype="iframe" data-trixam-linktarget="top" style={{ width: '100%', minHeight: '50px' }}></div>
                </div>
            )}

            <div className="guru-search-card game-search-card">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '950', textTransform: 'uppercase' }}>GURU VYHLEDÁVAČ HER A WINDOWS</h3>
                </div>
                <form onSubmit={handleGameSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="např. Cyberpunk 2077..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #a855f7' }} />
                    <button type="submit" style={{ background: '#a855f7', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>ZJISTIT NEJNIŽŠÍ CENU</button>
                </form>
                {hasSearched && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {getGameLinks(query).map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="nofollow sponsored" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${link.color}40`, textDecoration: 'none', color: '#fff' }}>
                                <span>{link.name}</span> <ExternalLink size={18} />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {buttons.map((btn) => (
                <a key={btn.key} href={isEn ? `https://www.amazon.com/s?k=${encodeURIComponent(btn.en)}&tag=thehardware07-20` : btn.url} target="_blank" rel="nofollow sponsored" className="guru-card">
                    <div className="guru-content"><span className="guru-label">{isEn ? btn.en : btn.label}</span></div>
                    <ChevronRight size={20} />
                </a>
            ))}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 40px 0; width: 100%; }
                .guru-search-card { grid-column: 1 / -1; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(102, 252, 241, 0.3); padding: 30px 20px; border-radius: 20px; }
                .game-search-card { border-color: rgba(168, 85, 247, 0.3); }
                .guru-card { display: flex; align-items: center; justify-content: space-between; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(147, 51, 234, 0.2); padding: 22px; border-radius: 20px; text-decoration: none; color: #fff; }
            `}} />
        </div>
    );
}
