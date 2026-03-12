"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
// 🛡️ GURU FIX: Pro prostředí Preview/Canvas používáme ESM import, aby se předešlo chybě "Could not resolve"
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Gamepad2, Star, Heart, Ghost, Brain
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V17.9 - FIX & TRENDS
 * Cesta: src/app/admin/page.js
 * 🛡️ FIX: Import Supabase změněn na https://esm.sh/ pro funkčnost v Preview.
 * 🚀 NEW: Integrace Guru Trends Engine s ochranou proti duplicitám.
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
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
};

if (typeof window !== 'undefined') {
  window.swgSubscriptions = window.swgSubscriptions || {};
  if (!window.swgSubscriptions.attachButton) window.swgSubscriptions.attachButton = () => {};
}

const STOP_WORDS = new Set(['this', 'that', 'with', 'from', 'will', 'over', 'game', 'play', 'about', 'more', 'than', 'have', 'been', 'which', 'what', 'when', 'just', 'only', 'after', 'first', 'adds', 'the', 'and', 'for', 'you', 'can', 'now', 'out']);
const tokenize = (str) => {
  if (!str) return new Set();
  const words = str.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  return new Set(words.filter(w => w.length >= 3 && !STOP_WORDS.has(w)).map(w => (w.length > 4 && w.endsWith('s')) ? w.slice(0, -1) : w));
};
const isSemanticDuplicate = (tokens1, tokens2) => {
  if (tokens1.size === 0 || tokens2.size === 0) return false;
  let matches = 0;
  for (const w of tokens1) if (tokens2.has(w)) matches++;
  const threshold = Math.min(3, Math.ceil(Math.min(tokens1.size, tokens2.size) * 0.6));
  return matches >= threshold;
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
  const [activeTab, setActiveTab] = useState('dashboard'); // Změněno na dashboard pro lepší start
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
  const [aiActive, setAiActive] = useState(false); 
  const [aiStatusMsg, setAiStatusMsg] = useState('IDLE');
  
  // 🚀 TRENDS STATE
  const [trendingGames, setTrendingGames] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  
  const [draft, setDraft] = useState(null);
  const [processingTitle, setProcessingTitle] = useState(null); 
  const [previewMode, setPreviewMode] = useState('none');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const isInitialized = useRef(false);

  const LEAK_PLACEHOLDER_URL = useMemo(() => {
    const sUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    if (!sUrl) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';
    return `${sUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;
  }, []);

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
      const generatedSlug = dbFormData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setDbFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [dbFormData.name]);

  const handleDbInputChange = (e) => {
    const { name, value } = e.target;
    setDbFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetDbForm = () => {
    setDbFormData({
      name: '', slug: '', vendor: '', performance_index: '',
      vram_gb: '', tdp_w: '', cores: '', threads: '',
      boost_clock_mhz: '', buy_link_cz: '', buy_link_en: ''
    });
  };

  const handleDbSubmit = async (e) => {
    e.preventDefault();
    setDbLoading(true);
    setDbMessage({ type: '', text: '' });

    const table = dbTab === 'games' ? 'games' : (dbTab === 'gpu' ? 'gpus' : 'cpus');
    
    const payload = {
      name: dbFormData.name,
      slug: dbFormData.slug,
    };

    if (dbTab === 'gpu') {
      payload.vendor = dbFormData.vendor;
      payload.performance_index = parseInt(dbFormData.performance_index) || 0;
      payload.vram_gb = parseInt(dbFormData.vram_gb) || 0;
      payload.tdp_w = parseInt(dbFormData.tdp_w) || 0;
      payload.buy_link_cz = dbFormData.buy_link_cz;
      payload.buy_link_en = dbFormData.buy_link_en;
    }

    if (dbTab === 'cpu') {
      payload.vendor = dbFormData.vendor;
      payload.performance_index = parseInt(dbFormData.performance_index) || 0;
      payload.cores = parseInt(dbFormData.cores) || 0;
      payload.threads = parseInt(dbFormData.threads) || 0;
      payload.boost_clock_mhz = parseInt(dbFormData.boost_clock_mhz) || 0;
      payload.buy_link_cz = dbFormData.buy_link_cz;
      payload.buy_link_en = dbFormData.buy_link_en;
    }

    const { error } = await supabase.from(table).insert([payload]);

    if (error) {
      setDbMessage({ type: 'error', text: `Chyba DB: ${error.message}` });
      addLog(`Selhalo přidání ${dbFormData.name} do databáze.`, 'error');
    } else {
      setDbMessage({ type: 'success', text: `Úspěšně přidáno: ${dbFormData.name}!` });
      addLog(`Hardware / Hra ${dbFormData.name} přidána do systému a ihned zaktivovala nové stránky!`, 'success');
      resetDbForm();
    }
    setDbLoading(false);
  };

  // --- 🚀 INDEXNOW ENGINE (Globální ping) ---
  const triggerIndexNow = async () => {
    if (!supabase) return;
    setIndexLoading(true);
    addLog("Spouštím globální indexaci přes interní proxy...", "warning");

    try {
      const [posts, cpus, gpus] = await Promise.all([
        supabase.from('posts').select('slug'),
        supabase.from('cpus').select('slug'),
        supabase.from('gpus').select('slug')
      ]);

      const urlList = [
        `https://${BASE_URL}/`,
        `https://${BASE_URL}/clanky`,
        `https://${BASE_URL}/cpu-index`,
        `https://${BASE_URL}/gpuvs/ranking`,
        `https://${BASE_URL}/cpuvs/ranking`
      ];

      posts.data?.forEach(p => p.slug && urlList.push(`https://${BASE_URL}/clanky/${p.slug}`));
      cpus.data?.forEach(c => c.slug && urlList.push(`https://${BASE_URL}/cpu/${c.slug}`));
      gpus.data?.forEach(g => g.slug && urlList.push(`https://${BASE_URL}/gpu/${g.slug}`));

      const response = await fetch('/api/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: BASE_URL,
          key: INDEXNOW_KEY,
          keyLocation: `https://${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: urlList.slice(0, 1000) 
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setDbMessage({ type: 'success', text: `IndexNow: ${urlList.length} adres odesláno k okamžité indexaci!` });
        addLog(`IndexNow úspěšně odpálil ${urlList.length} URL do Bingu a Seznamu.`, 'success');
      } else {
        throw new Error(resData.error || `API Error: ${response.status}`);
      }
    } catch (err) {
      setDbMessage({ type: 'error', text: `IndexNow selhal: ${err.message}` });
      addLog(`IndexNow selhal: ${err.message}`, 'error');
    } finally {
      setIndexLoading(false);
    }
  };

  // 🚀 TRENDS FETCH ENGINE
  const fetchTrendingGames = async () => {
    setTrendsLoading(true);
    addLog("Skenuji Google Trendy (CZ+US) a filtruji duplicity...", "warning");
    try {
      const res = await fetch('/api/trends');
      const json = await res.json();
      if (json.success) {
        setTrendingGames(json.data);
        addLog(`V nalezených trendech identifikovány ${json.data.length} nové unikátní hry.`, "success");
      }
    } catch (e) {
      addLog("Trend API momentálně nedostupné.", "error");
    } finally {
      setTrendsLoading(false);
    }
  };

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
      addLog('GURU OS načten.', 'success');
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
      fetchTrendingGames();
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
        stats: { visits: statsRes.data?.value || 0, missingEn: 0, missingSeo: 0 }
      });
      addLog('Databáze synchronizována.', 'success');
    } catch (err) { addLog(`Chyba DB: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    setAiStatusMsg('ANALÝZA...');
    addLog('Aktivuji Intel Radar...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        let rawItems = json.data || [];
        
        const dbTokensList = data.posts.flatMap(p => [tokenize(p.title), tokenize(p.title_en)]).filter(s => s.size > 0);
        const seenTokens = [];
        let cleanItems = [];
        let frontendFiltered = 0;

        for (const item of rawItems) {
            const t = tokenize(item.title);
            if (t.size === 0) { cleanItems.push(item); continue; }
            
            let isDupe = false;
            for (const dbT of dbTokensList) {
                if (isSemanticDuplicate(t, dbT)) { isDupe = true; break; }
            }
            if (isDupe) { frontendFiltered++; continue; }
            
            for (const seen of seenTokens) {
                if (isSemanticDuplicate(t, seen)) { isDupe = true; break; }
            }
            if (isDupe) { frontendFiltered++; continue; }
            
            seenTokens.push(t);
            cleanItems.push(item);
        }
        
        if (frontendFiltered > 0) addLog(`Odfiltrováno ${frontendFiltered} sémantických duplicit.`, 'success');

        setAiActive(json._debug?.ai_active || false);
        setAiStatusMsg(json._debug?.ai_active ? 'ONLINE' : 'OFFLINE');
        
        setHwIntel(cleanItems.filter(i => i.intelType === "hw").slice(0, 10));
        setGameIntel(cleanItems.filter(i => i.intelType === "game").slice(0, 10));
        setLeaksIntel(cleanItems.filter(i => i.intelType === "leaks").slice(0, 10));
        
      } else {
        throw new Error(json.error);
      }
    } catch (err) { addLog(`Intel fail: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  const createDraftFromIntel = async (item) => {
    if (savedDrafts[item.title]) {
      setDraft(savedDrafts[item.title]);
      setPreviewMode('card');
      return;
    }

    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || getEnv('NEXT_PUBLIC_OPENAI_API_KEY');
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
              content: "Jsi Hardware Guru. JSON output: { title_cs, content_cs, description_cs, seo_description_cs, slug_cs, seo_keywords_cs, title_en, content_en, description_en, seo_description_en, slug_en, meta_title_en, seo_keywords_en, image_alt, og_title, trailer }" 
            },
            { role: "user", content: `Vytvoř článek z: ${item.title}. Zdroj: ${item.description || item.title}.` }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      const r = await response.json();
      const aiData = JSON.parse(r?.choices?.[0]?.message?.content);
      
      const newDraft = {
        ...aiData,
        image_url: (item.title || '').toLowerCase().includes('leak') ? LEAK_PLACEHOLDER_URL : item.image_url, 
        created_at: new Date().toISOString(),
        type: item.intelType || 'hardware',
        original_item: item,
        is_important: false
      };

      setSavedDrafts(prev => ({ ...prev, [item.title]: newDraft }));
      setDraft(newDraft);
      setPreviewMode('card');
      addLog('Koncept vytvořen.', 'success');
    } catch (err) { addLog(`AI fail: ${err.message}`, 'error'); }
    finally { setProcessingTitle(null); }
  };

  const publishAndSendToMake = async () => {
    if (!draft) return;
    const articleWebhook = getEnv('NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL');
    addLog('PUBLIKUJI...', 'warning');
    try {
      const { data: dbData, error } = await supabase.from('posts').insert([{
        title: draft.title_cs, slug: draft.slug_cs, content: draft.content_cs, description: draft.description_cs, seo_description: draft.seo_description_cs, seo_keywords: draft.seo_keywords_cs,
        title_en: draft.title_en, slug_en: draft.slug_en, content_en: draft.content_en, description_en: draft.description_en, seo_description_en: draft.seo_description_en, meta_title_en: draft.meta_title_en, seo_keywords_en: draft.seo_keywords_en,
        image_url: draft.image_url, image_alt: draft.image_alt || draft.title_cs, og_title: draft.og_title || draft.title_cs, trailer: draft.trailer, type: draft.type, created_at: draft.created_at, is_fired: true 
      }]).select().single();

      if (error) throw error;
      if (articleWebhook) {
        await fetch(articleWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: dbData.title, url: `${BASE_URL}/clanky/${dbData.slug}`, image_url: dbData.image_url, description: dbData.description })
        });
      }
      
      setDraft(null); 
      setPreviewMode('none'); 
      fetchAndScanData();
      addLog('PUBLIKACE DOKONČENA! 🚀', 'success');
    } catch (err) { addLog(`Kritická chyba: ${err.message}`, 'error'); }
  };

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
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        .sidebar-btn:hover, .sidebar-btn.active { background: #ffffff0d; color: #fff; }
        .hub-compact-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 40px; }
        .compact-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; transition: 0.3s; position: relative; min-height: 160px; overflow: hidden; }
        .compact-card:hover { border-color: #eab308; transform: translateY(-3px); }
        .compact-badge { position: absolute; top: 6px; right: 6px; background: #ff0055; color: #fff; padding: 2px 5px; border-radius: 4px; font-size: 8px; font-weight: 950; z-index: 5; }
        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; overflow-y: auto; color: #22c55e; }
        .input-group { display: flex; flex-direction: column; gap: 10px; }
        .input-group input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 12px; color: #fff; outline: none; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />

      {previewMode !== 'none' && draft && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 500, display: 'flex' }}>
          <div style={{ width: '340px', background: '#0d0e12', padding: '30px 20px', borderRight: '1px solid #ffffff10' }}>
            <h2 style={{ color: '#eab308', fontWeight: 950, textAlign: 'center' }}>NÁHLED</h2>
            <button onClick={publishAndSendToMake} style={{ width: '100%', padding: '15px', background: '#10b981', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>PUBLIKOVAT</button>
            <button onClick={() => setPreviewMode('none')} style={{ width: '100%', padding: '15px', background: '#333', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>ZAVŘÍT</button>
          </div>
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#0a0b0d', width: '100%', maxWidth: '800px', borderRadius: '24px', border: '1px solid #333', padding: '40px' }}>
                <h1 style={{ fontWeight: 900, fontSize: '2.5rem' }}>{draft.title_cs}</h1>
                <img src={draft.image_url} style={{ width: '100%', borderRadius: '16px', margin: '20px 0' }} />
                <div dangerouslySetInnerHTML={{ __html: draft.content_cs }} style={{ color: '#ccc', lineHeight: '1.6' }} />
            </div>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#a855f7' }}>ADMIN</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="PŘEHLED" color="#a855f7" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#eab308" />
          <SidebarItemUI id="database" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Database />} label="DATABÁZE" color="#66fcf1" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px' }}>SYSTÉM</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ background: '#111318', padding: '25px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '28px', fontWeight: 950 }}>{data.stats.visits}</h3><p style={{fontSize: '10px', color: '#4b5563'}}>NÁVŠTĚVY</p>
              </div>
              <div style={{ background: '#111318', padding: '25px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '28px', fontWeight: 950 }}>{data.posts.length}</h3><p style={{fontSize: '10px', color: '#4b5563'}}>ČLÁNKY</p>
              </div>
            </div>

            <div style={{marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #eab30833' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#eab308' }}>🔥 TOP TRENDY HRY</h3>
                    <button onClick={fetchTrendingGames} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}><RefreshCw size={14} className={trendsLoading ? 'animate-spin' : ''}/></button>
                </div>
                {trendingGames.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {trendingGames.map((game, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#000', padding: '10px 15px', borderRadius: '12px', border: '1px solid #ffffff08' }}>
                                <span style={{ color: '#eab308', fontWeight: 900 }}>#{i+1}</span>
                                <span style={{ flex: 1, fontWeight: 700, fontSize: '13px' }}>{game}</span>
                                <button onClick={() => { 
                                    setActiveTab('database');
                                    setDbTab('games');
                                    setDbFormData(prev => ({ ...prev, name: game }));
                                }} style={{ fontSize: '10px', color: '#66fcf1', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900 }}>PŘIDAT</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#4b5563', fontSize: '12px' }}>{trendsLoading ? 'Skenuji...' : 'Skenovat trendy...'}</p>
                )}
              </div>
              <div className="terminal-box" style={{height: '300px'}}>{consoleLogs.slice(-10).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}</div>
            </div>
          </div>
        )}

        {activeTab === 'intel-hub' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 950 }}>INTEL HUB</h2>
              <button onClick={fetchIntelFeed} className="sidebar-btn" style={{ background: '#eab308', color: '#000', borderRadius: '12px', width: 'auto', padding: '10px 20px' }}><RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''}/> SCAN</button>
            </div>
            <div className="hub-compact-grid">
              {hwIntel.concat(gameIntel).slice(0, 10).map((item, i) => (
                <div key={i} className="compact-card">
                  <span style={{ fontSize: '8px', color: '#4b5563' }}>{item.source}</span>
                  <h4 style={{ fontSize: '11px', fontWeight: 900, margin: '10px 0' }}>{item.title}</h4>
                  <button onClick={() => createDraftFromIntel(item)} style={{ marginTop: 'auto', background: '#eab30833', border: '1px solid #eab308', borderRadius: '6px', color: '#eab308', fontSize: '9px', padding: '5px', cursor: 'pointer' }}>KONCEPT</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 950 }}>DATABÁZE</h2>
              <button onClick={triggerIndexNow} style={{ padding: '15px 30px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 900, cursor: 'pointer' }}>INDEXOVAT WEB</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <button onClick={() => setDbTab('games')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: dbTab === 'games' ? '#66fcf1' : '#222', color: dbTab === 'games' ? '#000' : '#fff', fontWeight: 'bold', border: 'none' }}>HRA</button>
              <button onClick={() => setDbTab('gpu')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: dbTab === 'gpu' ? '#66fcf1' : '#222', color: dbTab === 'gpu' ? '#000' : '#fff', fontWeight: 'bold', border: 'none' }}>GPU</button>
              <button onClick={() => setDbTab('cpu')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: dbTab === 'cpu' ? '#66fcf1' : '#222', color: dbTab === 'cpu' ? '#000' : '#fff', fontWeight: 'bold', border: 'none' }}>CPU</button>
            </div>

            {dbMessage.text && <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: '12px', marginBottom: '20px', color: '#10b981' }}>{dbMessage.text}</div>}

            <form onSubmit={handleDbSubmit} style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333' }}>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', color: '#4b5563', fontWeight: 900 }}>NÁZEV</label>
                <input type="text" name="name" value={dbFormData.name} onChange={handleDbInputChange} required />
              </div>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', color: '#4b5563', fontWeight: 900 }}>SLUG</label>
                <input type="text" name="slug" value={dbFormData.slug} onChange={handleDbInputChange} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: '20px', background: '#66fcf1', color: '#000', borderRadius: '14px', fontWeight: 900, border: 'none', cursor: 'pointer' }}>VLOŽIT A AKTIVOVAT</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
