"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, ChevronRight, Search, Zap, Activity, 
  Flame, Cpu, Info, ShieldCheck, Trophy
} from 'lucide-react';

/**
 * GURU GPU DUELS INDEX - MASTER LOGIC V1.1 (BUILD FIX)
 * Cesta: src/app/gpuvs/page.js
 * Funkce: Výběr karet pro duel, výpis existujících duelů, CZ/EN hybrid.
 */

// 🚀 GURU BUILD SHIELD: Bezpečné načtení modulů pro prostředí náhledu
const getModule = (path) => {
  try { return require(path); } catch (e) { return null; }
};

const supabaseLib = getModule('@supabase/supabase-js');
const nextNav = getModule('next/navigation');
const nextLink = getModule('next/link');

const createClient = supabaseLib ? supabaseLib.createClient : null;
const useRouter = nextNav ? nextNav.useRouter : () => ({ push: (url) => console.log(`Navigating to: ${url}`) });
const usePathname = nextNav ? nextNav.usePathname : () => '/gpuvs';
const Link = nextLink ? (nextLink.default || nextLink) : ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;

// Inicializace Supabase (pokud je dostupná)
const supabase = (createClient && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : { 
      from: () => ({ 
        select: () => ({ 
          order: () => ({ limit: () => Promise.resolve({ data: [] }) }),
          order: () => Promise.resolve({ data: [] }) 
        }) 
      }) 
    };

export default function GpuVsIndex() {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  // Stavy pro výběr a data
  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);

  // Načtení dat ze Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [gData, dData] = await Promise.all([
          supabase.from('gpus').select('*').order('release_price_usd', { ascending: false }),
          supabase.from('gpu_duels').select('*').order('created_at', { ascending: false }).limit(20)
        ]);
        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
      } catch (err) {
        console.error("Guru Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Logika pro odpal duelu
  const handleStartDuel = () => {
    if (!gpuA || !gpuB) return;
    if (gpuA === gpuB) return;

    const cardAName = gpus.find(g => g.id === gpuA)?.name || '';
    const cardBName = gpus.find(g => g.id === gpuB)?.name || '';

    // Vytvoření slugu pro přesměrování
    const rawSlug = `${cardAName}-vs-${cardBName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    if (isEn) {
      router.push(`/en/gpuvs/en-${rawSlug}`);
    } else {
      router.push(`/gpuvs/${rawSlug}`);
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '100px',
        color: '#fff', fontFamily: 'sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-select-card { background: rgba(17, 19, 24, 0.95); border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 32px; padding: 50px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .gpu-dropdown { width: 100%; padding: 18px; background: #000; border: 1px solid #333; color: #fff; border-radius: 14px; font-size: 16px; outline: none; transition: 0.3s; font-weight: 900; }
        .gpu-dropdown:focus { border-color: #ff0055; box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }
        .start-btn { width: 100%; padding: 22px; background: linear-gradient(135deg, #ff0055 0%, #be123c 100%); color: #fff; border: none; border-radius: 18px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4); }
        .start-btn:hover:not(:disabled) { transform: translateY(-5px); filter: brightness(1.1); }
        .start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .duel-list-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: #fff; transition: 0.3s; margin-bottom: 12px; }
        .duel-list-item:hover { background: rgba(255,255,255,0.07); border-color: #ff0055; transform: translateX(10px); }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* --- HERO SEKCE --- */}
        <div style={{ textAlign: 'center', marginBottom: '70px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#ff0055', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', padding: '8px 20px', border: '1px solid #ff0055', borderRadius: '50px', background: 'rgba(255,0,85,0.1)' }}>
            <Swords size={18} /> GURU VS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1', margin: 0, fontStyle: 'italic' }}>
            {isEn ? "COMPARE ANY" : "POROVNEJTE"} <br/> <span style={{ color: '#ff0055' }}>{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginTop: '20px', maxWidth: '600px', margin: '20px auto 0' }}>
            {isEn ? "Detailed technical analysis, RayTracing performance, and value assessment by Guru AI." : "Detailní technická analýza, výkon v RayTracingu a zhodnocení výhodnosti pomocí Guru AI."}
          </p>
        </div>

        {/* --- VÝBĚROVÝ PANEL --- */}
        <section className="guru-select-card" style={{ marginBottom: '90px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ff0055', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>🔴 {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}</label>
                  <select className="gpu-dropdown" value={gpuA} onChange={e => setGpuA(e.target.value)}>
                    <option value="">{isEn ? "-- Select GPU --" : "-- Vyber grafiku --"}</option>
                    {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#3b82f6', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>🔵 {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}</label>
                  <select className="gpu-dropdown" value={gpuB} onChange={e => setGpuB(e.target.value)}>
                    <option value="">{isEn ? "-- Select GPU --" : "-- Vyber grafiku --"}</option>
                    {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
            </div>

            <button 
              className="start-btn" 
              onClick={handleStartDuel} 
              disabled={!gpuA || !gpuB || gpuA === gpuB}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Zap fill="currentColor" size={20} /> {isEn ? "Start Hardware Battle" : "Spustit souboj železa"}
              </div>
            </button>
            
            {gpuA === gpuB && gpuA !== '' && (
              <p style={{ color: '#ff0055', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginTop: '15px' }}>
                {isEn ? "You cannot compare the same card!" : "Nemůžete porovnávat stejnou kartu!"}
              </p>
            )}
        </section>

        {/* --- EXISTUJÍCÍ DUELY --- */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
              {isEn ? "POPULAR" : "POPULÁRNÍ"} <span style={{ color: '#ff0055' }}>{isEn ? "BATTLES" : "SOUBOJE"}</span>
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
          </div>

          {loading ? (
            <div style={{ color: '#4b5563', fontWeight: 'bold', textAlign: 'center', padding: '50px' }}>GURU SYSTEM SCANNING...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {existingDuels.length > 0 ? existingDuels.map((duel) => (
                <Link 
                  href={isEn ? `/en/gpuvs/${duel.slug_en || duel.slug}` : `/gpuvs/${duel.slug}`} 
                  key={duel.id} 
                  className="duel-list-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,0,85,0.1)', padding: '8px', borderRadius: '10px', color: '#ff0055' }}>
                      <Swords size={20} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                      {isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}
                    </span>
                  </div>
                  <ChevronRight size={20} color="#4b5563" />
                </Link>
              )) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#4b5563' }}>
                   {isEn ? "No duels found in database." : "V databázi zatím nejsou žádné souboje."}
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
