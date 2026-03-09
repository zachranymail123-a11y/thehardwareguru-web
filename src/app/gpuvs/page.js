"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V55.0 (PRODUCTION GRID)
 * Cesta: src/app/gpuvs/page.js
 * DESIGN: Dvousloupcový layout (Generátor vlevo, Historie vpravo).
 * BASE: Použita přesná záloha "page (8).js" pro 100% kompatibilitu s Vercel.
 */

// 🚀 GURU: Inicializace Supabase klienta (Striktní verze bez fallbacků)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function App() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const isEn = pathname.startsWith('/en');

  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 GURU DATA SYNC: Načítání z DB
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [gData, dData] = await Promise.all([
          supabase
            .from('gpus')
            .select('id, name')
            .order('name', { ascending: true }),
          supabase
            .from('gpu_duels')
            .select('id, title_cs, title_en, slug, slug_en')
            .order('created_at', { ascending: false })
            .limit(12)
        ]);

        if (gData.error) throw gData.error;
        if (dData.error) throw dData.error;

        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
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

  // 🚀 GURU: UX Swap Engine
  const swapGPUs = () => {
    const temp = gpuA;
    setGpuA(gpuB);
    setGpuB(temp);
  };

  // 🚀 GURU ENGINE: Odpálení duelu a přesměrování
  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    
    // Typová kontrola String(id) pro UUID safety
    const cardA = gpus.find(g => String(g.id) === gpuA);
    const cardB = gpus.find(g => String(g.id) === gpuB);
    
    if (!cardA || !cardB) return;

    const rawSlug = `${slugify(cardA.name)}-vs-${slugify(cardB.name)}`;
    const target = isEn ? `/en/gpuvs/en-${rawSlug}` : `/gpuvs/${rawSlug}`;
    router.push(target);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#ff0055]" style={{ 
      backgroundColor: '#0a0b0d',
      backgroundImage: 'url("/bg-guru.png")', 
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      paddingTop: '140px', 
      paddingBottom: '100px' 
    }}>
      
      {/* 🛡️ GURU HYPER-SHIELD */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          window.swgSubscriptions = window.swgSubscriptions || {};
          if (typeof window.swgSubscriptions.attachButton !== 'function') {
            window.swgSubscriptions.attachButton = function() {};
          }
        })();
      `}} />

      <style dangerouslySetInnerHTML={{__html: `
        .guru-hub-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .guru-main-title { font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 950; font-style: italic; color: #fff; text-transform: uppercase; line-height: 1; margin: 0; text-shadow: 0 0 20px rgba(102, 252, 241, 0.2); text-align: center; }
        .guru-highlight-title { color: #66fcf1; display: block; }
        
        .guru-desc-text { color: #d1d5db; font-size: 1.15rem; line-height: 1.6; max-width: 600px; margin: 15px auto 0; text-align: center; }

        /* Hlavní Grid rozložení */
        .hub-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; margin-top: 50px; }
        
        /* Generátor (Levý sloupec) */
        .generator-panel { 
          background: rgba(15, 17, 21, 0.95); 
          backdrop-filter: blur(15px); 
          border-radius: 30px; 
          padding: 40px; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(102, 252, 241, 0.2);
          position: relative;
        }
        .generator-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #66fcf1, #a855f7); border-radius: 30px 30px 0 0; }
        
        .guru-dropdown-group { margin-bottom: 25px; }
        .gpu-label { display: flex; align-items: center; gap: 8px; color: #9ca3af; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        
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

        /* Historie duelů (Pravý sloupec) */
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
              <ShieldCheck size={14} /> GURU VS ENGINE
            </div>
            <h1 className="guru-main-title">
              {isEn ? "COMPARE" : "POROVNEJTE"} <br/>
              <span className="guru-highlight-title">{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
            </h1>
            <p className="guru-desc-text">
              {isEn 
                ? "Detailed technical analysis, raw performance index and AI verdict by Guru." 
                : "Detailní technická analýza, odhad hrubého výkonu a zhodnocení výhodnosti pomocí AI."}
            </p>
          </div>
        </header>

        {/* DVOUSLOUPCOVÝ GRID */}
        <div className="hub-grid">
            
            {/* LEVÝ SLOUPEC: GENERÁTOR */}
            <section className="generator-panel">
              {error && (
                <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textAlign: 'center', marginBottom: '25px', textTransform: 'uppercase' }}>
                   <AlertTriangle className="inline mr-2" size={16} /> {error}
                </div>
              )}
              
              <div className="guru-dropdown-group">
                <label className="gpu-label">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff0055', boxShadow: '0 0 10px #ff0055' }}></div>
                  {isEn ? "FIRST GPU (RED CORNER)" : "PRVNÍ GRAFIKA (ČERVENÝ ROH)"}
                </label>
                <select className="guru-dropdown" value={gpuA} onChange={e => setGpuA(e.target.value)}>
                  <option value="" style={{ color: '#6b7280' }}>{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                  {gpus.map(g => <option key={g.id} value={String(g.id)} style={{ color: '#fff' }}>{g.name}</option>)}
                </select>
              </div>

              <div className="guru-swap-wrapper">
                <button onClick={swapGPUs} className="guru-swap-btn" title={isEn ? "Swap" : "Prohodit"}>
                  <ArrowLeftRight size={20} />
                </button>
              </div>

              <div className="guru-dropdown-group">
                <label className="gpu-label">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#66fcf1', boxShadow: '0 0 10px #66fcf1' }}></div>
                  {isEn ? "SECOND GPU (BLUE CORNER)" : "DRUHÁ GRAFIKA (MODRÝ ROH)"}
                </label>
                <select className="guru-dropdown" value={gpuB} onChange={e => setGpuB(e.target.value)}>
                  <option value="" style={{ color: '#6b7280' }}>{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                  {gpus.map(g => (
                    <option key={g.id} value={String(g.id)} style={{ color: '#fff' }} disabled={String(g.id) === gpuA}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="guru-battle-btn" 
                onClick={handleStartDuel} 
                disabled={!gpuA || !gpuB || gpuA === gpuB || loading}
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                {isEn ? "START HARDWARE BATTLE" : "SPUSTIT SOUBOJ ŽELEZA"}
              </button>
              
              {gpuA === gpuB && gpuA !== '' && (
                <p style={{ color: '#ff0055', fontSize: '11px', fontWeight: '950', textAlign: 'center', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {isEn ? "ERROR: SELECT DIFFERENT CARDS!" : "CHYBA: VYBERTE DVĚ RŮZNÉ KARTY!"}
                </p>
              )}
            </section>

            {/* PRAVÝ SLOUPEC: KOMPAKTNÍ HISTORIE */}
            <section className="history-panel">
              <div className="history-header">
                <Flame color="#f97316" size={24} />
                <h2 className="history-title">{isEn ? "RECENT BATTLES" : "POSLEDNÍ SOUBOJE"}</h2>
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
                    <Link 
                      href={`/${isEn ? 'en/' : ''}gpuvs/${targetSlug}`} 
                      key={duel.id} 
                      className="compact-duel-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Swords size={16} color="#6b7280" />
                        <span className="duel-name">{targetTitle}</span>
                      </div>
                      <ChevronRight size={18} color="#66fcf1" />
                    </Link>
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
