"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - MASTER LOGIC V57.0 (ZERO DEPENDENCY HUB)
 * Cesta: src/app/gpuvs/page.js
 * DESIGN: Dvousloupcový layout (Generátor vlevo, Historie vpravo) = bez kolize s AI.
 * FIX: Zcela odstraněn next/link, next/navigation a @supabase/supabase-js.
 * Použito nativní fetch API. Rychlejší, bezpečnější, 100% imunní proti chybám v náhledu i Vercelu.
 */

export default function GpuVsHub() {
  const [isEn, setIsEn] = useState(false);
  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Zjištění jazyka z URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  // 🚀 GURU DATA SYNC (Nativní Fetch místo těžkého Supabase klienta)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase configuration");
        }

        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        };

        const [gRes, dRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name&order=name.asc`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en&order=created_at.desc&limit=12`, { headers })
        ]);

        if (!gRes.ok || !dRes.ok) throw new Error("API request failed");

        const gData = await gRes.json();
        const dData = await dRes.json();

        setGpus(gData || []);
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

  const swapGPUs = () => {
    const temp = gpuA;
    setGpuA(gpuB);
    setGpuB(temp);
  };

  // Nativní přesměrování (Náhrada za useRouter)
  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    
    const cardA = gpus.find(g => String(g.id) === gpuA);
    const cardB = gpus.find(g => String(g.id) === gpuB);
    
    if (!cardA || !cardB) return;

    const rawSlug = `${slugify(cardA.name)}-vs-${slugify(cardB.name)}`;
    const target = isEn ? `/en/gpuvs/en-${rawSlug}` : `/gpuvs/${rawSlug}`;
    window.location.href = target; 
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

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* HERO HLAVIČKA */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#66fcf1] text-xs font-black uppercase tracking-[0.2em] mb-6 px-5 py-2 border border-[#66fcf1]/30 rounded-full bg-[#66fcf1]/5 shadow-[0_0_20px_rgba(102,252,241,0.1)]">
            <ShieldCheck size={16} /> GURU VS ENGINE
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none mb-2 text-white drop-shadow-[0_0_20px_rgba(102,252,241,0.2)]">
            {isEn ? "COMPARE" : "POROVNEJTE"}
          </h1>
          <span className="text-4xl md:text-6xl font-black uppercase italic leading-none text-[#66fcf1] block mb-6">
            {isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}
          </span>
          <p className="text-[#d1d5db] text-lg max-w-2xl mx-auto leading-relaxed">
            {isEn ? "Detailed technical analysis, raw performance index and AI verdict by Guru." : "Detailní technická analýza, odhad hrubého výkonu a zhodnocení výhodnosti pomocí AI."}
          </p>
        </div>

        {/* 🚀 GURU: Dvousloupcový Tailwind Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            
            {/* LEVÝ SLOUPEC: GENERÁTOR (Širší) */}
            <section className="lg:col-span-3 bg-[#0f1115]/95 backdrop-blur-xl rounded-[30px] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-[#66fcf1]/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#66fcf1] to-[#a855f7]"></div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-center font-black mb-8 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                   <AlertTriangle size={16} /> {error}
                </div>
              )}
              
              <div className="mb-6">
                <label className="flex items-center gap-2 text-[#9ca3af] text-[11px] font-black uppercase tracking-widest mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff0055] shadow-[0_0_10px_#ff0055]"></div>
                  {isEn ? "FIRST GPU (RED CORNER)" : "PRVNÍ GRAFIKA (ČERVENÝ ROH)"}
                </label>
                <select 
                  className="w-full p-4 bg-black/60 border border-white/10 text-white rounded-2xl text-base font-bold outline-none focus:border-[#66fcf1] focus:ring-2 focus:ring-[#66fcf1]/20 transition-all cursor-pointer"
                  value={gpuA} 
                  onChange={e => setGpuA(e.target.value)}
                >
                  <option value="" className="text-neutral-500">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                  {gpus.map(g => <option key={g.id} value={String(g.id)} className="bg-[#0a0b0d] text-white">{g.name}</option>)}
                </select>
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                <button onClick={swapGPUs} className="bg-[#111318] border border-white/10 text-[#9ca3af] p-3 rounded-full hover:border-[#66fcf1] hover:text-[#66fcf1] transition-all transform hover:rotate-180 hover:scale-110 shadow-xl" title={isEn ? "Swap" : "Prohodit"}>
                  <ArrowLeftRight size={20} />
                </button>
              </div>

              <div className="mb-8">
                <label className="flex items-center gap-2 text-[#9ca3af] text-[11px] font-black uppercase tracking-widest mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#66fcf1] shadow-[0_0_10px_#66fcf1]"></div>
                  {isEn ? "SECOND GPU (BLUE CORNER)" : "DRUHÁ GRAFIKA (MODRÝ ROH)"}
                </label>
                <select 
                  className="w-full p-4 bg-black/60 border border-white/10 text-white rounded-2xl text-base font-bold outline-none focus:border-[#66fcf1] focus:ring-2 focus:ring-[#66fcf1]/20 transition-all cursor-pointer"
                  value={gpuB} 
                  onChange={e => setGpuB(e.target.value)}
                >
                  <option value="" className="text-neutral-500">{loading ? "..." : (isEn ? "-- Select GPU --" : "-- Vyber grafiku --")}</option>
                  {gpus.map(g => (
                    <option key={g.id} value={String(g.id)} className="bg-[#0a0b0d] text-white" disabled={String(g.id) === gpuA}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="w-full p-5 mt-2 bg-gradient-to-r from-[#ff0055] to-[#990033] text-white border border-[#ff0055]/50 rounded-2xl font-black text-lg uppercase tracking-wide cursor-pointer transition-all shadow-[0_10px_30px_rgba(255,0,85,0.3)] flex justify-center items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:transform-none hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,0,85,0.5)]"
                onClick={handleStartDuel} 
                disabled={!gpuA || !gpuB || gpuA === gpuB || loading}
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                {isEn ? "START HARDWARE BATTLE" : "SPUSTIT SOUBOJ ŽELEZA"}
              </button>
              
              {gpuA === gpuB && gpuA !== '' && (
                <p className="text-[#ff0055] text-[11px] font-black text-center mt-4 uppercase tracking-widest animate-pulse">
                  {isEn ? "ERROR: SELECT DIFFERENT CARDS!" : "CHYBA: VYBERTE DVĚ RŮZNÉ KARTY!"}
                </p>
              )}
            </section>

            {/* PRAVÝ SLOUPEC: KOMPAKTNÍ HISTORIE (Nativní HTML link místo next/link) */}
            <section className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <Flame color="#f97316" size={24} />
                <h2 className="text-lg font-black text-white uppercase m-0 tracking-wide">{isEn ? "RECENT BATTLES" : "POSLEDNÍ SOUBOJE"}</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-10 text-[#6b7280] text-xs font-black tracking-widest uppercase">
                  <RefreshCw className="animate-spin mr-3" size={18} /> SCANNING...
                </div>
              ) : existingDuels.length > 0 ? (
                existingDuels.map((duel) => {
                  const targetSlug = isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug;
                  const targetTitle = isEn ? (duel.title_en || duel.title_cs) : duel.title_cs;
                  
                  return (
                    <a 
                      href={`/${isEn ? 'en/' : ''}gpuvs/${targetSlug}`} 
                      key={duel.id} 
                      className="group bg-[#0f1115]/70 border border-white/5 p-4 rounded-2xl flex justify-between items-center no-underline transition-all duration-300 backdrop-blur-md hover:bg-[#66fcf1]/5 hover:border-[#66fcf1]/30 hover:translate-x-1"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Swords size={16} className="text-[#6b7280] flex-shrink-0" />
                        <span className="text-sm font-black text-[#d1d5db] uppercase truncate transition-colors group-hover:text-white">{targetTitle}</span>
                      </div>
                      <ChevronRight size={18} className="text-[#66fcf1] flex-shrink-0" />
                    </a>
                  );
                })
              ) : (
                <div className="text-center p-10 bg-black/30 rounded-2xl border border-dashed border-white/10 text-[#6b7280] text-xs font-black uppercase tracking-widest">
                   {isEn ? "DATABASES ARE EMPTY." : "DATABÁZE JE PRÁZDNÁ."}
                </div>
              )}
            </section>

        </div>
      </main>
    </div>
  );
}
