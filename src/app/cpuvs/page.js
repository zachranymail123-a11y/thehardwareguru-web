"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, RefreshCw, ChevronRight, ArrowLeftRight, ShieldCheck, Flame, AlertTriangle
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - MASTER HUB V1.2 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Kompletní monetizace CPU generátoru skrze A-ADS.
 */

export default function CpuVsHub() {
  const [isEn, setIsEn] = useState(false);
  const [cpus, setCpus] = useState([]);
  const [existingDuels, setExistingDuels] = useState([]);
  const [cpuA, setCpuA] = useState('');
  const [cpuB, setCpuB] = useState('');
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

        const [cRes, dRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/cpus?select=id,name&order=name.asc`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=id,title_cs,title_en,slug,slug_en&order=created_at.desc&limit=10`, { headers })
        ]);

        if (!cRes.ok || !dRes.ok) throw new Error("Network failed");
        setCpus(await cRes.json() || []);
        setExistingDuels(await dRes.json() || []);
      } catch (err) {
        setError(isEn ? "Database connection failed." : "Synchronizace selhala.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isEn]);

  const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").trim();

  const handleStartDuel = () => {
    if (!cpuA || !cpuB || cpuA === cpuB) return;
    const procA = cpus.find(c => String(c.id) === cpuA);
    const procB = cpus.find(c => String(c.id) === cpuB);
    if (!procA || !procB) return;
    const rawSlug = `${slugify(procA.name)}-vs-${slugify(procB.name)}`;
    window.location.href = isEn ? `/en/cpuvs/en-${rawSlug}` : `/cpuvs/${rawSlug}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', paddingTop: '140px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .guru-hub-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .guru-main-title { font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 950; font-style: italic; color: #fff; text-transform: uppercase; line-height: 1; margin: 0; }
        .guru-highlight-title { color: #66fcf1; display: block; }
        .guru-desc-text { color: #d1d5db; font-size: 1.15rem; line-height: 1.6; max-width: 600px; margin-top: 15px; }

        .hub-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; margin-top: 40px; }
        .generator-panel { background: rgba(15, 17, 21, 0.95); backdrop-filter: blur(15px); border-radius: 30px; padding: 40px; border: 1px solid rgba(102, 252, 241, 0.2); position: relative; }
        .generator-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #66fcf1, #ff0055); border-radius: 30px 30px 0 0; }
        
        .guru-dropdown { width: 100%; padding: 18px 20px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 16px; font-size: 16px; font-weight: bold; outline: none; margin-bottom: 20px; }
        .guru-battle-btn { width: 100%; padding: 20px; background: linear-gradient(135deg, #ff0055 0%, #990033 100%); color: #fff; border: 1px solid rgba(255,0,85,0.5); border-radius: 16px; font-weight: 950; font-size: 18px; text-transform: uppercase; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 12px; }

        .compact-duel-item { background: rgba(15, 17, 21, 0.7); border: 1px solid rgba(255,255,255,0.05); padding: 14px 18px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; transition: 0.3s; margin-bottom: 10px; }
        .compact-duel-item:hover { border-color: #66fcf1; transform: translateX(5px); }

        /* Reklamní sloty */
        .hub-ad-slot { margin: 30px 0; padding: 15px; background: rgba(102, 252, 241, 0.03); border: 1px solid rgba(102, 252, 241, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }

        @media (max-width: 1024px) { 
          .hub-grid { grid-template-columns: 1fr; } 
          .ad-desktop { display: none; } .ad-mobile { display: block; }
        }
      `}} />

      <div className="guru-hub-container">
        <header style={{ marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <ShieldCheck size={14} /> GURU VS ENGINE
          </div>
          <h1 className="guru-main-title">
            {isEn ? "COMPARE" : "POROVNEJTE"} <span className="guru-highlight-title">{isEn ? "PROCESSORS" : "PROCESORY"}</span>
          </h1>
          <p className="guru-desc-text">
            {isEn ? "Technical analysis and raw CPU benchmarks." : "Technické analýzy a hrubý výkon procesorů."}
          </p>
        </header>

        {/* 🔥 TOP AD SLOT: POD HLAVIČKOU */}
        <div className="hub-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <div className="hub-grid">
            <section className="generator-panel">
              {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}
              <select className="guru-dropdown" value={cpuA} onChange={e => setCpuA(e.target.value)}>
                <option value="">{isEn ? "-- Select CPU --" : "-- Vyber CPU --"}</option>
                {cpus.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button onClick={() => {const t=cpuA; setCpuA(cpuB); setCpuB(t);}} style={{ background: 'none', border: '1px solid #333', color: '#66fcf1', padding: '10px', borderRadius: '50%' }}><ArrowLeftRight size={20}/></button>
              </div>
              <select className="guru-dropdown" value={cpuB} onChange={e => setCpuB(e.target.value)}>
                <option value="">{isEn ? "-- Select CPU --" : "-- Vyber CPU --"}</option>
                {cpus.map(c => <option key={c.id} value={String(c.id)} disabled={String(c.id) === cpuA}>{c.name}</option>)}
              </select>
              <button className="guru-battle-btn" onClick={handleStartDuel} disabled={!cpuA || !cpuB || loading}>
                <Zap fill="currentColor" size={24} /> {isEn ? "START BATTLE" : "SPUSTIT SOUBOJ"}
              </button>
            </section>

            <section className="history-panel">
              <h2 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '15px' }}><Flame size={20} color="#f97316" style={{display:'inline', marginRight:'10px'}}/> {isEn ? "RECENT" : "POSLEDNÍ"}</h2>
              {existingDuels.map((duel) => (
                <a href={`/${isEn ? 'en/' : ''}cpuvs/${isEn ? (duel.slug_en || `en-${duel.slug}`) : duel.slug}`} key={duel.id} className="compact-duel-item">
                  <span style={{ fontSize: '13px', fontWeight: '900' }}>{isEn ? (duel.title_en || duel.title_cs) : duel.title_cs}</span>
                  <ChevronRight size={18} color="#66fcf1" />
                </a>
              ))}

              {/* 🔥 SIDEBAR AD SLOT: POD HISTORIÍ */}
              <div className="hub-ad-slot" style={{ marginTop: '20px' }}>
                  <span className="ad-label">Sponsored Hardware</span>
                  <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                  <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
              </div>
            </section>
        </div>
      </div>
    </div>
  );
}
