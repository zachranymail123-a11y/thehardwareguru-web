"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Cpu as CpuIcon, Gamepad2
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V8.13
 * Funkce: Multi-Source Intel (HW + Gaming), AI Viral Scoring, Deduplikace, Compact Grid 5x2, 
 * Integrated Publishing + Make.com Webhook (Screenshot Match), Full Czech Localization.
 */

// --- 🚀 GURU ENV ENGINE ---
const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  const envMap = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    'NEXT_PUBLIC_ADMIN_PASSWORD': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wifik500',
    'NEXT_PUBLIC_MAKE_WEBHOOK2_URL': process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL || '',
    'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL || ''
  };
  return envMap[key] || fallback;
};

// --- GURU ENGINE INIT ---
const initSupabase = () => {
  let createClient;
  try {
    const supabaseModule = require('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }), insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }) }) };
  }
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) return { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ single: () => Promise.resolve({ data: {} }) }) }), update: () => ({ eq: () => Promise.resolve({ error: null }) }), insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }) }) };
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

  const [data, setData] = useState({ posts: [], deals: [], stats: { visits: 0 } });

  // 🛡️ PERSISTENTNÍ INTEL SEZNAMY
  const [hwIntel, setHwIntel] = useState([]);
  const [gameIntel, setGameIntel] = useState([]);
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
      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        stats: { visits: statsRes.data?.value || 0 }
      });
      addLog('Guru databáze synchronizována.', 'success');
    } catch (err) { addLog(`Chyba skenu: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  // --- 🚀 GURU INTELLIGENCE: MULTI-SOURCE & AI VIRAL FILTER ---
  const fetchIntelFeed = async () => {
    const openAiKey = getEnv('OPENAI_API_KEY');
    if (!openAiKey) return addLog('CHYBÍ KLÍČ OPENAI!', 'error');
    
    setIntelLoading(true);
    addLog('Spouštím globální skener HW & Gaming trendů...', 'warning');
    
    const HW_FEEDS = [
      { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds.xml" },
      { name: "How-To Geek", url: "https://www.howtogeek.com/feed/" },
      { name: "AnandTech", url: "https://www.anandtech.com/rss" },
      { name: "GamersNexus", url: "https://gamersnexus.net/rss.xml" }
    ];

    const GAME_FEEDS = [
      { name: "IGN", url: "https://feeds.ign.com/ign/games-all" },
      { name: "GameSpot", url: "https://www.gamespot.com/feeds/news/" },
      { name: "VGC", url: "https://www.videogameschronicle.com/feed/" },
      { name: "Insider Gaming", url: "https://insider-gaming.com/feed/" }
    ];

    try {
      const fetchSet = async (list, type) => {
        const results = await Promise.all(list.map(f => 
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}&t=${Date.now()}`)
            .then(r => r.json())
            .then(d => (d.items || []).map(item => ({ ...item, source: f.name, intelType: type })))
        ));
        return results.flat();
      };

      const [rawHw, rawGame] = await Promise.all([fetchSet(HW_FEEDS, 'hw'), fetchSet(GAME_FEEDS, 'game')]);
      
      // 🛡️ DEDUPLIKACE: Kontrola proti DB
      const existingTitles = data.posts.map(p => p.title.toLowerCase().trim());
      const filterUnique = (items) => items.filter(item => !existingTitles.includes(item.title.toLowerCase().trim()));
      
      const uniqueHw = filterUnique(rawHw);
      const uniqueGame = filterUnique(rawGame);

      addLog(`Detekováno ${uniqueHw.length} nových HW a ${uniqueGame.length} herních novinek. AI zahajuje scoring...`, 'warning');

      const scoreItems = async (items) => {
        if (items.length === 0) return [];
        const batch = items.slice(0, 15);
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Jsi technologický analytik webu thehardwareguru.cz. Vyhodnoť virální potenciál (0-100) pro českou komunitu. Hledej trendy v hardware (NVIDIA, AMD, AI, CPU) i AAA herní hity. Vrať JSON { scores: [{ title, score }] }."
              },
              { role: "user", content: `Zanalyzuj: ${JSON.stringify(batch.map(i => i.title))}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const aiRes = await response.json();
        const content = aiRes.choices[0].message.content;
        const scores = JSON.parse(content).scores || [];
        return batch.map(item => ({
          ...item,
          viral_score: scores.find(s => s.title === item.title)?.score || 40
        })).sort((a, b) => b.viral_score - a.viral_score).slice(0, 10);
      };

      const [scoredHw, scoredGame] = await Promise.all([scoreItems(uniqueHw), scoreItems(uniqueGame)]);

      setHwIntel(scoredHw);
      setGameIntel(scoredGame);
      addLog('Scoring trendů dokončen. Radary jsou aktivní.', 'success');

    } catch (err) { addLog(`Chyba Enginu: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  // --- 🚀 GURU AI CONCEPT ENGINE (VŽDY ČEŠTINA) ---
  const createDraftFromIntel = async (item) => {
    const openAiKey = getEnv('OPENAI_API_KEY');
    if (!openAiKey) return;
    setIsTranslating(true);
    addLog(`AI připravuje český rozbor pro: ${item.title.substring(0, 30)}...`, 'warning');
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Jsi Hardware Guru. Expert na tech a gaming. Piš úderně, v ČEŠTINĚ, používej HTML (h2, p, strong, ul). Vždy vrať kompletní JSON v CZ i EN verzi." },
            { role: "user", content: `Vytvoř článek: ${item.title}. Zdroj: ${item.description}. POŽADAVEK: Vrať JSON s poli: title_cs, content_cs, seo_description_cs, slug_cs, title_en, content_en, seo_description_en, slug_en. Důležité: Všechny texty s příponou _cs MUSÍ být v perfektní češtině. Obsah min 400 slov.` }
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
        type: item.intelType === 'hw' ? 'hardware' : 'game',
        original_item: item
      });
      
      setPreviewMode('card');
      addLog('Český koncept připraven k revizi.', 'success');
    } catch (err) { addLog(`AI selhalo: ${err.message}`, 'error'); }
    finally { setIsTranslating(false); }
  };

  // --- 🚀 GURU PUBLISHING ENGINE (MAKE.COM MATCH) ---
  const publishAndSendToMake = async () => {
    if (!draft) return;
    const makeWebhook = getEnv('NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL');
    addLog('Zahajuji proces publikace a odesílání na Make...', 'warning');

    try {
      // 1. Zápis do Supabase
      const { data: dbData, error } = await supabase.from('posts').insert([{
        title: draft.title_cs, title_en: draft.title_en, slug: draft.slug_cs, slug_en: draft.slug_en,
        content: draft.content_cs, content_en: draft.content_en, seo_description: draft.seo_description_cs,
        seo_description_en: draft.seo_description_en, image_url: draft.image_url, created_at: draft.created_at,
        type: draft.type, is_fired: true 
      }]).select().single();

      if (error) throw error;

      // 2. Odeslání na Make (Přesná struktura dle screenshotu)
      if (makeWebhook) {
        const payload = {
          title: dbData.title,
          url: `${BASE_URL}/clanky/${dbData.slug}`,
          image_url: dbData.image_url,
          description: dbData.seo_description,
          type: dbData.type,
          fired_at: new Date().toISOString(),
          locale: 'cs',
          status: 'published_from_intel',
          id: dbData.id
        };

        const makeRes = await fetch(makeWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (makeRes.ok) addLog('Článek úspěšně odeslán na sociální scénář Make.com.', 'success');
        else throw new Error(`Make API Error: ${makeRes.status}`);
      }

      addLog('PUBLIKACE DOKONČENA! 🔥', 'success');
      
      // Vyřazení z feedu
      setHwIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setGameIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      
      setDraft(null); 
      setPreviewMode('none'); 
      fetchAndScanData();
    } catch (err) { addLog(`Kritická chyba při publikaci: ${err.message}`, 'error'); }
  };

  const runApiTask = (url, name) => {
    setActiveTab('terminal');
    addLog(`START: ${name}`, 'info');
    fetch(url).then(res => res.text()).then(txt => addLog(`ODPOVĚĎ: ${txt.substring(0,100)}`, 'success')).catch(e => addLog(`FAIL: ${e.message}`, 'error'));
  };

  useEffect(() => { if (isAuthenticated) { fetchAndScanData(); fetchIntelFeed(); } }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '30px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <Lock size={50} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1>GURU VELÍN</h1>
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
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 13px; overflow-y: auto; height: 100%; }
        
        /* 🚀 GURU COMPACT GRID 5x2 */
        .hub-compact-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 40px; }
        .compact-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; transition: 0.3s; position: relative; min-height: 160px; }
        .compact-card:hover { border-color: #eab308; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        .compact-badge { position: absolute; top: 6px; right: 6px; background: #ff0055; color: #fff; padding: 2px 5px; border-radius: 4px; font-size: 8px; font-weight: 950; z-index: 5; }
        .compact-title { font-size: 10px; font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; height: 48px; }
        .compact-source { font-size: 7px; color: #4b5563; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; }
        .compact-actions { margin-top: auto; display: flex; flex-direction: column; gap: 5px; }
        .compact-btn { width: 100%; padding: 4px; border-radius: 4px; font-size: 8px; font-weight: 900; text-transform: uppercase; cursor: pointer; text-align: center; border: 1px solid #333; background: transparent; color: #9ca3af; transition: 0.2s; }
        .compact-btn:hover { border-color: #eab308; color: #eab308; }
        .compact-btn-main { background: #eab30833; border-color: #eab30866; color: #eab308; }
        .compact-btn-main:hover { background: #eab308; color: #000; }

        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.98); z-index: 500; display: flex; flex-direction: column; padding: 30px; overflow-y: auto; backdrop-filter: blur(25px); }
        .preview-window { background: #0a0b0d; border-radius: 30px; border: 4px solid #333; margin: 0 auto; overflow: hidden; width: 100%; max-width: 1200px; min-height: 800px; }
        .preview-window.mobile { width: 375px; height: 667px; min-height: auto; }
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px solid rgba(102, 252, 241, 0.2); width: 320px; cursor: pointer; }
        .mock-prose { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; }
        .mock-prose h2 { color: #66fcf1; font-weight: 950; margin: 1.5em 0 0.5em; text-transform: uppercase; }
      `}} />

      {/* --- 🚀 GURU PREVIEW SYSTEM --- */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* 🛡️ NAVIGACE NÁHLEDU */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ width: 'auto', background: '#222', border: '1px solid #444', color: '#fff' }}>
                    <ArrowLeft size={16}/> ZPĚT DO VELÍNA
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setPreviewDevice('desktop')} style={{ padding: '12px', background: previewDevice === 'desktop' ? '#eab308' : '#222', borderRadius: '12px', border: 'none' }}><Monitor size={18}/></button>
                    <button onClick={() => setPreviewDevice('mobile')} style={{ padding: '12px', background: previewDevice === 'mobile' ? '#eab308' : '#222', borderRadius: '12px', border: 'none' }}><Smartphone size={18}/></button>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setPreviewMode(previewMode === 'card' ? 'slug' : 'card')} className="sidebar-btn" style={{ width: 'auto', background: '#a855f7', color: '#fff' }}>
                        {previewMode === 'card' ? 'ZOBRAZIT DETAIL' : 'ZOBRAZIT KARTU'}
                    </button>
                    <button onClick={publishAndSendToMake} className="sidebar-btn" style={{ width: 'auto', background: '#10b981', color: '#fff', border: '1px solid #10b981' }}>
                        <Check size={16}/> PUBLIKOVAT ČLÁNEK
                    </button>
                </div>
            </div>

            <div className={`preview-window ${previewDevice}`}>
                {previewMode === 'card' ? (
                   <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', background: '#0a0b0d', minHeight: '100%' }}>
                      <div className="mock-card" onClick={() => setPreviewMode('slug')}>
                         <img src={draft.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                         <div style={{ padding: '20px' }}>
                            <span style={{ color: '#ff0000', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{draft.type === 'hardware' ? 'TECH ROZBOR' : 'GAME NEWS'}</span>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', fontWeight: '900' }}>{draft.title_cs}</h3>
                            <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '12px', marginTop: '15px' }}>ČÍST VÍCE →</div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ padding: '60px 40px', maxWidth: '850px', margin: '0 auto', background: '#0a0b0d' }}>
                      <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px', lineHeight: 1.1 }}>{draft.title_cs}</h1>
                      <div style={{ color: '#444', fontWeight: '900', fontSize: '12px', marginBottom: '40px' }}>GURU ENGINE • {new Date().toLocaleDateString('cs-CZ')}</div>
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
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="TERMINÁL" color="#22c55e" />
          <div className="sidebar-header">LOGIKA</div>
          <SidebarItemUI id="pub-plan" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label="PUBLIKACE" color="#f97316" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="HW INTEL HUB" color="#eab308" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px', textTransform: 'uppercase' }}>SYSTÉMOVÝ <span style={{ color: '#a855f7' }}>STATUS</span></h2>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="stat-card" style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 950 }}>{data.stats.visits}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>NÁVŠTĚVY</p>
              </div>
              <div className="stat-card" style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '950' }}>{data.posts.length}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>ČLÁNKY</p>
              </div>
              <div className="stat-card" style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '950' }}>{data.deals.length}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>SLEVY</p>
              </div>
            </div>
          </div>
        )}

        {/* --- 🚀 HW INTEL HUB: HARDWARE & GAMING TREND ENGINE --- */}
        {activeTab === 'intel-hub' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <CpuIcon color="#eab308" size={32} />
                <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 950 }}>Intel <span style={{ color: '#eab308' }}>Hub</span></h2>
              </div>
              <button onClick={fetchIntelFeed} disabled={intelLoading} className="sidebar-btn active" style={{ width: 'auto', padding: '10px 25px', background: '#eab308', color: '#000' }}>
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> SKENOVAT TRENDY
              </button>
            </div>

            {/* SEKCE: HARDWARE INTEL (5x2) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderLeft: '4px solid #eab308', paddingLeft: '15px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 950, textTransform: 'uppercase', color: '#fff', margin: 0 }}>Hardware <span style={{ color: '#eab308' }}>Trend Radar</span></h3>
            </div>
            <div className="hub-compact-grid">
              {hwIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  {isTranslating && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><RefreshCw className="animate-spin" color="#
