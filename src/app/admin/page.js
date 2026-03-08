"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft
} from 'lucide-react';

// --- GURU CONFIG & ENV ---
const apiKey = ""; // Klíč je poskytován prostředím automaticky
const getEnv = (key, fallback = '') => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
  } catch (e) {}
  return fallback;
};

// --- GURU ENGINE INIT ---
const initSupabase = () => {
  let createClient;
  try {
    const supabaseModule = require('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }), insert: () => Promise.resolve({ error: null }) }) };
  }
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }), insert: () => Promise.resolve({ error: null }) }) };
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

  // Intel Hub Stavy
  const [intelFeed, setIntelFeed] = useState([]);
  const [intelLoading, setIntelLoading] = useState(false);
  
  // Draft & Preview Stavy
  const [draft, setDraft] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewMode, setPreviewMode] = useState('none'); // 'none' | 'card' | 'slug'
  const [previewDevice, setPreviewDevice] = useState('desktop');

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
    addLog('Spouštím sken Guru systémů...', 'info');
    try {
      const [postsRes, dealsRes, statsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
      ]);
      setData(prev => ({
        ...prev,
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        stats: { visits: statsRes.data?.value || 0 }
      }));
      addLog('Synchronizace s DB dokončena.', 'success');
    } catch (err) { addLog(`Chyba skenu: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  // --- AGREGÁTOR: FETCH TOM'S HARDWARE FEED ---
  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    addLog('Agreguji intel z Tom\'s Hardware (RSS)...', 'warning');
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.tomshardware.com/feeds.xml`);
      const resData = await res.json();
      if (resData.status === 'ok') {
        setIntelFeed(resData.items || []);
        addLog(`Agregováno ${resData.items.length} zpráv.`, 'success');
      } else throw new Error('RSS fail');
    } catch (err) { addLog(`Agregace selhala: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  // --- AI TRANSLATOR (GEMINI) ---
  const createDraftFromIntel = async (item) => {
    setIsTranslating(true);
    addLog(`AI připravuje český koncept: ${item.title.substring(0, 30)}...`, 'warning');
    
    try {
      const prompt = `Přelož a uprav tento článek z Tom's Hardware do češtiny v "Guru" stylu (profesionální, úderný, pro hráče). 
      Vrať čistý JSON s poli: 
      title_cs (chytlavý český nadpis), 
      seo_description_cs (meta popisek pro Google), 
      content_cs (článek v HTML formátu s h2 tagy, bez <html> tagu, min 3 odstavce),
      slug_cs (url-friendly český slug z nadpisu).
      
      ZDROJ:
      Název: ${item.title}
      Popis: ${item.description}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const result = await response.json();
      const aiData = JSON.parse(result.candidates[0].content.parts[0].text);

      setDraft({
        ...aiData,
        image_url: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000',
        original_link: item.link,
        created_at: new Date().toISOString(),
        type: 'hardware'
      });
      
      setPreviewMode('card');
      addLog('Koncept připraven k revizi.', 'success');
    } catch (err) {
      addLog(`AI Překlad selhal: ${err.message}`, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const publishDraft = async () => {
    if (!draft) return;
    addLog('Publikuji článek do databáze...', 'warning');
    try {
      const { error } = await supabase.from('posts').insert([{
        title: draft.title_cs,
        slug: draft.slug_cs,
        content: draft.content_cs,
        seo_description: draft.seo_description_cs,
        image_url: draft.image_url,
        created_at: draft.created_at,
        type: draft.type,
        is_fired: false
      }]);

      if (error) throw error;
      addLog('Článek byl úspěšně zveřejněn na webu! 🔥', 'success');
      setDraft(null);
      setPreviewMode('none');
      fetchAndScanData();
    } catch (err) {
      addLog(`Chyba publikace: ${err.message}`, 'error');
    }
  };

  const runApiTask = async (url, name) => {
    setActiveTab('terminal');
    addLog(`START: ${name}`, 'info');
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok) addLog(`OK: ${text.substring(0, 100)}...`, 'success');
      else addLog(`FAIL: ${res.status}`, 'error');
    } catch (err) { addLog(`FATAL: ${err.message}`, 'error'); }
    fetchAndScanData();
  };

  const markAsFired = async (id, table) => {
    try {
      await supabase.from(table).update({ is_fired: true }).eq('id', id);
      addLog(`Položka ${id} skryta.`, 'success');
      fetchAndScanData();
    } catch (e) { addLog(`Error: ${e.message}`, 'error'); }
  };

  const clearQueueItems = async (list, tabName) => {
    if (!confirm(`Vyčistit ${tabName}?`)) return;
    for (const item of list) {
        const table = (item.type === 'expected' || tabName === 'Plánovač' || tabName === 'Články') ? 'posts' : 'game_deals';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
    }
    addLog('Fronta vyčištěna.', 'success');
    fetchAndScanData();
  };

  const executeSocial = async (item, type) => {
    setActiveTab('terminal');
    addLog(`Odpaliště: ${item.title}`, 'warning');
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }) 
      });
      if (response.ok) {
        await supabase.from(type === 'deal' ? 'game_deals' : 'posts').update({ is_fired: true }).eq('id', item.id);
        addLog('Odesláno!', 'success');
        fetchAndScanData();
      } else throw new Error(response.status);
    } catch (err) { addLog(`Zlyhání: ${err.message}`, 'error'); }
  };

  useEffect(() => { if (isAuthenticated) { fetchAndScanData(); fetchIntelFeed(); } }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontWeight: 900 }}>GURU VELÍN</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Guru heslo..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '20px', textAlign: 'center' }} />
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
        .item-row { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 13px; overflow-y: auto; height: 100%; }
        iframe { width: 100%; height: 650px; border-radius: 20px; background: #fff; border: none; margin-top: 15px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #111318; padding: 20px; border-radius: 20px; border: 1px solid #333; text-align: center; }
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .hub-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; transition: 0.3s; position: relative; }
        .hub-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .hub-meta { font-size: 10px; color: #4b5563; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; }
        .hub-title { font-size: 14px; font-weight: 950; line-height: 1.4; color: #fff; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .action-btn-small { background: transparent; border: 1px solid #333; color: #9ca3af; padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
        .action-btn-small:hover { border-color: #10b981; color: #10b981; }
        
        /* GURU PREVIEW STYLES */
        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 200; display: flex; flex-direction: column; padding: 40px; overflow-y: auto; backdrop-filter: blur(10px); }
        .preview-content { max-width: 1200px; margin: 0 auto; width: 100%; position: relative; }
        .device-toggle { display: flex; gap: 10px; justify-content: center; margin-bottom: 30px; }
        .preview-window { background: #0a0b0d; border-radius: 30px; border: 4px solid #333; margin: 0 auto; overflow: hidden; transition: 0.3s; }
        .preview-window.mobile { width: 375px; height: 667px; }
        .preview-window.desktop { width: 100%; min-height: 800px; }
        
        /* SIMULOVANÝ GURU WEB STYL */
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px solid rgba(102, 252, 241, 0.2); width: 320px; }
        .mock-prose { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; }
        .mock-prose h2 { color: #66fcf1; font-weight: 950; margin: 2em 0 1em; }
      `}} />

      {/* --- PREVIEW SYSTEM OVERLAY --- */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div className="preview-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ width: 'auto', background: '#333' }}><ArrowLeft size={16}/> Zpět do Intel Hubu</button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setPreviewMode(previewMode === 'card' ? 'slug' : 'card')} className="sidebar-btn" style={{ width: 'auto', background: '#a855f7', color: '#fff' }}>
                        {previewMode === 'card' ? <Eye size={16}/> : <LayoutDashboard size={16}/>}
                        {previewMode === 'card' ? 'Přepnout na Detail (Slug)' : 'Přepnout na Kartu (HP)'}
                    </button>
                    <button onClick={publishDraft} className="sidebar-btn" style={{ width: 'auto', background: '#10b981', color: '#fff' }}><Check size={16}/> PUBLIKOVAT ČLÁNEK</button>
                </div>
            </div>

            <div className="device-toggle">
                <button onClick={() => setPreviewDevice('desktop')} style={{ padding: '10px 20px', background: previewDevice === 'desktop' ? '#eab308' : '#222', borderRadius: '10px', color: previewDevice === 'desktop' ? '#000' : '#fff' }}><Monitor size={18}/></button>
                <button onClick={() => setPreviewDevice('mobile')} style={{ padding: '10px 20px', background: previewDevice === 'mobile' ? '#eab308' : '#222', borderRadius: '10px', color: previewDevice === 'mobile' ? '#000' : '#fff' }}><Smartphone size={18}/></button>
            </div>

            <div className={`preview-window ${previewDevice}`}>
                {previewMode === 'card' ? (
                   <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                      <div className="mock-card">
                         <img src={draft.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                         <div style={{ padding: '20px' }}>
                            <span style={{ color: '#ff0000', fontSize: '10px', fontWeight: 'bold' }}>HW NOVINKA</span>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '10px 0' }}>{draft.title_cs}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#66fcf1', fontWeight: 'bold', fontSize: '13px' }}>
                                <span>Číst více →</span>
                            </div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#0a0b0d' }}>
                      <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '40px' }}>{draft.title_cs}</h1>
                      <img src={draft.image_url} style={{ width: '100%', borderRadius: '20px', marginBottom: '40px' }} />
                      <div className="mock-prose" dangerouslySetInnerHTML={{ __html: draft.content_cs }} />
                   </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#a855f7' }}>ADMIN</span></h2>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="Dashboard" color="#a855f7" />
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="Živý Terminál" color="#22c55e" />
          
          <div className="sidebar-header">CENTRÁLNÍ LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="Publikace & Plánovač" color="#f97316" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="HW Intel Hub" color="#eab308" />
          <SidebarItemUI id="tweaks-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label="Tweaky" color="#10b981" />
          <SidebarItemUI id="seo-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label="SEO & Překlady" color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label="Automatizace" color="#a855f7" />
          
          <div className="sidebar-header">OBSAH</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="Správa Slev" color="#ff0055" />
          <SidebarItemUI id="kal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CalendarDays />} label="Herní Kalendář" color="#3b82f6" href="/kalendar" />
        </nav>
        <div style={{ padding: '20px' }}>
          <button onClick={() => { sessionStorage.removeItem('guru_admin_auth'); setIsAuthenticated(false); }} className="action-btn-small" style={{ width: '100%', borderColor: '#ef444466' }}>ODHLÁSIT SE</button>
        </div>
      </aside>

      <main className="admin-main">
        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 className="tab-title">Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>{data.stats.visits}</h3><p style={{fontSize: '10px', color: '#444'}}>NÁVŠTĚVY</p></div>
              <div className="stat-card"><h3>{data.posts.length}</h3><p style={{fontSize: '10px', color: '#444'}}>ČLÁNKŮ V DB</p></div>
              <div className="stat-card"><h3>{data.deals.length}</h3><p style={{fontSize: '10px', color: '#444'}}>AKTIVNÍCH SLEV</p></div>
            </div>
            <div style={{ height: '300px' }}><div className="terminal-box">{consoleLogs.slice(-8).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}</div></div>
          </div>
        )}

        {/* --- TERMINÁL --- */}
        {activeTab === 'terminal' && <div style={{ height: '80vh' }}><div className="terminal-box">{consoleLogs.map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}<div ref={logEndRef} /></div></div>}

        {/* --- HARDWARE INTEL HUB (PŘEKLADAČ) --- */}
        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 className="tab-title" style={{ margin: 0 }}>HW Intel <span style={{ color: '#eab308' }}>Hub</span></h2>
              <button 
                onClick={fetchIntelFeed} 
                disabled={intelLoading}
                className="sidebar-btn active" 
                style={{ width: 'auto', padding: '10px 20px', background: '#eab308', color: '#000' }}
              >
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> SYNC TOM'S HARDWARE
              </button>
            </div>

            <div className="hub-grid">
              {intelFeed.map((item, i) => (
                <div key={i} className="hub-card">
                  {isTranslating && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}><RefreshCw className="animate-spin" color="#eab308"/></div>}
                  <span className="hub-meta">Tom's Hardware • {item.pubDate?.split(' ')[0]}</span>
                  <h3 className="hub-title">{item.title}</h3>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="action-btn-small" style={{ flex: 1, textAlign: 'center' }}>Zdroj</a>
                    <button 
                      onClick={() => createDraftFromIntel(item)} 
                      disabled={isTranslating}
                      className="action-btn-small" 
                      style={{ flex: 1.5, borderColor: '#eab308', color: '#eab308' }}
                    >
                        Vytvořit Koncept
                    </button>
                  </div>
                </div>
              ))}
              {intelFeed.length === 0 && !intelLoading && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', color: '#444' }}>SPUSTI SYNCHRONIZACI PRO NOVÁ DATA.</div>}
            </div>
          </div>
        )}

        {/* --- PUBLIKACE & PLÁNOVAČ --- */}
        {activeTab === 'pub-plan' && (
          <div className="fade-in">
            <h2 className="tab-title">Publikace & <span style={{ color: '#f97316' }}>Plánování</span></h2>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/executor`, 'Executor')} className="sidebar-btn" style={{ background: '#10b981', color: '#000', width: 'auto' }}>CRON EXECUTOR</button>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/planer`, 'Planner')} className="sidebar-btn" style={{ background: '#3b82f6', color: '#fff', width: 'auto' }}>CRON PLANNER</button>
              <button onClick={() => clearQueueItems([...unfiredPosts, ...unfiredDeals], 'Články')} className="sidebar-btn" style={{ background: '#ef4444', color: '#fff', width: 'auto' }}>SMAZAT STAROU FRONTU</button>
            </div>
            
            <div className="section-box">
              <h3>Executor Fronta</h3>
              {[...unfiredPosts, ...unfiredDeals].map(item => (
                <div key={item.id} className="item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><img src={item.image_url} style={{ width: '40px', height: '40px', borderRadius: '8px' }} /><span>{item.title}</span></div>
                  <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => markAsFired(item.id, item.title_en ? 'posts' : 'game_deals')} className="action-btn-small">Skrýt</button><button onClick={() => executeSocial(item, item.title_en ? 'post' : 'deal')} className="action-btn-small" style={{ color: '#10b981', borderColor: '#10b981' }}>Odpálit</button></div>
                </div>
              ))}
            </div>

            <div className="section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3>Plánovač Očekávaných</h3><button onClick={() => clearQueueItems(activeExpected, 'Plánovač')} className="action-btn-small" style={{ borderColor: '#ef4444' }}>Vyčistit vše</button></div>
              {activeExpected.map(game => (<div key={game.id} className="item-row"><span>{game.title}</span><button onClick={() => markAsFired(game.id, 'posts')} className="action-btn-small">Skrýt</button></div>))}
            </div>
          </div>
        )}

        {/* --- TWEAKY --- */}
        {activeTab === 'tweaks-hub' && (
          <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => runApiTask(`${BASE_URL}/api/cron/tweak-executor`, 'Tweak Exec')} style={{ marginBottom: '15px', width: 'fit-content', padding: '12px 25px', background: '#10b981', border: 'none', borderRadius: '12px' }}>SPUSTIT TWEAK CRON</button>
            <iframe src={`${BASE_URL}/admin/tweaky-generator`} />
          </div>
        )}

        {/* --- SEO & PŘEKLADY --- */}
        {activeTab === 'seo-hub' && (
          <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => runApiTask(`${BASE_URL}/api/generate-seo?secret=Wifik500`, 'SEO')} style={{ padding: '12px 20px', background: '#66fcf1', color: '#000', border: 'none', borderRadius: '10px' }}>GENERATE SEO ({data.stats.missingSeo})</button>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/slovnik?secret=Wifik500`, 'Slovník')} style={{ padding: '12px 20px', background: '#a855f7', border: 'none', borderRadius: '10px' }}>UPDATE SLOVNÍK ({data.stats.missingSlovnik})</button>
            </div>
            <iframe src={`${BASE_URL}/admin/en-fixer`} />
          </div>
        )}

        {/* --- AUTOMATIZACE --- */}
        {activeTab === 'automation' && (
          <div className="stats-grid">
            <div className="stat-card"><h3>TIP GENERATOR</h3><button onClick={() => runApiTask(`${BASE_URL}/api/generate-tip`, 'Tip Gen')} style={{ marginTop: '15px', padding: '10px', background: '#eab308', border: 'none', borderRadius: '8px' }}>SPUSTIT AI</button></div>
            <div className="stat-card"><h3>HLAVNÍ CRON</h3><button onClick={() => runApiTask(`${BASE_URL}/api/cron`, 'Main Cron')} style={{ marginTop: '15px', padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px' }}>SPUSTIT</button></div>
            <div className="stat-card"><h3>CHECK LIVE</h3><button onClick={() => runApiTask(`${BASE_URL}/api/check-live`, 'Check Live')} style={{ marginTop: '15px', padding: '10px', background: '#8b5cf6', border: 'none', borderRadius: '8px' }}>KONTROLA</button></div>
          </div>
        )}

        {/* --- SLEVY --- */}
        {activeTab === 'deals' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {data.deals.map(deal => (<div key={deal.id} style={{ background: '#111318', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333' }}><img src={deal.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover' }} /><div style={{ padding: '20px' }}><div style={{ fontWeight: 900, fontSize: '15px', textTransform: 'uppercase' }}>{deal.title}</div><div style={{ color: '#ff0055', fontWeight: 900, marginTop: '5px' }}>{deal.price_cs}</div></div></div>))}
          </div>
        )}
      </main>
    </div>
  );
}
