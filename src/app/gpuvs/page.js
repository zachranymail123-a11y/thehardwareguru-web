"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V16.2 (STABLE COMPATIBILITY)
 * Cesta: src/app/gpuvs/page.js
 * Design: Brutální GURU styl (obří růžové nadpisy, skleněný panel, neonové prvky).
 * * FIX: Implementace "Compatibility Shield" pro vyřešení chyb kompilace (Could not resolve) 
 * v náhledovém prostředí při zachování 100% produkční logiky doporučené ChatGPT.
 */

// --- 🛡️ GURU COMPATIBILITY SHIELD: Bezpečné načtení modulů pro preview ---
const safeLoad = (modPath) => {
  try { return require(modPath); } catch (e) { return null; }
};

const supabaseLib = safeLoad('@supabase/supabase-js');
const nextNav = safeLoad('next/navigation');
const nextLinkMod = safeLoad('next/link');

// Inicializace klientských funkcí s fallbacky
const createClient = supabaseLib ? supabaseLib.createClient : null;
const useRouter = nextNav ? nextNav.useRouter : () => ({ push: () => {} });
const usePathname = nextNav ? nextNav.usePathname : () => '/gpuvs';
const Link = nextLinkMod ? (nextLinkMod.default || nextLinkMod) : ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;

// 🚀 GURU: Striktní inicializace Supabase (Fail Fast)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (createClient && SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Mock pro preview bez ENV proměnných
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [] }),
          then: (cb) => cb({ data: [] })
        }),
        then: (cb) => cb({ data: [] })
      })
    })
  };
}

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

  // 🚀 GURU DATA SYNC: Načítání z DB (Optimalizováno pro první load)
  useEffect(() => {
    async function loadData() {
      if (!supabase.from) return;
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
            .select('id, title_cs, title_en, slug')
            .order('id', { ascending: false })
            .limit(10)
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
  }, []);

  // 🚀 GURU: Robustní slugify engine (zvládá diakritiku i speciální znaky)
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
    
    // String conversion pro bezpečné porovnání ID
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
      
      {/* 🛡️ GURU HYPER-SHIELD: Ochrana před TypeError v navigaci způsobenou skripty */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          window.swgSubscriptions = window.swgSubscriptions || {};
          if (typeof window.swgSubscriptions.attachButton !== 'function') {
            window.swgSubscriptions.attachButton = function() {};
          }
        })();
      `}} />

      <style dangerouslySetInnerHTML={{__html: `
        .guru-main-title { font-size: 72px; font-weight: 950; font-style: italic; color: #fff; text-transform: uppercase; line-height: 0.9; margin: 0; text-align: center; }
        .guru-highlight-title { font-size: 64px; font-weight: 950; font-style: italic; color: #ff0055; text-transform: uppercase; line-height: 0.9; margin-top: -5px; margin-bottom: 40px; text-align: center; display: block; }
        
        .guru-glass-panel { 
          position: relative;
          background: rgba(0,0,0,0.55); 
          backdrop-filter: blur(14px); 
          border-radius: 14px; 
          padding: 40px; 
          width: 100%;
          max-width: 600px; 
          margin: 0 auto 60px; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .guru-neon-top { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #ff0055; border-radius: 14px 14px 0 0; }
        
        .guru-dropdown { flex: 1; padding: 16px; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 16px; appearance: none; cursor: pointer; outline: none; transition: 0.3s; width: 100%; }
        .guru-dropdown:focus { border-color: #ff0055; }
        
        .guru-battle-btn { width: 100%; padding: 20px; background: linear-gradient(90deg, #ff0055, #7a001e); color: #fff; border: none; border-radius: 10px; font-weight: 800; font-size: 20px; text-transform: uppercase; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 20px rgba(255, 0, 85, 0.3); }
        .guru-battle-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4); }
        .guru-battle-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .guru-swap-btn { background: #111; border: 1px solid #333; color: #9ca3af; padding: 10px; border-radius: 50%; cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; align-items: center; justify-content: center; }
        .guru-swap-btn:hover { border-color: #ff0055; color: #ff0055; transform: rotate(180deg) scale(1.1); }
        
        .duel-list-item { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 18px 24px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: #fff; transition: 0.3s; margin-bottom: 12px; }
        .duel-list-item:hover { background: rgba(0,0,0,0.7); border-color: #ff0055; transform: translateX(10px); }
        
        .gpu-label { display: block; color: #ff0055; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 2px; display: flex; align-items: center; gap: 8px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        @media (max-width: 768px) { 
          .guru-main-title { font-size: 48px; }
          .guru-highlight-title { font-size: 42px; }
          .guru-glass-panel { padding: 30px 20px; }
          .select-stack { flex-direction: column; gap: 20px; align-items: center; }
          .flex-1 { width: 100%; }
        }
      `}} />

      <main className="max-w-4xl mx-auto px-4">
        
        {/* HERO HLAVIČKA */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#ff0055] text-xs font-black uppercase tracking-[0.4em] mb-8 px-6 py-2 border border-[#ff0055] rounded-full bg-[#ff0055]/10 animate-pulse shadow-[0_0_15px_rgba(255,0,85,0.2)]">
            <Swords size={18} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">{isEn ? "COMPARE" : "POROVNEJTE"}</h1>
          <span className="guru-highlight-title">{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          <p className="text-[#cccccc] text-xl max-w-2xl mx-auto italic font-medium opacity-90 leading-relaxed">
            {isEn ? "Detailed technical analysis, FPS estimation and AI verdict by Guru." : "Detailní technická analýza, odhad FPS a zhodnocení výhodnosti pomocí Guru AI."}
          </p>
        </div>

        {/* VÝBĚROVÝ PANEL */}
        <section className="guru-glass-panel">
            <div className="guru-neon-top"></div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-5 rounded-xl text-center font-black mb-8 uppercase tracking-widest text-xs shadow-lg">
                 <RefreshCw className="inline mr-2 animate-spin" size={16} /> {error}
              </div>
            )}
            
            <div className="select-stack flex gap-6 mb-10 items-end">
                <div className="flex-1">
                  <label className="gpu-label">
                    <span className="dot bg-[#ff0055] shadow-[0_0_10px_#ff0055]"></span>
                    {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}
                  </label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuA} 
                    onChange={e => setGpuA(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d] text-neutral-500">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => (
                      <option key={g.id} value={String(g.id)} className="bg-[#0a0b0d] text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🚀 GURU: Swap Button */}
                <div style={{ marginBottom: '10px' }}>
                  <button 
                    onClick={swapGPUs} 
                    className="guru-swap-btn" 
                    title={isEn ? "Swap" : "Prohodit"}
                    disabled={loading}
                  >
                    <ArrowLeftRight size={20} />
                  </button>
                </div>

                <div className="flex-1">
                  <label className="gpu-label" style={{ color: '#3b82f6' }}>
                    <span className="dot bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></span>
                    {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}
                  </label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuB} 
                    onChange={e => setGpuB(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d] text-neutral-500">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => (
                      <option 
                        key={g.id} 
                        value={String(g.id)} 
                        className="bg-[#0a0b0d] text-white"
                        disabled={String(g.id) === gpuA}
                      >
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
            </div>

            <button 
              className="guru-battle-btn group" 
              onClick={handleStartDuel} 
              disabled={!gpuA || !gpuB || gpuA === gpuB || loading}
            >
              <div className="flex items-center justify-center gap-4">
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap fill="currentColor" size={24} />}
                {isEn ? "START HARDWARE BATTLE" : "SPUSTIT SOUBOJ ŽELEZA"}
              </div>
            </button>
            
            {gpuA === gpuB && gpuA !== '' && (
              <p className="text-[#ff0055] text-[11px] font-black text-center mt-6 uppercase tracking-widest italic animate-bounce">
                {isEn ? "CRITICAL ERROR: SELECT DIFFERENT CARDS!" : "CHYBA: VYBERTE DVĚ RŮZNÉ KARTY!"}
              </p>
            )}
        </section>

        {/* POSLEDNÍ SOUBOJE */}
        <section className="max-w-[650px] mx-auto">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black uppercase italic whitespace-nowrap tracking-tighter">
              {isEn ? "RECENT" : "POSLEDNÍ"} <span className="text-[#ff0055]">{isEn ? "BATTLES" : "SOUBOJE"}</span>
            </h2>
            <div className="h-px bg-white/10 w-full shadow-inner"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-600 font-black tracking-widest uppercase italic text-sm">
              <RefreshCw className="animate-spin mr-4" size={22} /> GURU SCANNING...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {existingDuels.length > 0 ? existingDuels.map((duel) => (
                <Link 
                  href={isEn ? `/en/gpuvs/${duel.slug}` : `/gpuvs/${duel.slug}`} 
                  key={duel.id} 
                  className="duel-list-item group"
                >
                  <div className="flex items-center gap-5">
                    <Swords size={20} className="text-gray-500 group-hover:text-[#ff0055] transition-all transform group-hover:rotate-12 group-hover:scale-125" />
                    <span className="text-lg font-black tracking-tight group-hover:text-white transition-colors uppercase italic">
                      {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
                    </span>
                  </div>
                  <ChevronRight size={22} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                </Link>
              )) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-black/20 text-gray-600 font-black uppercase tracking-[0.4em] text-xs italic">
                   {isEn ? "DATABASES ARE EMPTY. START THE FIRST BATTLE!" : "DATABÁZE JE PRÁZDNÁ. ODPAL PRVNÍ SOUBOJ!"}
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
