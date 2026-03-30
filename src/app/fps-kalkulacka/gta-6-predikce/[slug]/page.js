import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Sparkles, Zap, Monitor, Cpu, ChevronRight, Swords, Gamepad2 } from 'lucide-react';
import ShareButtonsClient from './ShareButtonsClient';
import SeznamAd from '../../../../components/SeznamAd';

/**
 * GURU GTA 6 PREDICTOR - V11.6 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP reklamy Above Fold, přidání Sticky Bottom Anchoru, ochrana FPS enginu.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export default async function Gta6PredictionPage({ params, searchParams }) {
    const p = await params;
    const s = await searchParams;
    const { cpuId, gpuId } = s;
    const { slug } = p;

    if (!cpuId || !gpuId || !slug) return notFound();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- FETCH DATA ---
    const [gpus, cpus] = await Promise.all([
        supabase.from('gpus').select('id,name,performance_index,vram_gb,scaling').eq('id', gpuId).maybeSingle(),
        supabase.from('cpus').select('id,name,performance_index').eq('id', cpuId).maybeSingle()
    ]);

    const gpu = gpus.data || {};
    const cpu = cpus.data || {};
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
                
                {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
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
                </div>

                {/* 🔥 INNER AD SLOT - STRIKTNÍ SEPARACE (Zobrazeno pouze na mobilu) */}
                <div className="ad-mobile-wrapper" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                </div>

                <ShareButtonsClient shareText={shareText} shareUrl={shareUrl} />

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

                {/* 🚀 MASSIVE SEO HUB PRO ELIMINACI DEAD ENDU */}
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

            {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
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

                /* 🚀 SEO HUB CSS */
                .seo-hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .hub-column { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 25px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
                .hub-links-list { list-style: none; padding: 0; }
                .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 15px; font-weight: bold; transition: 0.3s; }
                .hub-links-list a:hover { color: #f43f5e; transform: translateX(10px); }

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
                
                @media (max-width: 768px) { 
                    .guru-gta-wrapper { paddingTop: 80px !important; }
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
