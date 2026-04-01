"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import SeznamAd from "../../components/SeznamAd";
import { Gamepad2, ShoppingCart } from 'lucide-react';
import HeurekaButtons from "../../components/HeurekaButtons";

/**
 * GURU GAME INDEX V1.6 (AFFILIATE BOMB & BUILD FIX)
 * 🚀 CÍL: Oprava cest k importům (Build fix) + integrace modrých affiliate tlačítek.
 */

export default function GameIndexPage() {
    const pathname = usePathname();
    const isEn = pathname.startsWith("/en");

    const games = [
        "cyberpunk-2077", "warzone", "starfield", "fortnite",
        "cs2", "gta-5", "witcher-3", "red-dead-redemption-2",
        "baldurs-gate-3", "hogwarts-legacy", "forza-horizon-5"
    ];

    // Affiliate linky pro modrá tlačítka
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div className="guru-page-wrapper" style={globalStyles}>
            
            {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>
            </div>

            <header style={header}>
                <div className="guru-badge">
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
                {/* 🔥 GURU AFFILIATE BOMB (Modrá tlačítka s opraveným trackováním) 🔥 */}
                <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderLeft: '4px solid #a855f7' }}>
                    <div className="affiliate-col">
                        <div className="affiliate-col-title" style={{ color: '#a855f7' }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY RTX 5070 Ti` : `KOUPIT RTX 5070 Ti`}
                        </div>
                        <div className="affiliate-btn-wrap">
                            <a href={getSmartyLink("RTX 5070 Ti")} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <a 
                                href={getHeurekaLink("RTX 5070 Ti")} 
                                data-trixam-positionid="276026" 
                                data-trixam-codetype="link" 
                                target="_blank" 
                                rel="nofollow sponsored" 
                                className="guru-buy-winner-btn heureka-btn heureka-hn-link"
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </div>
                    </div>
                </div>

                {/* Heureka Buttons pro kategorie (ponecháno pod Bomb Gridem) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <HeurekaButtons isEn={isEn} manualSearch="RTX 5070 Ti" positionId="276026" />
                </div>

                <div className="game-grid" style={grid}>
                    {games.map((game, index) => (
                        <React.Fragment key={game}>
                            <Link
                                href={isEn ? `/en/game-benchmarks/${game}` : `/game-benchmarks/${game}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div className="game-card" style={card}>
                                    <h3 style={cardTitle}>{game.replaceAll("-", " ").toUpperCase()}</h3>
                                </div>
                            </Link>

                            {/* 🔥 SEZNAM AD #2: GRID INJECTION (POUZE MOBIL) */}
                            {index === 3 && (
                                <div className="ad-mobile-wrapper" style={{ margin: '10px 0', justifyContent: 'center' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR */}
            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={90} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={100} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); }
                .game-card { transition: all .3s cubic-bezier(.4,0,.2,1); }
                .game-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 0 30px rgba(168, 85, 247,.3);
                    border-color: #a855f7 !important;
                }

                /* Affiliate Bomb Grid & Buttons */
                .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
                .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
                
                @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
                @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
                
                .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
                .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
                .smarty-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5); }
                .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
                .heureka-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }

                .sticky-bottom-anchor {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: rgba(10, 11, 13, 0.98);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9999;
                    padding: 10px 0;
                    display: flex;
                    justify-content: center;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
                }

                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) {
                    .guru-page-wrapper { padding-top: 80px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .game-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
                    .game-card { padding: 25px !important; border-radius: 16px !important; }
                    .affiliate-cta-grid { padding: 20px; }
                    .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
                    .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
                    .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
                }
            `}} />
        </div>
    );
}

const header = { maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" };
const title = { fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: "950", textTransform: "uppercase", letterSpacing: "1px", margin: 0, lineHeight: 1.1 };
const subtitle = { color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px' };
const main = { maxWidth: "1200px", margin: "0 auto 20px", padding: "0 20px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "30px" };

const card = { borderRadius: "12px", padding: "40px", textAlign: "center", background: "rgba(17,19,24,0.85)", border: "1px solid rgba(255,255,255,0.05)", height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { color: "#fff", fontSize: "1.2rem", fontWeight: "950", margin: 0 };

const globalStyles = {
    minHeight: "100vh",
    backgroundColor: "#0a0b0d",
    color: "#fff",
    backgroundImage: 'url("/bg-guru.png")',
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    paddingTop: "120px",
    paddingBottom: "160px"
};
