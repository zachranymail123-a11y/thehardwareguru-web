"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';
import SeznamAd from "../../components/SeznamAd";

/**
 * GURU GAME INDEX V1.2 (SEZNAM ADS INTEGRATION)
 * 🚀 CÍL: Kompletní monetizace rozcestníku her skrze Seznam Partner.
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

            {/* 🔥 SEZNAM AD #1: TOP PLACEMENT POD NADPISEM */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={210} />
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

                            {/* 🔥 SEZNAM AD #2: GRID INJECTION (Vloží reklamu po 4. hře) */}
                            {index === 3 && (
                                <div className="grid-span-ad" style={{ padding: '20px 0' }}>
                                    <SeznamAd zoneId={408651} width={300} height={250} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            <style>{`
                ${cardCss}
                @media (min-width: 768px) {
                    .grid-span-ad { grid-column: 1 / -1; display: flex; justifyContent: center; }
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
