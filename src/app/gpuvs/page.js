"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, RefreshCw, ChevronRight
} from 'lucide-react';

/**
 * GURU GPU DUELS INDEX - MASTER LOGIC V14.1 (BUILD SHIELD RECOVERY)
 * Cesta: src/app/gpuvs/page.js
 * Design: Brutální GURU styl (obří růžové nadpisy, skleněný panel, neonové tečky).
 * FIX: Dynamické načítání modulů (Build Shield) pro vyřešení chyb kompilace v náhledovém prostředí.
 * SYNC: Přímé propojení s tabulkou 'gpus' (RTX 5090, 4080 atd.).
 */

// --- 🛡️ GURU BUILD SHIELD ---
// Pomocná funkce pro bezpečné načítání modulů v prostředí náhledu/kompilátoru
const getModule = (path) => {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
};

const supabaseLib = getModule('@supabase/supabase-js');
const nextNav = getModule('next/navigation');
const nextLinkModule = getModule('next/link');

// Fallbacky pro prostředí, kde moduly nejsou dostupné v bundle času
const createClient = supabaseLib ? supabaseLib.createClient : null;
const useRouter = nextNav ? nextNav.useRouter : () => ({ push: (url) => console.log(`Navigace: ${url}`) });
const usePathname = nextNav ? nextNav.usePathname : () => '/gpuvs';
const Link = nextLinkModule ? (nextLinkModule.default || nextLinkModule) : ({ children, href, className, ...props }) => (
  <a href={href} className={className} {...props}>{children}</a>
);

// Inicializace Supabase s ochranou (Bere ENV z tvého Vercelu)
const supabase = (createClient && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : { 
      from: () => ({ 
        select: () => ({ 
          order: () => {
            const chain = Promise.resolve({ data: [] });
            // @ts-ignore
            chain.limit = () => Promise.resolve({ data: [] });
            return chain;
          }
        }) 
      }) 
    };

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

  // 🚀 GURU DATA SYNC: Načítání z tabulek 'gpus' a 'gpu_duels'
  useEffect(() => {
    async function loadData() {
      if (!createClient) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [gData, dData] = await Promise.all([
          supabase.from('gpus').select('id, name').order('name', { ascending: true }),
          supabase.from('gpu_duels').select('id, title_cs, title_en, slug').order('created_at', { ascending: false }).limit(10)
        ]);

        if (gData.error) throw gData.error;
        if (dData.error) throw dData.error;

        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
      } catch (err) {
        console.error("Guru Sync Error:", err);
        setError(isEn ? "Database sync failed." : "Synchronizace s DB selhala.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  // Pomocná funkce pro slugifikaci názvů
  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }

  // 🚀 GURU ENGINE: Odpálení duelu
  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    const cardA = gpus.find(g => g.id === gpuA);
    const cardB = gpus.find(g => g.id === gpuB);
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
      
      {/* 🛡️ GURU HYPER-SHIELD: Prevence TypeError u SwG scriptů */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          window.swgSubscriptions = window.swgSubscriptions || {};
          if (typeof window.swgSubscriptions.attachButton !== 'function') {
            window.swgSubscriptions.attachButton = function() {};
          }
        })();
      `}} />

      <style dangerouslySetInnerHTML={{__html: `
        .guru-main-title { font-size: 72px; font-weight: 900; font-style: italic; color: #fff; text-transform: uppercase; line-height: 0.9; margin: 0; text-align: center; }
        .guru-highlight-title { font-size: 64px; font-weight: 900; font-style: italic; color: #ff0055; text-transform: uppercase; line-height: 0.9; margin-top: -5px; margin-bottom: 40px; text-align: center; display: block; }
        
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
        }
        .guru-neon-top { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #ff0055; border-radius: 14px 14px 0 0; }
        
        .guru-dropdown { flex: 1; padding: 14px; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 16px; appearance: none; cursor: pointer; outline: none; transition: 0.3s; }
        .guru-dropdown:focus { border-color: #ff0055; }
        
        .guru-battle-btn { width: 100%; padding: 18px; background: linear-gradient(90deg, #ff0055, #7a001e); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(255, 0, 85, 0.3); }
        .guru-battle-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4); }
        .guru-battle-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .duel-list-item { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: #fff; transition: 0.3s; margin-bottom: 12px; }
        .duel-list-item:hover { background: rgba(0,0,0,0.7); border-color: #ff0055; transform: translateX(10px); }
        
        .gpu-label { display: block; color: #ff0055; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        @media (max-width: 768px) { 
          .guru-main-title { font-size: 44px; }
          .guru-highlight-title { font-size: 38px; }
          .guru-glass-panel { padding: 30px 20px; }
        }
      `}} />

      <main className="max-w-4xl mx-auto px-4">
        
        {/* HERO HLAVIČKA */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#ff0055] text-xs font-black uppercase tracking-[0.4em] mb-6 px-5 py-1.5 border border-[#ff0055] rounded-full bg-[#ff0055]/10 animate-pulse shadow-[0_0_15px_rgba(255,0,85,0.2)]">
            <Swords size={16} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">{isEn ? "COMPARE" : "POROVNEJTE"}</h1>
          <span className="guru-highlight-title">{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          <p className="text-[#e0e0e0] text-lg max-w-xl mx-auto italic font-medium opacity-80">
            {isEn ? "Detailed technical analysis, FPS estimation and AI verdict by Guru." : "Detailní technická analýza, odhad FPS a zhodnocení výhodnosti pomocí Guru AI."}
          </p>
        </div>

        {/* VÝBĚROVÝ PANEL */}
        <section className="guru-glass-panel">
            <div className="guru-neon-top"></div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center font-black mb-8 uppercase tracking-widest text-xs">
                 <RefreshCw className="inline mr-2 animate-spin" size={14} /> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="gpu-label">
                    <span className="dot bg-[#ff0055]"></span>
                    {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}
                  </label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuA} 
                    onChange={e => setGpuA(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d]">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => (
                      <option key={g.id} value={g.id} className="bg-[#0a0b0d] text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="gpu-label" style={{ color: '#3b82f6' }}>
                    <span className="dot bg-[#3b82f6]"></span>
                    {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}
                  </label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuB} 
                    onChange={e => setGpuB(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d]">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => (
                      <option key={g.id} value={g.id} className="bg-[#0a0b0d] text-white">
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
              <div className="flex items-center justify-center gap-3">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap fill="currentColor" size={20} />}
                {isEn ? "START HARDWARE BATTLE" : "SPUSTIT SOUBOJ ŽELEZA"}
              </div>
            </button>
            
            {gpuA === gpuB && gpuA !== '' && (
              <p className="text-[#ff0055] text-[10px] font-black text-center mt-5 uppercase tracking-widest">
                {isEn ? "CRITICAL ERROR: SELECT DIFFERENT CARDS!" : "CHYBA: VYBERTE DVĚ RŮZNÉ KARTY!"}
              </p>
            )}
        </section>

        {/* POPULÁRNÍ SOUBOJE */}
        <section className="max-w-[600px] mx-auto">
          <div className="flex items-center gap-5 mb-10">
            <h2 className="text-2xl font-black uppercase italic whitespace-nowrap tracking-tighter">
              {isEn ? "RECENT" : "POSLEDNÍ"} <span className="text-[#ff0055]">{isEn ? "BATTLES" : "SOUBOJE"}</span>
            </h2>
            <div className="h-px bg-white/10 w-full"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-600 font-black tracking-widest uppercase italic text-xs">
              <RefreshCw className="animate-spin mr-3" size={18} /> GURU SCANNING...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {existingDuels.length > 0 ? existingDuels.map((duel) => (
                <Link 
                  href={isEn ? `/en/gpuvs/${duel.slug}` : `/gpuvs/${duel.slug}`} 
                  key={duel.id} 
                  className="duel-list-item group"
                >
                  <div className="flex items-center gap-4">
                    <Swords size={16} className="text-gray-500 group-hover:text-[#ff0055] transition-colors" />
                    <span className="text-md font-black tracking-tight group-hover:text-white transition-colors uppercase italic">
                      {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>
              )) : (
                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl bg-black/20 text-gray-600 font-black uppercase tracking-widest text-[10px] italic">
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
