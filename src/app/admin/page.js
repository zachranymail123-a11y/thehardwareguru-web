"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, AlertCircle,
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Gamepad2, Star, Heart, Ghost, Brain,
  LineChart, ArrowUpRight, Info, BarChart3, MessageSquare, User, Mail, Maximize
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GURU ULTIMATE COMMAND CENTER V6.0 (BOOSTER DASHBOARD)
 * 🚀 CÍL: Monitoring stavu "nafukování" článků pro AdSense.
 */

const INDEXNOW_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";
const BASE_URL = "thehardwareguru.cz";

const getEnv = (key, fallback = '') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
      const envMap = {
        'OPENAI_API_KEY': process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        'NEXT_PUBLIC_ADMIN_PASSWORD': 'Wifik500',
        'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL || '',
        'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL': process.env.NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL || ''
      };
      return envMap[key] || fallback;
  }

  const bridge = document.getElementById('guru-env-bridge');
  const bridgeMap = {
    'NEXT_PUBLIC_SUPABASE_URL': bridge?.getAttribute('data-url'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': bridge?.getAttribute('data-key'),
    'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': bridge?.getAttribute('data-webhook-article'),
    'NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL': bridge?.getAttribute('data-webhook-vercel')
  };
  const envMap = {
    'OPENAI_API_KEY': process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    'NEXT_PUBLIC_ADMIN_PASSWORD': 'Wifik500',
    'NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL': process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL || '',
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    'NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL': process.env.NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL || ''
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
  const [dbMessage, setDbMessage] = useState({ type: '', text: '', links: [] });
  const [dbFormData, setDbFormData] = useState({ name: '', slug: '', rawData: '' });

  const [seznamLoading, setSeznamLoading] = useState(false);
  const [seznamResults, setSeznamResults] = useState([]);
  const [seznamSitemap, setSeznamSitemap] = useState('pages');
  const [seznamLimit, setSeznamLimit] = useState(50);
  const [seznamStatsLoading, setSeznamStatsLoading] = useState(false);
  const [seznamStats, setSeznamStats] = useState(null);

  const [poradnaQuestions, setPoradnaQuestions] = useState([]);
  const [poradnaLoading, setPoradnaLoading] = useState(false);
  const [poradnaAnswers, setPoradnaAnswers] = useState({});
  const [poradnaSubmitting, setPoradnaSubmitting] = useState(null);

  // --- 🚀 CONTENT BOOSTER STATE ---
  const [boosterStats, setBoosterStats] = useState({ total: 0, boosted: 0, pending: 0, articles: [] });
  const [boosterLoading, setBoosterLoading] = useState(false);

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  const fetchBoosterStats = async () => {
    setBoosterLoading(true);
    addLog('Skenuji stav "nafouknutí" článků...', 'warning');
    const { data, error } = await supabase.from('posts').select('id, title, content, content_en');
    if (error) {
      addLog(`Chyba boosteru: ${error.message}`, 'error');
    } else {
      const boosted = data.filter(p => (p.content?.length || 0) > 2000 && (p.content_en?.length || 0) > 2000);
      const pending = data.filter(p => (p.content?.length || 0) < 2000 || !p.content_en || p.content_en.length < 2000);
      setBoosterStats({
        total: data.length,
        boosted: boosted.length,
        pending: pending.length,
        articles: pending.slice(0, 20)
      });
      addLog(`Nafouknuto: ${boosted.length} / ${data.length}`, 'success');
    }
    setBoosterLoading(false);
  };

  const fetchPredictor = async () => {
    setPredictorLoading(true);
    addLog("Odpalyji Guru Predictor Engine...", "warning");
    try {
        const res = await fetch('/api/predictor');
        const json = await res.json();
        if (json && (json.success || Array.isArray(json))) {
            const dataToSet = Array.isArray(json) ? json : (json.data || []);
            setPredictorData(dataToSet);
            if (dataToSet.length > 0) {
                const topName = dataToSet[0].game || dataToSet[0].name || dataToSet[0].title;
                addLog(`Skenování dokončeno. Top trend: ${topName}`, "success");
            }
        } else {
             addLog(`Predictor API nevrátilo platná data.`, "error");
        }
    } catch (e) { addLog(`Predictor selhal: ${e.message}`, "error"); }
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
          model: "gpt-4o", 
          messages: [{ role: "system", content: "Jsi Hardware Guru. Piš technicky a virálně v JSON: { title_cs, content_cs, description_cs, seo_description_cs, slug_cs, title_en, content_en, description_en, seo_description_en, slug_en }" },
                     { role: "user", content: `Vytvoř článek z: ${item.title}. Zdroj: ${item.description || item.title}.` }],
          response_format: { type: "json_object" }
        })
      });
      const r = await response.json();
      const aiData = JSON.parse(r.choices[0].message.content);
      const imageUrl = aiData.image_url || item.image_url || item.image || item.thumbnail || item.urlToImage || '';
      const newDraft = { ...aiData, image_url: imageUrl, created_at: new Date().toISOString(), original_item: item };
      setSavedDrafts(prev => ({ ...prev, [item.title]: newDraft }));
      setDraft(newDraft);
      setPreviewMode('card');
      addLog('Koncept vytvořen a zobrazen.', 'success');
    } catch (err) { addLog('AI fail.', 'error'); }
    finally { setProcessingTitle(null); }
  };

  const handlePublishDraft = async () => {
    if (!draft) return;
    setLoading(true);
    addLog(`Publikuji článek: ${draft.title_cs}...`, 'warning');
    try {
        const finalSlug = draft.slug_cs || slugify(draft.title_cs);
        let postType = 'article'; 
        if (draft.original_item?.intelType === 'game') postType = 'game';
        if (draft.original_item?.intelType === 'leaks') postType = 'leak';
        const { error } = await supabase.from('posts').insert([{
            title: draft.title_cs,
            title_en: draft.title_en,
            slug: finalSlug,
            slug_en: draft.slug_en || slugify(draft.title_en),
            description: draft.description_cs,
            description_en: draft.description_en,
            seo_description: draft.seo_description_cs,
            seo_description_en: draft.seo_description_en,
            content: draft.content_cs || draft.content,
            content_cs: draft.content_cs,
            content_en: draft.content_en,
            image_url: draft.image_url,
            type: postType,
            created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        addLog(`Publikováno: ${postType.toUpperCase()}`, 'success');
        setDraft(null);
        setPreviewMode('none');
    } catch (e) { addLog(`Chyba: ${e.message}`, 'error'); }
    setLoading(false);
  };

  const fetchPoradnaQuestions = async () => {
    setPoradnaLoading(true);
    const { data, error } = await supabase.from('pc_questions').select('*').order('is_answered', { ascending: true }).order('created_at', { ascending: false });
    if (!error) setPoradnaQuestions(data || []);
    setPoradnaLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'predictor') fetchPredictor();
      if (activeTab === 'intel-hub') fetchIntelFeed();
      if (activeTab === 'poradna') fetchPoradnaQuestions();
      if (activeTab === 'booster') fetchBoosterStats();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Wifik500') {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
    }
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
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .terminal { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; color: #22c55e; height: 180px; overflow-y: auto; margin-top: 30px; }
        .booster-stat-card { background: #111318; padding: 30px; border-radius: 20px; border: 1px solid #ffffff08; text-align: center; }
      `}} />

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#eab308' }}>COMMAND</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItemUI id="predictor" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Brain />} label="HYPE RADAR" color="#eab308" />
          <SidebarItemUI id="booster" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Flame />} label="CONTENT BOOSTER" color="#ff4b2b" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#a855f7" />
          <SidebarItemUI id="database" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Database />} label="DATABÁZE" color="#66fcf1" />
          <SidebarItemUI id="seznam-indexer" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Search />} label="SEZNAM INDEXER" color="#ef4444" />
          <SidebarItemUI id="poradna" activeTab={activeTab} setActiveTab={setActiveTab} icon={<MessageSquare />} label="PORADNA" color="#3b82f6" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'booster' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', margin: 0 }}>CONTENT <span style={{ color: '#ff4b2b' }}>BOOSTER</span></h2>
                    <p style={{ color: '#4b5563', fontWeight: 'bold' }}>Sledování High-Value Content pro AdSense</p>
                </div>
                <button onClick={fetchBoosterStats} disabled={boosterLoading} style={{ background: '#ff4b2b', color: '#fff', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {boosterLoading ? <RefreshCw className="spin" size={20}/> : <RotateCcw size={20}/>} REFRESH STATS
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className="booster-stat-card">
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#4b5563', letterSpacing: '2px', marginBottom: '10px' }}>CELKEM ČLÁNKŮ</div>
                    <div style={{ fontSize: '48px', fontWeight: 950 }}>{boosterStats.total}</div>
                </div>
                <div className="booster-stat-card" style={{ borderColor: '#10b98144' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', letterSpacing: '2px', marginBottom: '10px' }}>NAFOUKNUTO (OK)</div>
                    <div style={{ fontSize: '48px', fontWeight: 950, color: '#10b981' }}>{boosterStats.boosted}</div>
                </div>
                <div className="booster-stat-card" style={{ borderColor: '#ff4b2b44' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff4b2b', letterSpacing: '2px', marginBottom: '10px' }}>ČEKÁ NA AI (THIN)</div>
                    <div style={{ fontSize: '48px', fontWeight: 950, color: '#ff4b2b' }}>{boosterStats.pending}</div>
                </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#fff', marginBottom: '20px', borderLeft: '4px solid #ff4b2b', paddingLeft: '15px' }}>FRONTA PRO CRON / BOOSTER</h3>
            <div style={{ background: '#0d0e12', borderRadius: '20px', border: '1px solid #ffffff0d', overflow: 'hidden' }}>
                {boosterStats.articles.map((art, i) => (
                    <div key={i} style={{ padding: '15px 25px', borderBottom: '1px solid #ffffff05', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{art.title}</div>
                            <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>CZ: {art.content?.length || 0} znaků | EN: {art.content_en?.length || 0} znaků</div>
                        </div>
                        <div style={{ color: '#ff4b2b', fontSize: '10px', fontWeight: 900 }}>THIN CONTENT</div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* ... (zbytek tvého kódu pro ostatní záložky zůstává beze změn) ... */}

        <div className="terminal">
            {consoleLogs.slice(-15).map((log, i) => (<div key={i} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#eab308' : '#22c55e' }}>[{log.time}] {log.msg}</div>))}
            <div ref={logEndRef} />
        </div>
      </main>
    </div>
  );
}
