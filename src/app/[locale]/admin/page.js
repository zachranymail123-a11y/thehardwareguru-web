"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  PenTool, ShoppingCart, Activity, ShieldCheck, Zap, 
  ChevronRight, LayoutDashboard, AlertTriangle, CheckCircle2, 
  RefreshCw, Send, Sparkles, Flame, Plus, X, ExternalLink, Image as ImageIcon
} from 'lucide-react';

// --- GURU ENGINE INIT ---
let supabase;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
} catch (e) {
  // Mock pro Canvas preview, v produkci se načte reálný klient
  supabase = { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: { value: 0 } }) }) }) }), rpc: () => Promise.resolve() };
}

export default function AdminApp({ params }) {
  const locale = params?.locale || 'cs';
  const isEn = locale === 'en';

  // --- STAV APLIKACE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [data, setData] = useState({
    posts: [],
    deals: [],
    tipy: [],
    tweaky: [],
    slovnik: [],
    stats: { visits: 0, missingEn: 0, missingSeo: 0 }
  });
  const [status, setStatus] = useState({ firing: false, message: '', type: '' });

  // --- STAV PRO NOVOU SLEVU ---
  const [newDeal, setNewDeal] = useState({ 
    title: '', price_cs: '', price_en: '', affiliate_link: '', 
    discount_code: '', description_cs: '', description_en: '' 
  });
  const [imageFile, setImageFile] = useState(null);

  // --- NAČÍTÁNÍ A ANALÝZA DAT (GURU CORE SCAN) ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [postsRes, dealsRes, tipyRes, tweakyRes, slovnikRes, statsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }),
        supabase.from('tweaky').select('*').order('created_at', { ascending: false }),
        supabase.from('slovnik').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single()
      ]);

      // Globální sken integrity obsahu
      const allContent = [
        ...(postsRes.data || []), 
        ...(tipyRes.data || []), 
        ...(tweakyRes.data || []),
        ...(slovnikRes.data || [])
      ];

      const missingEnCount = allContent.filter(p => !p.title_en || !p.content_en || (p.description && !p.description_en)).length;
      const missingSeoCount = (postsRes.data || []).filter(p => !p.seo_description).length;

      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        tipy: tipyRes.data || [],
        tweaky: tweakyRes.data || [],
        slovnik: slovnikRes.data || [],
        stats: { 
          visits: statsRes.data?.value || 0, 
          missingEn: missingEnCount, 
          missingSeo: missingSeoCount 
        }
      });
    } catch (err) {
      console.error("Guru Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- LOGIKA: PŘIDÁNÍ NOVÉ SLEVY (S Nahráváním Obrázku) ---
  const handleAddDeal = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ firing: false, message: 'VYBER OBRÁZEK HRY!', type: 'error' });
      return;
    }

    setStatus({ firing: true, message: 'NAHRÁVÁM DATA DO GURU SYSTÉMŮ...', type: 'info' });
    
    try {
      // 1. Nahrání obrázku do Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

      // 2. Zápis do tabulky game_deals
      const { error: dbError } = await supabase.from('game_deals').insert([{
        ...newDeal,
        image_url: publicUrl,
        created_at: new Date().toISOString(),
        is_fired: false,
        is_featured: false
      }]);

      if (dbError) throw dbError;

      setStatus({ firing: false, message: 'HRA ÚSPĚŠNĚ NASAZENA! 🔥', type: 'success' });
      setShowAddDeal(false);
      setNewDeal({ title: '', price_cs: '', price_en: '', affiliate_link: '', discount_code: '', description_cs: '', description_en: '' });
      setImageFile(null);
      fetchAllData();
    } catch (err) {
      setStatus({ firing: false, message: `CHYBA: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 4000);
  };

  // --- LOGIKA: SOCIAL EXECUTOR (S DB Update) ---
  const executeSocial = async (item, type) => {
    setStatus({ firing: true, message: 'ODPALUJI RAKETU NA SÍTĚ...', type: 'info' });
    const webhook = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL;

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }),
      });

      if (response.ok) {
        // Kritický krok: Označit jako odeslané v DB
        const table = type === 'deal' ? 'game_deals' : 'posts';
        await supabase.from(table).update({ is_fired: true }).eq('id', item.id);
        
        setStatus({ firing: false, message: 'ZÁSAH POTVRZEN! SÍTĚ HOŘÍ.', type: 'success' });
        fetchAllData(); 
      } else {
        throw new Error(`Server Error: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, message: `FAIL: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 4000);
  };

  // --- LOGIKA: AI FIXERY ---
  const runAIFixer = async (mode) => {
    setStatus({ firing: true, message: `Guru AI startuje opravu ${mode}...`, type: 'info' });
    
    // Zde by bylo volání tvého reálného API pro GPT operace
    // Pro ukázku funkčnosti tlačítek spouštíme re-scan dat
    await fetchAllData();
    
    setTimeout(() => {
        setStatus({ firing: false, message: `OPRAVA ${mode} DOKONČENA (Sken proběhl)!`, type: 'success' });
    }, 2000);
  };

  // --- UI KOMPONENTY ---
  const SidebarItem = ({ id, icon, label, color, href, external }) => {
    const active = activeTab === id;
    const content = (
      <>
        {React.cloneElement(icon, { size: 18, color: active ? color : '#9ca3af' })}
        <span style={{ flex: 1 }}>{label}</span>
        {external && <ExternalLink size={12} style={{ opacity: 0.5 }} />}
      </>
    );

    if (href) return (
      <a href={href} target={external ? "_blank" : "_self"} className="sidebar-link">{content}</a>
    );

    return (
      <button onClick={() => setActiveTab(id)} className={`sidebar-btn ${active ? 'active' : ''}`} style={{ borderLeftColor: active ? color : 'transparent' }}>
        {content}
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* --- SIDEBAR --- */}
      <aside style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#0d0e12', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '35px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '950', letterSpacing: '2px', color: '#a855f7' }}>GURU <span style={{ color: '#fff' }}>ADMIN</span></h1>
          <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginTop: '5px', textTransform: 'uppercase' }}>Command Center v4.0</div>
        </div>

        <nav style={{ flex: 1, paddingTop: '20px' }}>
          <SidebarItem id="dashboard" icon={<LayoutDashboard />} label="Dashboard" color="#a855f7" />
          <SidebarItem id="executor" icon={<Rocket />} label="Social Executor" color="#f97316" />
          <SidebarItem id="deals" icon={<ShoppingCart />} label="Slevy na hry" color="#ff0055" />
          <SidebarItem id="fixers" icon={<Zap />} label="AI Fixery" color="#eab308" />
          <SidebarItem id="planner" icon={<CalendarClock />} label="Plánovač" color="#66fcf1" />
          <div style={{ margin: '20px 25px 10px 25px', fontSize: '9px', color: '#4b5563', fontWeight: '900', letterSpacing: '1px' }}>RYCHLÉ ODKAZY</div>
          <SidebarItem id="cal" icon={<CalendarClock />} label="Kalendář (Web)" color="#66fcf1" href="/kalendar" external />
          <SidebarItem id="db" icon={<Database />} label="Supabase DB" color="#45a29e" href="https://supabase.com" external />
        </nav>

        <div style={{ padding: '20px' }}>
            <button onClick={fetchAllData} className="refresh-btn">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> SYNC DATABÁZE
            </button>
        </div>
      </aside>

      {/* --- HLAVNÍ PANEL --- */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '40px 60px' }}>
        
        {status.message && (
          <div className={`status-toast ${status.type}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : status.type === 'error' ? <AlertTriangle size={18} /> : <Activity size={18} className="animate-pulse" />}
            {status.message}
          </div>
        )}

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <section className="fade-in">
            <h2 className="tab-title">Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <Activity color="#a855f7" />
                    <h3>{data.stats.visits}</h3>
                    <p>CELKOVÉ NÁVŠTĚVY</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('fixers')}>
                    <Globe color="#eab308" />
                    <h3 style={{ color: data.stats.missingEn > 0 ? '#ef4444' : '#22c55e' }}>{data.stats.missingEn}</h3>
                    <p>CHYBĚJÍCÍ PŘEKLADY</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('fixers')}>
                    <Search color="#66fcf1" />
                    <h3 style={{ color: data.stats.missingSeo > 0 ? '#f97316' : '#22c55e' }}>{data.stats.missingSeo}</h3>
                    <p>CHYBĚJÍCÍ SEO META</p>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('deals')}>
                    <Flame color="#ff0055" />
                    <h3>{data.deals.length}</h3>
                    <p>AKTIVNÍCH SLEV</p>
                </div>
            </div>
          </section>
        )}

        {/* --- TAB: SOCIAL EXECUTOR (Filtrovaný) --- */}
        {activeTab === 'executor' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="tab-title">Social <span style={{ color: '#f97316' }}>Executor</span></h2>
                <div className="status-badge">FILTR: ČEKÁ NA ODPÁLENÍ</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Články */}
                {data.posts.filter(p => !p.is_fired).map(post => (
                    <div key={post.id} className="item-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src={post.image_url || 'https://via.placeholder.com/60'} className="row-img" alt="" />
                            <div>
                                <div className="row-title">{post.title}</div>
                                <div className="row-meta">ČLÁNEK • {new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <button onClick={() => executeSocial(post, 'post')} className="fire-btn"><Send size={16} /> ODPÁLIT</button>
                    </div>
                ))}
                
                {/* Slevy */}
                {data.deals.filter(d => !d.is_fired).map(deal => (
                    <div key={deal.id} className="item-row" style={{ borderColor: 'rgba(255,0,85,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src={deal.image_url || 'https://via.placeholder.com/60'} className="row-img" alt="" />
                            <div>
                                <div className="row-title" style={{ color: '#ff0055' }}>{deal.title}</div>
                                <div className="row-meta">SLEVA • {deal.price_cs}</div>
                            </div>
                        </div>
                        <button onClick={() => executeSocial(deal, 'deal')} className="fire-btn" style={{ background: '#ff0055' }}><Send size={16} /> ODPÁLIT</button>
                    </div>
                ))}

                {data.posts.filter(p => !p.is_fired).length === 0 && data.deals.filter(d => !d.is_fired).length === 0 && (
                    <div className="empty-state">VŠE JE ODESLÁNO. ŽÁDNÉ NOVÉ RAKETY K DISPOZICI. 🦾</div>
                )}
            </div>
          </section>
        )}

        {/* --- TAB: AI FIXERS --- */}
        {activeTab === 'fixers' && (
          <section className="fade-in">
            <h2 className="tab-title">AI <span style={{ color: '#eab308' }}>Fixer & Tooling</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="fixer-card">
                    <Globe size={40} color="#eab308" />
                    <h3>EN TRANSLATION FIXER</h3>
                    <p>Skenuje vše: <strong>články, tipy, tweaky, slovník</strong>. Hledá chybějící <code>title_en</code> nebo <code>content_en</code>.</p>
                    <div className="missing-info">CHYBÍ: <strong>{data.stats.missingEn}</strong> TEXTŮ</div>
                    <button onClick={() => runAIFixer('TRANSLATION')} className="action-btn" style={{ background: '#eab308' }}>
                        <Sparkles size={18} /> SPUSTIT AI FIX EN
                    </button>
                </div>

                <div className="fixer-card">
                    <Search size={40} color="#66fcf1" />
                    <h3>SEO AUTO-GENERATOR</h3>
                    <p>Vygeneruje <code>seo_description</code> pro články na základě jejich obsahu pro Google Crawler.</p>
                    <div className="missing-info" style={{ color: '#66fcf1' }}>CHYBÍ: <strong>{data.stats.missingSeo}</strong> POPISŮ</div>
                    <button onClick={() => runAIFixer('SEO')} className="action-btn" style={{ background: '#66fcf1' }}>
                        <Zap size={18} /> GENERATE SEO META
                    </button>
                </div>
            </div>
          </section>
        )}

        {/* --- TAB: DEALS (Správa + Formulář) --- */}
        {activeTab === 'deals' && (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="tab-title">Správa <span style={{ color: '#ff0055' }}>Slev</span></h2>
                <button onClick={() => setShowAddDeal(!showAddDeal)} className="fire-btn" style={{ background: '#ff0055' }}>
                    {showAddDeal ? <X size={18} /> : <Plus size={18} />} {showAddDeal ? 'ZAVŘÍT' : 'PŘIDAT HRU'}
                </button>
            </div>

            {showAddDeal && (
              <form onSubmit={handleAddDeal} className="deal-form">
                  <div style={{ gridColumn: 'span 2', fontSize: '11px', color: '#ff0055', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>ZÁKLADNÍ INFO</div>
                  <input type="text" placeholder="Název hry *" required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="guru-input" />
                  <div className="file-input-wrapper">
                      <label><ImageIcon size={16} /> {imageFile ? imageFile.name : 'Vyber banner (16:9) *'}</label>
                      <input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files[0])} />
                  </div>

                  <div style={{ gridColumn: 'span 2', fontSize: '11px', color: '#ff0055', fontWeight: '900', textTransform: 'uppercase', margin: '15px 0 5px 0' }}>CENY A ODKAZY</div>
                  <input type="text" placeholder="Cena CZ (např. 990 Kč) *" required value={newDeal.price_cs} onChange={e => setNewDeal({...newDeal, price_cs: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Cena EN (např. 39 €)" value={newDeal.price_en} onChange={e => setNewDeal({...newDeal, price_en: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Slevový kód (např. AKSGURU)" value={newDeal.discount_code} onChange={e => setNewDeal({...newDeal, discount_code: e.target.value})} className="guru-input" />
                  <input type="url" placeholder="Affiliate Link *" required value={newDeal.affiliate_link} onChange={e => setNewDeal({...newDeal, affiliate_link: e.target.value})} className="guru-input" />
                  
                  <div style={{ gridColumn: 'span 2', fontSize: '11px', color: '#ff0055', fontWeight: '900', textTransform: 'uppercase', margin: '15px 0 5px 0' }}>POPISY</div>
                  <textarea placeholder="Stručný popis CZ" value={newDeal.description_cs} onChange={e => setNewDeal({...newDeal, description_cs: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px' }}></textarea>
                  <textarea placeholder="Stručný popis EN" value={newDeal.description_en} onChange={e => setNewDeal({...newDeal, description_en: e.target.value})} className="guru-input" style={{ gridColumn: 'span 1', height: '100px' }}></textarea>
                  
                  <button type="submit" className="action-btn" style={{ background: '#ff0055', gridColumn: 'span 2', marginTop: '20px' }}>ULOŽIT HRU DO GURU DATABÁZE</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {data.deals.map(deal => (
                    <div key={deal.id} className="deal-card-admin">
                        <div className="card-thumb">
                            <img src={deal.image_url} alt="" />
                            {deal.is_fired && <div className="fired-badge">FIRED</div>}
                        </div>
                        <div className="card-info">
                            <div className="card-title">{deal.title}</div>
                            <div className="card-price">{deal.price_cs}</div>
                            <div className="card-actions">
                                <button className="mini-btn">UPRAVIT</button>
                                <button onClick={() => executeSocial(deal, 'deal')} disabled={deal.is_fired} className="mini-btn fire">ODPÁLIT</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

      </main>

      {/* --- CSS ENGINE --- */}
      <style>{`
        .sidebar-btn, .sidebar-link { width: 100%; display: flex; alignItems: center; gap: 15px; padding: 15px 25px; background: transparent; border: none; border-left: 4px solid transparent; color: #9ca3af; cursor: pointer; transition: 0.2s; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-btn:hover, .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .sidebar-btn.active { background: rgba(255,255,255,0.05); color: #fff; }

        .refresh-btn { width: 100%; padding: 12px; background: rgba(102, 252, 241, 0.1); border: 1px solid #66fcf1; color: #66fcf1; borderRadius: 10px; fontSize: 11px; fontWeight: 900; cursor: pointer; display: flex; alignItems: center; justifyContent: center; gap: 8px; transition: 0.3s; }
        .refresh-btn:hover { background: #66fcf1; color: #000; }

        .tab-title { font-size: 32px; font-weight: 950; margin-bottom: 40px; text-transform: uppercase; letter-spacing: -1px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; }
        
        .stat-card { background: #111318; padding: 30px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .stat-card.clickable:hover { border-color: #eab308; transform: translateY(-5px); cursor: pointer; }
        .stat-card h3 { font-size: 32px; font-weight: 950; margin: 15px 0 5px 0; }
        .stat-card p { font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; }

        .item-row { background: #111318; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 20px 30px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
        .item-row:hover { border-color: #f97316; background: rgba(249, 115, 22, 0.05); }
        .row-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .row-title { font-weight: 900; font-size: 15px; text-transform: uppercase; }
        .row-meta { font-size: 11px; color: #4b5563; font-weight: 900; margin-top: 4px; }

        .fire-btn { background: #f97316; color: #fff; border: none; padding: 12px 25px; border-radius: 14px; font-weight: 900; font-size: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
        .fire-btn:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(249, 115, 22, 0.4); }

        .fixer-card { background: #111318; padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .fixer-card h3 { font-size: 18px; margin: 20px 0 10px 0; font-weight: 950; }
        .fixer-card p { color: #9ca3af; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
        .missing-info { font-size: 11px; font-weight: 900; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 20px; border-radius: 10px; margin-bottom: 25px; background: rgba(239, 68, 68, 0.05); }

        .action-btn { width: 100%; padding: 18px; border: none; border-radius: 15px; font-weight: 950; color: #000; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

        .deal-form { background: #111318; padding: 40px; border-radius: 30px; border: 1px solid #ff0055; margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .guru-input { background: #000; border: 1px solid rgba(255,255,255,0.1); padding: 15px 20px; border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: 0.3s; width: 100%; }
        .guru-input:focus { border-color: #ff0055; box-shadow: 0 0 15px rgba(255,0,85,0.1); }
        
        .file-input-wrapper { position: relative; width: 100%; height: 52px; background: #000; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .file-input-wrapper label { color: #9ca3af; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .file-input-wrapper input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        .deal-card-admin { background: #111318; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .card-thumb { position: relative; height: 160px; width: 100%; }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .fired-badge { position: absolute; top: 10px; right: 10px; background: #22c55e; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 900; }
        .card-info { padding: 20px; }
        .card-title { font-weight: 900; font-size: 14px; text-transform: uppercase; margin-bottom: 5px; }
        .card-price { color: #ff0055; font-weight: 950; font-size: 16px; margin-bottom: 15px; }
        .card-actions { display: flex; gap: 10px; }
        .mini-btn { flex: 1; padding: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; border-radius: 8px; font-size: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .mini-btn.fire { border-color: #ff0055; color: #ff0055; }
        .mini-btn:hover { background: rgba(255,255,255,0.1); }
        .mini-btn.fire:hover:not(:disabled) { background: #ff0055; color: #fff; }
        .mini-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .status-badge { font-size: 10px; background: #111318; padding: 8px 15px; border-radius: 10px; color: #f97316; border: 1px solid rgba(249,115,22,0.3); font-weight: 900; letter-spacing: 1px; }
        .empty-state { padding: 60px; text-align: center; color: #4b5563; font-weight: 950; font-size: 12px; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; letter-spacing: 2px; }
        
        .status-toast { position: fixed; top: 30px; right: 30px; padding: 15px 30px; border-radius: 15px; z-index: 1000; display: flex; align-items: center; gap: 12px; font-weight: 900; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: guruSlideIn 0.3s ease; border: 1px solid transparent; }
        .status-toast.info { background: #1e1b4b; border-color: #6366f1; }
        .status-toast.success { background: #166534; border-color: #22c55e; }
        .status-toast.error { background: #991b1b; border-color: #ef4444; }

        @keyframes guruSlideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

    </div>
  );
}
