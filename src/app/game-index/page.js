"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import SeznamAd from "../../components/SeznamAd";
import { Gamepad2, ShoppingCart, AlertTriangle } from 'lucide-react';
import HeurekaButtons from "../../components/HeurekaButtons";

/**
 * GURU GAME INDEX V1.9 (GPU-FPS ROUTE FIX)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function GameIndexPage() {
    const pathname = usePathname();
    const isEn = pathname.startsWith("/en");

    // Slugy her odpovídající tvé DB (game_fps) a složce [game] v gpu-fps
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
        setTimeout(() => { window.location.href = targetUrl; }, 150);
    };

    return (
        <div className="guru-page-wrapper" style={{ minHeight: "100vh", backgroundColor: "#0a0b0d", color: "#fff", backgroundImage: 'url("/bg-guru.png")', backgroundSize: "cover", backgroundAttachment: "fixed", paddingTop: "120px", paddingBottom: "160px" }}>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
                <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
            </div>

            <header style={{ maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" }}>
                <div className="guru-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', background: 'rgba(168, 85, 247, 0.1)' }}>
                    <Gamepad2 size={16} /> {isEn ? 'DATABASE' : 'DATABÁZE'}
                </div>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: "950", textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
                    {isEn ? <>GAME <span style={{ color: "#a855f7" }}>INDEX</span></> : <>INDEX <span style={{ color: "#a855f7" }}>HER</span></>}
                </h1>
            </header>

            <main style={{ maxWidth: "1200px", margin: "0 auto 20px", padding: "0 20px" }}>
                <div className="affiliate-cta-grid" style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderLeft: '4px solid #a855f7' }}>
                    <div className="affiliate-col" style={{ width: '100%', textAlign: 'center' }}>
                        <div className="affiliate-col-title" style={{ fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px', color: '#a855f7' }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY RTX 5070 Ti` : `KOUPIT RTX 5070 Ti`}
                        </div>
                        <div className="affiliate-btn-wrap" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={getSmartyLink("RTX 5070 Ti")} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn" style={{ background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)', color: '#000', padding: '18px 24px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', fontSize: '16px' }}>Smarty.cz</a>
                            <button onClick={(e) => handleHeurekaAction(e, "RTX 5070 Ti", "v10-game-index")} className="guru-buy-winner-btn" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0078d4 100%)', color: '#fff', padding: '18px 24px', borderRadius: '16px', border: 'none', fontWeight: '950', fontSize: '16px', cursor: 'pointer' }}>Heureka.cz</button>
                        </div>
                    </div>
                </div>

                <div className="game-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "30px" }}>
                    {games.map((game) => (
                        <Link key={game} href={isEn ? `/en/gpu-fps/rtx-5070-ti/${game}` : `/gpu-fps/rtx-5070-ti/${game}`} style={{ textDecoration: "none" }}>
                            <div className="game-card" style={{ borderRadius: "12px", padding: "40px", textAlign: "center", background: "rgba(17,19,24,0.85)", border: "1px solid rgba(255,255,255,0.05)", height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "950", margin: 0 }}>{game.replaceAll("-", " ").toUpperCase()}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
