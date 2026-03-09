"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - MASTER HUB V1.0 (BASED ON GPU VS V67.0)
 * Cesta: src/app/cpuvs/page.js
 * DESIGN: Dvousloupcový grid layout.
 * STYL: Guru Supreme (Neon, Gradienty, Glassmorphismus).
 * FIX: Nativní 'fetch' a '<a>' tagy pro absolutní stabilitu prostředí.
 */

export default function CpuVsHub() {
  const [isEn, setIsEn] = useState(false);
  const [cpus, setCpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [cpuA, setCpuA] = useState('');
  const [cpuB, setCpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detekce jazyka z URL na klientovi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  // 🚀 GURU DATA SYNC (Nativní Fetch)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing database credentials");
        }

        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        const [cRes, dRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name&order=name.asc`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en&order=created_at.desc&limit=10`, { headers })
        ]);

        if (!cRes.ok || !dRes.ok) throw new Error("Network request failed");

        const cData = await cRes.json();
        const dData = await dRes.json();

        setCpus(cData || []);
        setExistingDuels(dData || []);
      } catch (err) {
        console.error("Guru Sync Error:", err);
        setError(isEn ? "Database connection failed." : "Synchronizace s DB selhala.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  // 🚀 GURU: Robustní slugify engine
  const slugify = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .trim();
  };

  const swapCPUs = () => {
    const temp = cpuA;
    setCpuA(cpuB);
    setCpuB(temp);
  };

  const handleStartDuel = () => {
    if (!cpuA || !cpuB || cpuA === cpuB) return;
    
    const processorA = cpus.find(c => String(c.id) === cpuA);
    const processorB = cpus.find(c => String(c.id) === cpuB);
    
    if (!processorA || !processorB) return;

    const rawSlug = `${slugify(processorA.name)}-vs-${slugify(processorB.name)}`;
    const target = isEn ? `/en/cpuvs/en-${rawSlug}` : `/cpuvs/${rawSlug}`;
    
    // Nativní přesměrování pro obcházení cache Next.js
    window.location.href = target;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0b0d',
      backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      paddingTop: '140px', 
      paddingBottom: '100px',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      
      {/* 🛡️ GURU HYPER-SHIELD pro SWG */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          window.swgSubscriptions = window.swgSubscriptions || {};
          if (typeof window.swgSubscriptions.attachButton !== 'function') {
            window.swgSubscriptions.attachButton = function() {};
          }
        })();
      `}} />

      {/* 🚀 GURU STYLES: Grid layout a neonový design */}
      <style dangerouslySetInnerHTML={{__html: `
        .guru-hub-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .guru-main-title { font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 950; font-style: italic; color: #fff; text-transform: uppercase; line-height: 1; margin: 0; text-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }
        .guru-highlight-title { color: #66fcf1; display: block; }
        
        .guru-desc-text { color: #d1d5db; font-size: 1.15rem; line-height: 1.6; max-width: 600px; margin-top: 15px; }

        .hub-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; margin-top: 50px; }
        
        .generator-panel { 
          background: rgba(15, 17, 21, 0.95); 
          backdrop-filter: blur(15px); 
          border-radius: 30px; 
          padding: 40px; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(102, 252, 241, 0.2);
          position: relative;
        }
        .generator-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #66fcf1, #ff0055); border-radius: 30px 30px 0 0; }
        
        .guru-dropdown-group { margin-bottom: 25px; }
        .cpu-label { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        
        .guru-dropdown { 
          width: 100%; padding: 18px 20px; background: rgba(0,0,0,0.6); 
          border: 1px solid rgba(255,255,255,0.1); color: #fff; 
          border-radius: 16px; font-size: 16px; font-weight: bold;
          outline: none; transition: 0.3s; cursor: pointer;
        }
        .guru-dropdown:focus { border-color: #66fcf1; box-shadow: 0 0 15px rgba(102, 252, 241, 0.2); background: rgba(0,0,0,0.8); }
        
        .guru-swap-wrapper { display: flex; justify-content: center; margin: -10px 0 15px; position: relative; z-index: 10; }
        .guru-swap-btn { 
          background: #111318; border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; 
          padding: 12px; border-radius: 50%; cursor: pointer; transition: 0.4s; 
          display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }
        .guru-swap-btn:hover { border-color: #66fcf1; color: #66fcf1; transform: rotate(180deg) scale(1.1); }
        
        .guru-battle-btn { 
          width: 100%; padding: 20px; margin-top: 15px;
          background: linear-gradient(135deg, #ff0055 0%, #990033 100%); 
          color: #fff; border: 1px solid rgba(255,0,85,0.5); border-radius: 16px; 
          font-weight: 950; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;
          cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(255, 0, 85, 0.3); 
          display: flex; justify-content: center; align-items: center; gap: 12px;
        }
        .guru-battle-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(255, 0, 85, 0.5); filter: brightness(1.1); }
        .guru-battle-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

        .history-panel { display: flex; flex-direction: column; gap: 12px; }
        .history-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .history-title { font-size: 18px; font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; letter-spacing: 1px; }
        
        .compact-duel-item { 
          background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); 
          padding: 14px 18px; border-radius: 14px; display: flex; justify-content: space-between; 
          align-items: center; text-decoration: none; transition: 0.3s; backdrop-filter: blur(10px);
        }
        .compact-duel-item:hover { background: rgba(102, 252, 241, 0.05); border-color: rgba(102, 252, 241, 0.3); transform: translateX(5px); }
        .duel-name { font-size: 13px; font-weight: 900; color: #d1d5db; text-transform: uppercase; transition: 0.3s; }
        .compact-duel-item:hover .duel-name { color: #fff; }

        @media (max-width: 1024px) { 
          .hub-grid { grid-template-columns: 1fr; } 
          .history-panel { margin-top: 20px; }
        }
      `}} />

      <div className="guru-hub-container">
        
        {/* HERO SEKCE */}
        <header style={{ marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <ShieldCheck size={14} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">
            {isEn ? "COMPARE" : "POROVNEJTE"} <br/>
            <span className="guru-highlight-title">{isEn ? "PROCESSORS" : "PROCESORY"}</span>
          </h1>
          <p className="guru-desc-text">
            {isEn 
              ? "Detailed specifications and raw gaming performance index driven by pure data." 
              : "Detailní technické specifikace a porovnání herního výkonu na základě reálných čísel."}
          </p>
        </header>

        {/* DVOUSLOUPCOVÝ GRID */}
        <div className="hub-grid">
            
            {/* LEVÝ SLOUPEC: GENERÁTOR */}
            <section className="generator-panel">
              {error && (
                <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textAlign: 'center', marginBottom: '25px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <AlertTriangle size={16} /> {error}
                </div>
              )}
              
              <div className="guru-dropdown-group">
                <label className="cpu-label">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff0055', boxShadow: '0 0 10px #ff0055' }}></div>
                  {isEn ? "FIRST CPU (RED CORNER)" : "PRVNÍ PROCESOR (ČERVENÝ ROH)"}
                </label>
                <select className="guru-dropdown" value={cpuA} onChange={e => setCpuA(e.target.value)}>
                  <option value="" style={{ color: '#6b7280' }}>{loading ? "..." : (isEn ? "-- Select CPU --" : "-- Vyber CPU --")}</option>
                  {cpus.map(c => <option key={c.id} value={String(c.id)} style={{ color: '#fff', background: '#0a0b0d' }}>{c.name}</option>)}
                </select>
              </div>

              <div className="guru-swap-wrapper">
                <button onClick={swapCPUs} className="guru-swap-btn" title={isEn ? "Swap" : "Prohodit"}>
                  <ArrowLeftRight size={20} />
                </button>
              </div>

              <div className="guru-dropdown-group">
                <label className="cpu-label">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#66fcf1', boxShadow: '0 0 10px #66fcf1' }}></div>
                  {isEn ? "SECOND CPU (BLUE CORNER)" : "DRUHÝ PROCESOR (MODRÝ ROH)"}
                </label>
                <select className="guru-dropdown" value={cpuB} onChange={e => setCpuB(e.target.value)}>
                  <option value="" style={{ color: '#6b7280' }}>{loading ? "..." : (isEn ? "-- Select CPU --" : "-- Vyber CPU --")}</option>
                  {cpus.map(c => (
                    <option key={c.id} value={String(c.id)} style={{ color: '#fff', background: '#0a0b0d' }} disabled={String(c.id) === cpuA}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="guru-battle-btn" 
                onClick={handleStartDuel} 
                disabled={!cpuA || !cpuB || cpuA === cpuB || loading}
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap fill="currentColor" size={24} />}
                {isEn ? "START CPU BATTLE" : "SPUSTIT SOUBOJ PROCESORŮ"}
              </button>
            </section>

            {/* PRAVÝ SLOUPEC: HISTORIE */}
            <section className="history-panel">
              <div className="history-header">
                <Flame color="#f97316" size={24} />
                <h2 className="history-title">{isEn ? "RECENT DUELS" : "POSLEDNÍ SOUBOJE"}</h2>
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#6b7280', fontSize: '12px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  <RefreshCw className="animate-spin mr-3" size={18} /> SCANNING...
                </div>
              ) : existingDuels.length > 0 ? (
                existingDuels.map((duel) => {
                  const targetSlug = isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug;
                  const targetTitle = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
                  
                  return (
                    <a 
                      href={`/${isEn ? 'en/' : ''}cpuvs/${targetSlug}`} 
                      key={duel.id} 
                      className="compact-duel-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Swords size={16} color="#6b7280" />
                        <span className="duel-name">{targetTitle}</span>
                      </div>
                      <ChevronRight size={18} color="#66fcf1" />
                    </a>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: '#6b7280', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   {isEn ? "DATABASES ARE EMPTY." : "DATABÁZE JE PRÁZDNÁ."}
                </div>
              )}
            </section>

        </div>
      </div>
    </div>
  );
}
