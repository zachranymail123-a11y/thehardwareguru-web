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
 * GURU ULTIMATE COMMAND CENTER V15.0 - SEMANTIC FRONTEND SHIELD
 * - FIX: Implementace inteligentní sémantické deduplikace přímo na frontendu! (Zabíjí Slay the Spire duplikáty)
 * - FIX: Odesílání na Make.com PŘESNĚ ve 4 polích podle screenshotu.
 * - ZACHOVÁNO: 10 karet na sekci (přesně 2 řádky po 5).
 * - ZACHOVÁNO: Bezpečné čtení NEXT_PUBLIC_OPENAI_API_KEY.
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

// 🛡️ GURU SEMANTIC ENGINE (Běží přímo u tebe v prohlížeči, Vercel Cache nemá šanci)
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
        
        // 🚀 GURU: SÉMANTICKÝ FRONTEND ŠTÍT! Zařezává "Slay the Spire" duplicity přímo v prohlížeči.
        const dbTokensList = data.posts.flatMap(p => [tokenize(p.title), tokenize(p.title_en)]).filter(s => s.size > 0);
        const seenTokens = [];
        let cleanItems = [];
        let frontendFiltered = 0;

        for (const item of rawItems) {
            const t = tokenize(item.title);
            if (t.size === 0) { cleanItems.push(item); continue; }
            
            let isDupe = false;
            // 1. Zkontroluje vydané články v DB
            for (const dbT of dbTokensList) {
                if (isSemanticDuplicate(t, dbT)) { isDupe = true; break; }
            }
            if (isDupe) { frontendFiltered++; continue; }
            
            // 2. Zkontroluje křížovou duplicitu napříč radary (Leaky mají vždy přednost)
            for (const seen of seenTokens) {
                if (isSemanticDuplicate(t, seen)) { isDupe = true; break; }
            }
            if (isDupe) { frontendFiltered++; continue; }
            
            seenTokens.push(t);
            cleanItems.push(item);
        }
        
        let items = cleanItems;
        if (frontendFiltered > 0) addLog(`Sémantický štít na frontendu zlikvidoval ${frontendFiltered} skrytých duplicit.`, 'success');

        // AI skórování
        setAiActive(json._debug?.ai_active || false);
        setAiStatusMsg(json._debug?.ai_active ? 'ONLINE' : 'OFFLINE');
        
        // 🚀 GURU FIX: Zobrazí přesně 10 nejvirálnějších položek na radar (2 řádky po 5)
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
        .mock-card { background: #1f2833; border-radius: 12px; overflow: hidden; border: 1px solid rgba(102, 252, 241, 0.2); width: 320px; cursor: pointer; transition: 0.3s; }
        .mock-card:hover { border-color: #66fcf1; }
        .mock-prose { color: #d1d5db; line-height: 1.8; font-size: 1.1rem; }
        .mock-prose h2 { color: #66fcf1; font-weight: 950; margin: 1.5em 0 0.5em; text-transform: uppercase; }
      `}} />

      {/* --- 🚀 GURU PREVIEW SYSTEM --- */}
      {previewMode !== 'none' && draft && (
        <div className="preview-overlay">
          <div className="preview-sidebar">
              <h2 style={{ color: '#eab308', fontSize: '18px', fontWeight: '950', marginBottom: '15px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Guru Náhled</h2>
              <button onClick={publishAndSendToMake} className="sidebar-btn" style={{ width: '100%', background: '#10b981', color: '#fff', border: '1px solid #10b981', justifyContent: 'center', padding: '15px', fontSize: '15px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', marginBottom: '10px' }}>
                  <Check size={20}/> PUBLIKOVAT ČLÁNEK
              </button>
              <button onClick={() => setPreviewMode('none')} className="sidebar-btn" style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', justifyContent: 'center' }}>
                  <ArrowLeft size={16}/> ZPĚT DO VELÍNA
              </button>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
                  <button onClick={() => setPreviewDevice('desktop')} style={{ flex: 1, padding: '12px', background: previewDevice === 'desktop' ? '#eab308' : '#222', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'center', color: previewDevice === 'desktop' ? '#000' : '#fff', cursor: 'pointer' }}><Monitor size={18}/></button>
                  <button onClick={() => setPreviewDevice('mobile')} style={{ flex: 1, padding: '12px', background: previewDevice === 'mobile' ? '#eab308' : '#222', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'center', color: previewDevice === 'mobile' ? '#000' : '#fff', cursor: 'pointer' }}><Smartphone size={18}/></button>
              </div>
              <button onClick={() => setDraft({...draft, is_important: !draft.is_important})} style={{ background: draft.is_important ? '#ff0055' : 'transparent', border: '1px solid #ff0055', color: draft.is_important ? '#fff' : '#ff0055', padding: '15px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', marginBottom: '15px' }}>
                <Star size={16} fill={draft.is_important ? "currentColor" : "none"} /> OZNAČIT JAKO DŮLEŽITÉ
              </button>
              <button onClick={() => setPreviewMode(previewMode === 'card' ? 'slug' : 'card')} className="sidebar-btn" style={{ width: '100%', background: '#a855f7', color: '#fff', justifyContent: 'center' }}>
                  {previewMode === 'card' ? 'PŘEPNOUT NA DETAIL' : 'PŘEPNOUT NA KARTU'}
              </button>
          </div>

          <div className="preview-content-area">
            <div className={`preview-window ${previewDevice}`} style={{ margin: '0 auto' }}>
                {previewMode === 'card' ? (
                   <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0b0d', minHeight: '100%' }}>
                      <div className="mock-card" onClick={() => setPreviewMode('slug')}>
                         <img src={draft.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt="" />
                         <div style={{ padding: '20px' }}>
                            <span style={{ color: draft.type === 'leaks' ? '#66fcf1' : '#ff0000', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              {draft.type === 'leaks' ? 'LEAKS & RUMORS' : (draft.type === 'hardware' ? 'TECH ROZBOR' : 'GAME NEWS')}
                            </span>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', fontWeight: '900' }}>{draft.title_cs}</h3>
                            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.4', marginBottom: '15px' }}>{draft.description_cs}</p>
                            <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '12px' }}>ČÍST VÍCE →</div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ padding: '60px 40px', maxWidth: '850px', margin: '0 auto', background: '#0a0b0d' }}>
                      <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', marginBottom: '20px', lineHeight: 1.1 }}>{draft.title_cs}</h1>
                      <div style={{ color: '#444', fontWeight: '900', fontSize: '12px', marginBottom: '40px' }}>GURU ENGINE • {new Date().toLocaleDateString('cs-CZ')}</div>
                      {draft.trailer && <div style={{ marginBottom: '40px', padding: '15px', background: 'rgba(255,0,85,0.1)', borderLeft: '4px solid #ff0055', color: '#ff0055', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}><Play size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/> Trailer detekován</div>}
                      <img src={draft.image_url} style={{ width: '100%', borderRadius: '20px', marginBottom: '40px', border: '1px solid #ffffff10' }} alt="" />
                      <div className="mock-prose" dangerouslySetInnerHTML={{ __html: draft.content_cs }} />
                      <div style={{ marginTop: '70px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
                        <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>Líbil se ti článek? Podpoř nás...</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
                          <div className="guru-deals-btn" style={{ flex: '1 1 280px', cursor: 'default' }}><Flame size={20} /> SLEVY</div>
                          <div className="guru-support-btn" style={{ flex: '1 1 280px', cursor: 'default' }}><Heart size={20} /> PODPORA</div>
                        </div>
                      </div>
                   </div>
                )}
            </div>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <div style={{ padding: '30px 25px', borderBottom: '1px solid #ffffff0d' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>GURU <span style={{ color: '#a855f7' }}>ADMIN</span></h2>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="PŘEHLED" color="#a855f7" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#eab308" />
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: 950, marginBottom: '30px', textTransform: 'uppercase' }}>SYSTÉMOVÝ <span style={{ color: '#a855f7' }}>STATUS</span></h2>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 950 }}>{data.stats.visits}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>NÁVŠTĚVY</p>
              </div>
              <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 950 }}>{data.posts.length}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>ČLÁNKY</p>
              </div>
              <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 950 }}>{data.stats.missingEn}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>CHYBĚJÍCÍ EN</p>
              </div>
              <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 950 }}>{data.deals.length}</h3><p style={{fontSize: '11px', color: '#4b5563', fontWeight: '900'}}>SLEVY</p>
              </div>
            </div>
            <div style={{marginTop: '40px'}}><div className="terminal-box" style={{height: '300px'}}>{consoleLogs.slice(-10).map((log, i) => (<div key={i}>[{log.time}] {log.msg}</div>))}</div></div>
          </div>
        )}

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderLeft: '4px solid #eab308', paddingLeft: '15px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 950, textTransform: 'uppercase', color: '#fff', margin: 0 }}>Hardware <span style={{ color: '#eab308' }}>Radar</span></h3>
            </div>
            <div className="hub-compact-grid">
              {hwIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-orange-500" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 85 ? '#ff0055' : '#10b981' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div className="compact-actions">
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">Zdroj</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className={`compact-btn ${savedDrafts[item.title] ? '' : 'compact-btn-main'}`} style={savedDrafts[item.title] ? { background: '#10b98133', borderColor: '#10b98166', color: '#10b981' } : {}}>{savedDrafts[item.title] ? 'MÁM KONCEPT' : 'KONCEPT'}</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 950, textTransform: 'uppercase', color: '#fff', margin: 0 }}>Gaming <span style={{ color: '#a855f7' }}>Radar</span></h3>
            </div>
            <div className="hub-compact-grid">
              {gameIntel.map((item, i) => (
                <div key={i} className="compact-card">
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-purple-500" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 85 ? '#ff0055' : '#10b981' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div className="compact-actions">
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">Zdroj</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className={`compact-btn ${savedDrafts[item.title] ? '' : 'compact-btn-main'}`} style={savedDrafts[item.title] ? { borderColor: '#a855f766', color: '#a855f7', background: '#a855f733' } : { borderColor: '#a855f766', color: '#a855f7', background: 'transparent' }}>{savedDrafts[item.title] ? 'MÁM KONCEPT' : 'KONCEPT'}</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderLeft: '4px solid #66fcf1', paddingLeft: '15px' }}>
                <Ghost color="#66fcf1" size={18} />
                <h3 style={{ fontSize: '16px', fontWeight: 950, textTransform: 'uppercase', color: '#fff', margin: 0 }}>Leaks & <span style={{ color: '#66fcf1' }}>Rumors</span></h3>
            </div>
            <div className="hub-compact-grid">
              {leaksIntel.map((item, i) => (
                <div key={i} className="compact-card" style={{ borderColor: 'rgba(102, 252, 241, 0.1)' }}>
                  {processingTitle === item.title && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin text-cyan-400" size={24}/></div>}
                  <div className="compact-badge" style={{ background: item.viral_score > 80 ? '#66fcf1' : '#10b981', color: item.viral_score > 80 ? '#000' : '#fff' }}>{item.viral_score}%</div>
                  <span className="compact-source">{item.source}</span>
                  <h4 className="compact-title">{item.title}</h4>
                  <div className="compact-actions">
                    <a href={item.link} target="_blank" rel="noreferrer" className="compact-btn">Zdroj</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className={`compact-btn ${savedDrafts[item.title] ? '' : 'compact-btn-main'}`} style={savedDrafts[item.title] ? { borderColor: '#66fcf166', color: '#66fcf1', background: '#66fcf122' } : { borderColor: '#66fcf166', color: '#66fcf1', background: 'transparent' }}>{savedDrafts[item.title] ? 'MÁM KONCEPT' : 'KONCEPT'}</button>
                  </div>
                </div>
              ))}
            </div>

            {!intelLoading && hwIntel.length === 0 && gameIntel.length === 0 && leaksIntel.length === 0 && <div style={{ textAlign: 'center', padding: '100px', color: '#444', fontWeight: 'bold' }}>ŽÁDNÁ DATA. SPUSTI SYNCHRONIZACI.</div>}
          </div>
        )}
      </main>
    </div>
  );
}
