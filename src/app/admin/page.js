"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download
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
    return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }) }) };
  }
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }) }) };
  return createClient(url, key);
};

// Pomocná komponenta Sidebar
const SidebarItemUI = ({ id, activeTab, setActiveTab, icon, label, color, href }) => {
  const active = activeTab === id;
  const content = (
    <>
      {React.cloneElement(icon, { size: 18, color: active ? color : '#9ca3af' })}
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" className="sidebar-btn" style={{ textDecoration: 'none' }}>{content} <ExternalLink size={12} color="#4b5563" /></a>;
  return <button onClick={() => setActiveTab(id)} className={`sidebar-btn ${active ? 'active' : ''}`} style={{ borderLeftColor: active ? color : 'transparent' }}>{content}</button>;
};

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);
  const supabase = useMemo(() => initSupabase(), []);

  const [data, setData] = useState({
    posts: [], deals: [], tipy: [], tweaky: [], slovnik: [],
    stats: { visits: 0, missingEn: 0, missingSeo: 0, missingSlovnik: 0 }
  });

  // Stav pro Intel Hub (Feed)
  const [intelFeed, setIntelFeed] = useState([]);
  const [intelLoading, setIntelLoading] = useState(false);

  const BASE_URL = 'https://www.thehardwareguru.cz';

  // --- AUTH ---
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === getEnv('NEXT_PUBLIC_ADMIN_PASSWORD', 'Wifik500')) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') sessionStorage.setItem('guru_admin_auth', 'true');
    }
  };

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => { if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [consoleLogs]);

  // --- HLOUBKOVÝ SKEN ---
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
        stats: { visits: statsRes.data?.value || 0, missingEn: allContent.filter(p => !p.title_en).length, missingSeo: (postsRes.data || []).filter(p => !p.seo_description).length, missingSlovnik: (slovnikRes.data || []).filter(p => !p.title_en).length }
      });
      addLog('Sken dokončen. Všechny systémy Guru jsou synchronizovány.', 'success');
    } catch (err) { addLog(`CHYBA: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  // --- AGREGÁTOR: FETCH TOM'S HARDWARE FEED ---
  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    addLog('Kontaktuji servery Tom\'s Hardware (RSS Feed)...', 'warning');
    try {
      // CORS Proxy je nutná pro RSS feedy v prohlížeči
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.tomshardware.com/feeds.xml`);
      const data = await res.json();
      if (data.status === 'ok') {
        setIntelFeed(data.items || []);
        addLog(`Agregováno ${data.items.length} nejnovějších zpráv z Tom's Hardware.`, 'success');
      } else {
        throw new Error('Feed status not OK');
      }
    } catch (err) {
      addLog(`Selhala agregace intel feedu: ${err.message}`, 'error');
    } finally {
      setIntelLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) fetchAndScanData(); }, [isAuthenticated]);

  const runApiTask = async (url, name) => {
    setActiveTab('terminal');
    addLog(`START: ${name}`, 'info');
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok) addLog(`OK [200]: ${text.substring(0, 150)}...`, 'success');
      else addLog(`FAIL [${res.status}]: ${text}`, 'error');
    } catch (err) { addLog(`FATAL: ${err.message}`, 'error'); }
    fetchAndScanData();
  };

  const markAsFired = async (id, table) => {
    addLog(`Vyřazuji ${id}...`, 'warning');
    try {
      const { error } = await supabase.from(table).update({ is_fired: true }).eq('id', id);
      if (error) throw error;
      addLog('Skryto.', 'success');
      fetchAndScanData();
    } catch (e) { addLog(`Update fail: ${e.message}`, 'error'); }
  };

  const clearQueueItems = async (list, tabName) => {
    if (!confirm(`Opravdu vyčistit celou frontu ${tabName}?`)) return;
    setActiveTab('terminal');
    addLog(`Hromadný úklid: ${tabName}...`, 'warning');
    try {
      for (const item of list) {
        const table = (item.type === 'expected' || tabName === 'Plánovač' || tabName === 'Články') ? 'posts' : 'game_deals';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
      }
      addLog('Fronta vyčištěna.', 'success');
      fetchAndScanData();
    } catch (e) { addLog(`Chyba: ${e.message}`, 'error'); }
  };

  const executeSocial = async (item, type) => {
    setActiveTab('terminal');
    addLog(`ODPALUJI NA MAKE: ${item.title}`, 'warning');
    const webhook = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');
    try {
      const response = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }) });
      if (response.ok) {
        await supabase.from(type === 'deal' ? 'game_deals' : 'posts').update({ is_fired: true }).eq('id', item.id);
        addLog('ODESLÁNO!', 'success');
        fetchAndScanData();
      } else throw new Error(response.status);
    } catch (err) { addLog(`SELHALO: ${err.message}`, 'error'); }
  };

  const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - 14);
  const unfiredPosts = data.posts.filter(p => !p.is_fired && new Date(p.created_at) > cutoffDate && p.type !== 'expected');
  const unfiredDeals = data.deals.filter(d => !d.is_fired && new Date(d.created_at) > cutoffDate);
  const activeExpected = data.posts.filter(p => p.type === 'expected' && !p.is_fired);

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1>GURU ACCESS</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '20px', textAlign: 'center' }} />
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#eab308', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>VSTOUPIT</button>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', color: '#fff', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 280px; background: #0d0e12; border-right: 1px solid #ffffff0d; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; height: 100vh; overflow-y: auto; }
        .sidebar-header { margin: 20px 25px 10px 25px; font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        .sidebar-btn:hover, .sidebar-btn.active { background: #ffffff0d; color: #fff; }
        .section-box { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid #ffffff05; margin-bottom: 40px; }
        .item-row { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; transition: 0.2s; }
        .item-row:hover { border-color: #f9731633; }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 13px; overflow-y: auto; height: 100%; }
        iframe { width: 100%; height: 700px; border-radius: 20px; background: #fff; border: none; margin-top: 15px; }
        .api-card { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid #ffffff08; display: flex; flex-direction: column; transition: 0.3s; }
        .api-card:hover { transform: translateY(-5px); border-color: #f9731633; }
        .action-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 12px; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .action-btn-small { background: transparent; border: 1px solid #333; color: #9ca3af; padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
        .btn-fire { border-color: #10b981; color: #10b981; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #111318; padding: 20px; border-radius: 20px; border: 1px solid #333; text-align: center; }
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .hub-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; transition: 0.3s; }
        .hub-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .hub-meta { font-size: 10px; color: #4b5563; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .hub-title { font-size: 15px; font-weight: 950; line-height: 1.4; color: #fff; margin-bottom: 15px; }
      `}} />

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#a855f7' }}>ADMIN</span></h2>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="Dashboard" color="#a855f7" />
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="Živý Terminál" color="#22c55e" />
          
          <div className="sidebar-header">CENTRÁLNÍ LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="Publikace & Plánovač" color="#f97316" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="Hardware Intel Hub" color="#eab308" />
          <SidebarItemUI id="tweaks-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label="Tweaky (Gen & Exec)" color="#10b981" />
          <SidebarItemUI id="seo-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label="SEO & Překlady" color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label="Automatizace" color="#a855f7" />
          
          <div className="sidebar-header">OBSAH</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="Správa Slev" color="#ff0055" />
          <SidebarItemUI id="kal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CalendarDays />} label="Herní Kalendář" color="#3b82f6" href="/kalendar" />
        </nav>
      </aside>

      <main className="admin-main">
        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ textTransform: 'uppercase', fontWeight: 950, marginBottom: '30px' }}>Systémový Status</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>{data.stats.visits}</h3><p style={{fontSize: '10px', color: '#444'}}>NÁVŠTĚVY</p></div>
              <div className="stat-card"><h3>{data.stats.missingEn}</h3><p style={{fontSize: '10px', color: '#444'}}>CHYBĚJÍCÍ EN</p></div>
              <div className="stat-card"><h3>{data.stats.missingSeo}</h3><p style={{fontSize: '10px', color: '#444'}}>CHYBĚJÍCÍ SEO</p></div>
              <div className="stat-card"><h3>{data.deals.length}</h3><p style={{fontSize: '10px', color: '#444'}}>AKTIVNÍ SLEVY</p></div>
            </div>
            <div style={{ height: '300px' }}><div className="terminal-box">{consoleLogs.slice(-8).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}</div></div>
          </div>
        )}

        {/* --- TERMINÁL --- */}
        {activeTab === 'terminal' && <div style={{ height: '80vh' }}><div className="terminal-box">{consoleLogs.map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}<div ref={logEndRef} /></div></div>}

        {/* --- HARDWARE INTEL HUB (NEW) --- */}
        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ textTransform: 'uppercase', fontWeight: 950, margin: 0 }}>Hardware <span style={{ color: '#eab308' }}>Intel Hub</span></h2>
              <button 
                onClick={fetchIntelFeed} 
                disabled={intelLoading}
                className="action-btn" 
                style={{ background: '#eab308', color: '#000', marginTop: 0, width: 'auto', padding: '10px 20px' }}
              >
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> SYNC TOM'S HARDWARE
              </button>
            </div>

            <div className="section-box" style={{ background: 'rgba(234, 179, 8, 0.03)', borderColor: 'rgba(234, 179, 8, 0.1)' }}>
               <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '25px', lineHeight: '1.6' }}>
                  Zde vidíš nejnovější podklady z elitních HW zdrojů. Použij tyto data jako inspiraci pro nové rozbory a články.
               </p>

               <div className="hub-grid">
                  {intelFeed.map((item, i) => (
                    <div key={i} className="hub-card">
                        <span className="hub-meta">Tom's Hardware • {item.pubDate?.split(' ')[0]}</span>
                        <h3 className="hub-title">{item.title}</h3>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <a href={item.link} target="_blank" rel="noreferrer" className="action-btn-small" style={{ flex: 1, textAlign: 'center' }}>Číst Zdroj</a>
                            <button onClick={() => addLog(`Příprava konceptu z: ${item.title}`, 'info')} className="action-btn-small btn-fire" style={{ flex: 1 }}>Vytvořit Koncept</button>
                        </div>
                    </div>
                  ))}
                  {intelFeed.length === 0 && !intelLoading && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#444', fontWeight: 'bold', border: '2px dashed #1a1a1a', borderRadius: '20px' }}>
                        HUB JE PRÁZDNÝ. SPUSTI SYNCHRONIZACI.
                    </div>
                  )}
                  {intelLoading && (
                     <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#eab308', fontWeight: 'black', letterSpacing: '2px' }}>
                        GURU SCANNING GLOBAL INTEL...
                     </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'pub-plan' && (
          <div className="fade-in">
            <h2 style={{ textTransform: 'uppercase', fontWeight: 950, marginBottom: '30px' }}>Publikace & Plánování</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className="api-card"><h3>SOCIAL EXECUTOR</h3><p style={{fontSize: '11px', color: '#666'}}>Hromadné odeslání obsahu na sítě.</p><button onClick={() => runApiTask(`${BASE_URL}/api/cron/executor`, 'Executor')} className="action-btn" style={{ background: '#10b981', color: '#000' }}><Zap size={14}/> SPUSTIT</button></div>
                <div className="api-card"><h3>PLÁNOVAČ CRON</h3><p style={{fontSize: '11px', color: '#666'}}>Automatická publikace rozborů.</p><button onClick={() => runApiTask(`${BASE_URL}/api/cron/planer`, 'Planner')} className="action-btn" style={{ background: '#3b82f6', color: '#fff' }}><Zap size={14}/> SPUSTIT</button></div>
            </div>
            <div className="section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3 style={{ margin: 0, color: '#10b981' }}>Social Executor Fronta</h3><button onClick={() => clearQueueItems([...unfiredPosts, ...unfiredDeals], 'Články')} className="action-btn-small" style={{ borderColor: '#ef4444', color: '#ef4444' }}>Smazat frontu</button></div>
              {[...unfiredPosts, ...unfiredDeals].map(item => (
                <div key={item.id} className="item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><img src={item.image_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /><span style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.title}</span></div>
                  <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => markAsFired(item.id, item.title_en ? 'posts' : 'game_deals')} className="action-btn-small">Skrýt</button><button onClick={() => executeSocial(item, item.title_en ? 'post' : 'deal')} className="action-btn-small btn-fire">Odpálit</button></div>
                </div>
              ))}
            </div>
            <div className="section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3 style={{ margin: 0, color: '#3b82f6' }}>Plánovač (Očekávané)</h3><button onClick={() => clearQueueItems(activeExpected, 'Plánovač')} className="action-btn-small" style={{ borderColor: '#ef4444', color: '#ef4444' }}>Vyčistit vše</button></div>
              {activeExpected.map(game => (<div key={game.id} className="item-row"><span>{game.title}</span><button onClick={() => markAsFired(game.id, 'posts')} className="action-btn-small">Už je venku (Skrýt)</button></div>))}
            </div>
          </div>
        )}

        {activeTab === 'tweaks-hub' && (
          <div className="fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="api-card" style={{ marginBottom: '20px' }}><h3>TWEAK EXECUTOR</h3><button onClick={() => runApiTask(`${BASE_URL}/api/cron/tweak-executor`, 'Tweak Exec')} className="action-btn" style={{ background: '#10b981', color: '#000', width: 'fit-content', padding: '12px 25px' }}><Zap size={14}/> SPUSTIT CRON</button></div>
            <iframe src={`${BASE_URL}/admin/tweaky-generator`} title="Tweaky Gen" />
          </div>
        )}

        {activeTab === 'seo-hub' && (
          <div className="fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="api-card"><h3>SEO GENERATOR</h3><button onClick={() => runApiTask(`${BASE_URL}/api/generate-seo?secret=Wifik500`, 'SEO Gen')} className="action-btn" style={{ background: '#66fcf1', color: '#000' }}><Zap size={14}/> GENERATE META</button></div>
                <div className="api-card"><h3>SLOVNÍK UPDATER</h3><button onClick={() => runApiTask(`${BASE_URL}/api/cron/slovnik?secret=Wifik500`, 'Slovník')} className="action-btn" style={{ background: '#a855f7', color: '#fff' }}><Zap size={14}/> UPDATE SLOVNÍK</button></div>
            </div>
            <iframe src={`${BASE_URL}/admin/en-fixer`} title="EN Fixer" />
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="fade-in">
            <h2 className="tab-title">Automatizace</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="api-card"><h3>TIP GENERATOR</h3><button onClick={() => runApiTask(`${BASE_URL}/api/generate-tip`, 'Tip Gen')} className="action-btn" style={{ background: '#eab308', color: '#000' }}><Zap size={14}/> SPUSTIT AI</button></div>
                <div className="api-card"><h3>HLAVNÍ CRON</h3><button onClick={() => runApiTask(`${BASE_URL}/api/cron`, 'Main Cron')} className="action-btn" style={{ background: '#ef4444', color: '#fff' }}><Zap size={14}/> SPUSTIT ÚDRŽBU</button></div>
                <div className="api-card"><h3>CHECK LIVE</h3><button onClick={() => runApiTask(`${BASE_URL}/api/check-live`, 'Check Live')} className="action-btn" style={{ background: '#8b5cf6', color: '#fff' }}><Zap size={14}/> KONTROLA STREAMŮ</button></div>
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="fade-in">
            <h2 className="tab-title">Správa Slev</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {data.deals.map(deal => (<div key={deal.id} style={{ background: '#111318', borderRadius: '20px', overflow: 'hidden', border: '1px solid #ffffff0a' }}><img src={deal.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt={deal.title}/><div style={{ padding: '20px' }}><div style={{ fontWeight: 900, fontSize: '15px', textTransform: 'uppercase' }}>{deal.title}</div><div style={{ color: '#ff0055', fontWeight: 900, marginTop: '5px', fontSize: '18px' }}>{deal.price_cs}</div></div></div>))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
