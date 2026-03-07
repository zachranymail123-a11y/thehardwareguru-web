"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  ShoppingCart, Activity, ShieldCheck, Zap, AlertTriangle, 
  CheckCircle2, RefreshCw, Send, Sparkles, Flame, Plus, X, 
  ExternalLink, Lightbulb, BookOpen, Wrench, Video, Cpu, Lock
} from 'lucide-react';

// --- GURU ENGINE INIT ---
// Bezpečné načtení Supabase klienta pro zajištění stability
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
      select: () => ({ order: () => Promise.resolve({ data: [] }) }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) })
    }), 
    storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) } 
  };
}

export default function AdminApp({ params }) {
  // Bezpečné načtení locale (pro Next.js 13+)
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // --- GURU AUTH SYSTEM ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // --- STAV APLIKACE ---
  const [activeTab, setActiveTab] = useState('api-hub');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ firing: false, message: '', type: '' });

  // --- STAV PRO SLEVY NA HRY ---
  const [deals, setDeals] = useState([]);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({ 
    title: '', price_cs: '', price_en: '', affiliate_link: '', 
    discount_code: '', description_cs: '', description_en: '' 
  });
  const [imageFile, setImageFile] = useState(null);

  // --- OCHRANA: KONTROLA SESSION PŘI NAČTENÍ ---
  useEffect(() => {
    const authStatus = sessionStorage.getItem('guru_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  // --- OCHRANA: PŘIHLÁŠENÍ ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Heslo je bráno z env proměnné nebo je fallback 'Wifik500' dle API klíčů
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wifik500';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('guru_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // --- DEFINICE API ENDPOINTŮ (Dle zadání) ---
  const apiEndpoints = [
    { id: 'seo', name: 'SEO Generator', url: '/api/generate-seo?secret=Wifik500', icon: <Search size={24}/>, color: '#66fcf1', desc: isEn ? 'Generate missing meta descriptions for better Google rankings.' : 'Vygeneruje chybějící meta popisky pro lepší pozice na Googlu.' },
    { id: 'tip', name: 'Tip Generator', url: '/api/generate-tip', icon: <Lightbulb size={24}/>, color: '#eab308', desc: isEn ? 'AI creates and saves a new tech tip.' : 'AI vytvoří a uloží nový technologický tip.' },
    { id: 'slovnik', name: 'Slovník Updater', url: '/api/cron/slovnik?secret=Wifik500', icon: <BookOpen size={24}/>, color: '#a855f7', desc: isEn ? 'Update terms in the hardware glossary.' : 'Aktualizace pojmů v hardwarovém slovníku.' },
    { id: 'planer', name: 'Plánovač Cron', url: '/api/cron/planer', icon: <CalendarClock size={24}/>, color: '#3b82f6', desc: isEn ? 'Process and publish scheduled articles/games.' : 'Zpracuje a publikuje naplánované články/hry dle kalendáře.' },
    { id: 'executor', name: 'Social Executor', url: '/api/cron/executor', icon: <Rocket size={24}/>, color: '#f97316', desc: isEn ? 'Send unpublished articles and deals to social networks (Discord etc.).' : 'Odešle nepublikované články a slevy na sítě (Discord atd.).' },
    { id: 'tweak_executor', name: 'Tweak Executor', url: '/api/cron/tweak-executor', icon: <Wrench size={24}/>, color: '#10b981', desc: isEn ? 'Automatic processing and sending of PC tweaks.' : 'Automatické zpracování a odeslání PC tweaků.' },
    { id: 'main_cron', name: 'Hlavní Cron', url: '/api/cron', icon: <Activity size={24}/>, color: '#ef4444', desc: isEn ? 'Run main website maintenance procedures.' : 'Spustí hlavní údržbové procedury webu.' },
    { id: 'check_live', name: 'Check Live Stream', url: '/api/check-live', icon: <Video size={24}/>, color: '#8b5cf6', desc: isEn ? 'Check and update live stream status (Kick/YT).' : 'Zkontroluje a aktualizuje status živého vysílání (Kick/YT).' },
  ];

  // --- DEFINICE INTERNÍCH NÁSTROJŮ ---
  const adminTools = [
    { id: 'en_fixer', name: 'EN Translation Fixer', url: `/${locale}/admin/en-fixer`, icon: <Globe size={24}/>, color: '#eab308', desc: isEn ? 'Tool for bulk repair and translation of missing EN texts.' : 'Nástroj pro hromadnou opravu a překlad chybějících EN textů.' },
    { id: 'tweak_gen', name: 'Tweaky Generator', url: `/${locale}/admin/tweaky-generator`, icon: <Cpu size={24}/>, color: '#10b981', desc: isEn ? 'Generator for creating new PC optimization tweaks.' : 'Generátor pro tvorbu nových optimalizačních PC tweaků.' },
  ];

  // --- UNIVERZÁLNÍ SPÍNAČ API ---
  const triggerApi = async (url, name) => {
    setStatus({ firing: true, message: isEn ? `Triggering: ${name}...` : `Spouštím: ${name}...`, type: 'info' });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      setStatus({ firing: false, message: isEn ? `SUCCESS: ${name} finished!` : `ÚSPĚCH: ${name} dokončen!`, type: 'success' });
    } catch (err) {
      setStatus({ firing: false, message: isEn ? `ERROR (${name}): ${err.message}` : `CHYBA (${name}): ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 5000);
  };

  // --- NAČTENÍ SLEV PRO SPRÁVCE ---
  const loadDeals = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('game_deals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      console.error("Chyba načítání slev:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'deals' && isAuthenticated) {
      loadDeals();
    }
  }, [activeTab, isAuthenticated]);

  // --- PŘIDÁNÍ NOVÉ SLEVY ---
  const handleAddDeal = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ firing: false, message: isEn ? 'MISSING GAME IMAGE!' : 'CHYBÍ OBRÁZEK HRY!', type: 'error' });
      return;
    }

    setStatus({ firing: true, message: isEn ? 'Uploading game to database...' : 'Nahrávám hru do databáze...', type: 'info' });
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `deal_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
      
      let finalImageUrl = '';
      if (!uploadError) {
         const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
         finalImageUrl = publicUrl;
      } else {
         console.warn("Storage upload failed, using fallback URL", uploadError);
         finalImageUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
      }

      const { error: dbError } = await supabase.from('game_deals').insert([{
        ...newDeal,
        image_url: finalImageUrl,
        is_fired: false
      }]);

      if (dbError) throw dbError;

      setStatus({ firing: false, message: isEn ? 'DEAL SUCCESSFULLY ADDED! 🔥' : 'SLEVA ÚSPĚŠNĚ PŘIDÁNA! 🔥', type: 'success' });
      setShowAddDeal(false);
      setNewDeal({ title: '', price_cs: '', price_en: '', affiliate_link: '', discount_code: '', description_cs: '', description_en: '' });
      setImageFile(null);
      loadDeals();
    } catch (err) {
      setStatus({ firing: false, message: isEn ? `DB ERROR: ${err.message}` : `CHYBA DB: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 4000);
  };

  // --- ODSTRANĚNÍ SLEVY ---
  const handleDeleteDeal = async (id) => {
      if (!confirm(isEn ? 'Really delete this deal?' : 'Opravdu chceš tuto slevu smazat?')) return;
      try {
          await supabase.from('game_deals').delete().eq('id', id);
          loadDeals();
          setStatus({ firing: false, message: isEn ? 'DEAL DELETED.' : 'SLEVA SMAZÁNA.', type: 'success' });
      } catch (e) {
          setStatus({ firing: false, message: isEn ? 'ERROR DURING DELETION.' : 'CHYBA PŘI MAZÁNÍ.', type: 'error' });
      }
      setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 3000);
  };

  // --- UI ZABEZPEČENÍ BĚHEM OVĚŘOVÁNÍ ---
  if (isCheckingAuth) return null; // Zabraňuje probliknutí obsahu

  // --- GURU LOGIN SCREEN (Pokud není přihlášen) ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#fff', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ background: 'rgba(17, 19, 24, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', textAlign: 'center', maxWidth: '420px', width: '100%', backdropFilter: 'blur(15px)' }}>
          <Lock size={60} color="#eab308" style={{ margin: '0 auto 25px', filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.5))' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '950', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>{isEn ? 'Restricted Area' : 'Vyhrazená Zóna'}</h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '35px', fontWeight: 'bold' }}>{isEn ? 'Enter Guru master password to access.' : 'Zadej Guru heslo pro přístup do administrace.'}</p>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEn ? 'Password...' : 'Heslo...'}
            style={{ width: '100%', padding: '18px', borderRadius: '15px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginBottom: '20px', outline: 'none', textAlign: 'center', letterSpacing: '5px', fontSize: '18px', transition: '0.3s' }}
            onFocus={(e) => e.target.style.borderColor = '#eab308'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {authError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{isEn ? 'INVALID PASSWORD!' : 'NESPRÁVNÉ HESLO!'}</div>}
          <button type="submit" style={{ width: '100%', padding: '18px', background: '#eab308', color: '#000', border: 'none', borderRadius: '15px', fontWeight: '950', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(234, 179, 8, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ShieldCheck size={18} /> {isEn ? 'ENTER ADMIN' : 'VSTOUPIT DO VELÍNU'}
          </button>
        </form>
      </div>
    );
  }

  // --- UI SIDEBAR POLOŽKA ---
  const SidebarItem = ({ id, icon, label, color }) => {
    const active = activeTab === id;
    return (
      <button onClick={() => setActiveTab(id)} className={`sidebar-btn ${active ? 'active' : ''}`} style={{ borderLeftColor: active ? color : 'transparent' }}>
        {React.cloneElement(icon, { size: 18, color: active ? color : '#9ca3af' })}
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* --- BOČNÍ PANEL --- */}
      <aside className="admin-sidebar">
        <div style={{ padding: '35px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '950', letterSpacing: '2px', color: '#a855f7' }}>
            <ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }}/>
            GURU <span style={{ color: '#fff' }}>ADMIN</span>
          </h1>
          <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginTop: '5px', textTransform: 'uppercase' }}>Central Command v5.0</div>
        </div>

        <nav style={{ flex: 1, paddingTop: '20px' }}>
          <div className="sidebar-header">{isEn ? 'GURU SYSTEMS' : 'GURU SYSTÉMY'}</div>
          <SidebarItem id="api-hub" icon={<Zap />} label="API & Cron Hub" color="#f97316" />
          <SidebarItem id="tools" icon={<Wrench />} label={isEn ? 'Tools & Generators' : 'Nástroje & Generátory'} color="#eab308" />
          
          <div className="sidebar-header" style={{ marginTop: '20px' }}>{isEn ? 'CONTENT' : 'OBSAH'}</div>
          <SidebarItem id="deals" icon={<ShoppingCart />} label={isEn ? 'Game Deals Admin' : 'Správa Slev na hry'} color="#ff0055" />
        </nav>

        {/* --- LOGOUT TLAČÍTKO --- */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => { sessionStorage.removeItem('guru_admin_auth'); setIsAuthenticated(false); }} className="logout-btn">
                <Lock size={14} /> {isEn ? 'LOCK CONSOLE' : 'UZAMKNOUT VELÍN'}
            </button>
        </div>
      </aside>

      {/* --- HLAVNÍ OBSAH --- */}
      <main className="admin-main">
        
        {/* NOTIFIKACE */}
        {status.message && (
          <div className={`status-toast ${status.type}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : status.type === 'error' ? <AlertTriangle size={18} /> : <RefreshCw size={18} className="animate-spin" />}
            {status.message}
          </div>
        )}

        {/* --- TAB 1: API & CRON HUB --- */}
        {activeTab === 'api-hub' && (
          <section className="fade-in">
            <h2 className="tab-title">API & <span style={{ color: '#f97316' }}>Cron Hub</span></h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', fontSize: '14px' }}>
                {isEn 
                  ? 'Central launcher for all your backend scripts. Run executors, planners, and generators here.' 
                  : 'Centrální odpalovač všech tvých backendových skriptů. Zde spustíš exekutory, plánovače a generátory.'}
            </p>
            <div className="api-grid">
                {apiEndpoints.map(api => (
                    <div key={api.id} className="api-card" style={{ borderColor: `rgba(${hexToRgb(api.color)}, 0.2)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div className="api-icon" style={{ color: api.color, background: `rgba(${hexToRgb(api.color)}, 0.1)` }}>
                                {api.icon}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>{api.name}</h3>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>{api.desc}</p>
                        <div style={{ background: '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '10px', color: '#4b5563', marginBottom: '20px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {api.url}
                        </div>
                        <button onClick={() => triggerApi(api.url, api.name)} className="action-btn" style={{ background: api.color, color: '#000' }}>
                            <Zap size={16} /> {isEn ? 'TRIGGER NOW' : 'SPUSTIT NYNÍ'}
                        </button>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* --- TAB 2: NÁSTROJE & GENERÁTORY --- */}
        {activeTab === 'tools' && (
          <section className="fade-in">
            <h2 className="tab-title">{isEn ? 'Tools &' : 'Nástroje &'} <span style={{ color: '#eab308' }}>{isEn ? 'Generators' : 'Generátory'}</span></h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', fontSize: '14px' }}>
                {isEn ? 'Direct links to specific admin modules for bulk repairs.' : 'Přímé odkazy do specifických administračních modulů pro hromadné opravy.'}
            </p>
            <div className="api-grid">
                {adminTools.map(tool => (
                    <a key={tool.id} href={tool.url} className="api-card link-card" style={{ borderColor: `rgba(${hexToRgb(tool.color)}, 0.2)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div className="api-icon" style={{ color: tool.color, background: `rgba(${hexToRgb(tool.color)}, 0.1)` }}>
                                {tool.icon}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>{tool.name}</h3>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>{tool.desc}</p>
                        <div className="action-btn" style={{ background: 'transparent', border: `1px solid ${tool.color}`, color: tool.color }}>
                            {isEn ? 'OPEN MODULE' : 'OTEVŘÍT MODUL'} <ExternalLink size={14} />
                        </div>
                    </a>
                ))}
            </div>
          </section>
        )}

        {/* --- TAB 3: SPRÁVA SLEV --- */}
        {activeTab === 'deals' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="tab-title" style={{ margin: 0 }}>{isEn ? 'Manage' : 'Správa'} <span style={{ color: '#ff0055' }}>{isEn ? 'Deals' : 'Slev na Hry'}</span></h2>
                <button onClick={() => setShowAddDeal(!showAddDeal)} className="add-btn" style={{ background: '#ff0055' }}>
                    {showAddDeal ? <X size={18} /> : <Plus size={18} />} {showAddDeal ? (isEn ? 'CLOSE FORM' : 'ZAVŘÍT FORMULÁŘ') : (isEn ? 'ADD NEW DEAL' : 'PŘIDAT NOVOU SLEVU')}
                </button>
            </div>

            {/* FORMULÁŘ PŘIDÁNÍ */}
            {showAddDeal && (
              <form onSubmit={handleAddDeal} className="deal-form">
                  <div className="form-section-title">{isEn ? 'BASIC INFO' : 'ZÁKLADNÍ ÚDAJE'}</div>
                  <input type="text" placeholder={isEn ? "Game Title *" : "Název hry (např. Resident Evil 4) *"} required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="guru-input" />
                  
                  <div className="file-input-wrapper">
                      <label>
                          <ImageIcon size={18} /> 
                          {imageFile ? imageFile.name : (isEn ? 'Select banner (16:9) *' : 'Vyber banner (16:9) *')}
                      </label>
                      <input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files[0])} />
                  </div>

                  <div className="form-section-title" style={{ marginTop: '15px' }}>{isEn ? 'PRICING & LINKS' : 'CENY A ODKAZY'}</div>
                  <input type="text" placeholder={isEn ? "Price CZK *" : "Cena CZ (např. 990 Kč) *"} required value={newDeal.price_cs} onChange={e => setNewDeal({...newDeal, price_cs: e.target.value})} className="guru-input" />
                  <input type="text" placeholder={isEn ? "Price EN" : "Cena EN (např. 39 €)"} value={newDeal.price_en} onChange={e => setNewDeal({...newDeal, price_en: e.target.value})} className="guru-input" />
                  <input type="text" placeholder={isEn ? "Discount Code" : "Slevový kód (volitelné)"} value={newDeal.discount_code} onChange={e => setNewDeal({...newDeal, discount_code: e.target.value})} className="guru-input" />
                  <input type="url" placeholder="Affiliate Link (URL) *" required value={newDeal.affiliate_link} onChange={e => setNewDeal({...newDeal, affiliate_link: e.target.value})} className="guru-input" />
                  
                  <div className="form-section-title" style={{ marginTop: '15px' }}>{isEn ? 'DESCRIPTIONS' : 'POPISY (Zobrazí se na detailu)'}</div>
                  <textarea placeholder={isEn ? "Description CZ" : "Stručný popis CZ"} value={newDeal.description_cs} onChange={e => setNewDeal({...newDeal, description_cs: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px', resize: 'vertical' }}></textarea>
                  <textarea placeholder={isEn ? "Description EN" : "Stručný popis EN"} value={newDeal.description_en} onChange={e => setNewDeal({...newDeal, description_en: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px', resize: 'vertical' }}></textarea>
                  
                  <button type="submit" className="action-btn" style={{ background: '#ff0055', color: '#fff', gridColumn: 'span 2', marginTop: '20px' }}>
                      <Database size={18} /> {isEn ? 'SAVE DEAL TO DATABASE' : 'ULOŽIT DO DATABÁZE'}
                  </button>
              </form>
            )}

            {/* SEZNAM EXISTUJÍCÍCH SLEV */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#ff0055' }}><RefreshCw className="animate-spin" size={32} /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {deals.map(deal => (
                        <div key={deal.id} className="deal-card-admin">
                            <div className="card-thumb">
                                <img src={deal.image_url || 'https://via.placeholder.com/300x160'} alt="" />
                                {deal.is_fired && <div className="fired-badge">{isEn ? 'SENT TO SOCIALS' : 'ODESLÁNO NA SÍTĚ'}</div>}
                            </div>
                            <div className="card-info">
                                <div className="card-title">{deal.title}</div>
                                <div className="card-price">{deal.price_cs}</div>
                                <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {deal.affiliate_link}
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => triggerApi('/api/cron/executor', 'Manual Executor')} className="mini-btn fire" style={{ borderColor: '#f97316', color: '#f97316' }}>
                                        <Send size={12}/> {isEn ? 'FORCE SEND' : 'VYNUTIT ODESLÁNÍ'}
                                    </button>
                                    <button onClick={() => handleDeleteDeal(deal.id)} className="mini-btn delete">
                                        <X size={12}/> {isEn ? 'DELETE' : 'SMAZAT'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {deals.length === 0 && !showAddDeal && (
                        <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', border: '1px dashed rgba(255,0,85,0.3)', borderRadius: '20px', color: '#9ca3af' }}>
                            {isEn ? 'No deals found in database.' : 'V databázi zatím nejsou žádné slevy.'}
                        </div>
                    )}
                </div>
            )}
          </section>
        )}

      </main>

      {/* --- GURU CSS ENGINE --- */}
      <style>{`
        /* Rozložení */
        .admin-sidebar { width: 280px; border-right: 1px solid rgba(255,255,255,0.05); background: #0d0e12; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
        .admin-main { flex: 1; margin-left: 280px; padding: 40px 60px; max-width: 1400px; }
        
        /* Tlačítka bočního menu */
        .sidebar-header { margin: 20px 25px 10px 25px; font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-btn:hover, .sidebar-btn.active { background: rgba(255,255,255,0.05); color: #fff; }
        
        .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 12px; font-weight: 900; font-size: 11px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
        .logout-btn:hover { background: #ef4444; color: #fff; }

        /* Obecné prvky */
        .tab-title { font-size: 36px; font-weight: 950; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: -1px; }
        .add-btn { color: #fff; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 900; font-size: 13px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .add-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .action-btn { width: 100%; padding: 15px; border: none; border-radius: 12px; font-weight: 950; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

        /* API Grid & Cards */
        .api-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        .api-card { background: #111318; padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; transition: 0.3s; }
        .api-card:hover { transform: translateY(-5px); background: #151820; }
        .link-card { text-decoration: none; color: inherit; display: block; }
        .api-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

        /* Formulář Slev */
        .deal-form { background: #111318; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,0,85,0.3); margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .form-section-title { grid-column: span 2; font-size: 11px; color: #ff0055; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .guru-input { background: #000; border: 1px solid rgba(255,255,255,0.1); padding: 15px 20px; border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: 0.3s; width: 100%; font-family: inherit; }
        .guru-input:focus { border-color: #ff0055; box-shadow: 0 0 15px rgba(255,0,85,0.1); }
        .file-input-wrapper { position: relative; width: 100%; height: 52px; background: #000; border: 1px dashed rgba(255,255,255,0.3); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: 0.3s; }
        .file-input-wrapper:hover { border-color: #ff0055; background: rgba(255,0,85,0.05); }
        .file-input-wrapper label { color: #fff; font-size: 13px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; z-index: 10; pointer-events: none; }
        .file-input-wrapper input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 20; }

        /* Karty Slev (Seznam) */
        .deal-card-admin { background: #111318; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; display: flex; flex-direction: column; }
        .deal-card-admin:hover { border-color: #ff0055; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255,0,85,0.1); }
        .card-thumb { position: relative; height: 160px; width: 100%; background: #000; }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
        .fired-badge { position: absolute; top: 10px; right: 10px; background: #22c55e; color: #fff; padding: 5px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
        .card-info { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .card-title { font-weight: 900; font-size: 16px; text-transform: uppercase; margin-bottom: 5px; line-height: 1.3; }
        .card-price { color: #ff0055; font-weight: 950; font-size: 18px; margin-bottom: 10px; }
        .card-actions { display: flex; gap: 10px; margin-top: auto; }
        .mini-btn { flex: 1; display: flex; justify-content: center; align-items: center; gap: 5px; padding: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; border-radius: 10px; font-size: 11px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .mini-btn:hover { background: rgba(255,255,255,0.1); }
        .mini-btn.fire:hover { background: #f97316; color: #fff !important; border-color: #f97316; }
        .mini-btn.delete { border-color: rgba(239,68,68,0.3); color: #ef4444; }
        .mini-btn.delete:hover { background: #ef4444; color: #fff; }

        /* Toasty a Animace */
        .status-toast { position: fixed; top: 30px; right: 30px; padding: 15px 30px; border-radius: 16px; z-index: 1000; display: flex; align-items: center; gap: 15px; font-weight: 900; font-size: 14px; text-transform: uppercase; box-shadow: 0 15px 40px rgba(0,0,0,0.6); animation: guruSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid transparent; }
        .status-toast.info { background: #1e1b4b; border-color: #6366f1; color: #a5b4fc; }
        .status-toast.success { background: #14532d; border-color: #22c55e; color: #86efac; }
        .status-toast.error { background: #7f1d1d; border-color: #ef4444; color: #fca5a5; }

        @keyframes guruSlideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}

// Helper funkce pro barvy (pro bg s opacity)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
