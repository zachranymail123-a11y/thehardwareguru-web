'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound, usePathname } from 'next/navigation';
import { Sparkles, Zap, Monitor, Cpu, ChevronRight, Swords, Gamepad2, AlertTriangle, ShoppingCart } from 'lucide-react';
import ShareButtonsClient from './ShareButtonsClient';
import SeznamAd from '../../../../components/SeznamAd';
import HeurekaButtons from '../../../../components/HeurekaButtons'; 

/**
 * GURU GTA 6 PREDICTOR - V11.8 (V10 HARD-LOCK & TOOLS UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock, oprava CSS build errorů a doplnění kalkulaček.
 */

const baseUrl = "https://thehardwareguru.cz";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Gta6PredictionPage({ params, searchParams }) {
    const p = use(params);
    const s = use(searchParams);
    const pathname = usePathname() || '';
    
    const { cpuId, gpuId } = s;
    const { slug } = p;

    const [data, setData] = useState({ gpu: null, cpu: null, loading: true });

    useEffect(() => {
        if (!cpuId || !gpuId || !slug) {
            setData({ loading: false });
            return;
        }

        const fetchData = async () => {
            const [gpusRes, cpusRes] = await Promise.all([
                supabase.from('gpus').select('id,name,performance_index,vram_gb,scaling').eq('id', gpuId).maybeSingle(),
                supabase.from('cpus').select('id,name,performance_index').eq('id', cpuId).maybeSingle()
            ]);
            
            setData({
                gpu: gpusRes.data || {},
                cpu: cpusRes.data || {},
                loading: false
            });
        };
        fetchData();
    }, [cpuId, gpuId, slug]);

    // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
    const handleHeurekaAction = (e, name, subId) => {
        e.preventDefault();
        const cleanName = name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon |Ryzen |Core /gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
        const q = encodeURIComponent(cleanName + ' cena');
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: 'gta6_predictor', sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    if (data.loading) return null;
    if (!cpuId || !gpuId || !slug || (!data.gpu?.id && !data.cpu?.id)) return notFound();

    const { gpu, cpu } = data;
    const gpuName = gpu.name || 'GPU';
    const cpuName = cpu.name || 'CPU';
    const hwComboName = `${cpuName} + ${gpuName}`;
    const resolutionStr = slug.endsWith('2160p') ? '2160p' : slug.endsWith('1440p') ? '1440p' : '1080p';

    // 🚀 GURU GTA 6 FPS ENGINE
    const GPU_ratio = (gpu.performance_index || 100) / 260;
    const CPU_factor = Math.max(0.7, (cpu.performance_index || 100) / 100);
    const baseFps = resolutionStr === '2160p' ? 45 : (resolutionStr === '1440p' ? 75 : 95);
    const predictedFps = Math.max(15, Math.round(baseFps * GPU_ratio * CPU_factor));

    const shareText = `🔮 GTA VI PREDIKCE: Moje sestava (${hwComboName}) by měla dát v GTA VI na ${resolutionStr.toUpperCase()} okolo ${predictedFps} FPS! 🚀`;
    const shareUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;

    return (
        <div className="guru-gta-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper">
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="pred-badge"><Sparkles size={16} /> AI PREDIKCE AKTIVNÍ</div>
                    <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                        GTA VI <span style={{ color: '#f43f5e' }}>VÝKON</span>
                    </h1>
                    <p className="hw-label" style={{ fontSize: '18px', fontWeight: '900', color: '#9ca3af', marginTop: '20px', textTransform: 'uppercase' }}>
                        {hwComboName} <span style={{ color: '#f43f5e' }}>({resolutionStr.toUpperCase()})</span>
                    </p>
                </header>

                <div className="result-card">
                    <div className="fps-main">{predictedFps} <span className="fps-unit" style={{ fontSize: '3rem' }}>FPS</span></div>
                    <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
                    
                    <div className="stats-row">
                        <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU: {Math.round(predictedFps * 1.1)} FPS</div>
                        <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU: {Math.round(predictedFps * 1.05)} FPS</div>
                    </div>

                    {/* 🔥 PŘIDÁNO: HARD-LOCK NÁKUPNÍ TLAČÍTKA 🔥 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(244, 63, 94, 0.2)' }}>
                         <button 
                             onClick={(e) => handleHeurekaAction(e, gpuName, 'v10-gta-gpu')}
                             style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase' }}
                         >
                             <ShoppingCart size={18} /> ZJISTIT CENU GRAFIKY
                         </button>
                         <button 
                             onClick={(e) => handleHeurekaAction(e, cpuName, 'v10-gta-cpu')}
                             style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '950', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase' }}
                         >
                             <ShoppingCart size={18} /> ZJISTIT CENU PROCESORU
                         </button>
                    </div>
                </div>

                <div className="ad-mobile-wrapper" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

                <ShareButtonsClient shareText={shareText} shareUrl={shareUrl} />

                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <HeurekaButtons manualSearch={gpuName} positionId="276026" isEn={false} />
                </div>

                <div className="res-switch-grid">
                    {['1080p', '1440p', '2160p'].map(res => {
                        const parts = slug.split('-vs-');
                        const newSlug = `${parts[0]}-vs-${parts[1].split('-').slice(0,-1).join('-')}-${res}`;
                        return (
                            <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${newSlug}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolutionStr === res ? 'active' : ''}`}>
                                {res === '2160p' ? '4K ULTRA' : `${res} QUAD`}
                            </a>
                        );
                    })}
                </div>

                {/* 🔥 GURU TOOLS - POVINNÁ TLAČÍTKA NA KALKULAČKY 🔥 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px' }}>
                    <a href="/fps-kalkulacka" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>FPS KALKULAČKA</span>
                    </a>
                    <a href="/bottleneck-kalkulacka" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>BOTTLENECK TEST</span>
                    </a>
                </div>

                <section className="massive-seo-hub" style={{ marginTop: '80px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #f43f5e', paddingLeft: '15px' }}>
                        PROZKOUMEJ GURU DATABÁZI
                    </h2>
                    <div className="seo-hub-grid">
                        <div className="hub-column">
                            <div className="hub-col-header"><Swords size={20} color="#ff0055" /> Hardware Souboje</div>
                            <ul className="hub-links-list">
                                <li><a href="/cpuvs"><ChevronRight size={16} /> Souboje Procesorů</a></li>
                                <li><a href="/gpuvs"><ChevronRight size={16} /> Souboje Grafických Karet</a></li>
                                <li><a href="/cpu-index"><ChevronRight size={16} /> Katalog Procesorů</a></li>
                                <li><a href="/gpu-index"><ChevronRight size={16} /> Katalog Grafických Karet</a></li>
                            </ul>
                        </div>
                        <div className="hub-column">
                            <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> Guru Ekosystém</div>
                            <ul className="hub-links-list">
                                <li><a href="/bottleneck-kalkulacka"><ChevronRight size={16} /> Kompletní Bottleneck Test</a></li>
                                <li><a href="/fps-kalkulacka"><ChevronRight size={16} /> Nový odhad pro GTA VI</a></li>
                                <li><a href="/ocekavane-hry"><ChevronRight size={16} /> Archiv a slevy her</a></li>
                                <li><a href="/clanky"><ChevronRight size={16} /> Články a Novinky</a></li>
                                <li><a href="/tipy"><ChevronRight size={16} /> GURU Tipy</a></li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={90} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={100} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 11px; }
                .result-card { background: linear-gradient(135deg, #0f1115 0%, #1a050a 100%); padding: 60px 40px; border-radius: 32px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 60px rgba(244, 63, 94, 0.15); position: relative; }
                .fps-main { font-size: 8rem; font-weight: 950; line-height: 0.9; margin-bottom: 15px; }
                .fps-label { font-size: 14px; font-weight: 900; color: #fda4af; text-transform: uppercase; letter-spacing: 2px; }
                .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
                .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: 900; font-size: 13px; background: rgba(255,255,255,0.03); padding: 10px 18px; border-radius: 12px; }
                
                .res-switch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
                .res-nav { padding: 18px; background: rgba(15,17,21,0.8); border-radius: 16px; text-align: center; text-decoration: none; color: #6b7280; font-weight: 950; border: 1px solid #222; transition: 0.3s; }
                .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

                .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
                .hub-links-list { list-style: none; padding: 0; }
                .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
                .hub-links-list a:hover { color: #f43f5e; transform: translateX(10px); }

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

                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }
                
                @media (max-width: 768px) { 
                    .guru-gta-wrapper { padding-top: 80px !important; }
                    .inner-container { padding: 0 15px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .main-title { font-size: 2.2rem !important; }
                    .hw-label { font-size: 14px !important; }
                    .result-card { padding: 35px 20px !important; border-radius: 24px !important; }
                    .fps-main { font-size: 4.5rem !important; } 
                    .fps-unit { font-size: 1.5rem !important; }
                    .stats-row { flex-direction: column; align-items: center; gap: 10px; margin-top: 25px; padding-top: 20px; }
                    .stat-pill { width: 100%; justify-content: center; }
                    .res-switch-grid { grid-template-columns: 1fr; gap: 10px; }
                    .seo-hub-grid { grid-template-columns: 1fr; }
                    .hub-column { padding: 25px; }
                }
            `}} />
        </div>
    );
}
