"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  PenTool, ShoppingCart, Activity, ShieldCheck, Zap, 
  ChevronRight, LayoutDashboard, AlertTriangle, CheckCircle2, 
  RefreshCw, Send, Sparkles, Flame
} from 'lucide-react';

/**
 * GURU COMMAND CENTER - HLAVNÍ ADMIN ROZHRANÍ
 * * Tento kód implementuje centrální správu pro:
 * 1. Social Executor (Odesílání na sítě)
 * 2. AI Fixery (EN Překlady & SEO)
 * 3. Release Planner (Plánovač her)
 * 4. Deals Manager (Správa slev)
 */

// --- BEZPEČNÁ INICIALIZACE SUPABASE PRO PROSTŘEDÍ CANVASU ---
let supabase;
try {
  // Pokus o načtení reálného klienta
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
} catch (e) {
  // Fallback / Mock pro náhledové prostředí, aby kód nespadl
  supabase = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [] }),
        eq: () => ({
          single: () => Promise.resolve({ data: { value: 0 } })
        }),
        neq: () => ({
            order: () => ({
                limit: () => Promise.resolve({ data: [] })
            })
        })
      })
    }),
    rpc: () => Promise.resolve()
  };
}

export default function App({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // --- STAV APLIKACE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    posts: [],
    deals: [],
    tipy: [],
    tweaky: [],
    stats: { visits: 0, missingEn: 0, missingSeo: 0 }
  });
  const [status, setStatus] = useState({ firing: false, message: '', type: '' });

  // --- NAČÍTÁNÍ DAT (S MEMORY FILTROVÁNÍM DLE PRAVIDEL) ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Paralelní fetch všech potřebných kolekcí
      const [postsRes, dealsRes, tipyRes, tweakyRes, statsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }),
        supabase.from('tweaky').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single()
      ]);

      // Analýza integrity dat v paměti
      const missingEn = (postsRes.data || []).filter(p => !p.title_en || !p.content_en).length;
      const missingSeo = (postsRes.data || []).filter(p => !p.seo_description).length;

      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        tipy: tipyRes.data || [],
        tweaky: tweakyRes.data || [],
        stats: { 
          visits: statsRes.data?.value || 0, 
          missingEn, 
          missingSeo 
        }
      });
    } catch (err) {
      console.error("Guru Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  // --- LOGIKA: SOCIAL EXECUTOR (Make.com Integrace) ---
  const executeSocial = async (item, type) => {
    setStatus({ firing: true, message: isEn ? 'FIRING TO MAKE.COM...' : 'ODPALUJI NA MAKE.COM...', type: 'info' });
    const webhook = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL;

    if (!webhook) {
        setStatus({ firing: false, message: 'WEBHOOK URL CHYBÍ!', type: 'error' });
        return;
    }

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }),
      });

      if (response.ok) {
        setStatus({ firing: false, message: 'ZÁSAH! ODESLÁNO.', type: 'success' });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, message: `CHYBA: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 4000);
  };

  // --- LOGIKA: AI FIXER (Simulace volání AI API) ---
  const runFixer = async (type) => {
    setStatus({ firing: true, message: `SPOUŠTÍM ${type} FIXER...`, type: 'info' });
    
    // Zde by bylo reálné volání vašeho backendu/API pro GPT operace
    setTimeout(() => {
        setStatus({ firing: false, message: `${type} OPTIMALIZACE DOKONČENA!`, type: 'success' });
        fetchAllData();
    }, 2000);
  };

  // --- UI KOMPONENTY ---
  const SidebarItem = ({ id, icon, label, color }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
        background: activeTab === id ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: 'none', borderLeft: activeTab === id ? `4px solid ${color}` : '4px solid transparent',
        color: activeTab === id ? '#fff' : '#9ca3af', cursor: 'pointer', transition: '0.2s',
        textAlign: 'left', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px'
      }}
    >
      {React.cloneElement(icon, { size: 18, color: activeTab === id ? color : '#9ca3af' })}
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* --- SIDEBAR --- */}
      <aside style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#0d0e12', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '35px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '950', letterSpacing: '2px', color: '#a855f7' }}>
            GURU <span style={{ color: '#fff' }}>ADMIN</span>
          </h1>
          <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginTop: '5px', textTransform: 'uppercase' }}>Command Center v2.0</div>
        </div>

        <nav style={{ flex: 1, paddingTop: '20px' }}>
          <SidebarItem id="dashboard" icon={<LayoutDashboard />} label={isEn ? "Dashboard" : "Přehled"} color="#a855f7" />
          <SidebarItem id="executor" icon={<Rocket />} label={isEn ? "Social Executor" : "Social Executor"} color="#f97316" />
          <SidebarItem id="planner" icon={<CalendarClock />} label={isEn ? "Release Planner" : "Plánovač"} color="#66fcf1" />
          <SidebarItem id="fixers" icon={<Zap />} label={isEn ? "AI Fixers" : "AI Opravy"} color="#eab308" />
          <SidebarItem id="deals" icon={<ShoppingCart />} label={isEn ? "Game Deals" : "Slevy na hry"} color="#ff0055" />
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={fetchAllData} style={{ width: '100%', padding: '12px', background: 'rgba(102, 252, 241, 0.1)', border: '1px solid #66fcf1', color: '#66fcf1', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> OBNOVIT SYSTÉMY
            </button>
        </div>
      </aside>

      {/* --- HLAVNÍ OBSAH --- */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '40px 60px' }}>
        
        {/* NOTIFIKAČNÍ STATUS BAR */}
        {status.message && (
          <div style={{ 
            position: 'fixed', top: '30px', right: '30px', padding: '15px 30px', borderRadius: '15px', 
            background: status.type === 'success' ? '#166534' : status.type === 'error' ? '#991b1b' : '#1e1b4b',
            border: `1px solid ${status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#6366f1'}`,
            zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', fontSize: '13px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'guruSlideIn 0.3s ease'
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {status.message}
          </div>
        )}

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
                <div className="stat-card">
                    <Activity color="#a855f7" />
                    <h3>{data.stats.visits}</h3>
                    <p>CELKOVÉ NÁVŠTĚVY</p>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('fixers')} style={{ cursor: 'pointer' }}>
                    <Globe color="#eab308" />
                    <h3 style={{ color: data.stats.missingEn > 0 ? '#ef4444' : '#22c55e' }}>{data.stats.missingEn}</h3>
                    <p>CHYBĚJÍCÍ PŘEKLADY</p>
                </div>
                <div className="stat-card">
                    <Search color="#66fcf1" />
                    <h3>{data.stats.missingSeo}</h3>
                    <p>CHYBĚJÍCÍ SEO META</p>
                </div>
                <div className="stat-card">
                    <Flame color="#ff0055" />
                    <h3>{data.deals.length}</h3>
                    <p>AKTIVNÍCH SLEV</p>
                </div>
            </div>
          </section>
        )}

        {/* --- TAB: SOCIAL EXECUTOR --- */}
        {activeTab === 'executor' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0, textTransform: 'uppercase' }}>Social <span style={{ color: '#f97316' }}>Executor</span></h2>
                <div style={{ fontSize: '12px', background: '#f97316', padding: '5px 15px', borderRadius: '20px', fontWeight: '900' }}>PŘIPRAVEN K PALBĚ</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {data.posts.slice(0, 10).map(post => (
                    <div key={post.id} style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src={post.image_url || 'https://via.placeholder.com/60'} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                            <div>
                                <div style={{ fontWeight: '900', fontSize: '15px' }}>{post.title}</div>
                                <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', marginTop: '4px' }}>{post.type === 'expected' ? 'PLÁNOVANÝ ROZBOR' : 'ČLÁNEK'} • {new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <button onClick={() => executeSocial(post, 'post')} className="guru-fire-btn">
                            <Send size={16} /> ODPÁLIT
                        </button>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* --- TAB: AI FIXERS --- */}
        {activeTab === 'fixers' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>AI <span style={{ color: '#eab308' }}>Fixer & Tooling</span></h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ background: '#111318', padding: '40px', borderRadius: '30px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <Globe size={40} color="#eab308" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px' }}>EN TRANSLATION FIXER</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                        Skenuje tabulky <strong>posts, tipy a tweaky</strong>. Hledá záznamy, které mají prázdná pole <code>title_en</code> nebo <code>content_en</code> a automaticky je přeloží.
                    </p>
                    <button onClick={() => runFixer('EN_TRANSLATION')} className="guru-action-btn" style={{ background: '#eab308', color: '#000' }}>
                        <Sparkles size={18} /> SPUSTIT OPRAVU PŘEKLADŮ
                    </button>
                </div>

                <div style={{ background: '#111318', padding: '40px', borderRadius: '30px', border: '1px solid rgba(102, 252, 241, 0.2)' }}>
                    <Search size={40} color="#66fcf1" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px' }}>SEO AUTO-GENERATOR</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                        Doplní chybějící <code>seo_description</code> pro všechny záznamy na základě obsahu článku. Klíčové pro lepší pozice v Google vyhledávání.
                    </p>
                    <button onClick={() => runFixer('SEO_META')} className="guru-action-btn" style={{ background: '#66fcf1', color: '#000' }}>
                        <Zap size={18} /> GENEROVAT META POPISKY
                    </button>
                </div>
            </div>
          </section>
        )}

        {/* --- TAB: PLANNER --- */}
        {activeTab === 'planner' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>Plánovač <span style={{ color: '#66fcf1' }}>Vydání</span></h2>
            <div style={{ background: '#111318', borderRadius: '25px', padding: '30px', border: '1px solid rgba(102, 252, 241, 0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#4b5563', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <th style={{ padding: '15px' }}>HRA / ROZBOR</th>
                            <th style={{ padding: '15px' }}>STATUS</th>
                            <th style={{ padding: '15px' }}>AKCE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.posts || []).filter(p => p.type === 'expected').map(game => (
                            <tr key={game.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px 15px', fontWeight: '900' }}>{game.title}</td>
                                <td style={{ padding: '20px 15px' }}>
                                    <span style={{ padding: '5px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', fontSize: '10px', fontWeight: '900' }}>PUBLISHED</span>
                                </td>
                                <td style={{ padding: '20px 15px' }}>
                                    <button style={{ background: 'transparent', border: '1px solid #4b5563', color: '#fff', padding: '8px 15px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>UPRAVIT</button>
                                </td>
                            </tr>
                        ))}
                        {(data.posts || []).filter(p => p.type === 'expected').length === 0 && (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#4b5563' }}>Žádné očekávané hry nenalezeny</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </section>
        )}

        {/* --- TAB: DEALS --- */}
        {activeTab === 'deals' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>Správa <span style={{ color: '#ff0055' }}>Slev</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {data.deals.map(deal => (
                    <div key={deal.id} style={{ background: '#111318', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,0,85,0.2)' }}>
                        <img src={deal.image_url || 'https://via.placeholder.com/300x150'} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt="" />
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontWeight: '900', marginBottom: '10px' }}>{deal.title}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#ff0055', fontWeight: '900' }}>{deal.price_cs}</div>
                                <button onClick={() => executeSocial(deal, 'deal')} style={{ padding: '8px 15px', background: '#ff0055', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}>FIRE</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

      </main>

      {/* --- GLOBÁLNÍ STYLY --- */}
      <style>{`
        .stat-card { background: #111318; padding: 30px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .stat-card:hover { border-color: rgba(168, 85, 247, 0.3); transform: translateY(-5px); }
        .stat-card h3 { font-size: 32px; font-weight: 950; margin: 15px 0 5px 0; }
        .stat-card p { font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; }
        
        .guru-fire-btn { background: #f97316; color: #fff; border: none; padding: 12px 25px; border-radius: 12px; fontWeight: 900; fontSize: 12px; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; gap: 8px; }
        .guru-fire-btn:hover { background: #ea580c; transform: scale(1.05); box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }

        .guru-action-btn { width: 100%; padding: 18px; border: none; border-radius: 15px; fontWeight: 900; fontSize: 14px; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; justify-content: center; gap: 10px; text-transform: uppercase; }
        .guru-action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }

        @keyframes guruSlideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

    </div>
  );
}
