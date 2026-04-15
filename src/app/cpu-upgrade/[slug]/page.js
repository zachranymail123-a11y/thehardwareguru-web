'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script'; 
import { notFound, usePathname } from 'next/navigation';
import { 
 ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
 Trophy, Zap, Gamepad2, LayoutList, BarChart3, TrendingUp,
 ArrowRight, ExternalLink, ArrowUpCircle, Monitor, Crosshair,
 Cpu, Info, AlertTriangle, ShoppingCart
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU UPGRADE - DETAIL V3.7 (V10 HARD-LOCK UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock a zachování navigačních nástrojů.
 * OPRAVA: Odstraněno use(params), přidán Amazon link pro EN verzi.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuUpgradePage({ params }) {
    // 🔥 FIX: Čteme přímo z params, odstraněno use(params)
    const rawSlug = params?.slug || '';
    const isEn = rawSlug.startsWith('en-');
    const cpuSlug = rawSlug.replace(/^en-/, '');
    const pathname = usePathname() || '';

    const [upgrade, setUpgrade] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpgrade = async () => {
            const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
            const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
            
            try {
                const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${rawSlug}&limit=1`, { headers });
                const data = await res.json();
                if (data && data[0]) {
                    setUpgrade(data[0]);
                } else {
                    const cleanSlug = rawSlug.replace(/^en-/, '');
                    const res2 = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, { headers });
                    const data2 = await res2.json();
                    setUpgrade(data2?.[0] || null);
                }
            } catch(e) {}
            setLoading(false);
        };
        fetchUpgrade();
    }, [rawSlug]);

    if (loading) return null;
    if (!upgrade || !upgrade.oldCpu || !upgrade.newCpu) notFound();

    const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
    const title = isEn ? (upgrade.title_en || `Upgrade from ${cpuA.name} to ${cpuB.name}`) : upgrade.title_cs;
    const finalPerfDiff = Math.round((cpuB.performance_index / cpuA.performance_index - 1) * 100);
    const cpuBBrand = normalizeName(cpuB.name).trim();

    // 🔥 V10 HARD-LOCK REDIRECT LOGIC + AMAZON S OPRAVENÝM FRAGMENTEM 🔥
    const handleHeurekaAction = (e, name, subId) => {
        e.preventDefault();
        const q = encodeURIComponent(name + ' cena');
        
        // Zohlednění EN verze pro přesměrování na Amazon, CZ verze zůstává tvrdě na Heureku dle manuálu
        const targetUrl = isEn 
            ? `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`
            : `https://www.heureka.cz/?h%5Bfraze%5D=${q}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const platform = isEn ? 'amazon' : 'heureka';
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify({ platform, category: 'cpu_upgrade', sub_id: subId, page: pathname })], { type: 'text/plain' }));
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    const amazonLink = `https://www.amazon.de/s?k=${encodeURIComponent(cpuB.name)}&tag=thehardware07-21`;

    const ctaVariants = isEn 
        ? [`🔥 Lowest price of ${cpuBBrand}`, `🔥 Buy ${cpuBBrand} cheapest`, `🔥 ${cpuBBrand} price today`]
        : [`🔥 Nejlevnější ${cpuBBrand}`, `🔥 Koupit ${cpuBBrand} nejvýhodněji`, `🔥 Cena ${cpuBBrand} právě teď`];
    const variantIndex = rawSlug.length % ctaVariants.length;
    const selectedCta = ctaVariants[variantIndex];

    return (
        <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
          
          {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

          {/* 🔥 STICKY MOBILE ANCHOR TRAP (V10) 🔥 */}
          {!isEn && (
            <div className="mobile-anchor-trap" style={{ position: 'fixed', bottom: '100px', right: '15px', zIndex: 9999 }}>
              <button 
                onClick={(e) => handleHeurekaAction(e, cpuB.name, 'v10-upgrade-anchor')}
                className="heureka-hn-link pulse-button"
                style={{ background: '#0078d4', color: '#fff', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <ShoppingCart size={18} /> CENA {cpuBBrand}
              </button>
            </div>
          )}

          <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
            <div style={{ marginBottom: '30px' }}>
              <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
            </div>

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

            <header style={{ textAlign: 'center', marginBottom: '50px' }}>
              <div className="upgrade-badge"><ArrowUpCircle size={14} /> {isEn ? 'GURU UPGRADE ANALYSIS' : 'GURU ANALÝZA UPGRADU'}</div>
              <h1 className="main-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>{title}</h1>
            </header>

            <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
                <div className="gpu-card-box old-cpu" style={{ borderTop: '5px solid #4b5563', opacity: 0.7 }}><h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2></div>
                <div className="vs-badge" style={{ background: '#f59e0b', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '32px', color: '#000' }}>➜</div>
                <div className="gpu-card-box new-cpu" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}><h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2></div>
            </div>

            <div className="affiliate-cta-grid" style={{ marginBottom: '40px', padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="affiliate-col" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '15px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                      {isEn ? `+${finalPerfDiff}% Performance boost over ${normalizeName(cpuA.name)}` : `+${finalPerfDiff}% výkonu oproti ${normalizeName(cpuA.name)}`}
                    </div>

                    <div className="affiliate-btn-wrap" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        {isEn ? (
                            <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn hover-scale" style={{ background: '#f59e0b', border: '2px solid #fbbf24', width: '100%', maxWidth: '450px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '18px 24px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', fontSize: '16px', textTransform: 'uppercase', color: '#000' }}><ShoppingCart size={16} /> 🔥 BUY CHEAPEST ON AMAZON</a>
                        ) : (
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <button 
                                  onClick={(e) => handleHeurekaAction(e, cpuB.name, 'v10-upgrade-main')}
                                  className="guru-buy-winner-btn heureka-btn hover-scale" 
                                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0078d4 100%)', color: '#fff', border: 'none', width: '100%', maxWidth: '450px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '18px 24px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', fontSize: '16px', textTransform: 'uppercase', cursor: 'pointer' }}
                                >
                                  <ShoppingCart size={16} /> {selectedCta}
                                </button>
                                
                                <div className="trust-block" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>
                                  <div>✔ Porovnání z 50+ obchodů</div>
                                  <div>✔ Ověřené (Alza, CZC, Datart)</div>
                                  <div style={{ color: '#f59e0b' }}>⚡ Ceny se mění každých pár hodin</div>
                                </div>

                                <div className="internal-links-row" style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                  <a href={`/cpu/${cpuB.slug}`} style={{ fontSize: '12px', color: '#60a5fa', textDecoration: 'underline', fontWeight: 'bold' }}>{isEn ? 'CPU Details →' : 'Detail CPU →'}</a>
                                  <a href={`/cpuvs/${cpuB.slug}-vs-${cpuA.slug}`} style={{ fontSize: '12px', color: '#60a5fa', textDecoration: 'underline', fontWeight: 'bold' }}>{isEn ? 'Side-by-Side →' : 'Porovnat →'}</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section style={{ marginBottom: '40px' }}>
                <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '24px' }}>
                        <div className="tool-meta" style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> BOTTLENECK</div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'CHECK SYSTEM' : 'KONTROLA SYSTÉMU'}</h3>
                        <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link hover-scale" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
                    </div>
                    <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '24px' }}>
                        <div className="tool-meta" style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Gamepad2 size={16} /> FPS TEST</div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan hover-scale" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)' }}>{isEn ? 'ZJISTIT FPS' : 'ZJISTIT FPS'}</a>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <div className="content-box-style analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={24} color="#f59e0b" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}</h2>
                    <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={finalPerfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
                </div>
            </section>

            <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', margin_bottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #f59e0b', paddingLeft: '15px' }}><LayoutList size={28} /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
              <div className="table-wrapper" style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  {[
                    { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}` },
                    { label: isEn ? 'BOOST CLOCK' : 'BOOST TAKT', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz` },
                    { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W` }
                  ].map((row, i) => (
                    <div key={i} className="spec-row-style" style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <div className="spec-val-side" style={{ flex: 1, textAlign: 'center', font_size: '18px', fontWeight: '950' }}>{row.valA}</div>
                      <div className="table-label" style={{ width: '180px', textAlign: 'center', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>{row.label}</div>
                      <div className="spec-val-side" style={{ flex: 1, textAlign: 'center', font_size: '18px', fontWeight: '950', color: '#f59e0b' }}>{row.valB}</div>
                    </div>
                  ))}
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={isEn} /></div>
          </main>

          <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <SeznamAd zoneId={408654} width={970} height={90} />
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
            .pulse-button { animation: pulse-cta 2s infinite; }
            .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
            .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
            .gpu-name-text { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
            .upgrade-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); margin-bottom: 20px; }
            .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            @media (max-width: 768px) {
                .guru-grid-ring { grid-template-columns: 1fr !important; }
                .vs-badge { margin: 10px auto; transform: rotate(90deg) !important; width: 50px !important; height: 50px !important; font-size: 24px !important; }
                .spec-row-style { padding: 15px 10px !important; flex-direction: column !important; gap: 10px !important; }
                .table-label { width: 100% !important; order: -1 !important; }
                .analysis-box { padding: 25px 15px !important; border-radius: 20px !important; }
                .guru-upgrade-wrapper { padding-top: 80px !important; }
            }
          `}} />
        </div>
    );
}
