"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Settings, Globe, Search, Database, CalendarClock, 
  PenTool, ShoppingCart, Activity, ShieldCheck, Zap, 
  ChevronRight, LayoutDashboard, AlertTriangle, CheckCircle2, 
  RefreshCw, Send, Sparkles, Flame, Plus, X
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
  supabase = { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: { value: 0 } }) }) }) }), rpc: () => Promise.resolve() };
}

export default function App({ params }) {
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
    stats: { visits: 0, missingEn: 0, missingSeo: 0 }
  });
  const [status, setStatus] = useState({ firing: false, message: '', type: '' });

  // --- FORMULÁŘ PRO NOVOU SLEVU ---
  const [newDeal, setNewDeal] = useState({ title: '', price_cs: '', price_en: '', affiliate_link: '', discount_code: '', image_url: '', description_cs: '', description_en: '' });

  // --- NAČÍTÁNÍ DAT ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [postsRes, dealsRes, tipyRes, tweakyRes, statsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('tipy').select('*').order('created_at', { ascending: false }),
        supabase.from('tweaky').select('*').order('created_at', { ascending: false }),
        supabase.from('stats').select('value').eq('name', 'total_visits').single()
      ]);

      // Reálný scan chybějících dat
      const allContent = [...(postsRes.data || []), ...(tipyRes.data || []), ...(tweakyRes.data || [])];
      const missingEn = allContent.filter(p => !p.title_en || !p.content_en).length;
      const missingSeo = (postsRes.data || []).filter(p => !p.seo_description).length;

      setData({
        posts: postsRes.data || [],
        deals: dealsRes.data || [],
        tipy: tipyRes.data || [],
        tweaky: tweakyRes.data || [],
        stats: { visits: statsRes.data?.value || 0, missingEn, missingSeo }
      });
    } catch (err) {
      console.error("Guru Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- LOGIKA: PŘIDÁNÍ HRY ---
  const handleAddDeal = async (e) => {
    e.preventDefault();
    setStatus({ firing: true, message: 'Ukládám novou pecku do DB...', type: 'info' });
    try {
      const { error } = await supabase.from('game_deals').insert([newDeal]);
      if (error) throw error;
      setStatus({ firing: false, message: 'Hra úspěšně přidána!', type: 'success' });
      setShowAddDeal(false);
      setNewDeal({ title: '', price_cs: '', price_en: '', affiliate_link: '', discount_code: '', image_url: '', description_cs: '', description_en: '' });
      fetchAllData();
    } catch (err) {
      setStatus({ firing: false, message: `Chyba: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 3000);
  };

  // --- LOGIKA: SOCIAL EXECUTOR ---
  const executeSocial = async (item, type) => {
    setStatus({ firing: true, message: 'Odesílám na Make.com...', type: 'info' });
    const webhook = process.env.NEXT_PUBLIC_MAKE_WEBHOOK2_URL;

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, guru_type: type, fired_at: new Date().toISOString() }),
      });

      if (response.ok) {
        setStatus({ firing: false, message: 'ZÁSAH! Sítě hoří.', type: 'success' });
      } else {
        throw new Error(`Chyba serveru: ${response.status}`);
      }
    } catch (err) {
      setStatus({ firing: false, message: `Selhalo: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 4000);
  };

  const runFixer = async (type) => {
    setStatus({ firing: true, message: `Spouštím ${type} scan...`, type: 'info' });
    await fetchAllData();
    setStatus({ firing: false, message: `${type} scan dokončen!`, type: 'success' });
    setTimeout(() => setStatus({ firing: false, message: '', type: '' }), 3000);
  };

  // --- UI KOMPONENTY ---
  const SidebarItem = ({ id, icon, label, color, href }) => {
    const isLink = !!href;
    const content = (
      <>
        {React.cloneElement(icon, { size: 18, color: activeTab === id ? color : '#9ca3af' })}
        {label}
      </>
    );

    if (isLink) return (
      <a href={href} target="_blank" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', color: '#9ca3af', cursor: 'pointer', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{content}</a>
    );

    return (
      <button onClick={() => setActiveTab(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', background: activeTab === id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderLeft: activeTab === id ? `4px solid ${color}` : '4px solid transparent', color: activeTab === id ? '#fff' : '#9ca3af', cursor: 'pointer', textAlign: 'left', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{content}</button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#0d0e12', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '35px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '950', letterSpacing: '2px', color: '#a855f7' }}>GURU <span style={{ color: '#fff' }}>ADMIN</span></h1>
          <div style={{ fontSize: '9px', color: '#4b5563', fontWeight: '900', marginTop: '5px', textTransform: 'uppercase' }}>Command Center v2.5</div>
        </div>
        <nav style={{ flex: 1, paddingTop: '20px' }}>
          <SidebarItem id="dashboard" icon={<LayoutDashboard />} label="Přehled" color="#a855f7" />
          <SidebarItem id="executor" icon={<Rocket />} label="Social Executor" color="#f97316" />
          <SidebarItem id="deals" icon={<ShoppingCart />} label="Slevy na hry" color="#ff0055" />
          <SidebarItem id="fixers" icon={<Zap />} label="AI Fixery" color="#eab308" />
          <SidebarItem id="planner" icon={<CalendarClock />} label="Plánovač" color="#66fcf1" />
          <SidebarItem id="calendar_link" icon={<CalendarClock />} label="Kalendář (Web)" color="#66fcf1" href="/kalendar" />
        </nav>
        <div style={{ padding: '20px' }}>
            <button onClick={fetchAllData} style={{ width: '100%', padding: '12px', background: 'rgba(102, 252, 241, 0.1)', border: '1px solid #66fcf1', color: '#66fcf1', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
            </button>
        </div>
      </aside>

      {/* HLAVNÍ OBSAH */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '40px 60px' }}>
        {status.message && (
          <div style={{ position: 'fixed', top: '30px', right: '30px', padding: '15px 30px', borderRadius: '15px', background: status.type === 'success' ? '#166534' : status.type === 'error' ? '#991b1b' : '#1e1b4b', border: `1px solid ${status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#6366f1'}`, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', fontSize: '13px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {status.message}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>Systémový <span style={{ color: '#a855f7' }}>Status</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
                <div className="stat-card"><Activity color="#a855f7" /><h3>{data.stats.visits}</h3><p>CELKOVÉ NÁVŠTĚVY</p></div>
                <div className="stat-card" onClick={() => setActiveTab('fixers')} style={{ cursor: 'pointer' }}><Globe color="#eab308" /><h3 style={{ color: data.stats.missingEn > 0 ? '#ef4444' : '#22c55e' }}>{data.stats.missingEn}</h3><p>CHYBĚJÍCÍ PŘEKLADY</p></div>
                <div className="stat-card"><Search color="#66fcf1" /><h3>{data.stats.missingSeo}</h3><p>CHYBĚJÍCÍ SEO META</p></div>
                <div className="stat-card" onClick={() => setActiveTab('deals')} style={{ cursor: 'pointer' }}><Flame color="#ff0055" /><h3>{data.deals.length}</h3><p>AKTIVNÍCH SLEV</p></div>
            </div>
          </section>
        )}

        {activeTab === 'executor' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>Social <span style={{ color: '#f97316' }}>Executor</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {data.posts.slice(0, 10).map(post => (
                    <div key={post.id} className="item-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src={post.image_url} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                            <div><div style={{ fontWeight: '900', fontSize: '15px' }}>{post.title}</div><div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase' }}>ČLÁNEK • {new Date(post.created_at).toLocaleDateString()}</div></div>
                        </div>
                        <button onClick={() => executeSocial(post, 'post')} className="fire-btn"><Send size={16} /> ODPÁLIT</button>
                    </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === 'fixers' && (
          <section>
            <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '40px', textTransform: 'uppercase' }}>AI <span style={{ color: '#eab308' }}>Fixer & Tooling</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="tool-card">
                    <Globe size={40} color="#eab308" />
                    <h3>EN TRANSLATION FIXER</h3>
                    <p>Skenuje tabulky posts, tipy a tweaky. Chybí: <strong>{data.stats.missingEn}</strong> textů.</p>
                    <button onClick={() => runFixer('EN')} className="action-btn" style={{ background: '#eab308' }}><Sparkles size={18} /> SCAN & FIX</button>
                </div>
                <div className="tool-card">
                    <Search size={40} color="#66fcf1" />
                    <h3>SEO AUTO-GENERATOR</h3>
                    <p>Doplní meta popisky pro lepší pozice. Chybí: <strong>{data.stats.missingSeo}</strong> záznamů.</p>
                    <button onClick={() => runFixer('SEO')} className="action-btn" style={{ background: '#66fcf1' }}><Zap size={18} /> GENERATE SEO</button>
                </div>
            </div>
          </section>
        )}

        {activeTab === 'deals' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0, textTransform: 'uppercase' }}>Správa <span style={{ color: '#ff0055' }}>Slev</span></h2>
                <button onClick={() => setShowAddDeal(!showAddDeal)} className="fire-btn" style={{ background: '#ff0055' }}><Plus size={18} /> {showAddDeal ? 'ZAVŘÍT' : 'PŘIDAT HRU'}</button>
            </div>

            {showAddDeal && (
              <form onSubmit={handleAddDeal} style={{ background: '#111318', padding: '40px', borderRadius: '30px', border: '1px solid #ff0055', marginBottom: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input type="text" placeholder="Název hry" required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Obrázek URL" required value={newDeal.image_url} onChange={e => setNewDeal({...newDeal, image_url: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Cena CZ (např. 990 Kč)" required value={newDeal.price_cs} onChange={e => setNewDeal({...newDeal, price_cs: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Cena EN (např. 39 €)" value={newDeal.price_en} onChange={e => setNewDeal({...newDeal, price_en: e.target.value})} className="guru-input" />
                  <input type="text" placeholder="Slevový kód" value={newDeal.discount_code} onChange={e => setNewDeal({...newDeal, discount_code: e.target.value})} className="guru-input" />
                  <input type="url" placeholder="Affiliate Link" required value={newDeal.affiliate_link} onChange={e => setNewDeal({...newDeal, affiliate_link: e.target.value})} className="guru-input" />
                  <textarea placeholder="Popis CZ" value={newDeal.description_cs} onChange={e => setNewDeal({...newDeal, description_cs: e.target.value})} className="guru-input" style={{ gridColumn: 'span 2', height: '80px' }}></textarea>
                  <button type="submit" className="action-btn" style={{ background: '#ff0055', gridColumn: 'span 2' }}>ULOŽIT HRU DO DATABÁZE</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {data.deals.map(deal => (
                    <div key={deal.id} className="deal-card-admin">
                        <img src={deal.image_url} style={{ width: '100%', height: '160px', objectFit: 'cover' }} alt="" />
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontWeight: '900', marginBottom: '10px' }}>{deal.title}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ff0055', fontWeight: '900' }}>{deal.price_cs}</span>
                                <button onClick={() => executeSocial(deal, 'deal')} className="fire-btn" style={{ padding: '8px 12px', fontSize: '10px' }}>ODPÁLIT</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        .stat-card { background: #111318; padding: 30px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .stat-card:hover { border-color: rgba(168, 85, 247, 0.3); transform: translateY(-5px); }
        .stat-card h3 { font-size: 32px; font-weight: 950; margin: 15px 0 5px 0; }
        .stat-card p { font-size: 10px; color: #4b5563; font-weight: 900; letter-spacing: 1.5px; }
        
        .item-row { background: #111318; border: 1px solid rgba(255,255,255,0.05); borderRadius: 20px; padding: 20px 30px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
        .item-row:hover { border-color: #f97316; }

        .fire-btn { background: #f97316; color: #fff; border: none; padding: 12px 25px; borderRadius: 12px; fontWeight: 900; fontSize: 12px; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; gap: 8px; }
        .fire-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }

        .tool-card { background: #111318; padding: 40px; borderRadius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .tool-card h3 { font-size: 18px; margin: 15px 0; font-weight: 950; }
        .tool-card p { color: #9ca3af; font-size: 14px; margin-bottom: 25px; }

        .action-btn { width: 100%; padding: 15px; border: none; borderRadius: 12px; fontWeight: 900; color: #000; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; justifyContent: center; gap: 8px; text-transform: uppercase; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }

        .guru-input { background: #000; border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; color: #fff; font-size: 14px; outline: none; }
        .guru-input:focus { border-color: #ff0055; }

        .deal-card-admin { background: #111318; borderRadius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .deal-card-admin:hover { border-color: #ff0055; }
      `}</style>
    </div>
  );
}
