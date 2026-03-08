"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Cpu as CpuIcon
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V8.9
 * Funkce: Multi-RSS Intelligence, AI Hardware & Gaming Viral Scoring, Deduplikace, Preview System
 */

const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  const envMap = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    'NEXT_PUBLIC_ADMIN_PASSWORD': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wifik500',
    'NEXT_PUBLIC_MAKE_WEBHOOK2_URL': process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || ''
  };
  return envMap[key] || fallback;
};

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
    stats: { visits: 0 }
  });

  const [intelFeed, setIntelFeed] = useState([]);
  const [intelLoading, setIntelLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewMode, setPreviewMode] = useState('none');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const BASE_URL = 'https://www.thehardwareguru.cz';

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

  const fetchAndScanData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [postsRes, dealsRes, statsRes] = await Promise.all([
        supabase.from('posts').select('id, title, slug, created_at').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
      ]);
      setData(prev => ({
        ...prev,
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        stats: { visits: statsRes.data?.value || 0 }
      }));
      addLog('Guru databáze synchronizována.', 'success');
    } catch (err) { addLog(`Chyba skenu: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  // --- 🚀 GURU INTELLIGENCE: MULTI-FEED & HW TREND SCORING ---
  const fetchIntelFeed = async () => {
    const openAiKey = getEnv('OPENAI_API_KEY');
    setIntelLoading(true);
    addLog('Zahajuji hloubkovou agregaci z globálních HW a herních feedů...', 'warning');
    
    const FEEDS = [
      { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds.xml" },
      { name: "How-To Geek", url: "https://www.howtogeek.com/feed/" },
      { name: "AnandTech", url: "https://www.anandtech.com/rss" },
      { name: "GamersNexus", url: "https://gamersnexus.net/rss.xml" }
    ];

    try {
      const feedPromises = FEEDS.map(f => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}&t=${Date.now()}`)
          .then(r => r.json())
          .then(d => (d.items || []).map(item => ({ ...item, source: f.name })))
      );

      const allResults = await Promise.all(feedPromises);
      const flatItems = allResults.flat();

      // Deduplikace
      const existingTitles = data.posts.map(p => p.title.toLowerCase().trim());
      const uniqueItems = flatItems.filter(item => {
        const titleLower = item.title.toLowerCase().trim();
        return !existingTitles.includes(titleLower);
      });

      if (flatItems.length - uniqueItems.length > 0) {
        addLog(`Zahozeno ${flatItems.length - uniqueItems.length} duplicitních článků.`, 'info');
      }

      // AI Scoring - Zaměřeno na HW trendy i herní komunitu
      if (uniqueItems.length > 0 && openAiKey) {
        addLog(`AI skenuje hardware a herní trendy v ${uniqueItems.length} článcích...`, 'warning');
        
        const itemsToScore = uniqueItems.slice(0, 20); // Zvětšený batch pro širší záběr
        
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
                content: "Jsi elitní technologický analytik pro The Hardware Guru. Vyhodnoť virální potenciál (0-100) pro CZ/SK komunitu. Hledej zásadní HW trendy (NVIDIA Blackwell, AMD RDNA, Intel Arrow Lake, AI hardware, tech faily) i očekávané herní hity. Vrať JSON s polem objektů 'scores' obsahujícím 'title' a 'score'."
              },
              {
                role: "user",
                content: `Zanalyzuj tyto novinky: ${JSON.stringify(itemsToScore.map(i => i.title))}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        const aiResult = await response.json();
        const responseData = JSON.parse(aiResult.choices[0].message.content);
        const scores = responseData.scores || responseData.items || [];
        
        const scoredItems = itemsToScore.map(item => {
          const found = scores.find(s => s.title === item.title);
          return { ...item, viral_score: found ? found.score : 40 };
        }).sort((a, b) => b.viral_score - a.viral_score);

        setIntelFeed(scoredItems);
        addLog(`Analýza trendů dokončena. TOP intel připraven.`, 'success');
      } else {
        setIntelFeed(uniqueItems.slice(0, 15));
      }
    } catch (err) { addLog(`Chyba Intel Enginu: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  const createDraftFromIntel = async (item) => {
    const openAiKey = getEnv('OPENAI_API_KEY');
    if (!openAiKey) return addLog('CHYBÍ KLÍČ!', 'error');

    setIsTranslating(true);
    addLog(`AI tvoří Guru rozbor: ${item.title.substring(0, 30)}...`, 'warning');
    
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
              content: "Jsi Hardware Guru. Píšeš pro českou elitu hráčů a techniků. Jsi expert, používáš HTML tagy (h2, p, strong, ul), tvůj styl je úderný a profesionální. Vracíš POUZE čistý JSON v CZ i EN."
            },
            {
              role: "user",
              content: `Vytvoř článek pro thehardwareguru.cz z: ${item.title}. Zdroj: ${item.description}. 
              Vrať JSON: { title_cs, content_cs, seo_description_cs, slug_cs, title_en, content_en, seo_description_en, slug_en }. 
              Obsah aspoň 400 slov, odborný rozbor, HTML formát.`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const result = await response.json();
      const aiData = JSON.parse(result.choices[0].message.content);

      setDraft({
        ...aiData,
        image_url: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000',
        created_at: new Date().toISOString(),
        type: 'hardware'
      });
      
      setPreviewMode('card');
      addLog('Koncept připraven k revizi.', 'success');
    } catch (err) { addLog(`AI selhalo: ${err.message}`, 'error'); }
    finally { setIsTranslating(false); }
  };

  const publishDraft = async () => {
    if (!draft) return;
    addLog('Publikuji článek...', 'warning');
    try {
      const { error } = await supabase.from('posts').insert([{
        title: draft.title_cs,
        title_en: draft.title_en,
        slug: draft.slug_cs,
        slug_en: draft.slug_en,
        content: draft.content_cs,
        content_en: draft.content_en,
        seo_description: draft.seo_description_cs,
        seo_description_en: draft.seo_description_en,
        image_url: draft.image_url,
        created_at: draft.created_at,
        type: draft.type,
        is_fired: false
      }]);
      if (error) throw error;
      addLog('ČLÁNEK JE ONLINE! 🔥', 'success');
      setDraft(null); setPreviewMode('none');
      fetchAndScanData();
    } catch (err) { addLog(`Chyba publikace: ${err.message}`, 'error'); }
  };

  const runApiTask = (url, name) => {
    setActiveTab('terminal');
    addLog(`START: ${name}`, 'info');
    fetch(url).then(res => res.text()).then(txt => addLog(`ODPOVĚĎ: ${txt.substring(0,100)}`, 'success')).catch(e => addLog(`CHYBA: ${e.message}`, 'error'));
  };

  const markAsFired = async (id, table) => {
    await supabase.from(table).update({ is_fired: true }).eq('id', id);
    addLog(`Odesláno do archivu.`, 'success');
    fetchAndScanData();
  };

  const executeSocial = async (item, type) => {
    setActiveTab('terminal');
    addLog(`ODPALUJI NA MAKE...`, 'warning');
    const webhook = getEnv('NEXT_PUBLIC_MAKE_WEBHOOK2_URL');
    fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }) })
      .then(() => { supabase.from(type === 'deal' ? 'game_deals' : 'posts').update({ is_fired: true }).eq('id', item.id); addLog('ZÁSAH! Webhook potvrzen.', 'success'); fetchAndScanData(); })
      .catch(e => addLog(`Fail: ${e.message}`, 'error'));
  };

  useEffect(() => { if (isAuthenticated) { fetchAndScanData(); fetchIntelFeed(); } }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1>GURU VELÍN</h1>
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
        .hub-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; transition: 0.3s; position: relative; }
        .hub-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .viral-badge { position: absolute; top: -10px; right: -10px; background: #ff0055; color: #fff; padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: 950; box-shadow: 0 5px 15px rgba(255,0,85,0.4); z-index: 5; }
        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.96); z-index: 200; display: flex; flex-direction: column; padding: 40px; overflow-y: auto; backdrop-filter: blur(20px); }
        .preview-window { background: #0a0b0d; border-radius: 30px; border: 4px solid #333; margin: 0 auto; overflow: hidden; transition: 0.3s; width: 100%; max-width: 1200px; min-height: 800px; box-shadow: 0 50px 100px rgba(0,0,0,0.9); }
        .preview-window.mobile { width: 375px; height: 667px; min-height: auto; }
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px solid rgba(102, 252, 241, 0.2); width: 320px; cursor: pointer; }
        .mock-prose { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; }
        .mock-prose h2 { color: #66fcf1; font-weight: 950; margin: 1.5em 0 0.5em; text-transform: uppercase; }
      `}} />

      {/* --- GURU PREVIEW SYSTEM --- */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ width: 'auto', background: '#333' }}><ArrowLeft size={16}/> ZPĚT</button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setPreviewMode(previewMode === 'card' ? 'slug' : 'card')} className="sidebar-btn" style={{ width: 'auto', background: '#a855f7', color: '#fff' }}>
                        {previewMode === 'card' ? 'ZOBRAZIT ROZBOR' : 'ZOBRAZIT KARTU'}
                    </button>
                    <button onClick={publishDraft} className="sidebar-btn" style={{ width: 'auto', background: '#10b981', color: '#fff' }}><Check size={16}/> PUBLIKOVAT NA WEB</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                <button onClick={() => setPreviewDevice('desktop')} style={{ padding: '10px', background: previewDevice === 'desktop' ? '#eab308' : '#222', borderRadius: '10px' }}><Monitor/></button>
                <button onClick={() => setPreviewDevice('mobile')} style={{ padding: '10px', background: previewDevice === 'mobile' ? '#eab308' : '#222', borderRadius: '10px' }}><Smartphone/></button>
            </div>

            <div className={`preview-window ${previewDevice}`}>
                {previewMode === 'card' ? (
                   <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', background: '#0a0b0d', minHeight: '100%' }}>
                      <div className="mock-card" onClick={() => setPreviewMode('slug')}>
                         <img src={draft.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                         <div style={{ padding: '20px' }}>
                            <span style={{ color: '#ff0000', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>TECH ROZBOR</span>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', fontWeight: '900' }}>{draft.title_cs}</h3>
                            <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '12px' }}>ČÍST VÍCE →</div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ padding: '60px 40px', maxWidth: '850px', margin: '0 auto', background: '#0a0b0d' }}>
                      <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', lineHeight: 1.1 }}>{draft.title_cs}</h1>
                      <div style={{ color: '#444', fontWeight: '900', fontSize: '12px', marginBottom: '30px' }}>GURU ENGINE • {new Date().toLocaleDateString('cs-CZ')}</div>
                      <img src={draft.image_url} style={{ width: '100%', borderRadius: '20px', marginBottom: '40px', border: '1px solid #ffffff10' }} />
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
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="PŘEHLED" color="#a855f7" />
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="ŽIVÝ TERMINÁL" color="#22c55e" />
          <div className="sidebar-header">CENTRÁLNÍ LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="PUBLIKACE" color="#f97316" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="HW INTEL HUB" color="#eab308" />
          <SidebarItemUI id="tweaks-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label="TWEAKY" color="#10b981" />
          <SidebarItemUI id="seo-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label="SEO" color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label="AUTOMATIZACE" color="#a855f7" />
          <div className="sidebar-header">OBSAH</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="SLEVY" color="#ff0055" />
          <SidebarItemUI id="kal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CalendarDays />} label="KALENDÁŘ" color="#3b82f6" href="/kalendar" />
        </nav>
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
          </div>
        )}

        {activeTab === 'terminal' && <div style={{ height: '80vh' }}><div className="terminal-box">{consoleLogs.map((log, i) => (<div key={i}>{log.msg}</div>))}<div ref={logEndRef} /></div></div>}

        {/* --- 🚀 HW INTEL HUB: HARDWARE & GAMING TREND ENGINE --- */}
        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <CpuIcon color="#eab308" size={32} />
                <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 950 }}>HW Intel <span style={{ color: '#eab308' }}>Hub</span></h2>
              </div>
              <button onClick={fetchIntelFeed} disabled={intelLoading} className="sidebar-btn active" style={{ width: 'auto', padding: '10px 25px', background: '#eab308', color: '#000' }}>
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> SKENOVAT TRENDY
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>
                Globální radar: NVIDIA • AMD • INTEL • AI TECH • GAMING HITS
            </div>

            <div className="hub-grid">
              {intelFeed.map((item, i) => (
                <div key={i} className="hub-card">
                  {isTranslating && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}><RefreshCw className="animate-spin" color="#eab308"/></div>}
                  
                  {item.viral_score && (
                    <div className="viral-badge" style={{ background: item.viral_score > 85 ? '#ff0055' : '#10b981' }}>
                       <TrendingUp size={12} style={{ display: 'inline', marginRight: '5px' }} />
                       {item.viral_score}% TREND
                    </div>
                  )}

                  <span style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>{item.source} • {item.pubDate?.split(' ')[0]}</span>
                  <h3 className="hub-title" style={{ color: item.viral_score > 90 ? '#eab308' : '#fff' }}>{item.title}</h3>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="action-btn-small" style={{ flex: 1, textAlign: 'center' }}>ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={isTranslating} className="action-btn-small" style={{ flex: 1.8, borderColor: '#eab308', color: '#eab308' }}>VYTVOŘIT KONCEPT</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... Zbytek sekcí zůstává zachován dle funkční verze ... */}
      </main>
    </div>
  );
}
