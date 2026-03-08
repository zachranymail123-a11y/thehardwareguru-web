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

/**
 * GURU ULTIMATE COMMAND CENTER
 * Cesta: /admin
 * Jazyk: Čeština
 * Engine: OpenAI GPT-4o-mini + Supabase
 */

// --- 🚀 GURU ENV ENGINE: STATICKÉ MAPOVÁNÍ PRO NEXT.JS ---
const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;

  // Next.js bundler nahrazuje tyto hodnoty při buildu pouze při statickém přístupu
  const envMap = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_ADMIN_PASSWORD': process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    'NEXT_PUBLIC_MAKE_WEBHOOK2_URL': process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL
  };

  return envMap[key] || fallback;
};

// --- GURU ENGINE INIT (SUPABASE) ---
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
  const [draft, setDraft] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewMode, setPreviewMode] = useState('none');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const BASE_URL = 'https://www.thehardwareguru.cz';

  // --- AUTH LOGIKA ---
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

  // --- SYNC DATABÁZE ---
  const fetchAndScanData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    addLog('Skenuji Guru systémy...', 'info');
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
      addLog('Synchronizace s databází hotova.', 'success');
    } catch (err) { addLog(`Chyba skenu: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  // --- 🚀 GURU SYNC: RSS FEED ---
  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    addLog('Stahuji nejnovější novinky z Tom\'s Hardware...', 'warning');
    try {
      // Používáme rss2json s cache busterem pro čerstvá data
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.tomshardware.com/feeds.xml&t=${Date.now()}`);
      const resData = await res.json();
      if (resData.status === 'ok') {
        setIntelFeed(resData.items || []);
        addLog(`Načteno ${resData.items.length} novinek. Připraveno k analýze.`, 'success');
      } else throw new Error('RSS feed je momentálně nedostupný.');
    } catch (err) { addLog(`Chyba feedu: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  // --- 🚀 GURU AI: OPENAI (GPT-4o) ---
  const createDraftFromIntel = async (item) => {
    // 🚀 GURU FIX: Načítáme klíč z proměnné OPENAI_API_KEY staticky
    const openAiKey = getEnv('OPENAI_API_KEY');
    
    if (!openAiKey) {
      addLog('CHYBÍ KLÍČ! Nastav OPENAI_API_KEY v administraci Vercelu.', 'error');
      return;
    }

    setIsTranslating(true);
    addLog(`GPT-4o-mini připravuje český koncept: ${item.title.substring(0, 30)}...`, 'warning');
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Jsi Hardware Guru. Píšeš pro českou komunitu hráčů a geeků. Tvůj styl je profesionální, úderný a expertní. Vždy vracíš POUZE čistý JSON bez markdown značek."
            },
            {
              role: "user",
              content: `Přelož a uprav tento článek z Tom's Hardware do češtiny pro web thehardwareguru.cz. 
              Vrať JSON s poli: 
              title_cs (chytlavý český nadpis), 
              seo_description_cs (popis pro vyhledávače), 
              content_cs (článek v HTML formátu, použij h2 pro podnadpisy, odstavce, odrážky),
              slug_cs (url-friendly slug z nadpisu).
              
              ZDROJ:
              Název: ${item.title}
              Popis: ${item.description}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      const content = result.choices[0].message.content;
      // Vyčištění pro parsování (pro jistotu, i když response_format je json_object)
      const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const aiData = JSON.parse(cleanJson);

      setDraft({
        ...aiData,
        image_url: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000',
        original_link: item.link,
        created_at: new Date().toISOString(),
        type: 'hardware'
      });
      
      setPreviewMode('card');
      addLog('Koncept připraven k revizi v náhledovém okně.', 'success');
    } catch (err) {
      addLog(`AI fail: ${err.message}`, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const publishDraft = async () => {
    if (!draft) return;
    addLog('Zveřejňuji článek na web...', 'warning');
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
      addLog('ZVEŘEJNĚNO! Článek je nyní online. 🔥', 'success');
      setDraft(null); setPreviewMode('none');
      fetchAndScanData();
    } catch (err) { addLog(`Chyba publikace: ${err.message}`, 'error'); }
  };

  const runApiTask = (url, name) => {
    setActiveTab('terminal');
    addLog(`START: ${name}`, 'info');
    fetch(url).then(res => res.text()).then(txt => addLog(`OK: ${txt.substring(0,100)}`, 'success')).catch(e => addLog(`CHYBA: ${e.message}`, 'error'));
  };

  const markAsFired = async (id, table) => {
    await supabase.from(table).update({ is_fired: true }).eq('id', id);
    addLog(`Položka ${id} skryta.`, 'success');
    fetchAndScanData();
  };

  const clearQueueItems = async (list, tabName) => {
    if (!confirm(`Opravdu vyčistit: ${tabName}?`)) return;
    for (const item of list) {
        const table = (item.type === 'expected' || tabName === 'Plánovač' || tabName === 'Články') ? 'posts' : 'game_deals';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
    }
    addLog('Fronta vyčištěna.', 'success');
    fetchAndScanData();
  };

  const executeSocial = async (item, type) => {
    setActiveTab('terminal');
    addLog(`Odesílám na Make: ${item.title}`, 'warning');
    const webhook = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');
    fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }) })
      .then(() => { supabase.from(type === 'deal' ? 'game_deals' : 'posts').update({ is_fired: true }).eq('id', item.id); addLog('ODESLÁNO!', 'success'); fetchAndScanData(); })
      .catch(e => addLog(`Fail: ${e.message}`, 'error'));
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
        .action-btn-small { background: transparent; border: 1px solid #333; color: #9ca3af; padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
        .action-btn-small:hover { border-color: #10b981; color: #10b981; }
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .hub-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; transition: 0.3s; position: relative; }
        .hub-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .hub-title { font-size: 14px; font-weight: 950; color: #fff; margin-bottom: 15px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.96); z-index: 200; display: flex; flex-direction: column; padding: 40px; overflow-y: auto; backdrop-filter: blur(20px); }
        .preview-window { background: #0a0b0d; border-radius: 30px; border: 4px solid #333; margin: 0 auto; overflow: hidden; transition: 0.3s; width: 100%; max-width: 1200px; min-height: 800px; box-shadow: 0 50px 100px rgba(0,0,0,0.9); }
        .preview-window.mobile { width: 375px; height: 667px; min-height: auto; }
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px solid rgba(102, 252, 241, 0.2); width: 320px; }
        .mock-prose { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; }
        .mock-prose h2 { color: #66fcf1; font-weight: 950; margin: 1.5em 0 0.5em; text-transform: uppercase; }
        .device-toggle { display: flex; gap: 10px; justify-content: center; margin-bottom: 25px; }
        .device-toggle button { padding: 10px 20px; background: #222; border: 1px solid #444; border-radius: 10px; color: #fff; cursor: pointer; transition: 0.2s; }
        .device-toggle button.active { background: #eab308; color: #000; border-color: #eab308; font-weight: 900; }
        iframe { width: 100%; height: 650px; border-radius: 20px; background: #fff; border: none; margin-top: 15px; }
      `}} />

      {/* --- GURU PREVIEW SYSTEM --- */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ width: 'auto', background: '#333' }}><ArrowLeft size={16}/> ZPĚT DO VELÍNA</button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setPreviewMode(previewMode === 'card' ? 'slug' : 'card')} className="sidebar-btn" style={{ width: 'auto', background: '#a855f7', color: '#fff' }}>
                        {previewMode === 'card' ? <Eye size={16}/> : <LayoutDashboard size={16}/>}
                        {previewMode === 'card' ? 'ZOBRAZIT DETAIL ČLÁNKU' : 'ZOBRAZIT KARTU NA HP'}
                    </button>
                    <button onClick={publishDraft} className="sidebar-btn" style={{ width: 'auto', background: '#10b981', color: '#fff' }}><Check size={16}/> PUBLIKOVAT NA WEB</button>
                </div>
            </div>

            <div className="device-toggle">
                <button onClick={() => setPreviewDevice('desktop')} className={previewDevice === 'desktop' ? 'active' : ''}><Monitor size={18}/></button>
                <button onClick={() => setPreviewDevice('mobile')} className={previewDevice === 'mobile' ? 'active' : ''}><Smartphone size={18}/></button>
            </div>

            <div className={`preview-window ${previewDevice}`}>
                {previewMode === 'card' ? (
                   <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', background: '#0a0b0d', minHeight: '100%' }}>
                      <div className="mock-card">
                         <img src={draft.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                         <div style={{ padding: '20px' }}>
                            <span style={{ color: '#ff0000', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>HW NOVINKA</span>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', fontWeight: '900' }}>{draft.title_cs}</h3>
                            <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '12px' }}>ČÍST VÍCE →</div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ padding: '60px 40px', maxWidth: '850px', margin: '0 auto', background: '#0a0b0d' }}>
                      <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px' }}>{draft.title_cs}</h1>
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
          <div className="sidebar-header">LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="Publikace" color="#f97316" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="HW Intel Hub" color="#eab308" />
          <SidebarItemUI id="tweaks-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label="Tweaky" color="#10b981" />
          <SidebarItemUI id="seo-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label="SEO" color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label="Automatizace" color="#a855f7" />
          <div className="sidebar-header">OBSAH</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="Slevy" color="#ff0055" />
          <SidebarItemUI id="kal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CalendarDays />} label="Kalendář" color="#3b82f6" href="/kalendar" />
        </nav>
        <div style={{ padding: '20px' }}>
          <button onClick={() => { if(typeof window !== 'undefined') { sessionStorage.removeItem('guru_admin_auth'); setIsAuthenticated(false); } }} className="action-btn-small" style={{ width: '100%', borderColor: '#ef444466' }}>ODHLÁSIT</button>
        </div>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px', textTransform: 'uppercase' }}>STATUS</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>{data.stats.visits}</h3><p>NÁVŠTĚVY</p></div>
              <div className="stat-card"><h3>{data.posts.length}</h3><p>ČLÁNKY</p></div>
              <div className="stat-card"><h3>{data.deals.length}</h3><p>SLEVY</p></div>
            </div>
            <div style={{ height: '350px' }}><div className="terminal-box">{consoleLogs.slice(-10).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}</div></div>
          </div>
        )}

        {activeTab === 'terminal' && <div style={{ height: '80vh' }}><div className="terminal-box">{consoleLogs.map((log, i) => (<div key={i}>{log.msg}</div>))}<div ref={logEndRef} /></div></div>}

        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 950 }}>HW Intel Hub</h2>
              <button onClick={fetchIntelFeed} disabled={intelLoading} className="sidebar-btn active" style={{ width: 'auto', padding: '10px 25px', background: '#eab308', color: '#000' }}>
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> AKTUALIZOVAT
              </button>
            </div>
            <div className="hub-grid">
              {intelFeed.map((item, i) => (
                <div key={i} className="hub-card">
                  {isTranslating && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}><RefreshCw className="animate-spin" color="#eab308"/></div>}
                  <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: '900', marginBottom: '10px' }}>{item.pubDate?.split(' ')[0]}</span>
                  <h3 className="hub-title">{item.title}</h3>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="action-btn-small" style={{ flex: 1, textAlign: 'center' }}>ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={isTranslating} className="action-btn-small" style={{ flex: 1.8, borderColor: '#eab308', color: '#eab308' }}>PŘIPRAVIT KONCEPT</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pub-plan' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px' }}>PUBLIKACE</h2>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/executor`, 'Executor')} className="sidebar-btn" style={{ background: '#10b981', color: '#000', width: 'auto' }}>EXECUTOR</button>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/planer`, 'Planner')} className="sidebar-btn" style={{ background: '#3b82f6', color: '#fff', width: 'auto' }}>PLANNER</button>
            </div>
            <div className="section-box">
              <h3 style={{ color: '#10b981', marginBottom: '20px' }}>Čeká na sítě</h3>
              {[...unfiredPosts, ...unfiredDeals].map(item => (
                <div key={item.id} className="item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><img src={item.image_url} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /><span>{item.title}</span></div>
                  <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => markAsFired(item.id, item.title_en ? 'posts' : 'game_deals')} className="action-btn-small">SKRÝT</button><button onClick={() => executeSocial(item, item.title_en ? 'post' : 'deal')} className="action-btn-small btn-fire">ODPÁLIT</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tweaks-hub' && <iframe src={`${BASE_URL}/admin/tweaky-generator`} />}
        {activeTab === 'seo-hub' && <iframe src={`${BASE_URL}/admin/en-fixer`} />}
        {activeTab === 'automation' && (
          <div className="stats-grid">
            <div className="stat-card"><h3>TIP GEN</h3><button onClick={() => runApiTask(`${BASE_URL}/api/generate-tip`, 'Tip Gen')} style={{ marginTop: '15px', padding: '12px', background: '#eab308', border: 'none', borderRadius: '8px' }}>START AI</button></div>
            <div className="stat-card"><h3>MAIN CRON</h3><button onClick={() => runApiTask(`${BASE_URL}/api/cron`, 'Main Cron')} style={{ marginTop: '15px', padding: '12px', background: '#ef4444', border: 'none', borderRadius: '8px' }}>START</button></div>
          </div>
        )}
      </main>
    </div>
  );
}
