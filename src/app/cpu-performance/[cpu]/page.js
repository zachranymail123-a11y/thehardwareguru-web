'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script'; 
import { notFound, usePathname } from 'next/navigation';
import { 
 ChevronLeft, Activity, Swords, CheckCircle2, Database, ArrowRight, Gamepad2, AlertTriangle, ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU PERFORMANCE ENGINE V2.9 (V10 HARD-LOCK UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock a zachování nástrojů.
 * OPRAVA: Odstraněno use(params) způsobující client-side error.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuPerformancePage({ params }) {
    // 🔥 FIX: Čteme přímo z params, odstraněno use(params)
    const rawCpuSlug = params?.cpu || '';
    const isEn = rawCpuSlug.startsWith('en-');
    const cpuSlug = rawCpuSlug.replace(/^en-/, '');
    const pathname = usePathname() || '';

    const [cpu, setCpu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCpu = async () => {
            const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
            try {
                const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
                const res1 = await fetch(url1, { headers });
                const data1 = await res1.json();
                if (data1?.[0]) {
                    setCpu(data1[0]);
                } else {
                    const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&order=slug.asc`;
                    const res2 = await fetch(url2, { headers });
                    const data2 = await res2.json();
                    setCpu(data2?.[0] || null);
                }
            } catch(e) {}
            setLoading(false);
        };
        fetchCpu();
    }, [cpuSlug]);

    if (loading) return null;
    if (!cpu) return notFound();

    const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
    const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';
    const cpuBrandName = normalizeName(cpu.name);

    // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
    const handleHeurekaAction = (e, name, subId) => {
        e.preventDefault();
        const q = encodeURIComponent(name + ' cena');
        
        // Přesný formát URL podle manuálu (přidán # před UTM parametry)
        const targetUrl = `https://www.heureka.cz/?h%5Bfraze%5D=${q}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: 'cpu_performance', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        // 150ms delay pro garantovaný zápis trackingu a cookies
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    const amazonLink = `https://www.amazon.de/s?k=${encodeURIComponent(cpu.name)}&tag=thehardware07-21`;

    const ctaVariants = isEn 
      ? [`🔥 Lowest price of ${cpuBrandName}`, `🔥 Buy ${cpuBrandName} cheapest`, `🔥 ${cpuBrandName} price today`]
      : [`🔥 Nejlevnější ${cpuBrandName}`, `🔥 Koupit ${cpuBrandName} nejvýhodněji`, `🔥 Cena ${cpuBrandName} právě teď`];
    const variantIndex = cpuSlug.length % ctaVariants.length;
    const selectedCta = ctaVariants[variantIndex];

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
          
          {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

          {!isEn && (
            <div className="anchor-trap-mobile" style={{ position: 'fixed', bottom: '110px', right: '15px', zIndex: 9999 }}>
                <button 
                  onClick={(e) => handleHeurekaAction(e, cpu.name, 'v10-perf-anchor')}
                  className="heureka-hn-link pulse-button" 
                  data-trixam-positionid="276026" 
                  style={{ background: '#0078d4', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <ShoppingCart size={16} /> CENA
                </button>
            </div>
          )}

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
              <div className="analysis-badge"><Activity size={16} /> GURU PERFORMANCE ANALYSIS</div>
              <h1 className="main-title" style={{ fontSize: 'clamp(1.8rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
                <span style={{ color: '#f59e0b' }}>{cpuBrandName}</span> <br/>
                {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
              </h1>
            </header>

            <section style={{ marginBottom: '40px' }}>
                <div className="benchmark-result-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: '8px solid #f59e0b', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                    <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{isEn ? 'Cinebench R23 Multi-Core Score' : 'Cinebench R23 Multi-Core Skóre'}</div>
                    <div style={{ fontSize: 'clamp(50px, 12vw, 80px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>{cinebenchScore} <span style={{ fontSize: '24px', color: '#f59e0b' }}>PTS</span></div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(245, 158, 11, 0.3)', marginTop: '10px' }}><CheckCircle2 size={18} /> {isEn ? 'Synthetic Benchmark' : 'Syntetický Benchmark'}</div>

                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                      <button 
                        onClick={isEn ? () => window.open(amazonLink, '_blank') : (e) => handleHeurekaAction(e, cpu.name, 'v10-perf-top')}
                        className={`guru-buy-winner-btn hover-scale ${!isEn ? 'heureka-hn-link heureka-btn' : 'amazon-btn'}`}
                        {...(!isEn && { "data-trixam-positionid": "276026" })}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <ShoppingCart size={20} /> {selectedCta}
                      </button>
                      
                      <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af' }}>
                        {isEn ? 'Compare current market prices instantly' : 'Porovnej aktuální ceny během 1 kliknutí'}
                      </div>

                      {!isEn && (
                        <>
                          <div style={{ marginTop: '15px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>✔ Porovnání z 50+ českých obchodů</div>
                          <div style={{ marginTop: '6px', fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>✔ Ověřené obchody (Alza, CZC, Datart)</div>
                          <div style={{ marginTop: '6px', fontSize: '11px', color: '#f59e0b', fontWeight: '900', textTransform: 'uppercase' }}>⚡ Cena se může změnit během hodin</div>
                        </>
                      )}

                      <div style={{ marginTop: '15px' }}>
                        <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} style={{ fontSize: '12px', color: '#60a5fa', textDecoration: 'underline', fontWeight: 'bold' }}>
                          {isEn ? 'View CPU Details →' : 'Zobrazit detail CPU →'}
                        </a>
                      </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '60px' }}>
                <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px' }}>
                        <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> {isEn ? 'BOTTLENECK' : 'KONTROLA'}</div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK KALKULAČKA'}</h3>
                        <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link hover-scale">{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
                    </div>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px' }}>
                        <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Gamepad2 size={16} /> {isEn ? 'FPS TEST' : 'HERNÍ VÝKON'}</div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan hover-scale">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Database size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
              <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div className="res-card"><div className="res-label">{isEn ? 'Cores / Threads' : 'Jádra / Vlákna'}</div><div className="res-val">{cpu.cores ?? '-'} / {cpu.threads ?? '-'}</div></div>
                  <div className="res-card"><div className="res-label">Base Clock</div><div className="res-val" style={{ color: '#f59e0b' }}>{cpu.base_clock_mhz ?? '-'} MHz</div></div>
                  <div className="res-card"><div className="res-label">Boost Clock</div><div className="res-val" style={{ color: '#f59e0b' }}>{cpu.boost_clock_mhz ?? '-'} MHz</div></div>
                  <div className="res-card"><div className="res-label">Architecture</div><div className="res-val">{cpu.architecture ?? '-'}</div></div>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                 <button 
                    onClick={isEn ? () => window.open(amazonLink, '_blank') : (e) => handleHeurekaAction(e, cpu.name, 'v10-perf-bottom')}
                    className={`guru-buy-winner-btn hover-scale ${!isEn ? 'heureka-hn-link heureka-btn' : 'amazon-btn'}`}
                    {...(!isEn && { "data-trixam-positionid": "276027" })}
                    style={{ border: 'none', cursor: 'pointer' }}
                 >
                    💰 {isEn ? 'Show current prices' : 'Zobrazit aktuální ceny'}
                 </button>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}><HeurekaButtons isEn={isEn} /></div>

            <section style={{ textAlign: 'center', marginTop: '60px' }}>
                <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-battle-btn hover-scale">
                    <Swords size={20} /> {isEn ? 'CPU VS ENGINE' : 'CPU VS ENGINE'} <ArrowRight size={18} />
                </a>
            </section>
          </main>

          <div className="sticky-bottom-anchor">
              <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
              <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
            .pulse-button { animation: pulse-cta 2s infinite; }
            .analysis-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); margin-bottom: 20px; }
            .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
            .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
            .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
            .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
            .res-val { font-size: 24px; font-weight: 950; color: #fff; }
            .guru-buy-winner-btn { display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); }
            .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; }
            .guru-battle-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 40px; background: #f59e0b; color: #fff; border-radius: 16px; font-weight: 950; font-size: 15px; text-decoration: none; text-transform: uppercase; }
            .tool-btn-link, .tool-btn-link-cyan { display: block; text-align: center; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
            .tool-btn-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
            .tool-btn-link-cyan { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid rgba(102, 252, 241, 0.3); }
            .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); }
            .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
            .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
            .ad-mobile-wrapper { display: none; width: 100%; }
            @media (max-width: 768px) {
                .guru-performance-wrapper { padding-top: 80px !important; }
                .ad-desktop-wrapper { display: none !important; }
                .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                .main-title { font-size: 1.6rem !important; }
                .benchmark-result-box { padding: 30px 20px !important; }
                .specs-grid { grid-template-columns: 1fr !important; gap: 15px; }
                .guru-buy-winner-btn { width: 100%; padding: 14px; font-size: 14px; justify-content: center; }
                main { padding: 0 15px !important; }
            }
          `}} />
        </div>
    );
}
