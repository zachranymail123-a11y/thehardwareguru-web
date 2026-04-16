"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import SeznamAd from "../../components/SeznamAd";
import { Gamepad2, ShoppingCart, AlertTriangle, ChevronRight, Swords } from 'lucide-react';
import HeurekaButtons from "../../components/HeurekaButtons";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function GameIndexPage() {
    const pathname = usePathname() || '';
    const isEn = pathname.startsWith("/en");

    const games = [
        "cyberpunk-2077", "warzone", "starfield", "fortnite",
        "cs2", "gta-v", "witcher-3", "red-dead-redemption-2",
        "baldurs-gate-3", "hogwarts-legacy", "forza-horizon-5"
    ];

    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;

    const handleHeurekaAction = (e, name, subId) => {
        e.preventDefault();
        const q = encodeURIComponent(name);
        const targetUrl = `https://www.heureka.cz/?h%5Bfraze%5D=${q}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: 'game_index', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    const globalStyles = { minHeight: "100vh", backgroundColor: "#0a0b0d", color: "#fff", backgroundImage: 'url("/bg-guru.png")', backgroundSize: "cover", backgroundAttachment: "fixed", paddingTop: "120px", paddingBottom: "160px", fontFamily: "sans-serif" };
    const header = { maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" };
    const title = { fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: "950", textTransform: "uppercase", letterSpacing: "1px", margin: 0, lineHeight: 1.1 };
    const subtitle = { color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px' };
    const main = { maxWidth: "1200px", margin: "0 auto 20px", padding: "0 20px" };
    const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "30px" };
    const card = { borderRadius: "12px", padding: "40px", textAlign: "center", background: "rgba(17,19,24,0.85)", border: "1px solid rgba(255,255,255,0.05)", height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' };
    const cardTitle = { color: "#fff", fontSize: "1.2rem", fontWeight: "950", margin: 0 };

    return (
        <div className="guru-page-wrapper" style={globalStyles}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": isEn ? "Game Performance Index" : "Index výkonu her",
                "description": isEn ? "Complete database of game benchmarks and FPS tests." : "Kompletní databáze herních benchmarků a testů FPS."
            })}} />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
                <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
            </div>

            <header style={header}>
                <div className="guru-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
                    <Gamepad2 size={16} /> {isEn ? 'DATABASE' : 'DATABÁZE'}
                </div>
                <h1 style={title}>
                    {isEn ? <>GAME <span style={{ color: "#a855f7" }}>INDEX</span></> : <>INDEX <span style={{ color: "#a855f7" }}>HER</span></>}
                </h1>
                <p style={subtitle}>
                    {isEn ? 'Hardware benchmarks and performance analysis for modern titles.' : 'Hardwarové benchmarky a analýzy výkonu pro moderní tituly.'}
                </p>
            </header>

            <main style={main}>
                <div className="affiliate-cta-grid">
                    <div className="affiliate-col">
                        <div className="affiliate-col-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', color: '#a855f7', marginBottom: '25px' }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY RTX 5070 Ti` : `KOUPIT RTX 5070 Ti`}
                        </div>
                        <div className="affiliate-btn-wrap">
                            <a href={getSmartyLink("RTX 5070 Ti")} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <button onClick={(e) => handleHeurekaAction(e, "RTX 5070 Ti", "v10-game-index")} className="guru-buy-winner-btn heureka-btn">
                                <ShoppingCart size={16} /> Heureka.cz
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <HeurekaButtons isEn={isEn} manualSearch="RTX 5070 Ti" positionId="276026" />
                </div>

                <div className="game-grid" style={grid}>
                    {games.map((game, index) => (
                        <React.Fragment key={game}>
                            <Link href={isEn ? `/en/gpu-fps/rtx-5070-ti/${game}` : `/gpu-fps/rtx-5070-ti/${game}`} style={{ textDecoration: "none" }}>
                                <div className="game-card" style={card}>
                                    <h3 style={cardTitle}>{game.replaceAll("-", " ").toUpperCase()}</h3>
                                </div>
                            </Link>
                            {index === 3 && (
                                <div className="ad-mobile-wrapper" style={{ margin: '10px 0', display: 'flex', justifyContent: 'center' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            <div className="sticky-bottom-anchor">
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .affiliate-cta-grid { padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); border-left: 4px solid #a855f7; margin-bottom: 50px; }
                .affiliate-btn-wrap { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
                .guru-buy-winner-btn { flex: 1; min-width: 200px; max-width: 300px; display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; cursor: pointer; border: none; }
                .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; }
                .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; }
                .game-card:hover { transform: translateY(-8px); border-color: #a855f7 !important; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3); }
                .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
                @media (max-width: 768px) { .ad-desktop-wrapper { display: none; } .game-grid { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
}
