'use client';

import React, { useEffect, useState, use } from 'react';
import Script from 'next/script'; 
import { notFound, usePathname } from 'next/navigation';
import { 
 ChevronLeft, Activity, Swords, CheckCircle2, Database, ArrowRight, Gamepad2, AlertTriangle, ShoppingCart, Trophy, Zap, LayoutList, Clock
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import GuruCpuCompareText from '../../../components/GuruCpuCompareText';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU COMPARE ENGINE - V4.5 (V10 HARD-LOCK UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock, oprava build chyb v stylech a zachování nástrojů.
 */

const AMAZON_TAG = "thehardware07-20";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuComparePage({ params }) {
    const p = use(params);
    const rawSlug = p?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const pathname = usePathname() || '';

    const [compareData, setCompareData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
            const parts = rawSlug.replace(/^en-/, '').split('-vs-');
            if (parts.length !== 2) { setLoading(false); return; }

            const fetchCpu = async (slug) => {
                const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${slug}&limit=1`, { headers: authHeaders });
                if (!res.ok) return null;
                const data = await res.json();
                return data?.[0] || null;
            };

            const [cpuA, cpuB] = await Promise.all([fetchCpu(parts[0]), fetchCpu(parts[1])]);
            if (cpuA && cpuB) {
                setCompareData({ cpuA, cpuB });
            }
            setLoading(false);
        };
        fetchData();
    }, [rawSlug]);

    if (loading) return null;
    if (!compareData?.cpuA || !compareData?.cpuB) return notFound();

    const { cpuA, cpuB } = compareData;
    const perfDiff = Math.round((cpuB.performance_index / cpuA.performance_index - 1) * 100);
    const cpuBBrand = normalizeName(cpuB.name).trim();

    // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
    const handleHeurekaAction = (e, name, subId) => {
        e.preventDefault();
        const q = encodeURIComponent(name + ' cena');
        // Prioritní haff ID na začátku URL pro garantované připsání
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: 'cpuvs_compare', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        // 150ms delay pro garantovaný zápis trackingu a cookies
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cpuB.name)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&camp=1789&creative=9325&ascsubtag=cpuvs-compare`;
    const ctaText = isEn 
        ? (perfDiff > 20 ? `🔥 Upgrade to ${cpuBBrand} (+${perfDiff}%)` : `🔥 Best price for ${cpuBBrand}`)
        : (perfDiff > 20 ? `🔥 Upgrade na ${cpuBBrand} (+${perfDiff}%)` : `🔥 Výhodná koupě ${cpuBBrand}`);

    return (
        <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '140px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
          
          {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

          <div className="mobile-anchor-trap" style={{ position: 'fixed', bottom: '160px', right: '15px', zIndex: 9999 }}>
            <button 
              onClick={isEn ? () => window.open(amazonLink, '_blank') : (e) => handleHeurekaAction(e, cpuB.name, 'v10-vs-anchor')}
              className={`pulse-button ${!isEn ? 'heureka-hn-link' : ''}`}
              style={{ background: '#0078d4', color: '#fff', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <ShoppingCart size={18} /> {isEn ? 'PRICE' : 'CENA'} {cpuBBrand}
            </button>
          </div>

          <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
            <div style={{ marginBottom: '30px' }}>
              <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#f59e0b', padding: '10px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(245, 158, 11, 0.3)', transition: '0.3s' }}>
                <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
              </a>
            </div>

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>

            <header style={{ textAlign: 'center', marginBottom: '50px' }}>
              <div className="upgrade-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)', marginBottom: '20px' }}>
                <Swords size={14} /> {isEn ? 'CPU BATTLE 2026' : 'SOUBOJ PROCESORŮ 2026'}
              </div>
              <h1 className="main-h1" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                {normalizeName(cpuA.name)} <span style={{color: '#f59e0b'}}>VS</span> {normalizeName(cpuB.name)}
              </h1>
            </header>

            <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
                <div className="gpu-card-box old-cpu" style={{ borderTop: '5px solid #4b5563', opacity: 0.8, background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}><h2 className="gpu-name-text" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{normalizeName(cpuA.name)}</h2></div>
                <div className="vs-badge" style={{ background: '#f59e0b', color: '#000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>VS</div>
                <div className="gpu-card-box new-cpu" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)', background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center' }}><h2 className="gpu-name-text" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{normalizeName(cpuB.name)}</h2></div>
            </div>

            <div className="affiliate-cta-grid" style={{ marginBottom: '40px', background: 'rgba(0,0,0,0.4)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ marginBottom: '10px', fontWeight: '950', color: '#10b981', textTransform: 'uppercase', fontSize: '18px' }}>
                      🏆 {isEn ? 'Winner' : 'Vítěz'}: {cpuBBrand} (+{perfDiff}% {isEn ? 'Perf' : 'výkon'})
                    </div>
                    
                    <div className="affiliate-btn-wrap" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={isEn ? () => window.open(amazonLink, '_blank') : (e) => handleHeurekaAction(e, cpuB.name, 'v10-vs-main')}
                        className={`guru-buy-winner-btn pulse-button ${isEn ? 'amazon-btn' : 'heureka-hn-link heureka-btn'}`}
                        style={{ padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: '0.3s', cursor: 'pointer', border: 'none' }}
                      >
                        <ShoppingCart size={20} /> {ctaText}
                      </button>
                    </div>
                    
                    <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.6, color: '#fff' }}>
                      {isEn ? "As an Amazon Associate I earn from qualifying purchases." : "Jako Amazon partner vydělávám z kvalifikovaných nákupů."}
                    </div>
                    
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>
                      {isEn ? '✔ Official prices updated hourly' : '✔ Alza, CZC, Datart a 50+ dalších | ⚡ Ceny se mění každých pár hodin'}
                    </div>
                </div>
            </div>

            <section style={{ marginBottom: '40px' }}>
                <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <div className="tool-header" style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}><AlertTriangle size={16} /> BOTTLENECK</div>
                        <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ textDecoration: 'none' }}><h3 style={{ color: '#fff', textTransform: 'uppercase', fontSize: '1.2rem' }}>{isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</h3></a>
                    </div>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <div className="tool-header" style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}><Gamepad2 size={16} /> FPS TEST</div>
                        <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ textDecoration: 'none' }}><h3 style={{ color: '#fff', textTransform: 'uppercase', fontSize: '1.2rem' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3></a>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <div className="content-box-style analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Battle Analysis' : 'Analýza souboje'}</h2>
                    <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={perfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
                    
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}>
                      <a href={isEn ? `/en/cpu/${cpuA.slug}` : `/cpu/${cpuA.slug}`} style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline' }}>Detail {normalizeName(cpuA.name)} →</a>
                      <a href={isEn ? `/en/cpu/${cpuB.slug}` : `/cpu/${cpuB.slug}`} style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline' }}>Detail {normalizeName(cpuB.name)} →</a>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #f59e0b', paddingLeft: '15px' }}><LayoutList size={24} /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
              <div className="table-wrapper" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', marginTop: '20px' }}>
                  {[
                    { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}` },
                    { label: isEn ? 'BOOST CLOCK' : 'BOOST TAKT', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz` },
                    { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W` }
                  ].map((row, i) => (
                    <div key={i} className="spec-row" style={{ display: 'flex', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <div className="spec-val" style={{ flex: 1, textAlign: 'center', fontWeight: '950' }}>{row.valA}</div>
                      <div className="spec-label-text" style={{ width: '180px', textAlign: 'center', fontSize: '10px', color: '#6b7280', fontWeight: '950', textTransform: 'uppercase' }}>{row.label}</div>
                      <div className="spec-val highlight" style={{ flex: 1, textAlign: 'center', fontWeight: '950', color: '#f59e0b' }}>{row.valB}</div>
                    </div>
                  ))}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button 
                  onClick={isEn ? () => window.open(amazonLink, '_blank') : (e) => handleHeurekaAction(e, cpuB.name, 'v10-vs-bottom')}
                  className={`guru-buy-winner-btn hover-scale ${isEn ? 'amazon-btn' : 'heureka-hn-link heureka-btn'}`}
                  style={{ padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: '0.3s', cursor: 'pointer', border: 'none' }}
                >
                  💰 {isEn ? `Check best price for ${cpuBBrand}` : `Zobrazit nejlepší ceny ${cpuBBrand}`}
                </button>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={isEn} /></div>
          </main>

          <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            .pulse-button { animation: pulse-cta 2s infinite; }
            .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            @media (max-width: 768px) {
                .guru-grid-ring { grid-template-columns: 1fr !important; }
                .vs-badge { margin: 10px auto; transform: rotate(90deg) !important; }
                .spec-row { flex-direction: column !important; gap: 10px !important; padding: 15px !important; }
                .spec-label-text { width: 100% !important; order: -1 !important; }
                .guru-tools-grid { grid-template-columns: 1fr !important; }
                .guru-buy-winner-btn { width: 100% !important; justify-content: center !important; font-size: 14px !important; }
            }
          `}} />
        </div>
    );
}
