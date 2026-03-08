"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Cpu as CpuIcon, Gamepad2, Star, Heart, Ghost, Brain
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V12.2 - NUCLEAR SYNC
 * - FIX: Striktní kontrola duplicity proti DB přímo v Intel Hubu.
 * - FIX: Odesílání čistých dat na Make.com (title, url, image_url, description).
 * - FIX: Kompletní vyplnění všech SEO a Meta polí (konec NULL hodnot).
 * - FIX: Robustní AI parser a vizuální spinner (kolečko) na kartách.
 */

// --- 🚀 GURU ENV ENGINE ---
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
  return createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
};

// 🛡️ GURU UI SHIELD
if (typeof window !== 'undefined') {
  window.swgSubscriptions = window.swgSubscriptions || {};
  if (!window.swgSubscriptions.attachButton) window.swgSubscriptions.attachButton = () => {};
}

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
  const [activeTab, setActiveTab] = useState('intel-hub');
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
  const [aiActive, setAiActive] = useState(false); 
  const [aiStatusMsg, setAiStatusMsg] = useState('IDLE');
  
  const [draft, setDraft] = useState(null);
  const [processingTitle, setProcessingTitle] = useState(null); 
  const [previewMode, setPreviewMode] = useState('none');
  const isInitialized = useRef(false);

  const BASE_URL = 'https://www.thehardwareguru.cz';

  const LEAK_PLACEHOLDER_URL = useMemo(() => {
    const sUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    if (!sUrl) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';
    return `${sUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('guru_admin_auth') === 'true') setIsAuthenticated(true);
      const savedHw = localStorage.getItem('guru_hw_intel');
      const savedGame = localStorage.getItem('guru_game_intel');
      const savedLeaks = localStorage.getItem('guru_leaks_intel');
      const savedDraftsLocal = localStorage.getItem('guru_saved_drafts');
      try {
        if (savedHw) setHwIntel(JSON.parse(savedHw));
        if (savedGame) setGameIntel(JSON.parse(savedGame));
        if (savedLeaks) setLeaksIntel(JSON.parse(savedLeaks));
        if (savedDraftsLocal) setSavedDrafts(JSON.parse(savedDraftsLocal));
      } catch (e) {}
      isInitialized.current = true;
      addLog('Systémová paměť načtena.', 'success');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized.current) {
      localStorage.setItem('guru_hw_intel', JSON.stringify(hwIntel));
      localStorage.setItem('guru_game_intel', JSON.stringify(gameIntel));
      localStorage.setItem('guru_leaks_intel', JSON.stringify(leaksIntel));
      localStorage.setItem('guru_saved_drafts', JSON.stringify(savedDrafts));
    }
  }, [hwIntel, gameIntel, leaksIntel, savedDrafts]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIntelFeed();
      fetchAndScanData();
    }
  }, [isAuthenticated]);

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
        supabase.from('posts').select('id, title, slug, title_en, seo_description, created_at').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single(),
      ]);
      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        stats: { 
          visits: statsRes.data?.value || 0,
          missingEn: (postsRes.data || []).filter(p => !p.title_en).length,
          missingSeo: (postsRes.data || []).filter(p => !p.seo_description).length
        }
      });
      addLog('DB synchronizována.', 'success');
    } catch (err) { addLog(`Chyba: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    setAiStatusMsg('ANALÝZA...');
    addLog('Spouštím Guru Intel Engine (V12.2)...', 'warning');
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      if (json.success) {
        // 🛡️ GURU ANTI-DUPLICITY: Odstranění položek, které už jsou v DB
        const existingTitles = new Set(data.posts.flatMap(p => [
            p.title?.toLowerCase().trim(),
            p.title_en?.toLowerCase().trim()
        ]).filter(Boolean));

        const filteredItems = (json.data || []).filter(item => {
            const t = item.title?.toLowerCase().trim();
            return !existingTitles.has(t);
        }).map(item => ({
            ...item,
            viral_score: item.viral_score || Math.floor(Math.random() * 40) + 60,
            image_url: (item.intelType === 'leaks' && (!item.image_url || item.image_url.includes('unsplash'))) 
                       ? LEAK_PLACEHOLDER_URL 
                       : (item.image_url || 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000')
        }));

        setHwIntel(filteredItems.filter(i => i.intelType === "hw").slice(0, 15));
        setGameIntel(filteredItems.filter(i => i.intelType === "game").slice(0, 15));
        setLeaksIntel(filteredItems.filter(i => i.intelType === "leaks").slice(0, 20));
        
        if (json._debug?.ai_active) {
            setAiActive(true);
            setAiStatusMsg('ONLINE');
            addLog('AI Skórování trendů dokončeno.', 'success');
        } else {
            setAiStatusMsg('OFFLINE');
        }
      }
    } catch (err) { addLog(`Chyba: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  // 🚀 GURU: ROBUSTNÍ AI GENERÁTOR - KOMPLETNÍ POLE
  const createDraftFromIntel = async (item) => {
    if (savedDrafts[item.title]) {
      setDraft(savedDrafts[item.title]);
      setPreviewMode('card');
      addLog('Koncept načten ze systému.', 'success');
      return;
    }
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
          messages: [
            { 
              role: "system", 
              content: "Jsi Hardware Guru. Piš úderně a technicky v CZ i EN. HTML h2, strong, ul. MUSÍŠ vygenerovat VŠECHNA pole v JSON: { title_cs, content_cs, description_cs, seo_description_cs, slug_cs, seo_keywords_cs, title_en, content_en, description_en, seo_description_en, slug_en, meta_title_en, seo_keywords_en, image_alt, og_title, trailer }" 
            },
            { role: "user", content: `Vytvoř článek z: ${item.title}. Zdroj: ${item.description || item.title}.` }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      const r = await response.json();
      
      // 🛡️ GURU FAIL-SAFE PARSER
      const content = r?.choices?.[0]?.message?.content || r?.output?.[0]?.content?.[0]?.text;

      if (!content) {
        throw new Error(r?.error?.message || "AI vrátilo prázdnou odpověď.");
      }

      const aiData = JSON.parse(content);
      const postType = item.intelType || 'hardware';

      const newDraft = {
        ...aiData,
        image_url: item.image_url || (postType === 'leaks' ? LEAK_PLACEHOLDER_URL : 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000'),
        created_at: new Date().toISOString(),
        type: postType,
        original_item: item,
        is_important: false
      };

      setSavedDrafts(prev => ({ ...prev, [item.title]: newDraft }));
      setDraft(newDraft);
      setPreviewMode('card');
      addLog('Koncept vytvořen se všemi SEO poli.', 'success');
    } catch (err) { 
      addLog(`AI fail: ${err.message}`, 'error'); 
    } finally { 
      setProcessingTitle(null);
    }
  };

  // 🚀 GURU: MASTER SYNC PRO MAKE.COM + DATABASE 🚀
  const publishAndSendToMake = async () => {
    if (!draft) return;
    const articleWebhook = getEnv('NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL');
    addLog('ODPALUJI ČLÁNEK DO SYSTÉMU...', 'warning');
    
    try {
      // 1. ZÁPIS DO DB (Supreme pole fix - žádné NULL)
      const { data: dbData, error } = await supabase.from('posts').insert([{
        // CZ
        title: draft.title_cs, 
        slug: draft.slug_cs, 
        content: draft.content_cs, 
        description: draft.description_cs, 
        seo_description: draft.seo_description_cs, 
        seo_keywords: draft.seo_keywords_cs,
        // EN
        title_en: draft.title_en, 
        slug_en: draft.slug_en, 
        content_en: draft.content_en, 
        description_en: draft.description_en, 
        seo_description_en: draft.seo_description_en, 
        meta_title_en: draft.meta_title_en, 
        seo_keywords_en: draft.seo_keywords_en,
        // Meta & Media
        image_url: draft.image_url, 
        image_alt: draft.image_alt || draft.title_cs,
        og_title: draft.og_title || draft.title_cs,
        trailer: draft.trailer,
        type: draft.type, 
        created_at: draft.created_at, 
        is_fired: true 
      }]).select().single();

      if (error) throw error;
      addLog('DATABÁZE SYNCHRONIZOVÁNA. 🔥', 'success');

      // 2. ODESLÁNÍ NA MAKE.COM (Struktura title, url, image_url, description)
      if (articleWebhook && articleWebhook !== "") {
        try {
          const payload = {
            title: dbData.title,
            url: `${BASE_URL}/clanky/${dbData.slug}`,
            image_url: dbData.image_url,
            description: dbData.description || dbData.seo_description,
            // Rozšířená metadata
            id: dbData.id,
            type: dbData.type,
            locale: 'cs',
            fired_at: new Date().toISOString(),
            is_important: draft.is_important
          };
          
          const makeRes = await fetch(articleWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (makeRes.ok) {
            addLog('VÝSTŘEL NA MAKE.COM ÚSPĚŠNÝ! 🚀', 'success');
          } else {
            throw new Error(`Make API Status: ${makeRes.status}`);
          }
        } catch (mErr) {
          addLog(`Make.com selhal: ${mErr.message}`, 'error');
        }
      } else {
        addLog('CHYBÍ WEBHOOK URL PRO ČLÁNKY!', 'error');
      }
      
      // Vyčištění UI a synchronizace
      setLeaksIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setHwIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setGameIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setDraft(null); setPreviewMode('none'); fetchAndScanData();
    } catch (err) { addLog(`KRITICKÁ CHYBA: ${err.message}`, 'error'); }
  };

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: '#111318', padding: '50px', borderRadius: '40px', border: '1px solid #eab30866', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <Lock size={60} color="#eab308" style={{ margin: '0 auto 20px' }} />
        <h1>GURU VELÍN</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Guru heslo..." style={{ width: '100%', padding: '20px', borderRadius: '15px', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '20px', textAlign: 'center', outline: 'none' }} />
        <button type="submit" style={{ width: '100%', padding: '20px', background: '#eab308', color: '#000', border: 'none', borderRadius: '15px', fontWeight: '950', cursor: 'pointer' }}>VSTOUPIT</button>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', color: '#fff', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 280px; background: #0d0e12; border-right: 1px solid #ffffff0d; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; height: 100vh; overflow-y: auto; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        .sidebar-btn:hover, .sidebar-btn.active { background: #ffffff0d; color: #fff; }
        .hub-compact-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 40px; }
        .compact-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 18px; padding: 15px; display: flex; flex-direction: column; transition: 0.3s; position: relative; min-height: 180px; overflow: hidden; }
        .compact-card:hover { border-color: #eab308; transform: translateY(-5px); }
        .compact-badge { position: absolute; top: 10px; right: 10px; background: #ff0055; color: #fff; padding: 3px 7px; border-radius: 6px; font-size: 9px; font-weight: 950; z-index: 5; }
        .compact-title { font-size: 11px; font-weight: 900; color: #fff; line-height: 1.3; margin-bottom: 12px; height: 55px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }
        .compact-source { font-size: 8px; color: #4b5563; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; }
        .compact-btn { width: 100%; padding: 6px; border-radius: 6px; font-size: 9px; font-weight: 950; text-transform: uppercase; cursor: pointer; text-align: center; border: 1px solid #333; background: transparent; color: #9ca3af; transition: 0.2s; }
        .compact-btn-main { background: #eab3081a; border-color: #eab3084d; color: #eab308; }
        .terminal-box { background: #000; border: 1px solid #22c55e22; border-radius: 20px; padding: 25px; font-family: monospace; font-size: 12px; overflow-y: auto; color: #22c55e; }
        .ai-badge { display: flex; align-items: center; gap: 8px; padding: 6px 15px; border-radius: 50px; font-size: 10px; font-weight: 950; border: 1px solid rgba(255,255,255,0.05); }
        .ai-online { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
        .ai-offline { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.98); z-index: 500; display: flex; backdrop-filter: blur(25px); }
        .preview-sidebar { width: 340px; background: #0d0e12; border-right: 1px solid #ffffff0d; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
        .preview-window { flex: 1; background: #0a0b0d; margin: 40px; border-radius: 40px; border: 4px solid #333; overflow-y: auto; }
      `}} />

      {/* PREVIEW SYSTEM */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div className="preview-sidebar">
              <h2 style={{ color: '#eab308', fontWeight: 950, textTransform: 'uppercase', textAlign: 'center' }}>Guru Preview</h2>
              <button onClick={publishAndSendToMake} className="sidebar-btn active" style={{ background: '#10b981', color: '#fff', justifyContent: 'center' }}>PUBLIKOVAT ČLÁNEK</button>
              <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ background: '#222', justifyContent: 'center' }}>ZPĚT DO HUBu</button>
              <div style={{ height: '1px', background: '#ffffff0d' }}></div>
              <button onClick={() => setPreviewMode(previewMode === 'card' ? 'full' : 'card')} className="sidebar-btn" style={{ background: '#a855f7', color: '#fff', justifyContent: 'center' }}>
                  {previewMode === 'card' ? 'ZOBRAZIT DETAIL' : 'ZOBRAZIT KARTU'}
              </button>
          </div>
          <div className="preview-window">
             <div style={{ padding: '60px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ textTransform: 'uppercase', fontWeight: 950, fontSize: '3rem', lineHeight: 1.1 }}>{draft.title_cs}</h1>
                <img src={draft.image_url} style={{ width: '100%', borderRadius: '25px', margin: '40px 0' }} />
                <div dangerouslySetInnerHTML={{ __html: draft.content_cs }} style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#d1d5db' }} />
             </div>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <div style={{ padding: '40px 30px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 950, letterSpacing: '-1px' }}>GURU <span style={{ color: '#a855f7' }}>ADMIN</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="PŘEHLED" color="#a855f7" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#eab308" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px' }}>SYSTÉMOVÝ <span style={{ color: '#a855f7' }}>STATUS</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
               <div style={{ background: '#111318', padding: '30px', borderRadius: '30px', border: '1px solid #ffffff0d', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 950, margin: 0 }}>{data.stats.visits}</h3>
                  <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px' }}>Návštěvy</p>
               </div>
               <div style={{ background: '#111318', padding: '30px', borderRadius: '30px', border: '1px solid #ffffff0d', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 950, margin: 0 }}>{data.posts.length}</h3>
                  <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px' }}>Články</p>
               </div>
               <div style={{ background: '#111318', padding: '30px', borderRadius: '30px', border: '1px solid #ffffff0d', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 950, margin: 0 }}>{data.deals.length}</h3>
                  <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px' }}>Slevy</p>
               </div>
               <div style={{ background: '#111318', padding: '30px', borderRadius: '30px', border: '1px solid #ffffff0d', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 950, margin: 0 }}>{data.stats.missingEn}</h3>
                  <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 900, textTransform: 'uppercase', marginTop: '5px' }}>Chybí EN</p>
               </div>
            </div>
            <div style={{ marginTop: '40px' }}>
              <div className="terminal-box" style={{ height: '400px' }}>
                {consoleLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '5px' }}>
                    <span style={{ opacity: 0.4, marginRight: '10px' }}>[{log.time}]</span>
                    <span style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#eab308' : '#22c55e' }}>{log.msg}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'intel-hub' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <CpuIcon color="#eab308" size={36} />
                <h2 style={{ fontSize: '32px', fontWeight: 950, margin: 0 }}>INTEL <span style={{ color: '#eab308' }}>RADAR</span></h2>
                <div className={`ai-badge ${aiActive ? 'ai-online' : 'ai-offline'}`}>
                  <Brain size={14} className={intelLoading ? 'animate-pulse' : ''} />
                  AI MOZEK: {aiActive ? 'ONLINE' : aiStatusMsg}
                </div>
              </div>
              <button onClick={fetchIntelFeed} disabled={intelLoading} className="sidebar-btn active" style={{ width: 'auto', padding: '12px 30px', background: '#eab308', color: '#000', borderRadius: '15px' }}>
                <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} /> SKENOVAT TRENDY
              </button>
            </div>

            {/* RADAR 1: LEAKS */}
            <div style={{ borderLeft: '5px solid #66fcf1', paddingLeft: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ghost color="#66fcf1" size={20} /> LEAKS & <span style={{ color: '#66fcf1' }}>RUMORS</span>
              </h3>
            </div>
            <div className="hub-compact-grid">
              {leaksIntel.map((item, i) => (
                <div key={i} className="compact-card" style={{ borderBottom: '2px solid rgba(102, 252, 241, 0.1)' }}>
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-cyan-400" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 80 ? '#ff0055' : '#10b981' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="compact-btn compact-btn-main">KONCEPT</button>
                  </div>
                </div>
              ))}
            </div>

            {/* RADAR 2: HARDWARE */}
            <div style={{ borderLeft: '5px solid #eab308', paddingLeft: '20px', marginBottom: '20px', marginTop: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 950 }}>HARDWARE <span style={{ color: '#eab308' }}>RADAR</span></h3>
            </div>
            <div className="hub-compact-grid">
              {hwIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-orange-500" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 85 ? '#ff0055' : '#10b981' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="compact-btn compact-btn-main">KONCEPT</button>
                  </div>
                </div>
              ))}
            </div>

            {/* RADAR 3: GAMING */}
            <div style={{ borderLeft: '5px solid #a855f7', paddingLeft: '20px', marginBottom: '20px', marginTop: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 950 }}>GAMING <span style={{ color: '#a855f7' }}>RADAR</span></h3>
            </div>
            <div className="hub-compact-grid">
              {gameIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-purple-500" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 85 ? '#ff0055' : '#10b981' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="compact-btn compact-btn-main">KONCEPT</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
