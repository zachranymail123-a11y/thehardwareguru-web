"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock, Calendar, Terminal,
  LayoutDashboard, Image as ImageIcon, CalendarDays, Layers
} from 'lucide-react';

// --- BEZPEČNÉ NAČÍTANIE NEXT.JS MODULOV PROTI PÁDOM ---
let usePathname = () => '';
try {
  const nextNav = require('next/navigation');
  usePathname = nextNav.usePathname;
} catch (e) {}

// --- GURU ENGINE INIT ---
let supabase;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
} catch (e) {
  supabase = { 
    from: () => ({ 
      select: () => ({ order: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: { value: 0 } }) }) }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }), in: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }), 
    storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    rpc: () => Promise.resolve()
  };
}

// Pomocná funkcia pre bezpečné Sidebar prvky
const SidebarItemUI = ({ id, activeTab, setActiveTab, icon, label, color }) => {
  const active = activeTab === id;
  return (
    <button onClick={() => setActiveTab(id)} className={`sidebar-btn ${active ? 'active' : ''}`} style={{ borderLeftColor: active ? color : 'transparent' }}>
      {React.cloneElement(icon, { size: 18, color: active ? color : '#9ca3af' })}
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </button>
  );
};

export default function AdminApp() {
  // GURU Jazyková logika
  const [currentPath, setCurrentPath] = useState('');
  useEffect(() => { setCurrentPath(window.location.pathname); }, []);
  const pathname = usePathname() || currentPath;
  const isEn = pathname.startsWith('/en');

  // --- AUTH SYSTEM ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // --- STAVY APLIKÁCIE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const logEndRef = useRef(null);

  // --- DÁTA ---
  const [data, setData] = useState({
    posts: [], deals: [], tipy: [], tweaky: [], slovnik: [],
    stats: { visits: 0, missingEn: 0, missingSeo: 0, missingSlovnik: 0 }
  });

  // --- ZĽAVY ---
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({ 
    title: '', price_cs: '', price_en: '', affiliate_link: '', 
    discount_code: '', description_cs: '', description_en: '' 
  });
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState({ firing: false, message: '', type: '' });

  // --- ABSOLÚTNE URL (OCHRANA PRED /cs/ PREFIXOM) ---
  const BASE_URL = 'https://www.thehardwareguru.cz';

  // --- OCHRANA: KONTROLA SESSION ---
  useEffect(() => {
    const authStatus = sessionStorage.getItem('guru_admin_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wifik500';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // --- TERMINÁL LOGIKA ---
  const addLog = (msg, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0]; 
    setConsoleLogs(prev => [...prev, { time: timeStr, msg, type }]);
  };

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // --- NAČÍTANIE DÁT (GURU SCAN) ---
  const fetchAndScanData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    addLog('Spouštím hloubkový sken databáze Supabase...', 'info');
    try {
      const [postsRes, dealsRes, tipyRes, tweakyRes, slovnikRes, statsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }),
        supabase.from('tweaky').select('*').order('created_at', { ascending: false }),
        supabase.from('slovnik').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single()
      ]);

      const allContent = [...(postsRes.data || []), ...(tipyRes.data || []), ...(tweakyRes.data || []), ...(slovnikRes.data || [])];
      
      const missingEnCount = allContent.filter(p => !p.title_en || (!p.content_en && !p.description_en)).length;
      const missingSeoCount = (postsRes.data || []).filter(p => !p.seo_description).length;
      const missingSlovnikEn = (slovnikRes.data || []).filter(p => !p.title_en || !p.description_en).length;

      setData({
        posts: postsRes.data || [], deals: dealsRes.data || [], tipy: tipyRes.data || [], tweaky: tweakyRes.data || [], slovnik: slovnikRes.data || [],
        stats: { visits: statsRes.data?.value || 0, missingEn: missingEnCount, missingSeo: missingSeoCount, missingSlovnik: missingSlovnikEn }
      });
      addLog(`Sken dokončen. Chybí: ${missingEnCount} EN textů, ${missingSeoCount} SEO meta.`, 'success');
    } catch (err) {
      addLog(`Chyba při skenování DB: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAndScanData();
  }, [isAuthenticated]);

  // --- API EXECUTION (ŽIVÝ TERMINÁL) ---
  const runApiTask = async (url, name) => {
    setActiveTab('terminal');
    addLog(`=== START: ${name} ===`, 'info');
    addLog(`Odesílám HTTP požadavek na: ${url}`, 'warning');
    
    try {
      const res = await fetch(url);
      const text = await res.text();
      
      if (res.ok) {
        addLog(`[200 OK] Odpověď serveru: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`, 'success');
      } else {
        addLog(`[${res.status} ERROR] Odpověď: ${text}`, 'error');
      }
    } catch (err) {
      addLog(`[FATAL] Nelze se spojit s API: ${err.message}`, 'error');
    }
    addLog(`=== END: ${name} ===`, 'info');
    fetchAndScanData();
  };

  // --- LOGIKA: PRIDANIE HRY (DEALS ADMIN) ---
  const handleAddDeal = async (e) => {
    e.preventDefault();
    if (!imageFile) return addLog('CHYBÍ OBRÁZEK HRY!', 'error');

    addLog('Nahrávám obrázek do Supabase Storage...', 'warning');
    setActiveTab('terminal');
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `deal_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);

      let finalImageUrl = '';
      if (!uploadError) {
         const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
         finalImageUrl = publicUrl;
         addLog('Obrázek nahrán úspěšně.', 'success');
      } else {
         finalImageUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
         addLog(`Chyba uploadu: ${uploadError.message}. Použit fallback obrázek.`, 'error');
      }

      addLog('Zapisuji data do game_deals...', 'warning');
      const { error: dbError } = await supabase.from('game_deals').insert([{
        ...newDeal, image_url: finalImageUrl, created_at: new Date().toISOString(), is_fired: false
      }]);

      if (dbError) throw dbError;

      addLog('HRA ÚSPĚŠNĚ PŘIDÁNA DO SYSTÉMU! 🔥', 'success');
      setShowAddDeal(false);
      setNewDeal({ title: '', price_cs: '', price_en: '', affiliate_link: '', discount_code: '', description_cs: '', description_en: '' });
      setImageFile(null);
      fetchAndScanData();
    } catch (err) {
      addLog(`CHYBA DB: ${err.message}`, 'error');
    }
  };

  const handleDeleteDeal = async (id) => {
      if (!confirm('Opravdu chceš tuto slevu smazat?')) return;
      setActiveTab('terminal');
      addLog(`Mažu slevu s ID: ${id}...`, 'warning');
      try {
          await supabase.from('game_deals').delete().eq('id', id);
          addLog('SLEVA SMAZÁNA.', 'success');
          fetchAndScanData();
      } catch (e) {
          addLog('CHYBA PŘI MAZÁNÍ.', 'error');
      }
  };

  // --- SOCIAL EXECUTOR: RUČNÉ ODPÁLENIE ---
  const executeSocialWebhook = async (item, type) => {
    setActiveTab('terminal');
    addLog(`Odpaluji ručně položku: ${item.title}`, 'warning');
    const webhook = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL;
    try {
      const response = await fetch(webhook, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }),
      });
      if (response.ok) {
        const table = type === 'deal' ? 'game_deals' : 'posts';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
        addLog('ÚSPĚŠNĚ ODESLÁNO! Položka byla skryta z fronty.', 'success');
        fetchAndScanData(); 
      } else {
        throw new Error(`HTTP Error ${response.status}`);
      }
    } catch (err) {
      addLog(`SELHALO: ${err.message}`, 'error');
    }
  };

  // --- SOCIAL EXECUTOR: SKRYŤ UŽ NASADENÉ ---
  const markAsFired = async (id, table) => {
      addLog(`Odstraňuji položku z fronty Executoru (označuji jako odeslané)...`, 'warning');
      try {
          await supabase.from(table).update({ is_fired: true }).eq('id', id);
          addLog('ÚSPĚŠNĚ SKRYTO.', 'success');
          fetchAndScanData();
      } catch (e) {
          addLog('CHYBA PŘI SKRÝVÁNÍ.', 'error');
      }
  };

  // 🚀 GURU FILTER FRONT: Iba veci staré max 14 dní, u ktorých is_fired NIE JE true
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);
  const unfiredPosts = data.posts.filter(p => p.is_fired !== true && new Date(p.created_at) > cutoffDate);
  const unfiredDeals = data.deals.filter(d => d.is_fired !== true && new Date(d.created_at) > cutoffDate);

  // --- SOCIAL EXECUTOR: HROMADNÉ VYMAZÁNÍ FRONTY ---
  const clearQueue = async () => {
      if (!confirm(isEn ? 'Clear the entire queue?' : 'Opravdu chceš smazat celou zobrazenou frontu? Všechny tyto položky se v databázi trvale označí jako odeslané a už se zde nezobrazí.')) return;
      
      setActiveTab('terminal');
      addLog('Zahajuji hromadné čištění fronty Executoru...', 'warning');
      
      try {
          const postIds = unfiredPosts.map(p => p.id);
          const dealIds = unfiredDeals.map(d => d.id);
          
          let promises = [];
          if (postIds.length > 0) promises.push(supabase.from('posts').update({ is_fired: true }).in('id', postIds));
          if (dealIds.length > 0) promises.push(supabase.from('game_deals').update({ is_fired: true }).in('id', dealIds));
          
          if (promises.length > 0) await Promise.all(promises);
          
          addLog('✅ FRONTA ÚSPĚŠNĚ VYMAZÁNA! Vše staré je pryč.', 'success');
          fetchAndScanData();
      } catch (e) {
          addLog(`❌ CHYBA PŘI ČIŠTĚNÍ FRONTY: ${e.message}`, 'error');
      }
  };

  // --- UI ZABEZPEČENIE POČAS OVEROVANIA ---
  if (isCheckingAuth) return null;

  // --- GURU LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ background: 'rgba(17, 19, 24, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', textAlign: 'center', maxWidth: '420px', width: '100%', backdropFilter: 'blur(15px)' }}>
          <Lock size={60} color="#eab308" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.5))' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '950', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Restricted Area</h1>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Guru Password..."
            style={{ width: '100%', padding: '18px', borderRadius: '15px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginBottom: '20px', outline: 'none', textAlign: 'center', letterSpacing: '5px', fontSize: '18px', transition: '0.3s' }}
            onFocus={(e) => e.target.style.borderColor = '#eab308'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {authError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>INVALID PASSWORD!</div>}
          <button type="submit" style={{ width: '100%', padding: '18px', background: '#eab308', color: '#000', border: 'none', borderRadius: '15px', fontWeight: '950', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ShieldCheck size={18} /> VSTOUPIT DO VELÍNU
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* --- CSS INJECTION --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 280px; border-right: 1px solid rgba(255,255,255,0.05); background: #0d0e12; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; max-width: 1500px; height: 100vh; overflow-y: auto; }
        
        .sidebar-header { margin: 20px 25px 10px 25px; font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-btn:hover, .sidebar-btn.active { background: rgba(255,255,255,0.05); color: #fff; }
        
        .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 12px; font-weight: 900; font-size: 11px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
        .logout-btn:hover { background: #ef4444; color: #fff; }

        .tab-title { font-size: 36px; font-weight: 950; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: -1px; }
        .add-btn { color: #fff; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 900; font-size: 13px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .add-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .action-btn { width: 100%; padding: 15px; border: none; border-radius: 12px; font-weight: 950; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

        .terminal-box { background: #000; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 15px; padding: 20px; font-family: monospace; font-size: 13px; overflow-y: auto; box-shadow: inset 0 0 20px rgba(0,0,0,1); }
        .log-line { margin-bottom: 8px; word-break: break-all; }
        .log-time { color: #4b5563; margin-right: 10px; }
        .log-line.info { color: #3b82f6; }
        .log-line.warning { color: #eab308; }
        .log-line.success { color: #22c55e; }
        .log-line.error { color: #ef4444; }

        .api-card { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; transition: 0.3s; }
        .api-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.5); }
        .missing-info { font-size: 11px; padding: 10px; border-radius: 10px; margin-bottom: 20px; font-weight: bold; text-align: center; letter-spacing: 1px; }

        .item-row { background: #111318; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 15px 25px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; gap: 20px; }
        .item-row:hover { background: rgba(255,255,255,0.02); }
        .row-img { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
        .row-title { font-weight: 900; font-size: 14px; text-transform: uppercase; }
        .row-meta { font-size: 10px; color: #4b5563; font-weight: 900; margin-top: 4px; }
        
        .fire-btn { color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 900; font-size: 11px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        .fire-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .mark-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 8px 15px; border-radius: 10px; font-weight: 900; font-size: 10px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        .mark-btn:hover { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; }
        .stat-card { background: #111318; padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .stat-card h3 { font-size: 28px; font-weight: 950; margin: 10px 0 5px 0; }
        .stat-card p { font-size: 9px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; margin: 0; }
        .stat-card.clickable:hover { border-color: #fff; transform: translateY(-5px); cursor: pointer; }

        .deal-form { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid rgba(255,0,85,0.3); margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-section-title { grid-column: span 2; font-size: 10px; color: #ff0055; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .guru-input { background: #000; border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; border-radius: 10px; color: #fff; font-size: 13px; outline: none; transition: 0.3s; width: 100%; font-family: inherit; }
        .guru-input:focus { border-color: #ff0055; }
        .file-input-wrapper { position: relative; width: 100%; height: 45px; background: #000; border: 1px dashed rgba(255,255,255,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .file-input-wrapper label { color: #fff; font-size: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; pointer-events: none; }
        .file-input-wrapper input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        .deal-card-admin { background: #111318; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; }
        .card-thumb { position: relative; height: 140px; width: 100%; background: #000; }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
        .fired-badge { position: absolute; top: 10px; right: 10px; background: #22c55e; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; }
        .card-info { padding: 15px; flex: 1; display: flex; flex-direction: column; }
        .card-title { font-weight: 900; font-size: 13px; text-transform: uppercase; margin-bottom: 5px; }
        .card-price { color: #ff0055; font-weight: 950; font-size: 16px; margin-bottom: 10px; }
        .card-actions { display: flex; gap: 10px; margin-top: auto; }
        .mini-btn { flex: 1; display: flex; justify-content: center; align-items: center; gap: 5px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; border-radius: 8px; font-size: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .mini-btn.fire:hover { background: #f97316; color: #fff !important; border-color: #f97316; }
        .mini-btn.delete { border-color: rgba(239,68,68,0.3); color: #ef4444; }
        .mini-btn.delete:hover { background: #ef4444; color: #fff; }

        .empty-state { padding: 40px; text-align: center; color: #4b5563; font-weight: 950; font-size: 12px; border: 2px dashed rgba(255,255,255,0.05); border-radius: 20px; letter-spacing: 2px; }
        
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* --- BOČNÝ PANEL --- */}
      <aside className="admin-sidebar">
        <div style={{ padding: '35px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '950', letterSpacing: '2px', color: '#a855f7' }}>
            <ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }}/> GURU <span style={{ color: '#fff' }}>ADMIN</span>
          </h1>
          <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginTop: '5px', textTransform: 'uppercase' }}>Command Center v7.0</div>
        </div>

        <nav style={{ flex: 1, paddingTop: '10px', overflowY: 'auto' }}>
          <SidebarItemUI id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard />} label="Dashboard" color="#a855f7" />
          <SidebarItemUI id="terminal" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Terminal />} label="Živý Terminál" color="#22c55e" />
          
          <div className="sidebar-header">{isEn ? 'LOGICAL GROUPS' : 'NÁSTROJE & LOGIKA'}</div>
          <SidebarItemUI id="social-planner" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Send />} label={isEn ? "Publishing & Planner" : "Publikace & Plánování"} color="#f97316" />
          <SidebarItemUI id="tweaks" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cpu />} label={isEn ? "Tweaks (Gen & Exec)" : "Tweaky (Gen & Exec)"} color="#10b981" />
          <SidebarItemUI id="content-seo" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Globe />} label={isEn ? "SEO & Translations" : "SEO & Překlady"} color="#eab308" />
          <SidebarItemUI id="automation" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap />} label={isEn ? "Automation & Tipy" : "Automatizace & Tipy"} color="#a855f7" />
          
          <div className="sidebar-header">{isEn ? 'CONTENT' : 'OBSAH'}</div>
          <SidebarItemUI id="deals" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShoppingCart />} label="Správa Slev na hry" color="#ff0055" />
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => { sessionStorage.removeItem('guru_admin_auth'); setIsAuthenticated(false); }} className="logout-btn">
                <Lock size={14} /> UZAMKNÚŤ VELÍN
            </button>
        </div>
      </aside>

      {/* --- HLAVNÝ OBSAH --- */}
      <main className="admin-main">

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="tab-title" style={{ margin: 0 }}>Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
              <button onClick={fetchAndScanData} className="add-btn" style={{ background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af' }}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH DB SCAN
              </button>
            </div>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <Activity color="#a855f7" /><h3>{data.stats.visits}</h3><p>CELKOVÉ NÁVŠTEVY</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('content-seo')}>
                    <Globe color="#eab308" /><h3 style={{ color: data.stats.missingEn > 0 ? '#ef4444' : '#22c55e' }}>{data.stats.missingEn}</h3><p>CHÝBAJÚCE EN PREKLADY</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('content-seo')}>
                    <Search color="#66fcf1" /><h3 style={{ color: data.stats.missingSeo > 0 ? '#f97316' : '#22c55e' }}>{data.stats.missingSeo}</h3><p>CHÝBAJÚCE SEO META</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('deals')}>
                    <Flame color="#ff0055" /><h3>{data.deals.length}</h3><p>AKTÍVNYCH ZLIAV</p>
                </div>
            </div>

            <div style={{ marginTop: '40px', background: '#111318', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Terminal size={20} color="#22c55e" /> Systémový Log</h3>
                <div className="terminal-box" style={{ maxHeight: '200px' }}>
                  {consoleLogs.slice(-5).map((log, i) => (
                      <div key={i} className={`log-line ${log.type}`}>
                        <span className="log-time">[{log.time}]</span> {log.msg}
                      </div>
                  ))}
                  {consoleLogs.length === 0 && <div className="log-line info">Čakám na príkazy...</div>}
                </div>
                <button onClick={() => setActiveTab('terminal')} style={{ marginTop: '15px', color: '#22c55e', background: 'transparent', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Otvoriť celý terminál →</button>
            </div>
          </section>
        )}

        {/* --- TAB: TERMINÁL --- */}
        {activeTab === 'terminal' && (
            <section className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h2 className="tab-title">Živý <span style={{ color: '#22c55e' }}>Terminál</span></h2>
                <div className="terminal-box" style={{ flex: 1, minHeight: '600px' }}>
                    {consoleLogs.map((log, i) => (
                        <div key={i} className={`log-line ${log.type}`}>
                            <span className="log-time">[{log.time}]</span> {log.msg}
                        </div>
                    ))}
                    {consoleLogs.length === 0 && <div className="log-line info">Žiadne záznamy. Spusť nejaký proces.</div>}
                    <div ref={logEndRef} />
                </div>
            </section>
        )}

        {/* --- TAB 1: PUBLIKACE & PLÁNOVÁNÍ (Executor + Planner + Kalendář) --- */}
        {activeTab === 'social-planner' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="tab-title" style={{ margin: 0 }}>Publikace & <span style={{ color: '#f97316' }}>Plánování</span></h2>
              <div style={{ display: 'flex', gap: '15px' }}>
                 <button onClick={() => runApiTask(`${BASE_URL}/api/cron/planer`, 'Plánovač Cron')} className="add-btn" style={{ background: '#3b82f6', color: '#fff' }}>
                     <CalendarClock size={16} /> SPUSTIT PLÁNOVAČ CRON
                 </button>
                 <button onClick={() => runApiTask(`${BASE_URL}/api/cron/executor`, 'Auto Executor Cron')} className="add-btn" style={{ background: '#10b981', color: '#fff' }}>
                     <Rocket size={16} /> SPUSTIT EXECUTOR CRON
                 </button>
              </div>
            </div>

            {/* Zóna Social Executor */}
            <div style={{ marginBottom: '40px', background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={20}/> SOCIAL EXECUTOR FRONTA</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                     <span style={{ fontSize: '10px', background: '#000', padding: '8px 12px', borderRadius: '8px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: '900', letterSpacing: '1px' }}>MAX 14 DNÍ STARÉ</span>
                     <button onClick={clearQueue} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}><X size={12} style={{display: 'inline', marginBottom: '-2px'}}/> SMAZAT STAROU</button>
                  </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {unfiredPosts.map(post => (
                      <div key={post.id} className="item-row" style={{ padding: '10px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden' }}>
                              <img src={post.image_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                              <div style={{ minWidth: 0 }}>
                                  <div className="row-title" style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                                  <div className="row-meta">ČLÁNEK • <span suppressHydrationWarning>{post.created_at.substring(0, 10)}</span></div>
                              </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button onClick={() => markAsFired(post.id, 'posts')} className="mark-btn"><CheckCircle2 size={14} /> UŽ JE ONLINE (SKRÝT)</button>
                              <button onClick={() => executeSocialWebhook(post, 'post')} className="fire-btn" style={{ background: '#10b981', padding: '8px 15px' }}><Send size={14} /> ODPÁLIT</button>
                          </div>
                      </div>
                  ))}
                  {unfiredDeals.map(deal => (
                      <div key={deal.id} className="item-row" style={{ borderColor: 'rgba(255,0,85,0.2)', padding: '10px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden' }}>
                              <img src={deal.image_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                              <div style={{ minWidth: 0 }}>
                                  <div className="row-title" style={{ fontSize: '12px', color: '#ff0055', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deal.title}</div>
                                  <div className="row-meta">SLEVA • {deal.price_cs}</div>
                              </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button onClick={() => markAsFired(deal.id, 'game_deals')} className="mark-btn"><CheckCircle2 size={14} /> UŽ JE ONLINE (SKRÝT)</button>
                              <button onClick={() => executeSocialWebhook(deal, 'deal')} className="fire-btn" style={{ background: '#ff0055', padding: '8px 15px' }}><Send size={14} /> ODPÁLIT</button>
                          </div>
                      </div>
                  ))}
                  {unfiredPosts.length === 0 && unfiredDeals.length === 0 && (
                      <div className="empty-state" style={{ padding: '20px' }}>VŠECHNO JE ODESLÁNO! ŽÁDNÁ FRONTA. 🚀</div>
                  )}
               </div>
            </div>

            {/* Zóna Očekávaných her (Plánovač) */}
            <div style={{ marginBottom: '40px', background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
               <h3 style={{ margin: '0 0 20px 0', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}><Database size={20}/> OČEKÁVANÉ HRY V DATABÁZI</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {data.posts.filter(p => p.type === 'expected').map(game => (
                       <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '15px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <div>
                               <div style={{ fontWeight: '950', fontSize: '14px', textTransform: 'uppercase' }}>{game.title}</div>
                               <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px', fontWeight: 'bold' }}>Vytvořeno: <span suppressHydrationWarning>{game.created_at.substring(0, 10)}</span></div>
                           </div>
                           <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '900', border: '1px solid #3b82f6', padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)' }}>PŘIPRAVENO V DB</span>
                       </div>
                   ))}
                   {data.posts.filter(p => p.type === 'expected').length === 0 && (
                       <div style={{ color: '#4b5563', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Žádné očekávané hry na analýzu.</div>
                   )}
               </div>
            </div>

            {/* Zóna Kalendář Iframe */}
            <div style={{ background: '#111318', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><CalendarDays size={20}/> HERNÍ KALENDÁŘ</h3>
                   <a href={`${BASE_URL}/kalendar`} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>OTEVŘÍT V NOVÉM OKNĚ <ExternalLink size={12} style={{display: 'inline', marginBottom: '-2px'}}/></a>
               </div>
               <iframe src={`${BASE_URL}/kalendar`} style={{ width: '100%', height: '500px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', background: '#0a0b0d' }}></iframe>
            </div>
          </section>
        )}

        {/* --- TAB 2: TWEAKY (Gen & Exec) --- */}
        {activeTab === 'tweaks' && (
          <section className="fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="tab-title" style={{ margin: 0 }}>Tweaky <span style={{ color: '#10b981' }}>Zázemí</span></h2>
              <button onClick={() => runApiTask(`${BASE_URL}/api/cron/tweak-executor`, 'Tweak Executor Cron')} className="add-btn" style={{ background: '#10b981', color: '#000' }}>
                  <Zap size={16} /> SPUSTIT TWEAK EXECUTOR
              </button>
            </div>
            <iframe src={`${BASE_URL}/admin/tweaky-generator`} style={{ width: '100%', flex: 1, border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', background: '#fff' }}></iframe>
          </section>
        )}

        {/* --- TAB 3: SEO & PŘEKLADY (Gen & Iframe) --- */}
        {activeTab === 'content-seo' && (
          <section className="fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="tab-title" style={{ margin: 0 }}>SEO & <span style={{ color: '#eab308' }}>Překlady</span></h2>
              <div style={{ display: 'flex', gap: '15px' }}>
                 <button onClick={() => runApiTask(`${BASE_URL}/api/generate-seo?secret=Wifik500`, 'SEO Generator')} className="add-btn" style={{ background: '#66fcf1', color: '#000' }}>
                     <Search size={16} /> GENERATE SEO ({data.stats.missingSeo} CHYBÍ)
                 </button>
                 <button onClick={() => runApiTask(`${BASE_URL}/api/cron/slovnik?secret=Wifik500`, 'Slovník Updater')} className="add-btn" style={{ background: '#a855f7', color: '#fff' }}>
                     <BookOpen size={16} /> UPDATE SLOVNÍK ({data.stats.missingSlovnik} CHYBÍ)
                 </button>
              </div>
            </div>
            <iframe src={`${BASE_URL}/admin/en-fixer`} style={{ width: '100%', flex: 1, border: '1px solid rgba(234,179,8,0.3)', borderRadius: '20px', background: '#fff' }}></iframe>
          </section>
        )}

        {/* --- TAB 4: AUTOMATIZACE & TIPY (Ostatní API) --- */}
        {activeTab === 'automation' && (
          <section className="fade-in">
            <h2 className="tab-title">Automatizace & <span style={{ color: '#a855f7' }}>Tipy</span></h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', fontSize: '14px' }}>
                Samostatné crony a služby pro udržení chodu webu. Výstupy jdou rovnou do živého terminálu.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
                
                <div className="api-card" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}><Lightbulb size={28} color="#eab308" /><h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>TIP GENERATOR</h3></div>
                    <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>AI vytvoří a uloží nový technologický tip do databáze.</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/generate-tip`, 'Tip Generator')} className="action-btn" style={{ background: '#eab308', color: '#000', marginTop: '15px' }}><Zap size={16} /> GENERATE TIP</button>
                </div>

                <div className="api-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}><Activity size={28} color="#ef4444" /><h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>HLAVNÍ CRON</h3></div>
                    <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>Spustí hlavní údržbové procedury webu (Cache, čištění).</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/cron`, 'Hlavní Cron')} className="action-btn" style={{ background: '#ef4444', color: '#fff', marginTop: '15px' }}><Zap size={16} /> SPUSTIT ÚDRŽBU</button>
                </div>

                <div className="api-card" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}><Video size={28} color="#8b5cf6" /><h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>CHECK LIVE STREAM</h3></div>
                    <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>Zkontroluje a aktualizuje status živého vysílání (Kick/YT).</p>
                    <button onClick={() => runApiTask(`${BASE_URL}/api/check-live`, 'Check Live Stream')} className="action-btn" style={{ background: '#8b5cf6', color: '#fff', marginTop: '15px' }}><Zap size={16} /> CHECK STREAM</button>
                </div>

            </div>
          </section>
        )}

        {/* --- TAB 5: DEALS --- */}
        {activeTab === 'deals' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="tab-title" style={{ margin: 0 }}>Správa <span style={{ color: '#ff0055' }}>Zliav</span></h2>
                <button onClick={() => setShowAddDeal(!showAddDeal)} className="add-btn" style={{ background: '#ff0055' }}>
                    {showAddDeal ? <X size={18} /> : <Plus size={18} />} {showAddDeal ? 'ZAVRIEŤ FORMULÁR' : 'PRIDAŤ NOVÚ ZĽAVU'}
                </button>
            </div>

            {showAddDeal && (
              <form onSubmit={handleAddDeal} className="deal-form">
                  <div className="form-section-title">ZÁKLADNÉ ÚDAJE</div>
                  <input type="text" placeholder="Názov hry *" required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="guru-input" />
                  
                  <div className="file-input-wrapper">
                      <label><ImageIcon size={18} /> {imageFile ? imageFile.name : 'Vyber banner (16:9) *'}</label>
                      <input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files[0])} />
                  </div>

                  <div className="form-section-title" style={{ marginTop: '15px' }}>CENY A ODKAZY</div>
                  <input type="text" placeholder="Cena CZ (napr. 990 Kč) *" required value={newDeal.price_cs} onChange={e => setNewDeal({...newDeal, price_cs: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Cena EN (napr. 39 €)" value={newDeal.price_en} onChange={e => setNewDeal({...newDeal, price_en: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Zľavový kód (voliteľné)" value={newDeal.discount_code} onChange={e => setNewDeal({...newDeal, discount_code: e.target.value})} className="guru-input" />
                  <input type="url" placeholder="Affiliate Link (URL) *" required value={newDeal.affiliate_link} onChange={e => setNewDeal({...newDeal, affiliate_link: e.target.value})} className="guru-input" />
                  
                  <div className="form-section-title" style={{ marginTop: '15px' }}>POPISY (Zobrazí sa na detaile)</div>
                  <textarea placeholder="Stručný popis CZ" value={newDeal.description_cs} onChange={e => setNewDeal({...newDeal, description_cs: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px', resize: 'vertical' }}></textarea>
                  <textarea placeholder="Stručný popis EN" value={newDeal.description_en} onChange={e => setNewDeal({...newDeal, description_en: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px', resize: 'vertical' }}></textarea>
                  
                  <button type="submit" className="action-btn" style={{ background: '#ff0055', color: '#fff', gridColumn: 'span 2', marginTop: '20px' }}>
                      <Database size={18} /> ULOŽIŤ DO DATABÁZY
                  </button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {data.deals.map(deal => (
                    <div key={deal.id} className="deal-card-admin">
                        <div className="card-thumb">
                            <img src={deal.image_url || 'https://via.placeholder.com/300x160'} alt="" />
                            {deal.is_featured && <div className="fired-badge" style={{ background: '#f97316', right: 'auto', left: '10px' }}>NA HOMEPAGE</div>}
                            {deal.is_fired && <div className="fired-badge">ODOSLANÉ NA SIETE</div>}
                        </div>
                        <div className="card-info">
                            <div className="card-title">{deal.title}</div>
                            <div className="card-price">{deal.price_cs}</div>
                            <div className="card-actions">
                                <button onClick={() => executeSocialWebhook(deal, 'deal')} className="mini-btn fire" style={{ borderColor: '#f97316', color: '#f97316' }}>
                                    <Send size={12}/> VYNÚTIŤ ODOSLANIE
                                </button>
                                <button onClick={() => handleDeleteDeal(deal.id)} className="mini-btn delete">
                                    <X size={12}/> ZMAZAŤ
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

function hexToRgb(hex) {
    if (!hex) return '255, 255, 255';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
