"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Cpu as CpuIcon, Gamepad2, Star, Heart, Ghost, Brain, Link2, PlusCircle, Loader2
} from 'lucide-react';

/**
 * GURU ULTIMATE COMMAND CENTER V16.0 - DB MANAGER UPDATE
 * Cesta: src/app/admin/page.js
 * - ZACHOVÁNO: Inteligentní sémantická deduplikace.
 * - ZACHOVÁNO: Odesílání na Make.com ve 4 polích.
 * - NEW: Integrovaná sekce "DATABÁZE" pro bleskové přidávání CPU/GPU/Her.
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

// 🛡️ GURU SEMANTIC ENGINE
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
  const [activeTab, setActiveTab] = useState('intel-hub');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);
  const supabase = useMemo(() => initSupabase(), []);

  // Původní stavy pro Intel Hub a Dashboard
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
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const isInitialized = useRef(false);

  const BASE_URL = 'https://www.thehardwareguru.cz';

  const LEAK_PLACEHOLDER_URL = useMemo(() => {
    const sUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    if (!sUrl) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000';
    return `${sUrl}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;
  }, []);

  // --- 🚀 NOVÉ STAVY PRO DB MANAGER ---
  const [dbTab, setDbTab] = useState('games');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbMessage, setDbMessage] = useState({ type: '', text: '' });
  const [dbFormData, setDbFormData] = useState({
    name: '', slug: '', vendor: '', performance_index: '',
    vram_gb: '', tdp_w: '', cores: '', threads: '',
    boost_clock_mhz: '', buy_link_cz: '', buy_link_en: ''
  });

  // Auto-slug generátor pro DB Manager
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

  // Odeslání do Supabase (DB Manager)
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
  // ------------------------------------

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
        stats: { visits: statsRes.data?.value || 0, missingEn: 0, missingSeo: 0 }
      });
      addLog('DB administrace synchronizována.', 'success');
    } catch (err) { addLog(`Chyba: ${err.message}`, 'error'); }
    finally { setLoading(false); }
  };

  const fetchIntelFeed = async () => {
    setIntelLoading(true);
    setAiActive(false);
    setAiStatusMsg('ANALÝZA...');
    addLog('Spouštím Guru Intel Engine...', 'warning');
    
    try {
      const res = await fetch('/api/leaks');
      const json = await res.json();
      
      if (json.success) {
        let rawItems = json.data || [];
        
        // 🚀 GURU: SÉMANTICKÝ FRONTEND ŠTÍT!
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
        
        let items = cleanItems;
        if (frontendFiltered > 0) addLog(`Sémantický štít na frontendu zlikvidoval ${frontendFiltered} skrytých duplicit.`, 'success');

        setAiActive(json._debug?.ai_active || false);
        setAiStatusMsg(json._debug?.ai_active ? 'ONLINE' : 'OFFLINE');
        
        setHwIntel(items.filter(i => i.intelType === "hw").slice(0, 10));
        setGameIntel(items.filter(i => i.intelType === "game").slice(0, 10));
        setLeaksIntel(items.filter(i => i.intelType === "leaks").slice(0, 10));
        
      } else {
        throw new Error(json.error);
      }
    } catch (err) { addLog(`API Leaks selhalo: ${err.message}`, 'error'); }
    finally { setIntelLoading(false); }
  };

  const createDraftFromIntel = async (item) => {
    if (savedDrafts[item.title]) {
      setDraft(savedDrafts[item.title]);
      setPreviewMode('card');
      addLog('Koncept načten ze systému.', 'success');
      return;
    }

    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || getEnv('NEXT_PUBLIC_OPENAI_API_KEY');
    
    if (!openAiKey || openAiKey === '') {
        return addLog('CHYBÍ AI KLÍČ V ENV (NEXT_PUBLIC_OPENAI_API_KEY)!', 'error');
    }
    
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
              content: "Jsi Hardware Guru. Piš úderně, technicky a virálně. ZDROJOVÉ TEXTY JSOU V ANGLIČTINĚ! ABSOLUTNÍ PRAVIDLO: Všechna pole v JSONu končící na '_cs' (title_cs, content_cs, atd.) MUSÍ BÝT STRIKTNĚ PŘELOŽENA DO ČEŠTINY! Všechna pole končící na '_en' zůstávají v angličtině. HTML h2, strong, ul pro obsah. MUSÍŠ vygenerovat JSON: { title_cs, content_cs, description_cs, seo_description_cs, slug_cs, seo_keywords_cs, title_en, content_en, description_en, seo_description_en, slug_en, meta_title_en, seo_keywords_en, image_alt, og_title, trailer }" 
            },
            { role: "user", content: `Vytvoř článek z: ${item.title}. Zdroj: ${item.description || item.title}.` }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      const r = await response.json();
      
      const content = r?.choices?.[0]?.message?.content || r?.output?.[0]?.content?.[0]?.text;
      if (!content) throw new Error(r?.error?.message || "AI vrátilo prázdnou odpověď.");

      const aiData = JSON.parse(content);
      
      let postType = item.intelType || 'hardware';
      const lowerTitle = (item.title || '').toLowerCase();
      if (lowerTitle.includes('leak') || lowerTitle.includes('rumor')) {
        postType = 'leaks';
      }

      const newDraft = {
        ...aiData,
        image_url: postType === 'leaks' ? LEAK_PLACEHOLDER_URL : item.image_url, 
        created_at: new Date().toISOString(),
        type: postType,
        original_item: item,
        is_important: false
      };

      setSavedDrafts(prev => ({ ...prev, [item.title]: newDraft }));
      setDraft(newDraft);
      setPreviewMode('card');
      addLog('Koncept vytvořen se všemi poli.', 'success');
    } catch (err) { 
      addLog(`AI fail: ${err.message}`, 'error'); 
    } finally { 
      setProcessingTitle(null);
    }
  };

  const publishAndSendToMake = async () => {
    if (!draft) return;
    
    const articleWebhook = process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL || getEnv('NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL');
    addLog('ODPALUJI ČLÁNEK DO SYSTÉMU...', 'warning');
    
    try {
      const { data: dbData, error } = await supabase.from('posts').insert([{
        title: draft.title_cs, slug: draft.slug_cs, content: draft.content_cs, description: draft.description_cs, seo_description: draft.seo_description_cs, seo_keywords: draft.seo_keywords_cs,
        title_en: draft.title_en, slug_en: draft.slug_en, content_en: draft.content_en, description_en: draft.description_en, seo_description_en: draft.seo_description_en, meta_title_en: draft.meta_title_en, seo_keywords_en: draft.seo_keywords_en,
        image_url: draft.image_url, image_alt: draft.image_alt || draft.title_cs, og_title: draft.og_title || draft.title_cs, trailer: draft.trailer, type: draft.type, created_at: draft.created_at, is_fired: true 
      }]).select().single();

      if (error) throw error;
      addLog('DATABÁZE SYNCHRONIZOVÁNA. 🔥', 'success');

      if (articleWebhook && articleWebhook !== "") {
        try {
          // 🚀 GURU MAKE.COM FIX: Přesně tvůj buffer scénář a 4 pole
          const payload = {
            title: dbData.title,
            url: `${BASE_URL}/clanky/${dbData.slug}`,
            image_url: dbData.image_url,
            description: dbData.description || dbData.seo_description
          };
          
          const makeRes = await fetch(articleWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (makeRes.ok) {
            addLog('VÝSTŘEL NA MAKE.COM ÚSPĚŠNÝ! 🚀', 'success');
          } else {
            throw new Error(`HTTP ${makeRes.status}`);
          }
        } catch (mErr) {
          addLog(`Make.com selhal: ${mErr.message}`, 'error');
        }
      } else {
        addLog('CHYBÍ WEBHOOK URL V ENV SOUBORU!', 'error');
      }
      
      setLeaksIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setHwIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      setGameIntel(prev => prev.filter(i => i.title !== draft.original_item.title));
      
      const newSavedDrafts = { ...savedDrafts };
      delete newSavedDrafts[draft.original_item.title];
      setSavedDrafts(newSavedDrafts);

      setDraft(null); 
      setPreviewMode('none'); 
      fetchAndScanData();
    } catch (err) { addLog(`KRITICKÁ CHYBA: ${err.message}`, 'error'); }
  };

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
        
        .hub-compact-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 40px; }
        .compact-card { background: #0d0e12; border: 1px solid #ffffff08; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; transition: 0.3s; position: relative; min-height: 160px; overflow: hidden; }
        .compact-card:hover { border-color: #eab308; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        .compact-badge { position: absolute; top: 6px; right: 6px; background: #ff0055; color: #fff; padding: 2px 5px; border-radius: 4px; font-size: 8px; font-weight: 950; z-index: 5; }
        .compact-title { font-size: 10px; font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; height: 48px; }
        .compact-source { font-size: 7px; color: #4b5563; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; }
        .compact-actions { margin-top: auto; display: flex; flex-direction: column; gap: 5px; }
        .compact-btn { width: 100%; padding: 4px; border-radius: 4px; font-size: 8px; font-weight: 900; text-transform: uppercase; cursor: pointer; text-align: center; border: 1px solid #333; background: transparent; color: #9ca3af; transition: 0.2s; }
        .compact-btn:hover { border-color: #eab308; color: #eab308; }
        .compact-btn-main { background: #eab30833; border-color: #eab30866; color: #eab308; }
        .compact-btn-main:hover { background: #eab308; color: #000; }

        .terminal-box { background: #000; border: 1px solid #22c55e33; border-radius: 15px; padding: 20px; font-family: monospace; font-size: 12px; overflow-y: auto; color: #22c55e; }
        .ai-badge { display: flex; align-items: center; gap: 8px; padding: 6px 15px; border-radius: 50px; font-size: 10px; font-weight: 950; border: 1px solid rgba(255,255,255,0.05); }
        .ai-online { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
        .ai-offline { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.98); z-index: 500; display: flex; flex-direction: row; padding: 0; backdrop-filter: blur(25px); }
        .preview-sidebar { width: 340px; background: #0d0e12; border-right: 1px solid rgba(255,255,255,0.1); padding: 30px 20px; display: flex; flex-direction: column; gap: 15px; height: 100vh; overflow-y: auto; flex-shrink: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.8); z-index: 510; }
        .preview-content-area { flex: 1; padding: 40px; height: 100vh; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
        .preview-window { background: #0a0b0d; border-radius: 30px; border: 4px solid #333; overflow: hidden; width: 100%; max-width: 1200px; min-height: 800px; box-shadow: 0 40px 120px rgba(0,0,0,0.8); }
        .preview-window.mobile { width: 375px; height: 667px; min-height: auto; }
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px
