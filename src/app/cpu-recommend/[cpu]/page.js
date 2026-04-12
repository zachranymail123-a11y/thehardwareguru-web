'use client';

import React, { useEffect, useState, use } from 'react';
import { notFound, usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Cpu, 
  ArrowRight, 
  ThumbsUp, 
  AlertTriangle,
  ShoppingCart,
  Gamepad2,
  Activity
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU RECOMMEND ENGINE V2.4 (V10 HARD-LOCK & TOOLS UPDATE)
 * 🚀 CÍL: Implementace V10 Hard-Lock linků a doplnění tlačítek na kalkulačky.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuRecommendPage({ params }) {
  const p = use(params);
  const rawCpuSlug = p?.cpu || '';
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const pathname = usePathname() || '';

  const [cpu, setCpu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCpu = async () => {
      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { headers });
        const data = await res.json();
        if (data?.[0]) {
          setCpu(data[0]);
        } else {
          // Fallback vyhledávání
          const clean = cpuSlug.replace(/-/g, " ").trim();
          const tokens = clean.split(/\s+/).filter(t => t.length > 0);
          if (tokens.length > 0) {
            const cond = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
            const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${cond})&order=name.asc&limit=1`, { headers });
            const data2 = await res2.json();
            setCpu(data2?.[0] || null);
          }
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchCpu();
  }, [cpuSlug]);

  if (loading) return null;
  if (!cpu) notFound();

  // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
  const handleHeurekaAction = (e, name) => {
    e.preventDefault();
    const cleanName = name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon |Ryzen |Core /gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
    const subId = `v10-cpu-recommend`;
    const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
    
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify({ platform: 'heureka', category: 'cpu_recommend', sub_id: subId, page: pathname })], { type: 'text/plain' }));
    }
    setTimeout(() => { window.location.href = targetUrl; }, 150);
  };

  const isHighEnd = (cpu.performance_index || 0) > 80;
  const isMidRange = (cpu.performance_index || 0) > 40 && (cpu.performance_index || 0) <= 80;

  const getVerdict = () => {
      if (isHighEnd) return { icon: <ThumbsUp size={40} />, color: '#10b981', en: 'EXCELLENT BUY', cz: 'VÝBORNÁ KOUPĚ' };
      if (isMidRange) return { icon: <CheckCircle2 size={40} />, color: '#f59e0b', en: 'GOOD VALUE', cz: 'DOBRÝ POMĚR CENA/VÝKON' };
      return { icon: <AlertTriangle size={40} />, color: '#ef4444', en: 'CONSIDER ALTERNATIVES', cz: 'ZVAŽTE ALTERNATIVY' };
  };

  const verdict = getVerdict();

  return (
    <div className="recommend-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="recommendation-badge">
            <Cpu size={16} /> GURU RECOMMENDATION
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}?</span>
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div className="verdict-main-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {verdict.icon}
                </div>
                <div className="verdict-title" style={{ fontSize: '40px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? verdict.en : verdict.cz}
                </div>
                <div className="verdict-text" style={{ color: '#d1d5db', fontSize: '1.1rem', maxWidth: '600px', margin: '30px auto 0', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data, specifications, and gaming benchmarks, the <strong>{cpu.name}</strong> is considered to be a <strong>{verdict.en.toLowerCase()}</strong> for your next PC build or upgrade.</p>
                    ) : (
                        <p>Na základě aktuálních dat z trhu, specifikací a herních benchmarků hodnotíme procesor <strong>{cpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong> pro vaši novou PC sestavu nebo upgrade.</p>
                    )}
                </div>

                {/* 🔥 V10 HARD-LOCK CONVERSION TRIGGER 🔥 */}
                {!isEn && (
                  <div style={{ marginTop: '40px' }}>
                    <button 
                      onClick={(e) => handleHeurekaAction(e, cpu.name)}
                      style={{ background: '#3b82f6', color: '#fff', padding: '18px 40px', borderRadius: '14px', border: 'none', fontWeight: 950, cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                      <ShoppingCart size={20} /> ZJISTIT NEJLEPŠÍ CENU
                    </button>
                  </div>
                )}
            </div>
        </section>

        {/* 🔥 GURU TOOLS - POVINNÁ TLAČÍTKA NA KALKULAČKY 🔥 */}
        <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Activity size={16} /> {isEn ? 'BOTTLENECK' : 'KONTROLA'}</div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</h3>
                <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ display: 'block', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
            </div>
            <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Gamepad2 size={16} /> {isEn ? 'FPS TEST' : 'HERNÍ VÝKON'}</div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ display: 'block', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)' }}>{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

        <section style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Compare this CPU with others' : 'Porovnejte tento procesor s ostatními'}
            </div>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-battle-btn">
                <ArrowRight size={20} /> {isEn ? 'CPU VS ENGINE' : 'CPU VS ENGINE'}
            </a>
        </section>

      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center', boxShadow: '0 -10px 30px rgba(0,0,0,0.8)' }}>
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .recommendation-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-battle-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 40px; background: #f59e0b; color: #fff; border-radius: 16px; font-weight: 950; font-size: 15px; text-decoration: none; text-transform: uppercase; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        @media (max-width: 768px) {
            .recommend-page-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .verdict-main-box { padding: 30px 15px !important; border-radius: 20px !important; }
            .main-title { font-size: 1.6rem !important; }
            .verdict-title { font-size: 1.5rem !important; }
            .verdict-text { font-size: 0.95rem !important; margin-top: 20px !important; }
            .guru-battle-btn { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
}
