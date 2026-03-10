"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Gamepad, Monitor, Clock, Loader2, ArrowLeft, ChevronRight, Zap, Heart, FileText, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// GURU CORE: Připojení k Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * 🚀 GURU EXPECTED GAMES CALENDAR (DATABASE POWERED)
 * Elitní rozhraní pro správu her, které spadnou do sekce "Očekávané hry".
 */
export default function GameCalendarPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  // Načtení her z tvé vlastní tabulky 'herni_kalendar'
  const fetchDbGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('herni_kalendar')
        .select('*')
        .order('released', { ascending: true });
      
      if (!error && data) {
        setGames(data);
      }
    } catch (err) {
      console.error("GURU DB FAIL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbGames();
    document.title = isEn ? 'Expected Games Calendar | Guru Base' : 'Kalendář očekávaných her | Guru Základna';
  }, [isEn]);

  // 🚀 GURU SYNC: Žluté plovoucí tlačítko - naplnění zásobníku z RAWG
  const handleSync = async () => {
    const pin = prompt(isEn ? "Enter GURU PIN to sync calendar:" : "Zadej GURU PIN pro synchronizaci kalendáře:");
    if (!pin) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (data.success) {
        alert(isEn ? `Success: ${data.count} games added to Expected list.` : `Úspěch: Do očekávaných her přidáno ${data.count} titulů.`);
        fetchDbGames();
      } else {
        alert("GURU SYNC FAIL: " + data.error);
      }
    } catch (err) {
      alert("Critical sync connection error.");
    } finally {
      setIsSyncing(false);
    }
  };

  // 🚀 GURU SURGERY: Vygenerování preview a trvalý zápis do sekce Očekávané hry
  const handleSurgery = async (game) => {
    const pin = prompt(isEn ? `Approve & Generate Preview for: ${game.name}` : `Schválit a vyrobit Technické Preview pro: ${game.name}`);
    if (!pin) return;

    setGenerating(game.id);
    try {
      const res = await fetch('/api/generate-game-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.rawg_id, pin, section: 'expected' }) 
      });
      
      const data = await res.json();
      
      if (data.success) {
        // GURU DB UPDATE: Propojíme hru v kalendáři s novým preview
        await supabase
          .from('herni_kalendar')
          .update({ post_slug: data.slug })
          .eq('id', game.id);

        alert(isEn ? "Preview generated and added to Expected Games!" : "Preview bylo vygenerováno a přidáno do Očekávaných her!");
        fetchDbGames();
      } else {
        alert("Surgery error: " + data.error);
      }
    } catch (err) {
      alert("Generator engine failure!");
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
            padding: 14px 15px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-transform: uppercase;
            transition: 0.2s;
            width: 100%;
        }
        .surgery-btn:hover { background: #fff; color: #a855f7; }
        .view-expected-btn {
            background: rgba(102, 252, 241, 0.1);
            color: #66fcf1;
            border: 1px solid #66fcf1;
            padding: 14px 15px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 11px;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-transform: uppercase;
        }
        .sync-btn-float {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #eab308;
            color: #000;
            width: 65px;
            height: 65px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(234, 179, 8, 0.5);
            z-index: 9999;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .sync-btn-float:hover { transform: rotate(180deg) scale(1.1); }
        .platform-tag {
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

      {/* --- 🚀 GURU FLOATING SYNC --- */}
      <button onClick={handleSync} className="sync-btn-float" title="SYNCHRONIZOVAT OČEKÁVANÉ HRY">
        {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCw size={28} />}
      </button>

      {/* --- HEADER --- */}
      <header style={headerContainer}>
        <div style={headerBox}>
          <Link href={isEn ? "/en" : "/"} style={backLink}>
            <ArrowLeft size={16} /> {isEn ? 'BACK TO BASE' : 'ZPĚT NA ZÁKLADNU'}
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '25px', marginTop: '20px' }}>
            <Calendar size={64} color="#a855f7" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }} />
            <Monitor size={64} color="#66fcf1" style={{ filter: 'drop-shadow(0 0 15px rgba(102, 252, 241, 0.5))' }} />
          </div>
          <h1 style={titleStyle}>
            {isEn ? <>EXPECTED <span style={{ color: '#a855f7' }}>GAMES</span></> : <>OČEKÁVANÉ <span style={{ color: '#a855f7' }}>HRY</span></>}
          </h1>
          <p style={subtitleStyle}>
            {isEn ? 'Future tech hits under Guru surveillance.' : 'Budoucí technologické pecky pod přísným Guru dohledem.'}
          </p>
        </div>
      </header>

      {/* --- HLAVNÍ GRID --- */}
      <main style={gridContainer}>
        {loading ? (
          <div style={center}><Loader2 className="animate-spin" size={64} color="#a855f7" /></div>
        ) : games.length === 0 ? (
          <div style={center}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
                <Gamepad size={64} style={{ marginBottom: '20px' }} />
                <h2>{isEn ? 'NO EXPECTED GAMES LOGGED' : 'ŽÁDNÉ OČEKÁVANÉ HRY V ZÁSOBNÍKU'}</h2>
                <p>{isEn ? 'Use yellow sync to fetch incoming titles.' : 'Použij žluté tlačítko pro načtení titulů.'}</p>
            </div>
          </div>
        ) : (
          <div style={grid}>
            {games.map((game) => (
              <div key={game.id} className="game-card-cal">
                <div style={{ height: '230px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                  <img src={game.image_url} alt={game.name} style={imgStyle} />
                  <div style={dateBadge}>
                    <Clock size={12} /> {new Date(game.released).toLocaleDateString(isEn ? 'en-US' : 'cs-CZ')}
                  </div>
                </div>
                
                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={gameTitle}>{game.name}</h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                    {game.platforms?.slice(0, 5).map((p, i) => (
                      <span key={i} className="platform-tag">{p}</span>
                    ))}
                  </div>

                  {/* 🛠️ GURU ACTION ZÓNA */}
                  <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    {game.post_slug ? (
                      <Link href={isEn ? `/en/ocekavane-hry/${game.post_slug}` : `/ocekavane-hry/${game.post_slug}`} className="view-expected-btn">
                        <Eye size={16} /> {isEn ? 'VIEW PREVIEW' : 'ZOBRAZIT PREVIEW'}
                      </Link>
                    ) : (
                      <button 
                        disabled={generating === game.id}
                        onClick={() => handleSurgery(game)}
                        className="surgery-btn"
                      >
                        {generating === game.id ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                        {generating === game.id ? (isEn ? 'PROCESSING...' : 'PROBÍHÁ OPERACE...') : (isEn ? 'APPROVE PREVIEW' : 'VYROBIT PREVIEW')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- GURU SUPPORT --- */}
      <section style={guruShield}>
          <Heart size={44} color="#a855f7" fill="#a855f7" style={{ margin: '0 auto 25px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
            {isEn ? 'SUPPORT THE DATABASE' : 'PODPOŘ GURU DATABÁZI'}
          </h3>
          <p style={{ color: '#d1d5db', margin: '0 auto 35px', maxWidth: '600px' }}>
            {isEn ? 'Help us analyze more upcoming hits.' : 'Hardware Guru běží bez reklam díky tvojí podpoře. Pomoz nám analyzovat další pecky.'}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={isEn ? "/en/support" : "/support"} style={supportBtn}>
              DARY / REVOLUT
            </Link>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '0 5px', display: 'flex', alignItems: 'center', height: '48px' }}>
              <button swg-standard-button="contribution" style={{ cursor: 'pointer' }}></button>
            </div>
          </div>
      </section>

      <footer style={footerStyle}>
        <p>© {new Date().getFullYear()} THE HARDWARE GURU SYSTEM • EXPECTED GAMES TRACKER</p>
      </footer>
    </div>
  );
}

// --- MASTER STYLES ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', padding: '120px 20px 60px' };
const headerContainer = { maxWidth: '1100px', margin: '0 auto 60px' };
const headerBox = { background: 'rgba(0,0,0,0.75)', padding: '60px 40px', borderRadius: '40px', border: '1px solid rgba(168, 85, 247, 0.2)', backdropFilter: 'blur(15px)', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' };
const backLink = { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' };
const titleStyle = { fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '950', textTransform: 'uppercase', margin: 0, letterSpacing: '-2px', lineHeight: '0.9' };
const subtitleStyle = { fontSize: '22px', color: '#d1d5db', marginTop: '25px', fontWeight: '700' };
const gridContainer = { maxWidth: '1300px', margin: '0 auto' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '35px' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 };
const dateBadge = { position: 'absolute', bottom: '15px', right: '15px', background: '#eab308', color: '#000', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.6)' };
const gameTitle = { fontSize: '24px', fontWeight: '900', margin: '0 0 25px 0', textTransform: 'uppercase', color: '#fff', lineHeight: '1.1', letterSpacing: '-0.5px' };
const guruShield = { marginTop: '100px', padding: '60px 40px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '40px', border: '1px solid #a855f7', textAlign: 'center', boxShadow: '0 0 50px rgba(168, 85, 247, 0.1)', maxWidth: '1300px', margin: '100px auto 0' };
const supportBtn = { background: '#a855f7', color: '#fff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', display: 'inline-flex', alignItems: 'center', transition: '0.2s' };
const footerStyle = { textAlign: 'center', padding: '100px 20px 40px', opacity: 0.4, fontSize: '11px', fontWeight: '900', letterSpacing: '3px' };
const center = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', width: '100%' };
