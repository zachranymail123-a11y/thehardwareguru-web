"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play
} from 'lucide-react';

// --- BEZPEČNÉ ZÍSKÁVÁNÍ ENVIRONMENTÁLNÍCH PROMĚNNÝCH ---
const getEnv = (key, fallback = '') => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
  } catch (e) {}
  return fallback;
};

// --- GURU ENGINE INIT (BEZPEČNÝ WRAPPER) ---
const initSupabase = () => {
  let createClient;
  try {
    const supabaseModule = require('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    // Fallback simulace pro UI v náhledu
    return {
      from: () => ({ 
        select: () => ({ order: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    };
  }

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    // Fallback pro chybějící klíče
    return {
      from: () => ({ 
        select: () => ({ order: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    };
  }

  return createClient(url, key);
};

// Pomocná komponenta pro Sidebar
const SidebarItemUI = ({ id, activeTab, setActiveTab, icon, label, color, href }) => {
  const active = activeTab === id;
  const content = (
    <>
      {React.cloneElement(icon, { size: 18, color: active ? color : '#9ca3af' })}
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="sidebar-btn" style={{ textDecoration: 'none' }}>
        {content} <ExternalLink size={12} color="#4b5563" />
      </a>
    );
  }

  return (
    <button onClick={() => setActiveTab(id)} className={`sidebar-btn ${active ? 'active' : ''}`} style={{ borderLeftColor: active ? color : 'transparent' }}>
      {content}
    </button>
  );
};

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);

  // Inicializace Supabase přes useMemo, aby se nevolala zbytečně
  const supabase = useMemo(() => initSupabase(), []);

  const [data, setData] = useState({
    posts: [], deals: [], tipy: [], tweaky: [], slovnik: [],
    stats: { visits: 0, missingEn: 0, missingSeo: 0, missingSlovnik: 0 }
  });

  const [showAddDeal, setShowAddDeal] = useState(false);
  const BASE_URL = 'https://www.thehardwareguru.cz';

  // --- AUTH LOGIKA ---
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPass = getEnv('NEXT_PUBLIC_ADMIN_PASSWORD', 'Wifik500');
    if (password === adminPass) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('guru_admin_auth', 'true');
      }
    }
  };

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => { if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [consoleLogs]);

  // --- HLOUBKOVÝ SKEN DAT ---
  const fetchAndScanData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    addLog('Spouštím hloubkový sken systémů Guru...', 'info');
    try {
      const [postsRes, dealsRes, statsRes, tipyRes, tweakyRes, slovnikRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
        supabase.from('tipy').select('*'),
        supabase.from('tweaky').select('*'),
        supabase.from('slovnik').select('*')
      ]);

      const allContent = [...(postsRes.data || []), ...(tipyRes.data || []), ...(tweakyRes.data || []), ...(slovnikRes.data || [])];
      
      setData({
        posts: postsRes.data || [], deals: dealsRes.data || [], tipy: tipyRes.data || [], tweaky: tweakyRes.data || [], slovnik: slovnikRes.data || [],
        stats: {
          visits: statsRes.data?.value || 0,
          missingEn: allContent.filter(p => !p.title_en).length,
          missingSeo: (postsRes.data || []).filter(p => !p.seo_description).length,
          missingSlovnik: (slovnikRes.data || []).filter(p => !p.title_en).length
        }
      });
      addLog('Sken dokončen. Všechny systémy Guru jsou synchronizovány.', 'success');
    } catch (err) { addLog(`CHYBA SKENU: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchAndScanData(); }, [isAuthenticated]);

  // --- API LOGIKA ---
  const runApiTask = async (url, name) => {
    setActiveTab('terminal');
    addLog(`STARTUJI PROCES: ${name}`, 'info');
    addLog(`Požadavek na: ${url}`, 'warning');
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok) addLog(`ODPOVĚĎ [200 OK]: ${text.substring(0, 200)}...`, 'success');
      else addLog(`CHYBA [${res.status}]: ${text}`, 'error');
    } catch (err) { addLog(`FATÁLNÍ CHYBA PŘI VOLÁNÍ API: ${err.message}`, 'error'); }
    fetchAndScanData();
  };

  const markAsFired = async (id, table) => {
    addLog(`Vyřazuji položku ${id} ze seznamu aktivních...`, 'warning');
    try {
      const { error } = await supabase.from(table).update({ is_fired: true }).eq('id', id);
      if (error) throw error;
      addLog('Položka byla úspěšně označena jako vyřízená.', 'success');
      fetchAndScanData();
    } catch (e) { addLog(`Update fail: ${e.message}`, 'error'); }
  };

  const clearQueueItems = async (list, tabName) => {
    if (!confirm(`Opravdu chceš vyčistit celou frontu ${tabName}?`)) return;
    setActiveTab('terminal');
    addLog(`Hromadný úklid fronty: ${tabName}...`, 'warning');
    try {
      for (const item of list) {
        const table = (item.type === 'expected' || tabName === 'Plánovač' || tabName === 'Články') ? 'posts' : 'game_deals';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
      }
      addLog('Fronta byla kompletně vyčištěna.', 'success');
      fetchAndScanData();
    } catch (e) { addLog(`Chyba při hromadném čištění: ${e.message}`, 'error'); }
  };

  const executeSocial = async (item, type) => {
    setActiveTab('terminal');
    addLog(`ODPALUJI RUČNĚ NA MAKE.COM: ${item.title}`, 'warning');
    const webhookUrl = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');
    if (!webhookUrl) {
      addLog('Chybí URL pro webhook!', 'error');
      return;
    }
    try {
      const response = await fetch(webhookUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }) 
      });
      if (response.ok) {
        await supabase.from(type === 'deal' ? 'game_deals' : 'posts').update({ is_fired: true }).eq('id', item.id);
        addLog('ZÁSAH! Webhook Make.com přijal data pro sociální sítě.', 'success');
        fetchAndScanData();
      } else throw new Error(response.status);
    } catch (err) { addLog(`SELHALO ODESLÁNÍ NA MAKE: ${err.message}`, 'error'); }
  };

  // --- FILTRY FRONT ---
  const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - 14);
  const unfiredPosts = data.posts.filter(p => !p.is_fired && new Date(p.created_at) > cutoffDate && p.type !== 'expected');
  const unfiredDeals = data.deals.filter(d => !d.is_fired && new Date(d.created_at) > cutoffDate);
  const activeExpected = data.posts.filter(p => p.type === 'expected' && !p.is_fired);

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontWeight: 900, marginBottom: '20px', letterSpacing: '1px' }}>GURU ACCESS</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo pro velín..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '20px', textAlign: 'center', fontSize: '18px' }} />
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#eab308', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>Vstoupit do velína</button>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', color: '#fff', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 280px; background: #0d0e12; border-right: 1px solid #ffffff0d; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; height: 100vh; overflow-y: auto; }
        .sidebar-header { margin: 20px 25px 10px 25px; font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sidebar-btn:hover, .sidebar-btn.active { background: #ffffff0d; color: #fff; }
        .section-box { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid #ffffff05; margin-bottom: 40px; }
        .item-row { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; transition: 0.2s; }
        .item-row:hover { border-color: #f9731633; }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 13px; overflow-y: auto; height: 100%; box-shadow: inset 0 0 20px rgba(0,0,0,1); }
        iframe { width: 100%; height: 700px; border-radius: 20px; background: #fff; border: none; margin-top: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .api-card { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid #ffffff08; display: flex; flex-direction: column; transition: 0.3s; position: relative; overflow: hidden; }
        .api-card:hover { transform: translateY(-5px); border-color: #f9731633; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
        .action-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 12px; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
        .action-btn:hover { filter: brightness(1.2); transform: scale(1.02); }
        .action-btn-small { background: transparent; border: 1px solid #333; color: #9ca3af; padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
        .action-btn-small:hover { border-color: #ef4444; color: #ef4444; }
        .btn-fire { border-color: #10b981; color: #10b981; }
        .btn-fire:hover { background: #10b981; color: #000; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #111318; padding: 25px; border-radius: 20px; border: 1px solid #333; text-align: center; }
        .stat-card h3 { font-size: 28px; font-weight: 950; margin: 0; }
        .stat-card p { font-size: 10px; color: #444; font-weight: 900; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 1px; }
        .missing-info { font-size: 10px; padding: 8px; border-radius: 8px; margin-top: 15px; font-weight: 900; text-align: center; background: rgba(0,0,0,0.3); border: 1px solid #ffffff05; letter-spacing: 1px; }
        .tab-title { font-size: 32px; font-weight: 950; text-transform: uppercase; margin: 0 0 30px 0; letter-spacing: -1px; }
      `}} />

      {/* --- SIDEBAR --- */}
      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="#a855f7" size={24}/> GURU <span style={{ color: '#a855f7' }}>ADMIN</span>
          </h2>
          <div style={{ fontSize: '9px', color: '#444', fontWeight: 'bold', marginTop: '5px' }}>COMMAND CENTER V6.1</div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '10px' }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="Dashboard" color="#a855f7" />
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="Živý Terminál" color="#22c55e" />
          
          <div className="sidebar-header">CENTRÁLNÍ LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="Publikace & Plánovač" color="#f97316" />
          <SidebarItemUI id="tweaks" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label="Tweaky (Gen & Exec)" color="#10b981" />
          <SidebarItemUI id="seo" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label="SEO & Překlady" color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label="API Služby" color="#a855f7" />
          
          <div className="sidebar-header">OBSAH</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="Správa Slev" color="#ff0055" />
          <SidebarItemUI id="kal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CalendarDays />} label="Herní Kalendář" color="#3b82f6" href="/kalendar" />
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #ffffff0d' }}>
           <button onClick={() => { if (typeof window !== 'undefined') { sessionStorage.removeItem('guru_admin_auth'); setIsAuthenticated(false); } }} className="action-btn-small" style={{ width: '100%', borderColor: '#ef444466' }}>ODHLÁSIT SE</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="admin-main">
        
        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 className="tab-title">Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>{data.stats.visits}</h3><p>CELKOVÉ NÁVŠTĚVY</p></div>
              <div className="stat-card"><h3>{data.stats.missingEn}</h3><p>CHYBĚJÍCÍ EN PŘEKLADY</p></div>
              <div className="stat-card"><h3>{data.stats.missingSeo}</h3><p>CHYBĚJÍCÍ SEO META</p></div>
              <div className="stat-card"><h3>{data.deals.length}</h3><p>AKTIVNÍCH SLEV</p></div>
            </div>
            
            <div className="section-box" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Terminal size={18} color="#22c55e"/> <strong>Poslední záznamy velína:</strong></div>
                <div className="terminal-box" style={{ height: '300px' }}>
                    {consoleLogs.slice(-10).map((log, i) => (<div key={i} style={{ marginBottom: '4px' }}>[{log.time}] {log.msg}</div>))}
                    {consoleLogs.length === 0 && <div>Připraven k akci...</div>}
                </div>
            </div>
          </div>
        )}

        {/* --- TAB: TERMINÁL --- */}
        {activeTab === 'terminal' && (
            <div className="fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
                <h2 className="tab-title">Živý <span style={{ color: '#22c55e' }}>Terminál</span></h2>
                <div className="terminal-box" style={{ flex: 1 }}>
                    {consoleLogs.map((log, i) => (<div key={i} style={{ marginBottom: '4px' }} className={log.type}>[{log.time}] {log.msg}</div>))}
                    <div ref={logEndRef} />
                </div>
            </div>
        )}

        {/* --- TAB: PUBLIKACE & PLÁNOVAČ --- */}
        {activeTab === 'pub-plan' && (
          <div className="fade-in">
            <h2 className="tab-title">Publikace & <span style={{ color: '#f97316' }}>Sítě</span></h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Rocket color="#10b981" /> <h3>SOCIAL EXECUTOR</h3></div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Hromadné odeslání nepublikovaného obsahu na sociální sítě.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/cron/executor`, 'Social Executor')} className="action-btn" style={{ background: '#10b981', color: '#000' }}><Zap size={14}/> SPUSTIT EXECUTOR</button>
                </div>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><CalendarClock color="#3b82f6" /> <h3>PLÁNOVAČ CRON</h3></div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Automatické zpracování kalendáře a publikace naplánovaných rozborů.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/cron/planer`, 'Plánovač')} className="action-btn" style={{ background: '#3b82f6', color: '#fff' }}><Zap size={14}/> SPUSTIT PLÁNOVAČ</button>
                </div>
            </div>

            <div className="section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={18}/> FRONTA K ODPÁLENÍ (EXECUTOR)</h3>
                <button onClick={() => clearQueueItems([...unfiredPosts, ...unfiredDeals], 'Články')} className="action-btn-small" style={{ borderColor: '#ef4444', color: '#ef4444' }}>Vymazat starou frontu</button>
              </div>
              {[...unfiredPosts, ...unfiredDeals].map(item => (
                <div key={item.id} className="item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.image_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => markAsFired(item.id, item.title_en ? 'posts' : 'game_deals')} className="action-btn-small">Skrýt</button>
                    <button onClick={() => executeSocial(item, item.title_en ? 'post' : 'deal')} className="action-btn-small btn-fire"><Play size={10}/> Odpálit</button>
                  </div>
                </div>
              ))}
              {unfiredPosts.length === 0 && unfiredDeals.length === 0 && <div style={{ textAlign: 'center', color: '#444', padding: '20px' }}>Fronta je prázdná. Vše je odesláno.</div>}
            </div>

            <div className="section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}><Database size={18}/> PLÁNOVAČ: OČEKÁVANÉ HRY</h3>
                <button onClick={() => clearQueueItems(activeExpected, 'Plánovač')} className="action-btn-small" style={{ borderColor: '#ef4444', color: '#ef4444' }}>Vyčistit vše</button>
              </div>
              {activeExpected.map(game => (
                <div key={game.id} className="item-row">
                    <span>{game.title}</span>
                    <button onClick={() => markAsFired(game.id, 'posts')} className="action-btn-small">Už je venku (Skrýt)</button>
                </div>
              ))}
              {activeExpected.length === 0 && <div style={{ textAlign: 'center', color: '#444', padding: '20px' }}>Žádné budoucí hry v plánu.</div>}
            </div>
          </div>
        )}

        {/* --- TAB: TWEAKY --- */}
        {activeTab === 'tweaks' && (
          <div className="fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="api-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Wrench color="#10b981" /> <h3>TWEAK EXECUTOR</h3></div>
                <button onClick={() => runApiTask(`${BASE_URL}/api/cron/tweak-executor`, 'Tweak Exec')} className="action-btn" style={{ background: '#10b981', color: '#000', width: 'fit-content', padding: '12px 25px', marginTop: '15px' }}><Zap size={14}/> SPUSTIT TWEAK CRON</button>
            </div>
            <iframe src={`${BASE_URL}/admin/tweaky-generator`} title="Tweaky Generator" />
          </div>
        )}

        {/* --- TAB: SEO & PŘEKLADY --- */}
        {activeTab === 'seo' && (
          <div className="fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Search color="#66fcf1" /> <h3>SEO GENERATOR</h3></div>
                    <div className="missing-info" style={{ color: '#66fcf1' }}>K OPRAVĚ: {data.stats.missingSeo} POPISŮ</div>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/generate-seo?secret=Wifik500`, 'SEO Gen')} className="action-btn" style={{ background: '#66fcf1', color: '#000' }}><Zap size={14}/> GENERATE META</button>
                </div>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><BookOpen color="#a855f7" /> <h3>SLOVNÍK UPDATER</h3></div>
                    <div className="missing-info" style={{ color: '#a855f7' }}>K OPRAVĚ: {data.stats.missingSlovnik} POJMŮ</div>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/cron/slovnik?secret=Wifik500`, 'Slovník')} className="action-btn" style={{ background: '#a855f7', color: '#fff' }}><Zap size={14}/> UPDATE SLOVNÍK</button>
                </div>
            </div>
            <iframe src={`${BASE_URL}/admin/en-fixer`} title="EN Translation Fixer" />
          </div>
        )}

        {/* --- TAB: AUTOMATIZACE --- */}
        {activeTab === 'automation' && (
          <div className="fade-in">
            <h2 className="tab-title">Web <span style={{ color: '#a855f7' }}>Automatizace</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Lightbulb color="#eab308" /> <h3>TIP GENERATOR</h3></div>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '10px' }}>Vytvoří a uloží nový technologický tip pomocí AI.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/generate-tip`, 'Tip Gen')} className="action-btn" style={{ background: '#eab308', color: '#000' }}><Zap size={14}/> SPUSTIT AI</button>
                </div>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Activity color="#ef4444" /> <h3>HLAVNÍ CRON</h3></div>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '10px' }}>Hlavní údržba, čištění cache a optimalizace DB.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/cron`, 'Main Cron')} className="action-btn" style={{ background: '#ef4444', color: '#fff' }}><Zap size={14}/> SPUSTIT ÚDRŽBU</button>
                </div>
                <div className="api-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Video color="#8b5cf6" /> <h3>CHECK LIVE</h3></div>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '10px' }}>Aktualizuje status živého vysílání Kick a YT.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/check-live`, 'Check Live')} className="action-btn" style={{ background: '#8b5cf6', color: '#fff' }}><Zap size={14}/> KONTROLA STREAMŮ</button>
                </div>
            </div>
          </div>
        )}

        {/* --- TAB: DEALS --- */}
        {activeTab === 'deals' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 className="tab-title">Správa <span style={{ color: '#ff0055' }}>Slev</span></h2>
              <button onClick={() => setShowAddDeal(!showAddDeal)} className="action-btn" style={{ width: 'auto', padding: '10px 25px', background: '#ff0055', color: '#fff', marginTop: 0 }}>
                  {showAddDeal ? <X size={18}/> : <Plus size={18}/>} {showAddDeal ? 'ZAVŘÍT' : 'PŘIDAT NOVOU SLEVU'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {data.deals.map(deal => (
                <div key={deal.id} style={{ background: '#111318', borderRadius: '20px', overflow: 'hidden', border: '1px solid #ffffff0a' }}>
                  <img src={deal.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt={deal.title} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 900, fontSize: '15px', textTransform: 'uppercase' }}>{deal.title}</div>
                    <div style={{ color: '#ff0055', fontWeight: 900, marginTop: '5px', fontSize: '18px' }}>{deal.price_cs}</div>
                  </div>
                </div>
              ))}
              {data.deals.length === 0 && <div style={{ textAlign: 'center', gridColumn: 'span 4', color: '#444', padding: '40px' }}>Žádné aktivní slevy v databázi.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
