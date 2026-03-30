"use client";

import React, { useState, useEffect } from 'react';
import { 
 Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle, Gamepad2
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU GPU DUELS ENGINE - MASTER HUB V67.8 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchor, zachování layoutu + Heureka konverze.
 */

export default function GpuVsHub() {
  const [isEn, setIsEn] = useState(false);
  const [gpus, setGpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [gpuA, setGpuA] = useState('');
  const [gpuB, setGpuB] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEn(window.location.pathname.startsWith('/en'));
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) throw new Error("Missing credentials");

        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        const [gRes, dRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/gpus?select=id,name&order=name.asc`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=id,title_cs,title_en,slug,slug_en&order=created_at.desc&limit=10`, { headers })
        ]);

        if (!gRes.ok || !dRes.ok) throw new Error("Sync failed");
        setGpus(await gRes.json() || []);
        setExistingDuels(await dRes.json() || []);
      } catch (err) {
        setError(isEn ? "Database connection failed." : "Synchronizace selhala.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  const slugify = (text) => text
    .toLowerCase()
    .replace(/nvidia|amd|geforce|radeon|intel|graphics|gpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();

  const handleStartDuel = () => {
    if (!gpuA || !gpuB || gpuA === gpuB) return;
    const cardA = gpus.find(g => String(g.id) === gpuA);
    const cardB = gpus.find(g => String(g.id) === gpuB);
    if (!cardA || !cardB) return;
    
    const rawSlug = `${slugify(cardA.name)}-vs-${slugify(cardB.name)}`;
    window.location.href = isEn ? `/en/gpuvs/en-${rawSlug}` : `/gpuvs/${rawSlug}`;
  };

  return (
    <div className="guru-hub-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', paddingTop: '140px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .guru-hub-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .guru-main-title { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 950; font-style: italic; color: #fff; text-transform: uppercase; line-height: 1; margin: 0; }
        .guru-highlight-title { color: #66fcf1; display: block; }
        .guru-desc-text { color: #d1d5db; font-size: 1.15rem; line-height: 1.6; max-width: 600px; margin-top: 15px; }

        .hub-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; margin-top: 40px; }
        .generator-panel { background: rgba(15, 17, 21, 0.95); backdrop-filter: blur(15px); border-radius: 30px; padding: 40px; border: 1px solid rgba(102, 252, 241, 0.2); position: relative; }
        .generator-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #66fcf1, #ff0055); border-radius: 30px 30px 0 0; }
        
        .guru-dropdown { width: 100%; padding: 18px 20px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 16px; font-size: 16px; font-weight: bold; outline: none; margin-bottom: 20px; }
        .guru-battle-btn { width: 100%; padding: 20px; background: linear-gradient(135deg, #ff0055 0%, #990033 100%); color: #fff; border: 1px solid rgba(255,0,85,0.5); border-radius: 16px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 12px; }
        .guru-battle-btn:disabled { opacity: 0.4; }

        .history-panel { display: flex; flex-direction: column; gap: 12px; }
        .compact-duel-item { background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); padding: 14px 18px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; transition: 0.3s; color: #fff; }
        .compact-duel-item:hover { transform: translateX(5px); border-color: #66fcf1; color: #66fcf1; }

        /* 🚀 SEO HUB CSS */
        .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .hub-links-list { list-style: none; padding: 0; }
        .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
        .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 1024px) { 
          .hub-grid { grid-template-columns: 1fr; gap: 30px; } 
        }

        @media (max-width: 768px) {
            .guru-hub-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .guru-hub-container { padding: 0 15px !important; }
            .generator-panel { padding: 25px 20px !important; border-radius: 20px !important; }
            .guru-main-title { font-size: 1.8rem !important; }
            .guru-desc-text { font-size: 1rem; }
            .history-panel h2 { font-size: 16px !important; }
            .seo-hub-grid { grid-template-columns: 1fr; }
            .hub-column { padding: 25px; }
        }
      `}} />

      <div className="guru-hub-container">
        {/* 🔥 GURU MONEY FIX: TOP BANNER ABOVE FOLD (Přesunut úplně nahoru před hlavičku) */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <ShieldCheck size={14} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">
            {isEn ? "COMPARE" : "POROVNEJTE"} <span className="guru-highlight-title">{isEn ? "GRAPHICS CARDS" : "GRAFICKÉ KARTY"}</span>
          </h1>
          <p className="guru-desc-text">
            {isEn ? "Technical analysis and performance index driven by data." : "Technická specifikace a porovnání výkonu bez omáček."}
          </p>
        </header>

        <div className="hub-grid">
            {/* LEVÝ SLOUPEC: Generátor + Vyplnění díry SEO Hubem */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section className="generator-panel">
                  {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
                  <select className="guru-dropdown" value={gpuA} onChange={e => setGpuA(e.target.value)}>
                    <option value="">{isEn ? "-- Select GPU --" : "-- Vyber grafiku --"}</option>
                    {gpus.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <button onClick={() => {const t=gpuA; setGpuA(gpuB); setGpuB(t);}} style={{ background: 'none', border: '1px solid #333', color: '#66fcf1', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><ArrowLeftRight size={20}/></button>
                  </div>
                  <select className="guru-dropdown" value={gpuB} onChange={e => setGpuB(e.target.value)}>
                    <option value="">{isEn ? "-- Select GPU --" : "-- Vyber grafiku --"}</option>
                    {gpus.map(g => <option key={g.id} value={String(g.id)} disabled={String(g.id) === gpuA}>{g.name}</option>)}
                  </select>
                  <button className="guru-battle-btn" onClick={handleStartDuel} disabled={!gpuA || !gpuB || loading}>
                    <Zap fill="currentColor" size={24} /> {isEn ? "START DUEL" : "SPUSTIT SOUBOJ"}
                  </button>

                  {/* 🔥 PŘIDÁNO: Heureka tlačítka přímo pod generátor 🔥 */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                      <HeurekaButtons isEn={isEn} />
                  </div>
                </section>

                {/* 🚀 MASSIVE SEO HUB PŘESUNUTÝ PŘÍMO POD VÝBĚR (Zaplňuje díru) */}
                <section className="massive-seo-hub" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '30px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>
                        {isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}
                    </h2>
                    <div className="seo-hub-grid">
                        <div className="hub-column">
                            <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                            <ul className="hub-links-list">
                                <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                                <li><a href={isEn ? "/en/gpu-index" : "/gpu-index"}><ChevronRight size={16} /> {isEn ? 'Graphics Cards Database' : 'Katalog Grafických Karet'}</a></li>
                                <li><a href={isEn ? "/en/cpu-index" : "/cpu-index"}><ChevronRight size={16} /> {isEn ? 'Processor Database' : 'Katalog Procesorů'}</a></li>
                            </ul>
                        </div>
                        <div className="hub-column">
                            <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                            <ul className="hub-links-list">
                                <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                                <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                                <li><a href={isEn ? "/en/clanky" : "/clanky"}><ChevronRight size={16} /> {isEn ? 'News & Articles' : 'Články a Novinky'}</a></li>
                                <li><a href={isEn ? "/en/tipy" : "/tipy"}><ChevronRight size={16} /> {isEn ? 'GURU Tips' : 'GURU Tipy'}</a></li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            {/* PRAVÝ SLOUPEC: Historie + Reklama */}
            <section className="history-panel">
              <h2 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px' }}><Flame size={20} color="#f97316" style={{display:'inline', marginRight:'10px'}}/> {isEn ? "RECENT" : "POSLEDNÍ"}</h2>
              {existingDuels.map((duel) => (
                <a href={`/${isEn ? 'en/' : ''}gpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} key={duel.id} className="compact-duel-item">
                  <span style={{ fontSize: '13px', fontWeight: '900' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</span>
                  <ChevronRight size={18} color="#66fcf1" />
                </a>
              ))}

              {/* 🔥 SIDEBAR / BOTTOM AD SLOT - STRIKTNÍ SEPARACE (POUZE MOBIL) */}
              <div className="ad-mobile-wrapper" style={{ marginTop: '20px' }}>
                <SeznamAd zoneId={408651} width={300} height={250} />
              </div>
            </section>
        </div>

      </div>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>
    </div>
  );
}
