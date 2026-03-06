"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Gamepad, Monitor, Clock, Loader2, ArrowLeft, ChevronRight, Zap, Heart, FileText, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * 🚀 GURU GAME CALENDAR + SURGERY ENGINE
 * Zobrazuje hry v příštích 7 dnech a umožňuje Guruovi generovat články jedním klikem.
 */
export default function GameCalendarPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // ID hry, která se právě "operuje"
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  // Načtení dat z RAWG API Engine
  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch('/api/game-calendar');
        const data = await res.json();
        if (data.games) {
          setGames(data.games);
        }
      } catch (err) {
        console.error("GURU CALENDAR FAIL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
    document.title = isEn ? 'Game Release Calendar | Guru Base' : 'Herní Kalendář | Guru Základna';
  }, [isEn]);

  // 🚀 GURU SURGERY: Funkce pro vygenerování článku rovnou z kalendáře
  const handleSurgery = async (gameId, gameName) => {
    const pin = prompt(isEn ? `Enter GURU PIN to generate article for: ${gameName}` : `Zadej GURU PIN pro vygenerování článku k: ${gameName}`);
    if (!pin) return;

    setGenerating(gameId);
    try {
      const res = await fetch('/api/generate-game-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, pin })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // GURU SUCCESS: Článek je v DB, přesměrujeme uživatele nebo potvrdíme
        const msg = isEn 
          ? `SUCCESS! Article '${gameName}' has been created. Check Article Archive.` 
          : `HOTOVO! Článek '${gameName}' byl úspěšně vygenerován a uložen.`;
        alert(msg);
      } else {
        alert(`${isEn ? 'ERROR' : 'CHYBA'}: ${data.error}`);
      }
    } catch (err) {
      alert(isEn ? "Generator engine failure!" : "Kritické selhání generátoru!");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div style={pageWrapper}>
      <style>{`
        .game-card-cal { 
            background: rgba(10, 11, 13, 0.94); 
            border: 1px solid rgba(168, 85, 247, 0.2); 
            border-radius: 28px; 
            overflow: hidden; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(15px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.7);
            height: 100%;
        }
        .game-card-cal:hover { 
            transform: translateY(-12px) scale(1.02); 
            border-color: #a855f7; 
            box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3); 
        }
        .surgery-btn {
            background: #a855f7;
            color: #fff;
            border: none;
            padding: 12px 15px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 15px;
            text-transform: uppercase;
            transition: 0.2s;
            box-shadow: 0 5px 15px rgba(168, 85, 247, 0.3);
        }
        .surgery-btn:hover { background: #fff; color: #a855f7; transform: scale(1.05); }
        .surgery-btn:disabled { opacity: 0.5; cursor: wait; }

        .platform-pill {
            background: rgba(168, 85, 247, 0.1);
            color: #a855f7;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }
      `}</style>

      {/* --- HEADER --- */}
      <header style={headerContainer}>
        <div style={headerBox}>
          <Link href={isEn ? "/en" : "/"} style={backLink}>
            <ArrowLeft size={16} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '25px', marginTop: '20px' }}>
            <Calendar size={64} color="#a855f7" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }} />
            <Zap size={64} color="#eab308" style={{ filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.5))' }} />
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>RELEASE <span style={{ color: '#a855f7' }}>CALENDAR</span></> : <>HERNÍ <span style={{ color: '#a855f7' }}>KALENDÁŘ</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Next 7 days of hardware-crushing titles. Monitored by Guru.' : 'Příštích 7 dní herního masakru. Pod přísným dohledem Guruho.'}
          </p>
        </div>
      </header>

      {/* --- GRID --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={center}><Loader2 className="animate-spin" size={64} color="#a855f7" /></div>
        ) : games.length === 0 ? (
          <div style={center}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
                <Gamepad size={64} style={{ marginBottom: '20px' }} />
                <h2>{isEn ? 'THE SYSTEM IS EMPTY' : 'SYSTÉM JE ZATÍM PRÁZDNÝ'}</h2>
            </div>
          </div>
        ) : (
          <div style={grid}>
            {games.map((game) => (
              <div key={game.id} className="game-card-cal">
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                  <img 
                    src={game.background_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} 
                    alt={game.name} 
                    style={imgStyle} 
                  />
                  <div style={dateBadge}>
                    <Clock size={12} /> {new Date(game.released).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                  </div>
                </div>
                
                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={gameTitle}>{game.name}</h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                    {game.platforms?.slice(0, 4).map((p, i) => (
                      <span key={i} className="platform-pill">{p.platform.name}</span>
                    ))}
                  </div>

                  {/* 🛠️ GURU SURGERY BUTTON (ADMIN TOOL) */}
                  <button 
                    disabled={generating === game.id}
                    onClick={() => handleSurgery(game.id, game.name)}
                    className="surgery-btn"
                  >
                    {generating === game.id ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
                    {generating === game.id ? (isEn ? 'SURGERY IN PROGRESS...' : 'PROBÍHÁ OPERACE...') : 'GURU SURGERY'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🛡️ SUPPORT SHIELD */}
        <div style={guruShield}>
          <Heart size={44} color="#a855f7" fill="#a855f7" style={{ margin: '0 auto 25px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
            {isEn ? 'SUPPORT GURU RELEASES' : 'PODPOŘ GURU KALENDÁŘ'}
          </h3>
          <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px' }}>
            {isEn ? 'Keep this automated tracking system alive for the community.' : 'Hardware Guru běží bez reklam díky tvojí podpoře. Pomoz nám udržet systémy v chodu.'}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
              DARY / REVOLUT
            </Link>
            
            {/* 📰 GOOGLE CONTRIBUTION BUTTON */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
              <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
            </div>
          </div>
        </div>
      </main>

      <footer style={footerStyle}>
        <p>© {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • ELITE AUTOMATED RELEASE TRACKER</p>
      </footer>
    </div>
  );
}

// --- MASTER STYLES ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', padding: '120px 20px 60px' };
const headerContainer = { maxWidth: '1100px', margin: '0 auto 60px' };
const headerBox = { background: 'rgba(0,0,0,0.75)', padding: '60px 40px', borderRadius: '40px', border: '1px solid rgba(168, 85, 247, 0.2)', backdropFilter: 'blur(15px)', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' };
const backLink = { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' };
const titleStyle = { fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '950', textTransform: 'uppercase', margin: 0, letterSpacing: '-2px', lineHeight: '0.9' };
const subtitleStyle = { fontSize: '22px', color: '#d1d5db', marginTop: '25px', fontWeight: '700', maxWidth: '700px', margin: '25px auto 0' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '35px' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 };
const dateBadge = { position: 'absolute', bottom: '15px', right: '15px', background: '#eab308', color: '#000', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.6)' };
const gameTitle = { fontSize: '24px', fontWeight: '900', margin: '0 0 25px 0', textTransform: 'uppercase', color: '#fff', lineHeight: '1.1', letterSpacing: '-0.5px' };
const guruShield = { marginTop: '100px', padding: '60px 40px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '40px', border: '1px solid #a855f7', textAlign: 'center', boxShadow: '0 0 50px rgba(168, 85, 247, 0.1)' };
const supportBtn = { background: '#a855f7', color: '#fff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', transition: '0.2s' };
const footerStyle = { textAlign: 'center', padding: '100px 20px 40px', opacity: 0.4, fontSize: '11px', fontWeight: '900', letterSpacing: '3px' };
const center = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', width: '100%' };
