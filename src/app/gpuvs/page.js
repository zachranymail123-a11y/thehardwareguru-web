"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Swords, ChevronRight, Zap, RefreshCw, Flame, Cpu, ShieldCheck
} from 'lucide-react';

/**
 * GURU GPU DUELS INDEX - V2.5 (PRODUCTION STABLE)
 * Cesta: src/app/gpuvs/page.js
 * Oprava: Stabilní načítání z DB a funkční dropdowny.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function GpuVsIndex() {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');

  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // GURU DATA FETCH: Načítáme karty a už existující duely
        const [gData, dData] = await Promise.all([
          supabase.from('gpus').select('*').order('name', { ascending: true }),
          supabase.from('gpu_duels').select('*').order('created_at', { ascending: false }).limit(20)
        ]);

        if (gData.error) throw gData.error;
        setGpus(gData.data || []);
        setExistingDuels(dData.data || []);
      } catch (err) {
        console.error("Guru System Error:", err);
        setError(isEn ? "Database sync failed." : "Synchronizace s databází selhala.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    const cardA = gpus.find(g => g.id === gpuA);
    const cardB = gpus.find(g => g.id === gpuB);
    if (!cardA || !cardB) return;

    // Vytvoření slugu (identický pattern jako v adminu)
    const rawSlug = `${cardA.name}-vs-${cardB.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    router.push(isEn ? `/en/gpuvs/en-${rawSlug}` : `/gpuvs/${rawSlug}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-select-card { background: rgba(17, 19, 24, 0.95); border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 32px; padding: 50px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .gpu-dropdown { width: 100%; padding: 18px; background: #000; border: 1px solid #333; color: #fff; border-radius: 14px; font-size: 16px; font-weight: 900; appearance: none; cursor: pointer; outline: none; }
        .gpu-dropdown:focus { border-color: #ff0055; box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }
        .start-btn { width: 100%; padding: 22px; background: linear-gradient(135deg, #ff0055 0%, #be123c 100%); color: #fff; border: none; border-radius: 18px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4); }
        .start-btn:hover:not(:disabled) { transform: translateY(-5px); filter: brightness(1.1); }
        .duel-list-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: #fff; transition: 0.3s; margin-bottom: 12px; }
        .duel-list-item:hover { background: rgba(255,255,255,0.07); border-color: #ff0055; transform: translateX(10px); }
        @media (max-width: 768px) { .grid-select { grid-template-columns: 1fr !important; } .guru-select-card { padding: 30px 20px; } }
      `}} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '70px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#ff0055', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', padding: '8px 20px', border: '1px solid #ff0055', borderRadius: '50px' }}>
            <Swords size={18} /> GURU VS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: '1', margin: 0, fontStyle: 'italic' }}>
            {isEn ? "COMPARE ANY" : "POROVNEJTE"} <br/> <span style={{ color: '#ff0055' }}>{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          </h1>
        </div>

        <section className="guru-select-card" style={{ marginBottom: '90px' }}>
            {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}
            <div className="grid-select" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ff0055', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px' }}>🔴 {isEn ? "FIRST GPU" : "PRVNÍ GRAFIKA"}</label>
                  <select className="gpu-dropdown" value={gpuA} onChange={e => setGpuA(e.target.value)}>
                    <option value="">{loading ? "..." : (isEn ? "-- Select --" : "-- Vyber --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#3b82f6', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '10px' }}>🔵 {isEn ? "SECOND GPU" : "DRUHÁ GRAFIKA"}</label>
                  <select className="gpu-dropdown" value={gpuB} onChange={e => setGpuB(e.target.value)}>
                    <option value="">{loading ? "..." : (isEn ? "-- Select --" : "-- Vyber --")}</option>
                    {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
            </div>
            <button className="start-btn" onClick={handleStartDuel} disabled={!gpuA || !gpuB || gpuA === gpuB}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Zap fill="currentColor" size={20} /> {isEn ? "Start Hardware Battle" : "Spustit souboj železa"}
              </div>
            </button>
        </section>

        <section>
          <h2 style={{ fontSize: '22px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px' }}>
            {isEn ? "RECENT" : "POSLEDNÍ"} <span style={{ color: '#ff0055' }}>{isEn ? "BATTLES" : "SOUBOJE"}</span>
          </h2>
          {existingDuels.map((duel) => (
            <Link href={isEn ? `/en/gpuvs/${duel.slug_en || duel.slug}` : `/gpuvs/${duel.slug}`} key={duel.id} className="duel-list-item">
              <span style={{ fontSize: '18px', fontWeight: '900' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</span>
              <ChevronRight size={20} color="#4b5563" />
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
