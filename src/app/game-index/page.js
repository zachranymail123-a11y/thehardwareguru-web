"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import SeznamAd from "../../components/SeznamAd";
import { Gamepad2 } from 'lucide-react';

/**
 * GURU GAME INDEX V1.3 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace a perfektní mobilní zobrazení katalogu her.
 */

export default function GameIndexPage() {
    const pathname = usePathname();
    const isEn = pathname.startsWith("/en");

    const games = [
        "cyberpunk-2077", "warzone", "starfield", "fortnite",
        "cs2", "gta-5", "witcher-3", "red-dead-redemption-2",
        "baldurs-gate-3", "hogwarts-legacy", "forza-horizon-5"
    ];

    return (
        <div className="guru-page-wrapper" style={globalStyles}>
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

            {/* 🔥 SEZNAM AD #1: TOP PLACEMENT (STRIKTNÍ SEPARACE) */}
            <div style={{ marginBottom: '40px' }}>
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={210} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>
            </div>

            <main style={main}>
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
                                <div className="ad-mobile-wrapper" style={{ margin: '10px 0' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .guru-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.05); }
                .game-card { transition: all .3s cubic-bezier(.4,0,.2,1); }
                .game-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 0 30px rgba(168, 85, 247,.3);
                    border-color: #a855f7 !important;
                }

                /* 🚀 RESPONSIVE ADS SYSTEM */
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) {
                    .guru-page-wrapper { padding-top: 80px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .game-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
                    .game-card { padding: 25px !important; border-radius: 16px !important; }
                }
            `}} />
        </div>
    );
}

const header = { maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" };
const title = { fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: "950", textTransform: "uppercase", letterSpacing: "1px", margin: 0, lineHeight: 1.1 };
const subtitle = { color: '#9ca3af', fontSize: '1.1rem', marginTop: '15px' };
const main = { maxWidth: "1200px", margin: "0 auto 80px", padding: "0 20px" };
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
    paddingTop: "100px"
};
