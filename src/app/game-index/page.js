"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';

/**
 * GURU GAME INDEX V1.1 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Monetizace rozcestníku her skrze A-ADS.
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
        <div style={globalStyles}>
            <header style={header}>
                <h1 style={title}>
                    {isEn ? <>GAME <span style={{ color: "#a855f7" }}>INDEX</span></> : <>INDEX <span style={{ color: "#a855f7" }}>HER</span></>}
                </h1>
            </header>

            {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD NADPISEM */}
            <div className="guru-index-ad-wrapper">
                <span className="ad-label">Advertisement</span>
                <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{ border: 0, padding: 0, width: '100%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe></div>
                <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{ border: 0, padding: 0, width: '100%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe></div>
            </div>

            <main style={main}>
                <div style={grid}>
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

                            {/* 🔥 ADS SLOT #2: GRID INJECTION (Vloží reklamu po 4. hře) */}
                            {index === 3 && (
                                <div className="guru-index-ad-wrapper grid-span-ad">
                                    <span className="ad-label">Sponsored Gaming Tech</span>
                                    <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{ border: 0, padding: 0, width: '100%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe></div>
                                    <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{ border: 0, padding: 0, width: '100%', height: '100px', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe></div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            <style>{`
                ${cardCss}
                .guru-index-ad-wrapper { 
                    max-width: 1200px; 
                    margin: 0 auto 40px; 
                    padding: 15px; 
                    background: rgba(168, 85, 247, 0.03); 
                    border: 1px solid rgba(168, 85, 247, 0.1); 
                    border-radius: 20px; 
                    text-align: center; 
                }
                .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
                .ad-desktop { display: block; } .ad-mobile { display: none; }
                
                @media (min-width: 768px) {
                    .grid-span-ad { grid-column: 1 / -1; }
                }
                @media (max-width: 768px) {
                    .ad-desktop { display: none; } .ad-mobile { display: block; }
                }
            `}</style>
        </div>
    );
}

const header = { maxWidth: "800px", margin: "40px auto 20px", textAlign: "center", padding: "0 20px" };
const title = { fontSize: "clamp(32px,5vw,56px)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "2px" };
const main = { maxWidth: "1200px", margin: "0 auto 80px", padding: "0 20px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "30px" };

const card = { borderRadius: "12px", padding: "40px", textAlign: "center", background: "rgba(17,19,24,0.85)", border: "1px solid rgba(168,85,247,0.2)", height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { color: "#fff", fontSize: "1.4rem", fontWeight: "bold", margin: 0 };

const globalStyles = {
    minHeight: "100vh",
    backgroundColor: "#0a0b0d",
    color: "#fff",
    backgroundImage: 'url("/bg-guru.png")',
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    paddingTop: "100px"
};

const cardCss = `
.game-card{transition:all .3s cubic-bezier(.4,0,.2,1)}
.game-card:hover{
transform:translateY(-8px);
box-shadow:0 0 30px rgba(168,85,247,.3);
border-color:#a855f7;
}
`;
