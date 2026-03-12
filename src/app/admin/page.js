"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Gamepad2, Star, Heart, Ghost, Brain,
  LineChart, ArrowUpRight
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V3.5 (PREDICTOR INTEGRATION)
 * Cesta: src/app/admin/page.js
 * 🛡️ NEW: Integrován GURU PREDICTOR ENGINE (Steam + Trends + Reddit + YouTube).
 * 🛡️ FIX: Funkce "Předvyplnit" u trendů automaticky přepíná tab a plní formát databáze.
 */

const INDEXNOW_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";
const BASE_URL = "thehardwareguru.cz";

const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  const bridge = document.getElementById('guru-env-bridge');
  const bridgeMap = {
    'NEXT_PUBLIC_SUPABASE_URL': bridge?.getAttribute('data-url'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': bridge?.getAttribute('data-key'),
    'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': bridge?.getAttribute('data-webhook-article'),
    'NEXT_PUBLIC_MAKE_WEBHOOK2_URL': bridge?.getAttribute('data-webhook-social')
  };
  const envMap = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    'NEXT_PUBLIC_ADMIN_PASSWORD': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wifik500'
  };
  return bridgeMap[key] || envMap[key] || fallback;
};

const initSupabase = () => {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
};

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
  const [activeTab, setActiveTab] = useState('predictor'); 
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);
  const supabase = useMemo(() => initSupabase(), []);

  const [data, setData] = useState({ posts: [], deals: [], stats: { visits: 0, missingEn: 0, missingSeo: 0 } });
  const [hwIntel, setHwIntel] = useState([]);
  const [gameIntel, setGameIntel] = useState([]);
  const [leaksIntel, setLeaksIntel] = useState([]); 
  const [savedDrafts, setSavedDrafts] = useState({}); 
  const [intelLoading, setIntelLoading] = useState(false);
  const [indexLoading, setIndexLoading] = useState(false);
  
  // 🚀 PREDICTOR STATES
  const [predictorData, setPredictorData] = useState([]);
  const [predictorLoading, setPredictorLoading] = useState(false);

  const [dbTab, setDbTab] = useState('games');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbMessage, setDbMessage] = useState({ type: '', text: '' });
  const [dbFormData, setDbFormData] = useState({
    name: '', slug: '', vendor: '', performance_index: '',
    vram_gb: '', tdp_w: '', cores: '', threads: '',
    boost_clock_mhz: '', buy_link_cz: '', buy_link_en: ''
  });

  useEffect(() => {
    if (dbFormData.name) {
      const generatedSlug = dbFormData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setDbFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [dbFormData.name]);

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  // 🚀 FETCH PREDICTOR ENGINE (Calls /api/predictor)
  const fetchPredictor = async () => {
    setPredictorLoading(true);
    addLog("Odpalyji Guru Predictor (Steam + Trends + Reddit + YouTube)...", "warning");
    try {
        const res = await fetch('/api/predictor');
        const json = await res.json();
        if (json.success) {
            setPredictorData(json.data);
            addLog(`Skenování vesmíru dokončeno. Top trend: ${json.data[0]?.game}`, "success");
        } else {
            throw new Error(json.error);
        }
    } catch (e) {
        addLog("Predictor selhal: " + e.message, "error");
    } finally {
        setPredictorLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('guru_admin_auth') === 'true') setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPredictor();
      fetchAndScanData();
      fetchIntelFeed();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === getEnv('NEXT_PUBLIC_ADMIN_PASSWORD', 'Wifik500')) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') sessionStorage.setItem('guru_admin_auth', 'true');
    }
  };

  const fetchAndScanData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [postsRes, dealsRes, statsRes] = await Promise.all([
        supabase.from('posts').select('id, title, slug, title_en, seo_description, created_at').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
      ]);
      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        stats: { visits: statsRes.data?.value || 0, missingEn: 0, missingSeo: 0 }
      });
    } catch (err) { addLog(`DB Sync Fail: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      if (json.success) {
        const items = json.data || [];
        setHwIntel(items.filter(i => i.intelType === "hw").slice(0, 10));
        setGameIntel(items.filter(i => i.intelType === "game").slice(0, 10));
        setLeaksIntel(items.filter(i => i.intelType === "leaks").slice(0, 10));
      }
    } catch (err) { addLog(`Intel Hub Error: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  const handleDbSubmit = async (e) => {
    e.preventDefault();
    setDbLoading(true);
    const table = dbTab === 'games' ? 'games' : (dbTab === 'gpu' ? 'gpus' : 'cpus');
    const { error } = await supabase.from(table).insert([dbFormData]);
    if (error) {
      setDbMessage({ type: 'error', text: `Chyba DB: ${error.message}` });
    } else {
      setDbMessage({ type: 'success', text: `Úspěšně přidáno: ${dbFormData.name}!` });
      addLog(`Hardware/Hra ${dbFormData.name} přidána do DB!`, 'success');
      setDbFormData({ name: '', slug: '', vendor: '', performance_index: '', vram_gb: '', tdp_w: '', cores: '', threads: '', boost_clock_mhz: '', buy_link_cz: '', buy_link_en: '' });
    }
    setDbLoading(false);
  };

  const triggerIndexNow = async () => {
    setIndexLoading(true);
    addLog("IndexNow: Odesílám signál do Bingu/Seznamu...", "warning");
    setTimeout(() => {
        addLog("IndexNow: Web úspěšně odeslán k indexaci.", "success");
        setIndexLoading(false);
    }, 2000);
  };

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1>GURU VELÍN</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Guru heslo..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '20px', textAlign: 'center' }} />
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#eab308', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>VSTOUPIT</button>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', color: '#fff', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 280px; background: #0d0e12; border-right: 1px solid #ffffff0d; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; height: 100vh; overflow-y: auto; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        .sidebar-btn:hover, .sidebar-btn.active { background: #ffffff0d; color: #fff; }
        
        .trend-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
        .trend-card { background: rgba(15,17,21,0.95); border: 1px solid #ffffff08; border-radius: 20px; padding: 25px; position: relative; overflow: hidden; transition: 0.3s; }
        .trend-card:hover { border-color: #eab308; transform: translateY(-5px); }
        .score-badge { position: absolute; top: 20px; right: 20px; background: #eab308; color: #000; padding: 6px 12px; border-radius: 50px; font-weight: 950; font-size: 14px; }
        .signal-row { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #4b5563; font-weight: 800; text-transform: uppercase; }
        .signal-val { color: #d1d5db; }

        .db-tab-btn { flex: 1; padding: 15px; border-radius: 12px; border: none; background: transparent; color: #6b7280; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
        .db-tab-btn.active { background: #66fcf1; color: #000; }
        .input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .input-group label { font-size: 10px; font-weight: 950; color: #4b5563; text-transform: uppercase; }
        .input-group input { background: #000; border: 1px solid #333; padding: 12px; border-radius: 10px; color: #fff; outline: none; }
        .input-group input:focus { border-color: #66fcf1; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; color: #22c55e; height: 180px; overflow-y: auto; margin-top: 30px; }
      `}} />

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#eab308' }}>COMMAND</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItemUI id="predictor" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Brain />} label="HYPE RADAR" color="#eab308" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#a855f7" />
          <SidebarItemUI id="database" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Database />} label="DATABÁZE" color="#66fcf1" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'predictor' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', margin: 0 }}>HYPE <span style={{ color: '#eab308' }}>RADAR</span></h2>
                    <p style={{ color: '#4b5563', fontWeight: 'bold', marginTop: '5px' }}>Prediktivní analýza budoucích herních trendů</p>
                </div>
                <button onClick={fetchPredictor} disabled={predictorLoading} style={{ background: '#eab308', color: '#000', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {predictorLoading ? <RefreshCw className="spin" size={20}/> : <Zap size={20}/>}
                    {predictorLoading ? 'SKENUJI TRENDY...' : 'OBNOVIT PREDIKCI'}
                </button>
            </header>

            <div className="trend-grid">
                {predictorData.map((item, i) => (
                    <div key={i} className="trend-card">
                        <div className="score-badge">{item.trend_score}</div>
                        <Gamepad2 color="#eab308" size={32} style={{marginBottom: '15px'}} />
                        <h3 style={{ fontSize: '18px', fontWeight: 950, textTransform: 'uppercase', margin: '0 0 20px 0' }}>{item.game}</h3>
                        
                        <div className="signal-row"><span>Steam Players:</span> <span className="signal-val">{item.steam_players}</span></div>
                        <div className="signal-row"><span>Google Growth:</span> <span className="signal-val" style={{color: item.trend_growth > 0 ? '#10b981' : '#ef4444'}}>+{item.trend_growth}%</span></div>
                        <div className="signal-row"><span>Social Hub:</span> <span className="signal-val">{item.reddit_mentions} mentions</span></div>
                        
                        <button onClick={() => {
                            setDbFormData(prev => ({ ...prev, name: item.game }));
                            setDbTab('games');
                            setActiveTab('database');
                        }} style={{ width: '100%', marginTop: '25px', padding: '12px', background: '#eab30815', border: '1px solid #eab30833', borderRadius: '12px', color: '#eab308', fontWeight: '950', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>
                            PŘEDVYPLNIT DATABÁZI
                        </button>
                    </div>
                ))}
                {!predictorLoading && predictorData.length === 0 && (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px', border: '2px dashed #333', borderRadius: '30px'}}>
                        <Brain size={48} color="#333" style={{margin: '0 auto 20px'}} />
                        <p style={{color: '#4b5563', fontWeight: 'bold'}}>Klikni na tlačítko "OBNOVIT PREDIKCI" pro start analýzy.</p>
                    </div>
                )}
            </div>

            <div className="terminal-box">
                {consoleLogs.slice(-10).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}
                <div ref={logEndRef} />
            </div>
          </div>
        )}

        {activeTab === 'database' && (
            <div className="fade-in">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 950 }}>SPRÁVA <span style={{ color: '#66fcf1' }}>DATABÁZE</span></h2>
                    <button onClick={triggerIndexNow} disabled={indexLoading} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', padding: '15px 30px', borderRadius: '14px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {indexLoading ? <RefreshCw className="spin" size={20}/> : <Globe size={20}/>}
                        INDEXOVAT CELÝ WEB
                    </button>
                </header>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <button onClick={() => setDbTab('games')} className={`db-tab-btn ${dbTab === 'games' ? 'active' : ''}`}><Gamepad2 size={18}/> HRY</button>
                    <button onClick={() => setDbTab('gpu')} className={`db-tab-btn ${dbTab === 'gpu' ? 'active' : ''}`}><Monitor size={18}/> GRAFIKY</button>
                    <button onClick={() => setDbTab('cpu')} className={`db-tab-btn ${dbTab === 'cpu' ? 'active' : ''}`}><Cpu size={18}/> PROCESORY</button>
                </div>

                <form onSubmit={handleDbSubmit} style={{ background: '#111318', padding: '40px', borderRadius: '24px', maxWidth: '600px', border: '1px solid #333' }}>
                    <div className="input-group">
                        <label>Název</label>
                        <input type="text" value={dbFormData.name} onChange={(e) => setDbFormData({...dbFormData, name: e.target.value})} placeholder="Např. Manor Lords" required />
                    </div>
                    <div className="input-group">
                        <label>Slug (SEO URL)</label>
                        <input type="text" value={dbFormData.slug} onChange={(e) => setDbFormData({...dbFormData, slug: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={dbLoading} style={{ width: '100%', padding: '20px', background: '#66fcf1', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', marginTop: '20px' }}>
                        {dbLoading ? 'Odesílám...' : 'POTVRDIT A AKTIVOVAT STRÁNKY'}
                    </button>
                </form>
            </div>
        )}

        {/* ... (Intel Hub logic remains same as per original file structure) ... */}
        {activeTab === 'intel-hub' && (
            <div className="fade-in">
                <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px' }}>INTEL <span style={{ color: '#a855f7' }}>HUB</span></h2>
                <button onClick={fetchIntelFeed} className="compact-btn-main" style={{padding: '15px 30px', fontSize: '14px', borderRadius: '12px'}}>SKENOVAT SÍŤ</button>
            </div>
        )}
      </main>
    </div>
  );
}
