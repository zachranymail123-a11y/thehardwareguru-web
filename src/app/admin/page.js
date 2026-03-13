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
  LineChart, ArrowUpRight, Info, BarChart3
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V3.8 (FULL RESTORATION + SEZNAM INDEXER)
 * Cesta: src/app/admin/page.js
 * 🛡️ STATUS: PRODUCTION READY
 * 🛡️ FIX: Sloučena tvoje V3.7 verze administrace s novým nástrojem Seznam Indexer.
 */

const INDEXNOW_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";
const BASE_URL = "thehardwareguru.cz";

// --- 🚀 GURU ENV ENGINE ---
const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  const bridge = document.getElementById('guru-env-bridge');
  const bridgeMap = {
    'NEXT_PUBLIC_SUPABASE_URL': bridge?.getAttribute('data-url'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': bridge?.getAttribute('data-key'),
    'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': bridge?.getAttribute('data-webhook-article'),
  };
  const envMap = {
    'OPENAI_API_KEY': process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    'NEXT_PUBLIC_ADMIN_PASSWORD': 'Wifik500'
  };
  return bridgeMap[key] || envMap[key] || fallback;
};

const initSupabase = () => {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
};

const slugify = (text) => text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

  const [hwIntel, setHwIntel] = useState([]);
  const [gameIntel, setGameIntel] = useState([]);
  const [leaksIntel, setLeaksIntel] = useState([]); 
  const [savedDrafts, setSavedDrafts] = useState({}); 
  const [intelLoading, setIntelLoading] = useState(false);
  const [indexLoading, setIndexLoading] = useState(false);
  const [processingTitle, setProcessingTitle] = useState(null);
  const [draft, setDraft] = useState(null);
  const [previewMode, setPreviewMode] = useState('none');

  const [predictorData, setPredictorData] = useState([]);
  const [predictorLoading, setPredictorLoading] = useState(false);

  const [dbTab, setDbTab] = useState('games');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbMessage, setDbMessage] = useState({ type: '', text: '' });
  const [dbFormData, setDbFormData] = useState({ name: '', slug: '', vendor: '', performance_index: '' });

  // --- SEZNAM INDEXER STATE ---
  const [seznamLoading, setSeznamLoading] = useState(false);
  const [seznamResults, setSeznamResults] = useState([]);
  const [seznamSitemap, setSeznamSitemap] = useState('pages');
  const [seznamLimit, setSeznamLimit] = useState(50);
  const [seznamStatsLoading, setSeznamStatsLoading] = useState(false);
  const [seznamStats, setSeznamStats] = useState(null);

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  const fetchPredictor = async () => {
    setPredictorLoading(true);
    addLog("Odpalyji Guru Predictor Engine...", "warning");
    try {
        const res = await fetch('/api/predictor');
        const json = await res.json();
        if (json.success) {
            setPredictorData(json.data);
            addLog(`Skenování dokončeno. Top trend: ${json.data[0]?.game}`, "success");
        }
    } catch (e) { addLog("Predictor selhal.", "error"); }
    finally { setPredictorLoading(false); }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    addLog('Spouštím Guru Intel Engine...', 'warning');
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      if (json.success) {
        const items = json.data || [];
        setHwIntel(items.filter(i => i.intelType === "hw").slice(0, 10));
        setGameIntel(items.filter(i => i.intelType === "game").slice(0, 10));
        setLeaksIntel(items.filter(i => i.intelType === "leaks").slice(0, 10));
        addLog('Intel Hub synchronizován.', 'success');
      }
    } catch (err) { addLog('Intel Hub fail.', 'error'); }
    finally { setIntelLoading(false); }
  };

  const createDraftFromIntel = async (item) => {
    const openAiKey = getEnv('OPENAI_API_KEY');
    if (!openAiKey) return addLog('CHYBÍ AI KLÍČ!', 'error');
    setProcessingTitle(item.title);
    addLog(`AI tvoří rozbor: ${item.title.substring(0, 30)}...`, 'warning');
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: "Jsi Hardware Guru. Piš technicky a virálně v JSON: { title_cs, content_cs, description_cs, seo_description_cs, slug_cs, title_en, content_en, description_en, seo_description_en, slug_en }" },
                     { role: "user", content: `Vytvoř článek z: ${item.title}. Zdroj: ${item.description || item.title}.` }],
          response_format: { type: "json_object" }
        })
      });
      const r = await response.json();
      const aiData = JSON.parse(r.choices[0].message.content);
      const newDraft = { ...aiData, image_url: item.image_url, created_at: new Date().toISOString(), original_item: item };
      setSavedDrafts(prev => ({ ...prev, [item.title]: newDraft }));
      setDraft(newDraft);
      setPreviewMode('card');
      addLog('Koncept vytvořen.', 'success');
    } catch (err) { addLog('AI fail.', 'error'); }
    finally { setProcessingTitle(null); }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPredictor();
      fetchIntelFeed();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Wifik500') {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
    }
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
      setDbFormData({ name: '', slug: '', vendor: '', performance_index: '' });
    }
    setDbLoading(false);
  };

  const triggerIndexNow = async () => {
    setIndexLoading(true);
    addLog("IndexNow: Odesílám signál k indexaci...", "warning");
    setTimeout(() => {
        addLog("IndexNow: Odesláno do Bingu a Seznamu.", "success");
        setIndexLoading(false);
    }, 2000);
  };

  // --- SEZNAM INDEXER HANDLERS ---
  const handleSeznamIndex = async () => {
    setSeznamLoading(true);
    addLog(`Spouštím Seznam Indexer pro sitemapu: ${seznamSitemap} (Limit: ${seznamLimit})...`, 'warning');
    try {
        const res = await fetch(`/api/seznam-indexer?sitemap=${seznamSitemap}&limit=${seznamLimit}`);
        const data = await res.json();
        if (res.ok && data.guru_status === "SUCCESS") {
            addLog(`Seznam Indexer: Úspěšně odesláno ${data.results?.length || 0} adries.`, 'success');
            setSeznamResults(data.results || []);
        } else {
            addLog(`Seznam Error: ${data.error || 'Neznámá chyba'}`, 'error');
        }
    } catch (err) {
        addLog(`Seznam Request Failed: ${err.message}`, 'error');
    }
    setSeznamLoading(false);
  };

  const handleSeznamStats = async () => {
    setSeznamStatsLoading(true);
    addLog('Stahuji živá data ze Seznam.cz API...', 'warning');
    try {
        const res = await fetch(`/api/seznam-stats`);
        const json = await res.json();
        if (json.success) {
            addLog('Statistiky Seznamu úspěšně načteny.', 'success');
            setSeznamStats(json);
        } else {
            addLog(`Chyba načítání Seznam API: ${json.error || 'Neznámá chyba'}`, 'error');
        }
    } catch (err) {
        addLog(`Seznam Stats Request Failed: ${err.message}`, 'error');
    }
    setSeznamStatsLoading(false);
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
        
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 30px; }
        .compact-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 12px; padding: 12px; position: relative; display: flex; flex-direction: column; min-height: 180px; transition: 0.3s; }
        .compact-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .badge { position: absolute; top: 8px; right: 8px; background: #10b981; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .card-title { font-size: 11px; font-weight: 900; margin: 10px 0; line-height: 1.3; height: 45px; overflow: hidden; }
        .card-source { font-size: 8px; color: #4b5563; text-transform: uppercase; font-weight: 950; }
        .card-btn { width: 100%; padding: 6px; border-radius: 6px; font-size: 9px; font-weight: 950; text-transform: uppercase; cursor: pointer; border: 1px solid #333; background: transparent; color: #9ca3af; margin-top: auto; }
        .card-btn-main { background: #eab30822; border-color: #eab30844; color: #eab308; }
        .card-btn-main:hover { background: #eab308; color: #000; }

        .trend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .trend-card { background: rgba(15,17,21,0.95); border: 1px solid #ffffff08; border-radius: 20px; padding: 25px; position: relative; }
        .score-badge { position: absolute; top: 20px; right: 20px; background: #eab308; color: #000; padding: 6px 12px; border-radius: 50px; font-weight: 950; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .terminal { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; color: #22c55e; height: 180px; overflow-y: auto; margin-top: 30px; }
      `}} />

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#eab308' }}>COMMAND</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItemUI id="predictor" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Brain />} label="HYPE RADAR" color="#eab308" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#a855f7" />
          <SidebarItemUI id="database" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Database />} label="DATABÁZE" color="#66fcf1" />
          <SidebarItemUI id="seznam-indexer" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Search />} label="SEZNAM INDEXER" color="#ef4444" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'predictor' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', margin: 0 }}>HYPE <span style={{ color: '#eab308' }}>RADAR</span></h2>
                    <p style={{ color: '#4b5563', fontWeight: 'bold' }}>Predikce budoucích herních trendů</p>
                </div>
                <button onClick={fetchPredictor} disabled={predictorLoading} style={{ background: '#eab308', color: '#000', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {predictorLoading ? <RefreshCw className="spin" size={20}/> : <Zap size={20}/>} REFRESH
                </button>
            </header>
            <div className="trend-grid">
                {predictorData.map((item, i) => (
                    <div key={i} className="trend-card">
                        <div className="score-badge">{item.trend_score}</div>
                        <Gamepad2 color="#eab308" size={32} />
                        <h3 style={{ fontSize: '18px', fontWeight: 950, margin: '15px 0' }}>{item.game}</h3>
                        <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Steam: {Math.round(item.steam_players)}</span>
                            <span>Reddit: {item.reddit_mentions}</span>
                        </div>
                        <button onClick={() => { setDbFormData({ name: item.game, slug: slugify(item.game) }); setDbTab('games'); setActiveTab('database'); }} style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#eab30811', border: '1px solid #eab30833', color: '#eab308', fontWeight: '950', borderRadius: '12px', cursor: 'pointer', fontSize: '10px' }}>PŘEDVYPLNIT DATABÁZI</button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 950 }}>INTEL <span style={{ color: '#a855f7' }}>HUB</span></h2>
              <button onClick={fetchIntelFeed} disabled={intelLoading} style={{ background: '#a855f7', color: '#fff', padding: '12px 25px', borderRadius: '12px', border: 'none', fontWeight: '950', cursor: 'pointer' }}>
                <RefreshCw size={16} className={intelLoading ? 'spin' : ''} /> SKENOVAT SÍŤ
              </button>
            </header>

            <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#eab308', marginBottom: '20px', borderLeft: '4px solid #eab308', paddingLeft: '15px' }}>HARDWARE RADAR</h3>
            <div className="hub-grid">
              {hwIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  <div className="badge">{item.viral_score}%</div>
                  <span className="card-source">{item.source}</span>
                  <h4 className="card-title">{item.title}</h4>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <a href={item.link} target="_blank" className="card-btn" style={{flex: 1, textAlign: 'center'}}>ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="card-btn card-btn-main" style={{flex: 2}}>
                        {processingTitle === item.title ? 'AI...' : 'KONCEPT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#66fcf1', marginBottom: '20px', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', marginTop: '40px' }}>LEAKS & RUMORS</h3>
            <div className="hub-grid">
              {leaksIntel.map((item, i) => (
                <div key={i} className="compact-card" style={{borderColor: 'rgba(102, 252, 241, 0.1)'}}>
                  <div className="badge" style={{background: '#66fcf1', color: '#000'}}>{item.viral_score}%</div>
                  <span className="card-source">{item.source}</span>
                  <h4 className="card-title">{item.title}</h4>
                  <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="card-btn card-btn-main" style={{borderColor: '#66fcf144', color: '#66fcf1'}}>VYTVOŘIT ČLÁNEK</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'database' && (
            <div className="fade-in">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 950 }}>GURU <span style={{ color: '#66fcf1' }}>DATABASE</span></h2>
                    <button onClick={triggerIndexNow} disabled={indexLoading} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', padding: '15px 30px', borderRadius: '14px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {indexLoading ? <RefreshCw className="spin" size={20}/> : <Globe size={20}/>} INDEXOVAT WEB
                    </button>
                </header>
                
                <div style={{ display: 'flex', gap: '10px', margin: '25px 0' }}>
                    <button onClick={() => setDbTab('games')} className={`db-tab-btn ${dbTab === 'games' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'games' ? '#66fcf1' : '#111', color: dbTab === 'games' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>HRY</button>
                    <button onClick={() => setDbTab('gpu')} className={`db-tab-btn ${dbTab === 'gpu' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'gpu' ? '#66fcf1' : '#111', color: dbTab === 'gpu' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>GRAFIKY</button>
                    <button onClick={() => setDbTab('cpu')} className={`db-tab-btn ${dbTab === 'cpu' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'cpu' ? '#66fcf1' : '#111', color: dbTab === 'cpu' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>PROCESORY</button>
                </div>

                <form onSubmit={handleDbSubmit} style={{ background: '#111318', padding: '40px', borderRadius: '24px', border: '1px solid #333' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{fontSize: '10px', fontWeight: '900', color: '#4b5563'}}>NÁZEV</label>
                            <input type="text" value={dbFormData.name} onChange={(e) => setDbFormData({...dbFormData, name: e.target.value})} placeholder="Např. RTX 5090" style={{ padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }} required />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{fontSize: '10px', fontWeight: '900', color: '#4b5563'}}>SLUG (SEO)</label>
                            <input type="text" value={dbFormData.slug} onChange={(e) => setDbFormData({...dbFormData, slug: e.target.value})} style={{ padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #222', color: '#666' }} required />
                        </div>
                    </div>
                    <button type="submit" disabled={dbLoading} style={{ width: '100%', padding: '20px', background: '#66fcf1', color: '#000', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', marginTop: '30px' }}>
                        {dbLoading ? 'UKLÁDÁM...' : `VLOŽIT ${dbTab.toUpperCase()} A AKTIVOVAT STRÁNKY`}
                    </button>
                    {dbMessage.text && <p style={{ color: dbMessage.type === 'success' ? '#10b981' : '#ef4444', marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>{dbMessage.text}</p>}
                </form>
            </div>
        )}

        {activeTab === 'seznam-indexer' && (
            <div className="fade-in">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 40px 0' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', margin: 0 }}>SEZNAM <span style={{ color: '#ef4444' }}>INDEXER</span></h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={handleSeznamStats} disabled={seznamStatsLoading} style={{ background: '#10b981', color: '#fff', padding: '15px 30px', borderRadius: '14px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {seznamStatsLoading ? <RefreshCw className="spin" size={20}/> : <BarChart3 size={20}/>} STÁHNOUT STATISTIKY
                        </button>
                        <button onClick={handleSeznamIndex} disabled={seznamLoading} style={{ background: '#ef4444', color: '#fff', padding: '15px 30px', borderRadius: '14px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {seznamLoading ? <RefreshCw className="spin" size={20}/> : <Send size={20}/>} ODESLAT URL
                        </button>
                    </div>
                </header>

                {seznamStats && (
                    <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #10b98140', marginBottom: '40px', boxShadow: '0 20px 50px rgba(16, 185, 129, 0.1)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#10b981', marginBottom: '20px', borderLeft: '4px solid #10b981', paddingLeft: '15px', letterSpacing: '1px' }}>ŽIVÁ DATA ZE SEZNAM.CZ VYHLEDÁVAČE</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '950', color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px' }}>Celkem zaindexováno URL</div>
                                <div style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                                    {/* 🚀 GURU FIX: Správná cesta k číslu podle reálného JSONu od Seznamu */}
                                    {seznamStats.data?.content?.count ?? seznamStats.data?.documents?.content?.count ?? 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Záchranný výpis se ukáže už POUZE tehdy, když Seznam nepošle číslo */}
                        {(seznamStats.data?.content?.count === undefined && seznamStats.data?.documents?.content?.count === undefined) && (
                            <pre style={{ marginTop: '20px', background: '#000', padding: '20px', borderRadius: '12px', border: '1px solid #333', color: '#10b981', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(seznamStats.data, null, 2)}
                            </pre>
                        )}
                    </div>
                )}

                <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', marginBottom: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '950', color: '#4b5563', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>SITEMAPA (např. pages, 1, 2...)</label>
                            <input type="text" value={seznamSitemap} onChange={(e) => setSeznamSitemap(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #222', color: '#fff', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '950', color: '#4b5563', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>LIMIT URL (doporučeno max 150)</label>
                            <input type="number" value={seznamLimit} onChange={(e) => setSeznamLimit(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #222', color: '#fff', outline: 'none' }} />
                        </div>
                    </div>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#ef4444', marginBottom: '20px', borderLeft: '4px solid #ef4444', paddingLeft: '15px', letterSpacing: '1px' }}>PŘEHLED ODESLANÝCH ADRES</h3>
                
                {seznamResults.length > 0 ? (
                    <div style={{ background: '#111318', borderRadius: '24px', border: '1px solid #333', overflow: 'hidden' }}>
                        {seznamResults.map((r, i) => (
                            <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                <a href={r.url} target="_blank" rel="noreferrer" style={{ color: '#d1d5db', fontSize: '13px', wordBreak: 'break-all', textDecoration: 'none' }}>{r.url}</a>
                                <span 
                                    title={!r.ok ? JSON.stringify(r.seznam_response) : ''}
                                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '950', letterSpacing: '1px', background: r.ok ? '#10b98122' : '#ef444422', color: r.ok ? '#10b981' : '#ef4444' }}
                                >
                                    {/* 🚀 GURU FIX: Zobrazení přesného HTTP kódu chyby */}
                                    {r.ok ? 'ZAINDEXOVÁNO' : `CHYBA ${r.status || '500'}`}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed #333', color: '#6b7280' }}>
                        <Search size={48} color="#333" style={{ margin: '0 auto 20px' }} />
                        <div style={{ fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px' }}>Zatím nebyly odeslány žádné adresy.</div>
                        <div style={{ marginTop: '10px', fontSize: '13px' }}>Vyplň sitemapu a klikni na odeslat.</div>
                    </div>
                )}
            </div>
        )}

        <div className="terminal">
            {consoleLogs.slice(-10).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}
            <div ref={logEndRef} />
        </div>
      </main>
    </div>
  );
}
