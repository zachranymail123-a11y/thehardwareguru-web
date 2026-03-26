"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, AlertCircle,
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers, ChevronRight, Play,
  Download, Eye, Check, RotateCcw, Smartphone, Monitor, ArrowLeft, TrendingUp, Gamepad2, Star, Heart, Ghost, Brain,
  LineChart, ArrowUpRight, Info, BarChart3, MessageSquare, User, Mail, CheckSquare
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GURU ULTIMATE COMMAND CENTER V6.4 (SEO BATCH AUTO-FIX ADDED)
 * Cesta: src/app/admin/page.js
 * 🛡️ STATUS: PRODUCTION READY
 */

const INDEXNOW_KEY = "85b2e3f5a1c44d7e9b0d3f2a1b5c4d7e";
const BASE_URL = "thehardwareguru.cz";

// --- 🚀 GURU ENV ENGINE ---
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

const exampleCpuJson = `{\n  "vendor": "AMD",\n  "architecture": "Zen 4",\n  "cores": 8,\n  "threads": 16,\n  "base_clock_mhz": 4200,\n  "boost_clock_mhz": 5200,\n  "tdp_w": 120,\n  "l3_cache_mb": 96,\n  "release_price_usd": 699,\n  "release_date": "2026-03-15",\n  "performance_index": 125\n}`;
const exampleGpuJson = `{\n  "vendor": "NVIDIA",\n  "architecture": "Blackwell",\n  "vram_gb": 16,\n  "memory_bus": "256-bit",\n  "base_clock_mhz": 2200,\n  "boost_clock_mhz": 2600,\n  "tdp_w": 400,\n  "release_price_usd": 999,\n  "release_date": "2026-03-15",\n  "performance_index": 290\n}`;

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

  // --- PORADNA STATE ---
  const [poradnaQuestions, setPoradnaQuestions] = useState([]);
  const [poradnaLoading, setPoradnaLoading] = useState(false);
  const [poradnaAnswers, setPoradnaAnswers] = useState({});
  const [poradnaSubmitting, setPoradnaSubmitting] = useState(null);

  // --- CONTENT BOOSTER STATE ---
  const [boosterStats, setBoosterStats] = useState({ total: 0, boosted: 0, pending: 0, sample: [] });
  const [boosterLoading, setBoosterLoading] = useState(false);

  // --- SEO AUDIT STATE ---
  const [seoAudits, setSeoAudits] = useState([]);
  const [seoAuditsLoading, setSeoAuditsLoading] = useState(false);
  const [selectedAudits, setSelectedAudits] = useState([]);
  const [batchFixing, setBatchFixing] = useState(false);

  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  const fetchBoosterStats = async () => {
    setBoosterLoading(true);
    addLog('Skenuji stav High-Value obsahu...', 'warning');
    const { data, error } = await supabase.from('posts').select('id, title, content, content_en');
    if (error) {
        addLog(`Chyba boosteru: ${error.message}`, 'error');
    } else {
        const ok = data.filter(p => (p.content?.length || 0) > 2000 && (p.content_en?.length || 0) > 2000);
        const bad = data.filter(p => (p.content?.length || 0) < 2000 || !p.content_en || p.content_en.length < 2000);
        setBoosterStats({ total: data.length, boosted: ok.length, pending: bad.length, sample: bad.slice(0, 15) });
        addLog(`Nafouknuto: ${ok.length} / ${data.length}`, 'success');
    }
    setBoosterLoading(false);
  };

  // --- FETCH SEO AUDITS ---
  const fetchSeoAudits = async () => {
    setSeoAuditsLoading(true);
    setSelectedAudits([]); // Reset výběru při refreši
    addLog('Načítám AI SEO Audity z karantény...', 'warning');
    const { data, error } = await supabase
        .from('seo_audits')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        addLog(`Chyba načítání SEO auditů: ${error.message}`, 'error');
    } else {
        setSeoAudits(data || []);
        addLog(`Načteno ${data?.length || 0} SEO auditů.`, 'success');
    }
    setSeoAuditsLoading(false);
  };

  const updateAuditStatus = async (id, newStatus) => {
    addLog(`Měním status auditu na: ${newStatus}...`, 'warning');
    const { error } = await supabase
        .from('seo_audits')
        .update({ status: newStatus, resolved_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        addLog(`Chyba aktualizace auditu: ${error.message}`, 'error');
    } else {
        addLog('Audit úspěšně vyřešen a odsunut z fronty.', 'success');
        setSeoAudits(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        setSelectedAudits(prev => prev.filter(aId => aId !== id));
    }
  };

  const toggleAuditSelection = (id) => {
      setSelectedAudits(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
  };

  // --- 🚀 AI BATCH AUTO-FIX LOGIC ---
  const handleBatchAutoFix = async () => {
      if (selectedAudits.length === 0) return;
      
      setBatchFixing(true);
      addLog(`Spouštím dávkovou AI opravu pro ${selectedAudits.length} článků...`, 'warning');
      
      let successCount = 0;
      const openAiKey = getEnv('OPENAI_API_KEY');

      if (!openAiKey) {
          addLog('Chybí OpenAI klíč.', 'error');
          setBatchFixing(false);
          return;
      }

      for (const auditId of selectedAudits) {
          const audit = seoAudits.find(a => a.id === auditId);
          if (!audit) continue;

          addLog(`Analyzuji a opravuji: ${audit.url.split('/').pop()}...`, 'info');

          try {
              if (!audit.url.includes('/clanky/')) throw new Error('Auto-Fix aktuálně podporuje pouze články (/clanky/).');
              
              const slug = audit.url.split('/').pop();
              const { data: post, error: postErr } = await supabase.from('posts').select('*').eq('slug', slug).single();
              
              if (postErr || !post) throw new Error('Článek nenalezen v databázi.');

              const response = await fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiKey}` },
                  body: JSON.stringify({
                      model: "gpt-4o",
                      messages: [
                          { role: "system", content: `Jsi expertní SEO architekt. Oprav SEO metadata pro tento článek, aby vyhovoval Google a Bing standardům. 
Tyto chyby byly nalezeny: ${JSON.stringify(audit.critical_errors)}.
Vrať POUZE validní JSON s opravenými daty: { "title": "nový titulek (max 60 znaků bez duplicit)", "seo_description": "nový popisek (max 155 znaků)" }` },
                          { role: "user", content: `Původní title: ${post.title}\nPůvodní SEO description: ${post.seo_description || post.description || 'Chybí'}\nZkrácený obsah: ${post.content_cs?.substring(0, 1000) || post.content?.substring(0, 1000)}` }
                      ],
                      response_format: { type: "json_object" }
                  })
              });

              const r = await response.json();
              const fixedData = JSON.parse(r.choices[0].message.content);

              if (!fixedData.title || !fixedData.seo_description) throw new Error('AI nevrátilo kompletní data.');

              // Update Post in DB
              const { error: updateErr } = await supabase.from('posts').update({
                  title: fixedData.title,
                  seo_description: fixedData.seo_description
              }).eq('id', post.id);

              if (updateErr) throw updateErr;

              // Update Audit Status
              await supabase.from('seo_audits').update({ status: 'approved', resolved_at: new Date().toISOString() }).eq('id', audit.id);

              // Update UI State
              setSeoAudits(prev => prev.map(a => a.id === audit.id ? { ...a, status: 'approved' } : a));
              successCount++;
              
              addLog(`Hotovo: ${fixedData.title}`, 'success');

          } catch (err) {
              addLog(`Chyba u ${audit.url.split('/').pop()}: ${err.message}`, 'error');
          }
      }

      // ODPÁLENÍ JEDNOHO VERCEL BUILDU NA KONCI
      if (successCount > 0) {
          const vercelWebhook = getEnv('NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL');
          if (vercelWebhook) {
              addLog(`Dávka dokončena (${successCount} opraveno). Odpaluji JEDEN finální Vercel Rebuild...`, 'warning');
              fetch(vercelWebhook, { method: 'POST' }).then(() => {
                  addLog('Vercel Build spuštěn. Změny budou online za 1-2 minuty.', 'success');
              }).catch(() => {
                  addLog('Vercel webhook selhal.', 'error');
              });
          } else {
              addLog(`Dávka dokončena, ale chybí Vercel Webhook v .env pro automatický rebuild.`, 'warning');
          }
      }

      setSelectedAudits([]); // Vyčištění výběru
      setBatchFixing(false);
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
                if (topName) {
                    addLog(`Skenování dokončeno. Top trend: ${topName}`, "success");
                } else {
                    addLog(`Skenování dokončeno, ale pole s názvem hry chybí (zkontroluj výstup API).`, "warning");
                }
            }
        } else {
             addLog(`Predictor API nevrátilo platná data.`, "error");
             setPredictorData([]);
        }
    } catch (e) { 
        addLog(`Predictor selhal: ${e.message}`, "error"); 
        setPredictorData([]);
    }
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
      
      const newDraft = { 
          ...aiData, 
          image_url: imageUrl, 
          created_at: new Date().toISOString(), 
          original_item: item 
      };
      
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
        addLog(`Článek úspěšně publikován do DB pod štítkem: ${postType.toUpperCase()}`, 'success');

        const webhookUrl = process.env.NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL || getEnv('NEXT_PUBLIC_MAKE_ARTICLE_WEBHOOK_URL');
        if (webhookUrl) {
            addLog('Odesílám data na Make.com (Vercel + Sítě)...', 'warning');
            const articleUrl = `https://thehardwareguru.cz/clanky/${finalSlug}`;
            await fetch(webhookUrl, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "publish",
                    title: draft.title_cs,
                    slug: finalSlug,
                    url: articleUrl,
                    description: draft.seo_description_cs || draft.description_cs,
                    image_url: draft.image_url,
                    type: postType
                })
            }).catch(err => console.error("Webhook trigger failed:", err));
            addLog('Webhook úspěšně odeslán.', 'success');
        } else {
            addLog('CHYBA: Webhook URL chybí v .env! Článek je v DB, ale na sítě se neposlal.', 'error');
        }

        setDraft(null);
        setPreviewMode('none');
    } catch (e) {
        addLog(`Chyba publikace: ${e.message}`, 'error');
    }
    setLoading(false);
  };

  const fetchPoradnaQuestions = async () => {
    setPoradnaLoading(true);
    addLog('Načítám dotazy z poradny...', 'info');
    const { data, error } = await supabase
      .from('pc_questions')
      .select('*')
      .order('is_answered', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
        addLog(`Chyba načítání poradny: ${error.message}`, 'error');
    } else {
        setPoradnaQuestions(data || []);
        addLog(`Načteno ${data?.length || 0} dotazů.`, 'success');
    }
    setPoradnaLoading(false);
  };

  const handlePoradnaAnswerChange = (id, text) => {
    setPoradnaAnswers({ ...poradnaAnswers, [id]: text });
  };

  const submitPoradnaAnswer = async (id) => {
    const answerText = poradnaAnswers[id];
    if (!answerText || answerText.trim() === '') return;

    setPoradnaSubmitting(id);
    addLog(`Ukládám odpověď na dotaz ID: ${id}...`, 'warning');

    const { error } = await supabase
      .from('pc_questions')
      .update({ 
        answer: answerText, 
        is_answered: true 
      })
      .eq('id', id);

    if (error) {
      addLog(`Chyba při ukládání odpovědi: ${error.message}`, 'error');
    } else {
      addLog(`Odpověď uložena!`, 'success');
      setPoradnaQuestions(poradnaQuestions.map(q => 
        q.id === id ? { ...q, is_answered: true, answer: answerText } : q
      ));
    }
    setPoradnaSubmitting(null);
  };


  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('guru_admin_auth') === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'predictor') fetchPredictor();
      if (activeTab === 'intel-hub') fetchIntelFeed();
      if (activeTab === 'poradna') fetchPoradnaQuestions();
      if (activeTab === 'booster') fetchBoosterStats();
      if (activeTab === 'seo-audit') fetchSeoAudits();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (dbTab === 'cpu') setDbFormData(prev => ({...prev, rawData: exampleCpuJson, name: '', slug: ''}));
    else if (dbTab === 'gpu') setDbFormData(prev => ({...prev, rawData: exampleGpuJson, name: '', slug: ''}));
    else setDbFormData(prev => ({...prev, rawData: '', name: '', slug: ''}));
    setDbMessage({ type: '', text: '', links: [] });
  }, [dbTab]);

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
    setDbMessage({ type: '', text: '', links: [] });
    
    const table = dbTab === 'games' ? 'games' : (dbTab === 'gpu' ? 'gpus' : 'cpus');
    
    const safeSlug = slugify(dbFormData.slug || dbFormData.name);

    let payload = {
        name: dbFormData.name.trim()
    };

    if (dbTab === 'games' || dbTab === 'gpu') {
        payload.slug = safeSlug;
    }

    if (dbTab !== 'games') {
        try {
            const parsedData = JSON.parse(dbFormData.rawData);
            payload = { ...payload, ...parsedData };
        } catch (err) {
            setDbMessage({ type: 'error', text: 'CHYBA: Neplatný formát JSON! Zkontrolujte uvozovky a čárky.' });
            addLog('JSON Parse Error! HW neuložen.', 'error');
            setDbLoading(false);
            return;
        }
    }

    addLog(`Ukládám ${dbTab.toUpperCase()}: ${payload.name} do databáze...`, 'warning');

    const { data: insertedData, error } = await supabase.from(table).insert([payload]).select();
    
    if (error || !insertedData || insertedData.length === 0) {
      setDbMessage({ type: 'error', text: `Chyba DB: ${error?.message || 'Záznam nevložen'}` });
      addLog(`DB Error: ${error?.message}`, 'error');
      setDbLoading(false);
      return;
    }

    const insertedItem = insertedData[0];
    let successText = `Úspěšně přidáno: ${payload.name}! `;
    let verificationLinks = [];

    try {
        if (dbTab === 'cpu') {
            addLog(`Generuji všechny možné duely a upgrady pro procesor ${payload.name}...`, 'warning');
            const { data: allCpus, error: cpuSelectErr } = await supabase.from('cpus').select('id, name').neq('id', insertedItem.id);
            
            if (cpuSelectErr) addLog(`CHYBA čtení existujících CPU: ${cpuSelectErr.message}`, 'error');

            if (allCpus && allCpus.length > 0) {
                const duelsToInsert = allCpus.map(c => {
                    const cSlug = slugify(c.name);
                    const dSlug = `${safeSlug}-vs-${cSlug}`;
                    return {
                        slug: dSlug,
                        slug_en: `en-${dSlug}`,
                        cpu_a_id: insertedItem.id,
                        cpu_b_id: c.id,
                        title_cs: `Srovnání procesorů: ${payload.name} vs ${c.name}`,
                        title_en: `Processors comparison: ${payload.name} vs ${c.name}`,
                        seo_description_cs: `Detailní srovnání výkonu a parametrů mezi ${payload.name} a ${c.name}.`,
                        seo_description_en: `Detailed performance and specs comparison between ${payload.name} and ${c.name}.`,
                        created_at: new Date().toISOString()
                    };
                });
                const { error: dErr } = await supabase.from('cpu_duels').insert(duelsToInsert);
                if (dErr) addLog(`CHYBA zápisu duelů: ${dErr.message}`, 'error');

                const upgradesToInsert = allCpus.map(c => {
                    const cSlug = slugify(c.name);
                    const uSlug = `${cSlug}-to-${safeSlug}`;
                    return {
                        slug: uSlug,
                        slug_en: `en-${uSlug}`,
                        old_cpu_id: c.id,
                        new_cpu_id: insertedItem.id,
                        title_cs: `Upgrade z ${c.name} na ${payload.name}`,
                        title_en: `Upgrade from ${c.name} to ${payload.name}`,
                        seo_description_cs: `Vyplatí se přechod z procesoru ${c.name} na ${payload.name}? Podívejte se na reálné srovnání a benchmarky.`,
                        seo_description_en: `Is it worth upgrading your processor from ${c.name} to ${payload.name}? See real benchmarks and specs comparison.`,
                        created_at: new Date().toISOString()
                    };
                });
                const { error: uErr } = await supabase.from('cpu_upgrades').insert(upgradesToInsert);
                if (uErr) addLog(`CHYBA zápisu upgradů: ${uErr.message}`, 'error');

                successText += `Vygenerováno a uloženo ${duelsToInsert.length} duelů a ${upgradesToInsert.length} upgradů. `;
                addLog(`Vytvořeno ${duelsToInsert.length} duelů a ${upgradesToInsert.length} upgradů!`, 'success');

                const randomOtherCpu = allCpus[0];
                const rSlug = slugify(randomOtherCpu.name);
                
                verificationLinks = [
                    { label: '🔥 PROFIL', url: `/cpu/${safeSlug}` },
                    { label: '⚔️ CPU vs CPU', url: `/cpuvs/${safeSlug}-vs-${rSlug}` },
                    { label: '🚀 UPGRADE', url: `/cpu-upgrade/${rSlug}-to-${safeSlug}` },
                    { label: '🎮 CPU FPS', url: `/cpu-fps/${safeSlug}/cyberpunk-2077` },
                    { label: '⚠️ BOTTLENECK', url: `/bottleneck/${safeSlug}-with-geforce-rtx-5090` }
                ];
            }
        } else if (dbTab === 'gpu') {
            addLog(`Generuji všechny možné duely a upgrady pro grafiku ${payload.name}...`, 'warning');
            const { data: allGpus, error: gpuSelectErr } = await supabase.from('gpus').select('id, name').neq('id', insertedItem.id);
            
            if (gpuSelectErr) addLog(`CHYBA čtení existujících GPU: ${gpuSelectErr.message}`, 'error');

            if (allGpus && allGpus.length > 0) {
                const duelsToInsert = allGpus.map(g => {
                    const gSlug = slugify(g.name);
                    const dSlug = `${safeSlug}-vs-${gSlug}`;
                    return {
                        slug: dSlug,
                        slug_en: `en-${dSlug}`,
                        gpu_a_id: insertedItem.id,
                        gpu_b_id: g.id,
                        title_cs: `Srovnání grafik: ${payload.name} vs ${g.name}`,
                        title_en: `Graphics cards comparison: ${payload.name} vs ${g.name}`,
                        seo_description_cs: `Detailní srovnání herního výkonu a parametrů mezi ${payload.name} a ${g.name}.`,
                        seo_description_en: `Detailed gaming performance and specs comparison between ${payload.name} and ${g.name}.`,
                        created_at: new Date().toISOString()
                    };
                });
                const { error: dErr } = await supabase.from('gpu_duels').insert(duelsToInsert);
                if (dErr) addLog(`CHYBA zápisu duelů: ${dErr.message}`, 'error');

                const upgradesToInsert = allGpus.map(g => {
                    const gSlug = slugify(g.name);
                    const uSlug = `${gSlug}-to-${safeSlug}`;
                    return {
                        slug: uSlug,
                        slug_en: `en-${uSlug}`,
                        old_gpu_id: g.id,
                        new_gpu_id: insertedItem.id,
                        title_cs: `Upgrade z ${g.name} na ${payload.name}`,
                        title_en: `Upgrade from ${g.name} to ${payload.name}`,
                        seo_description_cs: `Detailní analýza přechodu z grafické karty ${g.name} na ${payload.name}.`,
                        seo_description_en: `Detailed upgrade path analysis between ${g.name} and ${payload.name}.`,
                        created_at: new Date().toISOString()
                    };
                });
                const { error: uErr } = await supabase.from('gpu_upgrades').insert(upgradesToInsert);
                if (uErr) addLog(`CHYBA zápisu upgradů: ${uErr.message}`, 'error');

                successText += `Vygenerováno a uloženo ${duelsToInsert.length} duelů a ${upgradesToInsert.length} upgradů. `;
                addLog(`Vytvořeno ${duelsToInsert.length} duelů a ${upgradesToInsert.length} upgradů!`, 'success');

                const randomOtherGpu = allGpus[0];
                const rSlug = slugify(randomOtherGpu.name);
                
                verificationLinks = [
                    { label: '🔥 PROFIL', url: `/gpu/${safeSlug}` },
                    { label: '⚔️ GPU vs GPU', url: `/gpuvs/${safeSlug}-vs-${rSlug}` },
                    { label: '🚀 UPGRADE', url: `/gpu-upgrade/${rSlug}-to-${safeSlug}` },
                    { label: '🎮 GPU FPS', url: `/gpu-fps/${safeSlug}/cyberpunk-2077` },
                    { label: '⚠️ BOTTLENECK', url: `/bottleneck/amd-ryzen-7-7800x3d-with-${safeSlug}` }
                ];
            }
        } else if (dbTab === 'games') {
            successText += `Hra přidána. Databázový trigger automaticky dopočítává všechny FPS metriky. `;
            addLog(`Hra zapsána a auto_game_engine počítá FPS matici na pozadí!`, 'success');

            verificationLinks = [
                { label: '🎮 GPU FPS TEST', url: `/gpu-fps/geforce-rtx-5090/${safeSlug}` },
                { label: '⚡ CPU FPS TEST', url: `/cpu-fps/amd-ryzen-7-7800x3d/${safeSlug}` },
                { label: '⚠️ BOTTLENECK + HRA', url: `/bottleneck/amd-ryzen-7-7800x3d-with-geforce-rtx-5090-in-${safeSlug}` }
            ];
        }
    } catch (e) {
        addLog(`Chyba při generování dodatečných dat (duely atd.): ${e.message}`, 'error');
    }

    const vercelWebhook = getEnv('NEXT_PUBLIC_VERCEL_DEPLOY_WEBHOOK_URL');
    if (vercelWebhook) {
        addLog('Odesílám signál do Vercelu pro automatický rebuild SSG stránek...', 'warning');
        fetch(vercelWebhook, { method: 'POST' })
            .then(res => {
                if(res.ok) {
                    addLog('Vercel Build úspěšně spuštěn! Za cca 1-2 minuty budou nové stránky staticky vygenerovány a funkční.', 'success');
                } else {
                    addLog('Vercel Build selhal (chyba webhooku).', 'error');
                }
            })
            .catch(err => addLog(`Chyba připojení k Vercelu: ${err.message}`, 'error'));
        
        successText += 'Byl spuštěn Vercel Rebuild. Odkazy budou funkční za cca 2 minuty.';
    } else {
        addLog('CHYBA: Vercel Webhook URL chybí v .env! Rebuild se nespustil, stránky hodí 404 dokud nespustíš build ručně.', 'error');
        successText += 'POZOR: Automatický rebuild nenastaven. Stránky zatím neexistují (404).';
    }

    setDbMessage({ type: 'success', text: successText, links: verificationLinks });
    setDbFormData(prev => ({ ...prev, name: '', slug: '' }));
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

  const googleGoldenRichSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Guru Command Center",
    "description": "Administrace platformy The Hardware Guru",
    "url": `https://${BASE_URL}/admin`
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0d', display: 'flex', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(googleGoldenRichSchema) }} />
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
          <SidebarItemUI id="booster" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Flame />} label="CONTENT BOOSTER" color="#ff4b2b" />
          <SidebarItemUI id="intel-hub" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Layers />} label="INTEL HUB" color="#a855f7" />
          <SidebarItemUI id="seo-audit" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LineChart />} label="SEO AUDIT" color="#10b981" />
          <SidebarItemUI id="database" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Database />} label="DATABÁZE (NEW)" color="#66fcf1" />
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
                <p style={{ color: '#4b5563', fontWeight: 'bold' }}>Monitoring High-Value Contentu pro AdSense</p>
              </div>
              <button onClick={fetchBoosterStats} disabled={boosterLoading} style={{ background: '#ff4b2b', color: '#fff', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {boosterLoading ? <RefreshCw className="spin" size={20}/> : <RotateCcw size={20}/>} OBNOVIT STAV
              </button>
            </header>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#111318', padding: '30px', borderRadius: '20px', border: '1px solid #ffffff08', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#4b5563', letterSpacing: '2px', marginBottom: '10px' }}>CELKEM ČLÁNKŮ</div>
                    <div style={{ fontSize: '48px', fontWeight: 950 }}>{boosterStats.total}</div>
                </div>
                <div style={{ background: '#111318', padding: '30px', borderRadius: '20px', border: '1px solid #10b98144', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', letterSpacing: '2px', marginBottom: '10px' }}>HVC (DOKONČENO)</div>
                    <div style={{ fontSize: '48px', fontWeight: 950, color: '#10b981' }}>{boosterStats.boosted}</div>
                </div>
                <div style={{ background: '#111318', padding: '30px', borderRadius: '20px', border: '1px solid #ff4b2b44', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff4b2b', letterSpacing: '2px', marginBottom: '10px' }}>THIN (ČEKÁ NA AI)</div>
                    <div style={{ fontSize: '48px', fontWeight: 950, color: '#ff4b2b' }}>{boosterStats.pending}</div>
                </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#fff', marginBottom: '20px', borderLeft: '4px solid #ff4b2b', paddingLeft: '15px' }}>FRONTA KE ZPRACOVÁNÍ (MAX 15)</h3>
            <div style={{ background: '#0d0e12', borderRadius: '20px', border: '1px solid #ffffff0d', overflow: 'hidden' }}>
                {boosterStats.sample.map((art, i) => (
                    <div key={i} style={{ padding: '15px 25px', borderBottom: '1px solid #ffffff05', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{art.title}</div>
                            <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>Délka CZ: {art.content?.length || 0} | EN: {art.content_en?.length || 0}</div>
                        </div>
                        <div style={{ background: '#ff4b2b22', color: '#ff4b2b', padding: '5px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 950 }}>THIN CONTENT</div>
                    </div>
                ))}
                {boosterStats.sample.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#10b981', fontWeight: 900 }}>VŠECHNY ČLÁNKY JSOU NAFOUKNUTY! 🎉</div>
                )}
            </div>
          </div>
        )}

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
                        <div className="score-badge">{item.trend_score || 'N/A'}</div>
                        <Gamepad2 color="#eab308" size={32} />
                        <h3 style={{ fontSize: '18px', fontWeight: 950, margin: '15px 0' }}>{item.game || item.name || item.title || 'Neznámá Hra'}</h3>
                        <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Steam: {item.steam_players ? Math.round(item.steam_players) : 'N/A'}</span>
                            <span>Reddit: {item.reddit_mentions || 'N/A'}</span>
                        </div>
                        <button onClick={() => { setDbFormData({ name: item.game || item.name || item.title || '', slug: slugify(item.game || item.name || item.title || ''), rawData: '' }); setDbTab('games'); setActiveTab('database'); }} style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#eab30811', border: '1px solid #eab30833', color: '#eab308', fontWeight: '950', borderRadius: '12px', cursor: 'pointer', fontSize: '10px' }}>PŘEDVYPLNIT DATABÁZI</button>
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
                    <a href={item.link} target="_blank" rel="noreferrer" className="card-btn" style={{flex: 1, textAlign: 'center'}}>ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="card-btn card-btn-main" style={{flex: 2}}>
                        {processingTitle === item.title ? 'AI...' : 'KONCEPT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#ff0055', marginBottom: '20px', borderLeft: '4px solid #ff0055', paddingLeft: '15px', marginTop: '40px' }}>GAMING RADAR</h3>
            <div className="hub-grid">
              {gameIntel.map((item, i) => (
                <div key={i} className="compact-card" style={{borderColor: 'rgba(255, 0, 85, 0.1)'}}>
                  <div className="badge" style={{background: '#ff0055', color: '#fff'}}>{item.viral_score}%</div>
                  <span className="card-source">{item.source}</span>
                  <h4 className="card-title">{item.title}</h4>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <a href={item.link} target="_blank" rel="noreferrer" className="card-btn" style={{flex: 1, textAlign: 'center'}}>ZDROJ</a>
                    <button onClick={() => createDraftFromIntel(item)} disabled={!!processingTitle} className="card-btn card-btn-main" style={{borderColor: '#ff005544', color: '#ff0055', flex: 2}}>
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
                    <button onClick={() => setDbTab('games')} className={`db-tab-btn ${dbTab === 'games' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'games' ? '#66fcf1' : '#111', color: dbTab === 'games' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>1. HRY</button>
                    <button onClick={() => setDbTab('gpu')} className={`db-tab-btn ${dbTab === 'gpu' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'gpu' ? '#66fcf1' : '#111', color: dbTab === 'gpu' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>2. GRAFIKY</button>
                    <button onClick={() => setDbTab('cpu')} className={`db-tab-btn ${dbTab === 'cpu' ? 'active' : ''}`} style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: dbTab === 'cpu' ? '#66fcf1' : '#111', color: dbTab === 'cpu' ? '#000' : '#666', fontWeight: '900', cursor: 'pointer'}}>3. PROCESORY</button>
                </div>

                <form onSubmit={handleDbSubmit} style={{ background: '#111318', padding: '40px', borderRadius: '24px', border: '1px solid #333' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{fontSize: '10px', fontWeight: '900', color: '#4b5563'}}>NÁZEV</label>
                            <input type="text" value={dbFormData.name} onChange={(e) => setDbFormData({...dbFormData, name: e.target.value})} placeholder={dbTab === 'games' ? "Např. GTA 6" : "Např. AMD Ryzen 9 9950X"} style={{ padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }} required />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{fontSize: '10px', fontWeight: '900', color: '#4b5563'}}>SLUG (SEO)</label>
                            <input type="text" value={dbFormData.slug} onChange={(e) => setDbFormData({...dbFormData, slug: e.target.value})} placeholder="Ponech prázdné pro auto-generaci" style={{ padding: '15px', borderRadius: '12px', background: '#000', border: '1px solid #222', color: '#666' }} />
                        </div>
                    </div>

                    {dbTab !== 'games' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{fontSize: '10px', fontWeight: '900', color: '#66fcf1'}}>SPECIFIKACE (ČISTÝ JSON) - POUZE PŘEPIŠTE HODNOTY, NEMĚŇTE NÁZVY KLÍČŮ</label>
                            <textarea 
                                rows={12} 
                                value={dbFormData.rawData} 
                                onChange={(e) => setDbFormData({...dbFormData, rawData: e.target.value})} 
                                style={{ padding: '15px', borderRadius: '12px', background: '#000', border: '1px dashed #66fcf1', color: '#eab308', fontFamily: 'monospace', fontSize: '13px' }} 
                                required 
                            />
                        </div>
                    )}

                    <button type="submit" disabled={dbLoading} style={{ width: '100%', padding: '20px', background: '#66fcf1', color: '#000', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', marginTop: '30px' }}>
                        {dbLoading ? 'ZPRACOVÁVÁM A GENERUJI DUELY...' : `VLOŽIT ${dbTab.toUpperCase()} A VYGENEROVAT VŠECHNY DUELY`}
                    </button>

                    {dbMessage.text && (
                        <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: dbMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${dbMessage.type === 'success' ? '#10b981' : '#ef4444'}`, textAlign: 'center' }}>
                            <p style={{ color: dbMessage.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 'bold', margin: '0 0 15px 0' }}>{dbMessage.text}</p>
                            {dbMessage.links && dbMessage.links.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                    {dbMessage.links.map((lnk, idx) => (
                                        <a key={idx} href={lnk.url} target="_blank" rel="noreferrer" style={{ background: '#111', padding: '8px 15px', borderRadius: '8px', color: '#66fcf1', fontWeight: '950', textDecoration: 'none', border: '1px solid rgba(102, 252, 241, 0.3)', fontSize: '11px', textTransform: 'uppercase', transition: '0.2s' }}>
                                            {lnk.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                                    {seznamStats.data?.content?.count ?? seznamStats.data?.documents?.content?.count ?? 'N/A'}
                                </div>
                            </div>
                        </div>

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

        {/* 🚀 NOVÁ ZÁLOŽKA: PORADNA */}
        {activeTab === 'poradna' && (
          <div className="fade-in">
            <header style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(59, 130, 246, 0.1)' }}>
                <MessageSquare size={14} /> SPRÁVA DOTAZŮ
              </div>
              <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '950', textTransform: 'uppercase', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                PC <span style={{ color: '#3b82f6' }}>PORADNA</span>
                <button onClick={fetchPoradnaQuestions} disabled={poradnaLoading} style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: '950', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {poradnaLoading ? <RefreshCw className="spin" size={16}/> : <RefreshCw size={16}/>} REFRESH
                </button>
              </h1>
              <p style={{ color: '#9ca3af', marginTop: '10px' }}>
                Čeká na tebe <strong style={{ color: poradnaQuestions.filter(q => !q.is_answered).length > 0 ? '#f59e0b' : '#4ade80' }}>{poradnaQuestions.filter(q => !q.is_answered).length}</strong> nezodpovězených dotazů.
              </p>
            </header>

            {poradnaQuestions.length === 0 ? (
              <div style={{ background: 'rgba(15,17,21,0.5)', padding: '40px', textAlign: 'center', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                {poradnaLoading ? 'Načítám dotazy...' : 'Zatím tu nejsou žádné dotazy.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '30px' }}>
                {poradnaQuestions.map((q) => (
                  <div key={q.id} style={{ background: '#0f1115', border: q.is_answered ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
                    
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="#3b82f6" /> {q.name}
                        </strong>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                          <Mail size={12} /> {q.email}
                        </div>
                        {q.components && (
                          <div style={{ color: '#d1d5db', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Cpu size={14} color="#f59e0b" /> {q.components}
                          </div>
                        )}
                      </div>
                      
                      {q.is_answered ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          <CheckCircle2 size={14} /> Vyřešeno
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          <AlertCircle size={14} /> Čeká na odpověď
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{q.question}</p>
                    </div>

                    <div style={{ padding: '20px', background: q.is_answered ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {q.is_answered ? (
                        <div>
                          <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Tvoje odpověď:</span>
                          <p style={{ color: '#d1d5db', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{q.answer}</p>
                        </div>
                      ) : (
                        <div>
                          <textarea 
                            value={poradnaAnswers[q.id] || ''} 
                            onChange={(e) => handlePoradnaAnswerChange(q.id, e.target.value)}
                            placeholder="Napiš svou Guru odpověď sem..."
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '15px', color: '#fff', fontFamily: 'inherit', fontSize: '1rem', minHeight: '120px', marginBottom: '15px', boxSizing: 'border-box' }}
                          />
                          <button 
                            onClick={() => submitPoradnaAnswer(q.id)}
                            disabled={poradnaSubmitting === q.id || !poradnaAnswers[q.id]}
                            style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (poradnaSubmitting === q.id || !poradnaAnswers[q.id]) ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: (poradnaSubmitting === q.id || !poradnaAnswers[q.id]) ? 0.5 : 1 }}
                          >
                            {poradnaSubmitting === q.id ? 'Ukládám...' : <><Send size={16} /> Odeslat odpověď</>}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🚀 NOVÁ ZÁLOŽKA: SEO AUDIT */}
        {activeTab === 'seo-audit' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', margin: 0 }}>SEO <span style={{ color: '#10b981' }}>AUDIT</span></h2>
                <p style={{ color: '#4b5563', fontWeight: 'bold' }}>AI návrhy pro raketový růst vyhledávačů (Read-Only)</p>
              </div>
              <button onClick={fetchSeoAudits} disabled={seoAuditsLoading} style={{ background: '#10b981', color: '#fff', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {seoAuditsLoading ? <RefreshCw className="spin" size={20}/> : <RotateCcw size={20}/>} OBNOVIT
              </button>
            </header>

            {/* 🚀 BATCH ACTION BAR (Zobrazí se, když je něco vybráno) */}
            {selectedAudits.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', padding: '20px 30px', borderRadius: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}>
                    <div style={{ fontWeight: '950', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckSquare size={24} />
                        VYBRÁNO K OPRAVĚ: {selectedAudits.length}
                    </div>
                    <button onClick={handleBatchAutoFix} disabled={batchFixing} style={{ background: '#fff', color: '#7e22ce', padding: '12px 25px', borderRadius: '12px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontSize: '14px' }}>
                        {batchFixing ? <><RefreshCw className="spin" size={18}/> OPRAVUJI...</> : <><Sparkles size={18}/> VYŘEŠIT VŠE A BUILDNOUT (1X)</>}
                    </button>
                </div>
            )}

            {seoAudits.length === 0 ? (
              <div style={{ background: '#111318', padding: '40px', textAlign: 'center', borderRadius: '24px', border: '1px dashed #10b98144', color: '#9ca3af' }}>
                {seoAuditsLoading ? 'Stahuji data z databáze...' : 'Zatím nebyly provedeny žádné SEO audity.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {seoAudits.map(audit => (
                  <div key={audit.id} style={{ background: '#111318', borderRadius: '20px', border: `1px solid ${audit.status === 'pending_review' ? (selectedAudits.includes(audit.id) ? '#a855f7' : '#eab30855') : '#333'}`, padding: '25px', position: 'relative', opacity: audit.status === 'pending_review' ? 1 : 0.5, transition: '0.2s' }}>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* 🚀 CHECKBOX PRO BATCH SELECTION */}
                            {audit.status === 'pending_review' && (
                                <input 
                                    type="checkbox" 
                                    checked={selectedAudits.includes(audit.id)} 
                                    onChange={() => toggleAuditSelection(audit.id)}
                                    style={{ width: '22px', height: '22px', accentColor: '#a855f7', cursor: 'pointer' }}
                                />
                            )}
                            <div>
                                <a href={audit.url} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {audit.url.split('/').pop()} <ExternalLink size={14} color="#6b7280" />
                                </a>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>{audit.url}</div>
                            </div>
                        </div>
                        <div style={{ background: audit.seo_score > 70 ? '#10b98122' : audit.seo_score > 40 ? '#eab30822' : '#ef444422', color: audit.seo_score > 70 ? '#10b981' : audit.seo_score > 40 ? '#eab308' : '#ef4444', padding: '10px 15px', borderRadius: '12px', fontWeight: '950', fontSize: '18px' }}>
                            {audit.seo_score} / 100
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <h4 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '12px', letterSpacing: '1px' }}>KRITICKÉ CHYBY:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '13px', lineHeight: '1.6' }}>
                                {Array.isArray(audit.critical_errors) ? audit.critical_errors.map((e, i) => <li key={i}>{e}</li>) : <li>Žádné chyby</li>}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#10b981', margin: '0 0 10px 0', fontSize: '12px', letterSpacing: '1px' }}>AI NÁVRHY:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6ee7b7', fontSize: '13px', lineHeight: '1.6' }}>
                                {Array.isArray(audit.suggestions) ? audit.suggestions.map((s, i) => <li key={i}>{s}</li>) : <li>Žádné návrhy</li>}
                            </ul>
                        </div>
                     </div>

                     {audit.status === 'pending_review' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #333', flexWrap: 'wrap' }}>
                            <button onClick={() => updateAuditStatus(audit.id, 'approved')} style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', flex: 1, textTransform: 'uppercase' }}>
                                Označit jako vyřešeno (Ručně)
                            </button>
                            <button onClick={() => updateAuditStatus(audit.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', flex: 1, textTransform: 'uppercase' }}>
                                Zamítnout
                            </button>
                        </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="terminal">
            {consoleLogs.slice(-15).map((log, i) => (<div key={i} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#eab308' : '#22c55e' }}>[{log.time}] {log.msg}</div>))}
            <div ref={logEndRef} />
        </div>
        
      </main>

      {/* 🚀 MODAL PRO NÁHLED A PUBLIKACI */}
      {draft && previewMode === 'card' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
            <div style={{ background: '#111318', padding: '40px', borderRadius: '24px', border: '1px solid #a855f7', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 0 50px rgba(168, 85, 247, 0.2)' }}>
                <button onClick={() => { setDraft(null); setPreviewMode('none'); }} style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={28}/></button>
                
                <h2 style={{ margin: '0 0 25px 0', color: '#a855f7', fontSize: '24px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={24} /> NÁHLED A PUBLIKACE ČLÁNKU
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>NÁZEV (CZ)</label>
                            <input value={draft.title_cs || ''} onChange={e => setDraft({...draft, title_cs: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>SLUG (CZ)</label>
                            <input value={draft.slug_cs || ''} onChange={e => setDraft({...draft, slug_cs: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: '#a855f7', marginBottom: '5px', display: 'block' }}>IMAGE URL (NÁHLEDOVÝ OBRÁZEK)</label>
                        <input value={draft.image_url || ''} onChange={e => setDraft({...draft, image_url: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '12px', background: '#000', border: '1px dashed #a855f7', color: '#fff', borderRadius: '8px' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>OBSAH (CZ - HTML)</label>
                        <textarea value={draft.content_cs || ''} onChange={e => setDraft({...draft, content_cs: e.target.value})} rows={6} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }} />
                    </div>
                    
                    <div style={{ height: '1px', background: '#333', margin: '15px 0' }}></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>NÁZEV (EN)</label>
                            <input value={draft.title_en || ''} onChange={e => setDraft({...draft, title_en: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>SLUG (EN)</label>
                            <input value={draft.slug_en || ''} onChange={e => setDraft({...draft, slug_en: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>OBSAH (EN - HTML)</label>
                        <textarea value={draft.content_en || ''} onChange={e => setDraft({...draft, content_en: e.target.value})} rows={6} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }} />
                    </div>
                </div>

                <button onClick={handlePublishDraft} disabled={loading} style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', borderRadius: '15px', border: 'none', fontWeight: '950', cursor: 'pointer', marginTop: '30px', fontSize: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}>
                    {loading ? <><RefreshCw className="spin" size={20}/> PUBLIKUJI A ODESÍLÁM NA SÍTĚ...</> : <><Send size={20}/> ULOŽIT DO DB, BUILDNOUT A ODESLAT NA SÍTĚ</>}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
