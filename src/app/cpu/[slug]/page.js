'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script'; 
import { notFound, useParams, usePathname } from 'next/navigation';
import { 
 ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import { createClient } from '@supabase/supabase-js';
// 🔥 PŘIDÁNO: Naše inteligentní komponenta pro up-sell
import GuruInContentOffer from '../../../components/GuruInContentOffer';

/**
 * GURU CPU ENGINE - V15 (CRASH FIX & SMART MONETIZATION)
 * 🚀 CÍL: Fix klientského pádu (useParams), čisté V10 linky, GuruInContentOffer.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default function CpuDetailPage() {
    // 🔥 FIX: Správné vytažení parametrů v klientské komponentě (Zabrání pádu)
    const params = useParams();
    const pathname = usePathname() || '';
    
    const rawSlug = params?.slug || '';
    const isEn = typeof rawSlug === 'string' && rawSlug.startsWith('en-');
    const cpuSlug = typeof rawSlug === 'string' ? rawSlug.replace(/^en-/, '') : '';

    const [cpu, setCpu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cpuSlug) return;
        const fetchCpu = async () => {
            const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
            try {
                const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { headers: authHeaders });
                const data1 = await res1.json();
                if (data1?.[0]) {
                    setCpu(data1[0]);
                } else {
                    const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&limit=1`, { headers: authHeaders });
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

    const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
    const cpuCleanName = normalizeName(cpu.name);

    // 🔥 V10 GOLDEN FORMAT LINKŮ S OPRAVENÝM FRAGMENTEM 🔥
    const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpu.name + ' procesor')}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-cpu-detail`;
    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cpu.name)}&tag=thehardware07-20&ascsubtag=cpu-detail`;

    // Čistý tracking na pozadí, který neblokuje prohlížeč
    const handleLogClick = (category, subId) => {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: isEn ? 'amazon' : 'heureka', category, sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }
    };

    return (
        <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

            {/* 🔥 STICKY MOBILE CTA (ČISTÝ ODKAZ MÍSTO JS REDIRECTU) 🔥 */}
            {!isEn && (
                <div className="mobile-floating-cta" style={{ position: 'fixed', bottom: '100px', right: '15px', zIndex: 9999 }}>
                    <a 
                        href={heurekaLink}
                        target="_blank"
                        rel="nofollow sponsored"
                        onClick={() => handleLogClick('cpu_detail_sticky', 'v10-cpu-anchor')}
                        className="pulse-button heureka-hn-link" 
                        data-trixam-positionid="276026"
                        style={{ background: '#0078d4', color: '#fff', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', textDecoration: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    >
                        <ShoppingCart size={18} /> CENA {cpuCleanName}
                    </a>
                </div>
            )}

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#f59e0b', padding: '10px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(245, 158, 11, 0.3)', transition: '0.3s' }}>
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div className="ad-desktop-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="profile-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, border: `1px solid ${vendorColor}40`, background: `${vendorColor}15`, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', borderRadius: '50px', marginBottom: '20px' }}>
                        <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
                    </div>
                    <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
                        <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{cpuCleanName}</span>
                    </h1>
                </header>

                <div className="affiliate-cta-grid" style={{ marginBottom: '40px', padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="affiliate-col" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ marginBottom: '15px', color: '#f59e0b', fontWeight: '900', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>
                            {cpu.performance_index > 15000 ? '🔥 High-end gaming performance' : '🔥 Excellent price/performance ratio'}
                        </div>
                        
                        <div className="affiliate-btn-wrap" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            {isEn ? (
                                <a 
                                    href={amazonLink} 
                                    target="_blank" 
                                    rel="nofollow sponsored noopener noreferrer" 
                                    onClick={() => handleLogClick('cpu_detail_main', 'v10-cpu-main')}
                                    className="guru-buy-winner-btn amazon-btn hover-scale" 
                                    style={{ background: '#f59e0b', color: '#000', border: '2px solid #fbbf24', width: '100%', maxWidth: '450px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '18px 24px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', fontSize: '16px', textTransform: 'uppercase' }}
                                >
                                    <ShoppingCart size={16} /> 🔥 BUY {cpuCleanName} ON AMAZON
                                </a>
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <a 
                                        href={heurekaLink}
                                        target="_blank"
                                        rel="nofollow sponsored"
                                        onClick={() => handleLogClick('cpu_detail_main', 'v10-cpu-main')}
                                        className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale" 
                                        data-trixam-positionid="276027"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0078d4 100%)', color: '#fff', width: '100%', maxWidth: '450px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '18px 24px', borderRadius: '16px', textDecoration: 'none', fontWeight: '950', fontSize: '16px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
                                    >
                                        <ShoppingCart size={16} /> 🔥 POROVNAT NEJLEVNĚJŠÍ CENY
                                    </a>
                                    <div className="trust-stack" style={{ marginTop: '15px', font_size: '12px', color: '#9ca3af', fontWeight: 'bold', textAlign: 'center' }}>
                                        <div>✔ Alza, CZC, Datart a 50+ dalších</div>
                                        <div style={{ color: '#f59e0b', marginTop: '4px' }}>⚡ Cena se mění každých pár hodin</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🔥 GURU INTELIGENTNÍ UPSELL 🔥 */}
                <div style={{ margin: '40px 0' }}>
                    <GuruInContentOffer 
                        productName={(cpu.name.includes('9800X3D') || cpu.name.includes('9950X')) ? "NVIDIA GeForce RTX 5080" : "AMD Ryzen 7 9800X3D"} 
                        category={(cpu.name.includes('9800X3D') || cpu.name.includes('9950X')) ? "gpu" : "cpu"} 
                        reason="upgrade"
                        isEn={isEn}
                        subId={`cpu-detail-upsell-${cpuSlug}`}
                    />
                </div>

                <section style={{ marginBottom: '40px' }}>
                    <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
                            <div className="tool-meta" style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={16} /> BOTTLENECK TEST</div>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>CHECK SYSTEM</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>{isEn ? `Will your GPU handle the ${cpuCleanName}?` : `Bude tvá grafika stačit na procesor ${cpuCleanName}?`}</p>
                            <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '12px', text_align: 'center', color: '#fff', text_decoration: 'none', fontWeight: '950', display: 'block', border: '1px solid rgba(255,255,255,0.1)', transition: '0.3s', marginTop: '20px', textAlign: 'center' }}>{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                        </div>
                        <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
                            <div className="tool-meta" style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Gamepad2 size={16} /> FPS CALCULATOR</div>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>GAMING POWER</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>{isEn ? `How many FPS will ${cpuCleanName} push?` : `Kolik FPS ti dá ${cpuCleanName} ve hrách?`}</p>
                            <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '12px', text_align: 'center', color: '#fff', text_decoration: 'none', fontWeight: '950', display: 'block', border: '1px solid rgba(255,255,255,0.1)', transition: '0.3s', marginTop: '20px', textAlign: 'center' }}>{isEn ? 'TEST FPS' : 'TESTOVAT FPS'}</a>
                        </div>
                    </div>
                </section>

                {/* Tento kód je nepotřebný, protože tlačítka už nejsou potřeba nebo je řeší GuruInContentOffer a hlavní blok
                {!isEn && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                        <HeurekaButtons isEn={false} manualSearch={cpu.name} positionId="276027" />
                    </div>
                )} */}

                <section style={{ marginBottom: '60px' }}>
                    <h2 className="section-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: `4px solid ${vendorColor}`, paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
                    <div className="table-wrapper" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}>
                        <div className="spec-row-style" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}><div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase' }}>CORES / THREADS</div><div style={{ color: '#fff', fontWeight: '950', fontSize: '18px' }}>{cpu.cores} / {cpu.threads}</div></div>
                        <div className="spec-row-style" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}><div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase' }}>BASE CLOCK</div><div style={{ color: '#fff', fontWeight: '950', fontSize: '18px' }}>{cpu.base_clock_mhz} MHz</div></div>
                        <div className="spec-row-style" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}><div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase' }}>TDP</div><div style={{ color: '#fff', fontWeight: '950', fontSize: '18px' }}>{cpu.tdp_w} W</div></div>
                        <div className="spec-row-style" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px' }}><div style={{ fontSize: '11px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase' }}>ARCHITECTURE</div><div style={{ color: '#fff', fontWeight: '950', fontSize: '18px' }}>{cpu.architecture}</div></div>
                    </div>
                </section>

                <div className="money-loop-links" style={{ textAlign: 'center', marginTop: '40px' }}>
                    <a href={isEn ? "/en/cpuvs/ranking" : "/cpuvs/ranking"} style={{ color: '#60a5fa', textDecoration: 'underline', margin: '0 15px', fontWeight: 'bold' }}>{isEn ? 'Best CPUs 2026 →' : 'Nejlepší procesory 2026 →'}</a>
                    <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ color: '#60a5fa', textDecoration: 'underline', margin: '0 15px', fontWeight: 'bold' }}>{isEn ? 'Compare with another CPU →' : 'Porovnat s jiným CPU →'}</a>
                </div>

            </main>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                .pulse-button { animation: pulse-cta 2s infinite; }
                .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                @media (max-width: 768px) {
                    .main-title { font-size: 1.6rem !important; }
                    .affiliate-cta-grid { padding: 20px !important; }
                    .guru-tools-grid { grid-template-columns: 1fr !important; }
                }
            `}} />
        </div>
    );
}
