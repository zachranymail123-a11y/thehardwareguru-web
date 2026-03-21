import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Sparkles, Zap, Monitor, Cpu, ChevronRight } from 'lucide-react';
import ShareButtonsClient from './ShareButtonsClient';

/**
 * GURU GTA 6 PREDICTOR - V11.2 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Maximální monetizace GTA VI hypu skrze strategické A-ADS.
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

    // 🚀 GURU GTA 6 FPS ENGINE (Zjednodušená verze pro render)
    const GPU_ratio = (gpu.performance_index || 100) / 260;
    const CPU_factor = Math.max(0.7, (cpu.performance_index || 100) / 100);
    const baseFps = resolutionStr === '2160p' ? 45 : (resolutionStr === '1440p' ? 75 : 95);
    const predictedFps = Math.max(15, Math.round(baseFps * GPU_ratio * CPU_factor));

    const shareText = `🔮 GTA VI PREDIKCE: Moje sestava (${hwComboName}) by měla dát v GTA VI na ${resolutionStr.toUpperCase()} okolo ${predictedFps} FPS! 🚀`;
    const shareUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div className="pred-badge"><Sparkles size={16} /> AI PREDIKCE AKTIVNÍ</div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                        GTA VI <span style={{ color: '#f43f5e' }}>VÝKON</span>
                    </h1>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#9ca3af', marginTop: '20px', textTransform: 'uppercase' }}>
                        {hwComboName} <span style={{ color: '#f43f5e' }}>({resolutionStr.toUpperCase()})</span>
                    </p>
                </header>

                <div className="result-card">
                    <div className="fps-main">{predictedFps} <span style={{ fontSize: '3rem' }}>FPS</span></div>
                    <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
                    <div className="stats-row">
                        <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU: {Math.round(predictedFps * 1.1)} FPS</div>
                        <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU: {Math.round(predictedFps * 1.05)} FPS</div>
                    </div>
                </div>

                {/* 🔥 ADS SLOT: GURU MONETIZATION ENGINE (INJEKCE POD VÝSLEDEK) */}
                <div className="guru-gta-ad-slot">
                    <span className="ad-label">Sponsored Gaming Hardware</span>
                    <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
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
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 11px; }
                .result-card { background: linear-gradient(135deg, #0f1115 0%, #1a050a 100%); padding: 60px 40px; border-radius: 32px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 60px rgba(244, 63, 94, 0.15); position: relative; }
                .fps-main { font-size: 8rem; font-weight: 950; line-height: 0.9; margin-bottom: 15px; }
                .fps-label { font-size: 14px; font-weight: 900; color: #fda4af; text-transform: uppercase; letter-spacing: 2px; }
                .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
                .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: 900; font-size: 13px; background: rgba(255,255,255,0.03); padding: 10px 18px; border-radius: 12px; }
                
                .guru-gta-ad-slot { margin: 30px 0; padding: 15px; background: rgba(244, 63, 94, 0.02); border: 1px solid rgba(244, 63, 94, 0.1); border-radius: 20px; text-align: center; }
                .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
                .ad-desktop { display: block; } .ad-mobile { display: none; }

                .res-switch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
                .res-nav { padding: 18px; background: rgba(15,17,21,0.8); border-radius: 16px; text-align: center; text-decoration: none; color: #6b7280; font-weight: 950; border: 1px solid #222; transition: 0.3s; }
                .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                
                @media (max-width: 768px) { 
                    .fps-main { font-size: 5rem; } 
                    .stats-row { flex-direction: column; align-items: center; }
                    .ad-desktop { display: none; } .ad-mobile { display: block; }
                }
            `}} />
        </div>
    );
}
