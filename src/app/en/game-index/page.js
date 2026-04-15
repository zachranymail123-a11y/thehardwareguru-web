"use client";
import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import SeznamAd from "../../../components/SeznamAd";
import { Gamepad2, ShoppingCart, AlertTriangle } from 'lucide-react';

/**
 * GURU GAME INDEX EN - V1.1 (FULL ENGLISH TRANSLATION)
 * 🚀 GOAL: Complete English version with Amazon links and EN interface.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function GameIndexEnPage() {
    const pathname = usePathname();
    const isEn = true; 

    const games = [
        "cyberpunk-2077", "warzone", "starfield", "fortnite",
        "cs2", "gta-v", "witcher-3", "red-dead-redemption-2",
        "baldurs-gate-3", "hogwarts-legacy", "forza-horizon-5"
    ];

    const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

    const handleLogClick = (subId) => {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'amazon', category: 'game_index_en', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
    };

    return (
        <div className="guru-page-wrapper" style={globalStyles}>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>
            </div>

            <header style={header}>
                <div className="guru-badge" style={badgeStyle}>
                    <Gamepad2 size={16} /> GURU DATABASE
                </div>
                <h1 style={title}>
                    GAME <span style={{ color: "#a855f7" }}>INDEX</span>
                </h1>
                <p style={subtitle}>
                    Hardware benchmarks and performance analysis for modern gaming titles.
                </p>
            </header>

            <main style={main}>
                {/* 🔥 GURU AFFILIATE BOMB - EN VERSION 🔥 */}
                <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderLeft: '4px solid #a855f7' }}>
                    <div className="affiliate-col" style={{ width: '100%', textAlign: 'center' }}>
                        <div className="affiliate-col-title" style={{ fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <ShoppingCart size={16} /> BEST DEAL: NVIDIA RTX 5070 Ti
                        </div>
                        <div className="affiliate-btn-wrap" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <a 
                                href={getAmazonLink("RTX 5070 Ti")} 
                                target="_blank" 
                                rel="nofollow sponsored" 
                                onClick={() => handleLogClick('v10-game-index-en')}
                                className="guru-buy-winner-btn amazon-btn"
                                style={amazonBtnStyle}
                            >
                                <ShoppingCart size={16} /> CHECK PRICE ON AMAZON
                            </a>
                        </div>
                    </div>
                </div>

                <div className="game-grid" style={grid}>
                    {games.map((game, index) => (
                        <React.Fragment key={game}>
                            <Link
                                href={`/en/gpu-fps/rtx-5070-ti/${game}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div className="game-card" style={card}>
                                    <h3 style={cardTitle}>{game.replaceAll("-", " ").toUpperCase()}</h3>
                                </div>
                            </Link>
                            {index === 3 && (
                                <div className="ad-mobile-wrapper" style={{ margin: '10px 0', justifyContent: 'center' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px' }}>
                    <a href="/en/fps-calculator" style={toolBtnFps}>
                        <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>FPS CALCULATOR</span>
                    </a>
                    <a href="/en/bottleneck-calculator" style={toolBtnBn}>
                        <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>BOTTLENECK TEST</span>
                    </a>
                </div>
            </main>

            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={90} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={100} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .game-card { transition: all .3s cubic-bezier(.4,0,.2,1); }
                .game-card:hover { transform: translateY(-8px); box-shadow: 0 0 30px rgba(168, 85, 247,.3); border-color: #a855f7 !important; }
                .affiliate-cta-grid { padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
                .guru-buy-winner-btn { display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: all 0.3s ease; letter-spacing: 1px; }
                .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
                .amazon-btn:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(245, 158, 11, 0.4); }
                .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
                @media (max-width: 768px) {
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .game-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
                    .affiliate-cta-grid { padding: 20px; }
                }
            `}} />
        </div>
    );
}

// STYLES
const globalStyles = { minHeight: "100vh", backgroundColor: "#0a0b0d", color: "#fff", backgroundImage: 'url("/bg-guru.png")', backgroundSize: "cover", backgroundAttachment: "fixed", paddingTop: "120px", paddingBottom: "160px", fontFamily: "sans-serif" };
const header = { maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" };
const title = { fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: "950", textTransform: "uppercase", letterSpacing: "1px", margin: 0, lineHeight: 1.1 };
const subtitle = { color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px' };
const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' };
const main = { maxWidth: "1200px", margin: "0 auto 20px", padding: "0 20px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "30px" };
const card = { borderRadius: "12px", padding: "40px", textAlign: "center", background: "rgba(17,19,24,0.85)", border: "1px solid rgba(255,255,255,0.05)", height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { color: "#fff", fontSize: "1.2rem", fontWeight: "950", margin: 0 };
const toolBtnFps = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' };
const toolBtnBn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' };
const amazonBtnStyle = { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', border: '2px solid #fbbf24', textDecoration: 'none' };
