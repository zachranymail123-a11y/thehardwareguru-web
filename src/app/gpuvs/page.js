"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, ChevronRight, Zap, RefreshCw, Flame, Cpu, ShieldCheck 
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V9.1 (CLEAN BUILD)
 * Cesta: src/app/gpuvs/page.js
 * Funkce: Výběr karet pro srovnání, seznam existujících duelů.
 * FIX: Odstraněn duplicitní default export, opraven Build Shield pro náhled.
 * Design: Brutální růžové nadpisy, skleněný panel a neonové prvky (GURU STYLE).
 */

// --- 🛡️ GURU BUILD SHIELD: Dynamické ošetření modulů pro prostředí náhledu ---
const safeRequire = (path) => {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
};

const supabaseLib = safeRequire('@supabase/supabase-js');
const nextNav = safeRequire('next/navigation');
const nextLinkModule = safeRequire('next/link');

// Fallbacky pro bezpečný běh v náhledu (Canvas)
const createClient = supabaseLib ? supabaseLib.createClient : null;
const useRouter = nextNav ? nextNav.useRouter : () => ({ push: () => {} });
const usePathname = nextNav ? nextNav.usePathname : () => '/gpuvs';
const Link = nextLinkModule ? (nextLinkModule.default || nextLinkModule) : ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;

// Inicializace Supabase s ochranou proti chybějícím ENV proměnným
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

  // 🚀 GURU DATA SYNC: Načítání z DB
  useEffect(() => {
    async function loadData() {
      if (!createClient) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Načítáme karty pro dropdowny a už existující duely
        const [gData, dData] = await Promise.all([
          supabase.from('gpus').select('id, name').order('name', { ascending: true }),
          supabase.from('gpu_duels').select('id, title_cs, title_en, slug').order('created_at', { ascending: false }).limit(20)
        ]);

        if (gData.error) throw gData.error;
        if (dData.error) throw dData.error;

        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
      } catch (err) {
        console.error("Guru Sync Error:", err);
        setError(isEn ? "Database sync failed. Refresh page." : "Synchronizace s DB selhala. Zkuste obnovit stránku.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  // 🚀 GURU ENGINE: Odpálení duelu
  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    const cardA = gpus.find(g => g.id === gpuA);
    const cardB = gpus.find(g => g.id === gpuB);
    if (!cardA || !cardB) return;

    // Slug pattern: karta-a-vs-karta-b
    const rawSlug = `${cardA.name}-vs-${cardB.name}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    
    // Přesměrování na detail
    const target = isEn ? `/en/gpuvs/en-${rawSlug}` : `/gpuvs/${rawSlug}`;
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans selection:bg-[#ff0055]" style={{ backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '100px' }}>
      
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
        .guru-glass-card { background: rgba(17, 19, 24, 0.95); border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 40px; padding: 60px; box-shadow: 0 30px 100px rgba(0,0,0,0.8); backdrop-filter: blur(25px); position: relative; }
        .guru-glass-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, transparent, #ff0055, transparent); }
        
        .guru-dropdown { width: 100%; padding: 22px; background: #000; border: 1px solid #333; color: #fff; border-radius: 18px; font-size: 16px; font-weight: 900; appearance: none; cursor: pointer; outline: none; transition: 0.3s; }
        .guru-dropdown:focus { border-color: #ff0055; box-shadow: 0 0 20px rgba(255, 0, 85, 0.3); }
        
        .guru-start-btn { width: 100%; padding: 24px; background: linear-gradient(135deg, #ff0055 0%, #be123c 100%); color: #fff; border: none; border-radius: 20px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 15px 40px rgba(255, 0, 85, 0.4); }
        .guru-start-btn:hover:not(:disabled) { transform: translateY(-5px); filter: brightness(1.1); box-shadow: 0 20px 60px rgba(255, 0, 85, 0.6); }
        .guru-start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .duel-list-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 25px 30px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: #fff; transition: 0.3s; margin-bottom: 12px; }
        .duel-list-item:hover { background: rgba(255,255,255,0.05); border-color: #ff0055; transform: translateX(10px); }
        
        .gpu-label { display: block; color: #ff0055; font-size: 11px; font-weight: 950; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 2px; }
        
        .guru-main-title { font-size: 90px; font-weight: 950; font-style: italic; color: #ff0055; text-transform: uppercase; line-height: 0.9; margin-bottom: 30px; }
        
        @media (max-width: 768px) { 
          .grid-select { grid-template-columns: 1fr !important; } 
          .guru-glass-card { padding: 40px 20px; }
          .guru-main-title { font-size: 50px; }
        }
      `}} />

      <main className="max-w-4xl mx-auto px-4">
        
        {/* HERO HLAVIČKA */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#ff0055] text-xs font-black uppercase tracking-[0.4em] mb-8 px-6 py-2 border border-[#ff0055] rounded-full bg-[#ff0055]/10 animate-pulse shadow-[0_0_15px_rgba(255,0,85,0.2)]">
            <Swords size={18} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">
            {isEn ? "COMPARE ANY" : "POROVNEJTE"} <br/> 
            <span style={{ color: '#fff' }}>{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          </h1>
          <p className="text-[#9ca3af] text-xl max-w-xl mx-auto italic font-medium">
            {isEn ? "Detailed technical analysis and AI verdict by Hardware Guru." : "Detailní technická analýza a AI verdikt přímo od Hardware Guruho."}
          </p>
        </div>

        {/* VÝBĚROVÝ PANEL */}
        <section className="guru-glass-card mb-24 shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-2xl text-center font-black mb-10 uppercase tracking-widest text-sm">
                 <RefreshCw className="inline mr-2 animate-spin" size={16} /> {error}
              </div>
            )}
            
            <div className="grid-select grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div>
                  <label className="gpu-label">🔴 {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}</label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuA} 
                    onChange={e => setGpuA(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d]">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id} className="bg-[#0a0b0d]">{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gpu-label" style={{ color: '#3b82f6' }}>🔵 {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}</label>
                  <select 
                    className="guru-dropdown" 
                    value={gpuB} 
                    onChange={e => setGpuB(e.target.value)}
                  >
                    <option value="" className="bg-[#0a0b0d]">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id} className="bg-[#0a0b0d]">{g.name}</option>)}
                  </select>
                </div>
            </div>

            <button 
              className="guru-start-btn group" 
              onClick={handleStartDuel} 
              disabled={!gpuA || !gpuB || gpuA === gpuB || loading}
            >
              <div className="flex items-center justify-center gap-4">
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap fill="currentColor" size={24} className="group-hover:scale-125 transition-transform" />}
                {isEn ? "Start Hardware Battle" : "Spustit souboj železa"}
              </div>
            </button>
            
            {gpuA === gpuB && gpuA !== '' && (
              <p className="text-[#ff0055] text-[10px] font-black text-center mt-6 uppercase tracking-[0.3em]">
                {isEn ? "Critical Error: Select different hardware!" : "Kritická chyba: Vyberte dvě různé karty!"}
              </p>
            )}
        </section>

        {/* POPULÁRNÍ SOUBOJE */}
        <section>
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black uppercase italic whitespace-nowrap tracking-tighter">
              {isEn ? "POPULAR" : "POPULÁRNÍ"} <span className="text-[#ff0055]">{isEn ? "BATTLES" : "SOUBOJE"}</span>
            </h2>
            <div className="h-px bg-white/10 w-full"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-600 font-black tracking-[0.5em] uppercase italic text-sm">
              <RefreshCw className="animate-spin mr-4" size={24} /> Guru System Scanning...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {existingDuels.length > 0 ? existingDuels.map((duel) => (
                <Link 
                  href={isEn ? `/en/gpuvs/${duel.slug}` : `/gpuvs/${duel.slug}`} 
                  key={duel.id} 
                  className="duel-list-item group"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-[#ff0055]/10 rounded-xl text-[#ff0055] group-hover:bg-[#ff0055] group-hover:text-white transition-all shadow-lg">
                      <Swords size={22} />
                    </div>
                    <span className="text-xl font-black tracking-tight group-hover:text-[#ff0055] transition-colors uppercase italic">
                      {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
                    </span>
                  </div>
                  <ChevronRight size={24} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                </Link>
              )) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-black/20 text-gray-600 font-black uppercase tracking-[0.5em] text-xs italic">
                   {isEn ? "Database is empty. Start the first battle!" : "V databázi zatím nejsou žádné souboje. Odpal to první!"}
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
