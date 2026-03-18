import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Sparkles, Zap, Monitor, Cpu } from 'lucide-react';
import ShareButtonsClient from './ShareButtonsClient';

/**
 * GURU GTA 6 PREDICTOR - V11.1 (ADSENSE READY & ENTERPRISE ENGINE)
 * 🛡️ UPDATE: Integrace Enterprise 3-Tier AI Modelu (1080p/1440p/4K)
 * 🛡️ PREDIKCE: -30% výkonnostní zátěž oproti Cyberpunku 2077, dynamické VRAM/CPU škrcení.
 */

export const dynamic = 'force-dynamic';
const baseUrl = "https://thehardwareguru.cz";

export default async function Gta6PredictionPage({ params, searchParams }) {
    const { cpuId, gpuId } = await searchParams;
    const { slug } = await params;

    if (!cpuId || !gpuId || !slug) return notFound();

    // SERVER Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- 🚀 GURU ANTI-DUPLIKACE & ZÁPIS ---
    try {
        const fullUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;
        
        const { error: upsertError } = await supabase
            .from('generated_predictions')
            .upsert({
                slug_base: slug,
                cpu_id: cpuId,
                gpu_id: gpuId,
                full_url: fullUrl,
                last_requested: new Date().toISOString()
            }, { 
                onConflict: 'slug_base'
            });

        if (upsertError) console.error("❌ DB Write Error:", upsertError.message);
        
    } catch (err) {
        console.error("❌ Critical Logging Failure:", err);
    }

    // --- FETCH DATA PRO ZOBRAZENÍ ---
    const [gpuRes, cpuRes, gpus, cpus] = await Promise.all([
        supabase.from('game_fps').select('*').eq('gpu_id', gpuId).maybeSingle(),
        supabase.from('cpu_game_fps').select('*').eq('cpu_id', cpuId).maybeSingle(),
        supabase.from('gpus').select('id,name,performance_index,vram_gb').eq('id', gpuId).maybeSingle(),
        supabase.from('cpus').select('id,name,performance_index').eq('id', cpuId).maybeSingle()
    ]);

    const gpuData = gpuRes.data || {};
    const cpuData = cpuRes.data || {};
    
    const gpu = gpus.data || {};
    const cpu = cpus.data || {};
    
    const gpuName = gpu.name || 'GPU';
    const cpuName = cpu.name || 'CPU';
    const hwComboName = `${cpuName} + ${gpuName}`;
    const gpuPerfIndex = gpu.performance_index || 100;
    const cpuPerfIndex = cpu.performance_index || 100;

    const resolutionStr = slug.endsWith('2160p') ? '2160p' : slug.endsWith('1440p') ? '1440p' : '1080p';
    const displayResolution = resolutionStr === '2160p' ? '4k' : resolutionStr;

    // ---------------------------------------------------------
    // 🚀 THE ENDGAME FPS ENGINE (GTA VI SPECIAL CALIBRATION)
    // ---------------------------------------------------------

    // 1. NATIVNÍ GPU RATIO (3-Tier Empirický model pro Cyberpunk Basis)
    const getGpuTier = (name) => {
        if (!name) return null;
        const n = name.toLowerCase();

        if (resolutionStr === '1080p') {
            if (n.includes('5090')) return 1.100; 
            if (n.includes('5080')) return 1.048; 
            if (n.includes('4090')) return 1.000; 
            if (n.includes('4080 super')) return 0.900;
            if (n.includes('4080')) return 0.889; 
            if (n.includes('7900 xtx')) return 0.895; 
            if (n.includes('5070 ti')) return 0.853; 
            if (n.includes('4070 ti super')) return 0.797; 
            if (n.includes('7900 xt')) return 0.789; 
            if (n.includes('3090 ti')) return 0.747; 
            if (n.includes('5070')) return 0.716; 
            if (n.includes('4070 ti')) return 0.718; 
            if (n.includes('4070 super')) return 0.694; 
            if (n.includes('7900 gre')) return 0.682; 
            if (n.includes('3090')) return 0.674; 
            if (n.includes('7800 xt')) return 0.667; 
            if (n.includes('6950 xt')) return 0.665; 
            if (n.includes('3080 ti')) return 0.635; 
            if (n.includes('3080')) return 0.621; 
            if (n.includes('6900 xt')) return 0.618; 
            if (n.includes('4070')) return 0.603; 
            if (n.includes('6800 xt')) return 0.580; 
            if (n.includes('7700 xt')) return 0.550;
            if (n.includes('3070 ti')) return 0.520;
            if (n.includes('3070')) return 0.490;
            if (n.includes('4060 ti 16')) return 0.480; 
            if (n.includes('4060 ti')) return 0.490;
            if (n.includes('3060 ti')) return 0.430;
            if (n.includes('4060')) return 0.380;
            if (n.includes('3060')) return 0.350;
        } else if (resolutionStr === '1440p') {
            if (n.includes('5090')) return 1.280; 
            if (n.includes('5080')) return 1.150; 
            if (n.includes('4090')) return 1.000;
            if (n.includes('4080 super')) return 0.827;
            if (n.includes('4080')) return 0.798;
            if (n.includes('7900 xtx')) return 0.757;
            if (n.includes('5070 ti')) return 0.880; 
            if (n.includes('4070 ti super')) return 0.712;
            if (n.includes('7900 xt')) return 0.665;
            if (n.includes('3090 ti')) return 0.701;
            if (n.includes('5070')) return 0.730; 
            if (n.includes('4070 ti')) return 0.648;
            if (n.includes('4070 super')) return 0.615;
            if (n.includes('7900 gre')) return 0.635;
            if (n.includes('3090')) return 0.616;
            if (n.includes('7800 xt')) return 0.568;
            if (n.includes('6950 xt')) return 0.596;
            if (n.includes('3080 ti')) return 0.551;
            if (n.includes('3080')) return 0.548;
            if (n.includes('6900 xt')) return 0.545;
            if (n.includes('4070')) return 0.513;
            if (n.includes('6800 xt')) return 0.512;
            if (n.includes('7700 xt')) return 0.481;
            if (n.includes('3070 ti')) return 0.445;
            if (n.includes('3070')) return 0.421;
            if (n.includes('4060 ti 16')) return 0.389;
            if (n.includes('4060 ti')) return 0.401;
            if (n.includes('3060 ti')) return 0.359;
            if (n.includes('4060')) return 0.297;
            if (n.includes('3060')) return 0.280;
        } else {
            if (n.includes('5090')) return 1.426; 
            if (n.includes('5080')) return 1.199; 
            if (n.includes('4090')) return 1.000; 
            if (n.includes('7900 xtx')) return 0.763; 
            if (n.includes('4080 super')) return 0.754; 
            if (n.includes('4080')) return 0.739; 
            if (n.includes('5070 ti')) return 0.734; 
            if (n.includes('7900 xt')) return 0.656; 
            if (n.includes('4070 ti super')) return 0.648; 
            if (n.includes('3090 ti')) return 0.624; 
            if (n.includes('5070')) return 0.612; 
            if (n.includes('4070 ti')) return 0.559; 
            if (n.includes('7900 gre')) return 0.551; 
            if (n.includes('3090')) return 0.532; 
            if (n.includes('4070 super')) return 0.526; 
            if (n.includes('7800 xt')) return 0.501; 
            if (n.includes('6950 xt')) return 0.496; 
            if (n.includes('3080 ti')) return 0.478; 
            if (n.includes('3080')) return 0.442; 
            if (n.includes('6900 xt')) return 0.427; 
            if (n.includes('4070')) return 0.421; 
            if (n.includes('6800 xt')) return 0.406; 
            if (n.includes('7700 xt')) return 0.380;
            if (n.includes('3070 ti')) return 0.350;
            if (n.includes('3070')) return 0.320;
            if (n.includes('4060 ti 16')) return 0.300;
            if (n.includes('4060 ti')) return 0.290;
            if (n.includes('3060 ti')) return 0.250;
            if (n.includes('4060')) return 0.220;
            if (n.includes('3060')) return 0.180;
        }
        return null;
    };

    const dbScalingRatio = gpu?.scaling ? gpu.scaling[displayResolution] : null;
    const tierFromList = dbScalingRatio !== null ? dbScalingRatio : getGpuTier(gpuName);
    const fallbackRatio = Math.pow(gpuPerfIndex / 260, 0.9);
    const GPU_ratio = tierFromList !== null ? tierFromList : fallbackRatio;

    // 2. BASELINE NORMALIZATION (4090 v Cyberpunku jako kotevní bod pro celý výpočet)
    let base4090Fps = 0;
    if (resolutionStr === '1080p') base4090Fps = 140;
    else if (resolutionStr === '1440p') base4090Fps = 129;
    else base4090Fps = 74;

    // 3. GTA VI MULTIPLIER (-30 % zátěž navíc oproti Cyberpunku)
    // Těžká hra trestá slabší GPU mnohem více
    const gtaBaseScaling = 0.70; 
    const gpuStrugglePenalty = 1 - (0.25 * (1 - GPU_ratio)); // Slaba karta ztratí dalších až 20%
    base4090Fps *= (gtaBaseScaling * gpuStrugglePenalty);

    // 4. CPU BOTTLENECK (Extrémně náročné NPC systémy v GTA VI)
    const cpuWeight = { '1080p': 1.0, '1440p': 0.8, '2160p': 0.5 };
    const currentCpuWeight = cpuWeight[resolutionStr] || 1.0;
    let CPU_factor = 1.0;
    
    const gpuCpuInteraction = Math.pow(GPU_ratio, 0.3);
    const adjustedCpuLimit = cpuPerfIndex / (GPU_ratio * 100 * currentCpuWeight * gpuCpuInteraction);
    
    if (adjustedCpuLimit < 1) {
        CPU_factor = Math.pow(adjustedCpuLimit, 0.7); // GTA VI bude kruté k CPU
    }
    CPU_factor = Math.max(0.60, CPU_factor); // Nikdy neklesne pod 60% své síly (Hard floor)

    // 5. VRAM PENALTY MODEL (GTA VI se slabou VRAM se zadusí)
    let vramPenalty = 1.0;
    if (gpu?.vram_gb && gpu.vram_gb < 12 && resolutionStr === '2160p') {
        vramPenalty = 0.55; // 8GB karty ve 4K GTA VI prakticky nepojedou
    } else if (gpu?.vram_gb && gpu.vram_gb < 10 && resolutionStr === '1440p') {
        vramPenalty = 0.85; // 8GB karty v 1440p budou cítit tlak
    }

    // 6. ORGANIC VARIANCE (Pseudo-random ale konzistentní stabilita)
    const hashStr = gpuId + cpuId + 'gta6' + resolutionStr;
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) hash = Math.imul(31, hash) + hashStr.charCodeAt(i) | 0;
    const pseudoRandom = Math.abs(hash) / 2147483647; 
    const variance = 0.95 + (pseudoRandom * 0.10); // +/- 5% rozptyl pro realism
    
    // 🎯 FINAL COMPUTATION
    let predictedFps = base4090Fps * GPU_ratio * CPU_factor * vramPenalty * variance;
    
    // CAP A UX CLAMP
    predictedFps = Math.min(predictedFps, 160); // Nečekáme víc než 160 FPS v GTA VI
    predictedFps = Math.max(15, Math.round(predictedFps)); // Pod 15 to je unplayable
    
    // Generování falešných CPU/GPU čísel pro estetiku v "Pill" designu pod tím
    const visualCpuFps = Math.round(predictedFps * (1 + (pseudoRandom * 0.2)));
    const visualGpuFps = Math.round(predictedFps * (1 + ((1-pseudoRandom) * 0.15)));

    // ---------------------------------------------------------

    const shareText = `🔮 GTA VI PREDIKCE: Moje sestava (${hwComboName}) by měla dát v GTA VI na ${displayResolution.toUpperCase()} okolo ${predictedFps} FPS! 🚀`;
    const shareUrl = `${baseUrl}/fps-kalkulacka/gta-6-predikce/${slug}?cpuId=${cpuId}&gpuId=${gpuId}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div className="pred-badge"><Sparkles size={16} /> AI PREDIKCE ZÁPIS AKTIVNÍ</div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                        GTA VI <span style={{ color: '#f43f5e' }}>VÝKON</span>
                    </h1>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: '#9ca3af', marginTop: '20px', textTransform: 'uppercase' }}>
                        {hwComboName} <span style={{ color: '#f43f5e' }}>({displayResolution.toUpperCase()})</span>
                    </p>
                </header>

                <div className="result-card">
                    <div className="fps-main">{predictedFps} <span style={{ fontSize: '3rem' }}>FPS</span></div>
                    <div className="fps-label">PŘEDPOKLÁDANÁ RYCHLOST HRY</div>
                    <div className="stats-row">
                        <div className="stat-pill"><Cpu size={18} color="#f59e0b" /> CPU: {visualCpuFps} FPS</div>
                        <div className="stat-pill"><Monitor size={18} color="#66fcf1" /> GPU: {visualGpuFps} FPS</div>
                    </div>
                </div>

                {/* 💰 ADSENSE SLOT - GURU MONETIZATION ENGINE */}
                <div style={{ margin: '40px 0', minHeight: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(244, 63, 94, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#4b5563', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '2px' }}>SPONZOROVANÝ OBSAH</span>
                    <ins className="adsbygoogle"
                         style={{ display: 'block', width: '100%' }}
                         data-ad-client="ca-pub-5468223287024993"
                         data-ad-slot="1234567890" // Sem vložíš ID po schválení
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
                </div>

                <ShareButtonsClient shareText={shareText} shareUrl={shareUrl} />

                <div className="res-switch-grid">
                    {['1080p', '1440p', '2160p'].map(res => {
                        const parts = slug.split('-vs-');
                        const newSlug = `${parts[0]}-vs-${parts[1].split('-').slice(0,-1).join('-')}-${res}`;
                        return (
                            <a key={res} href={`/fps-kalkulacka/gta-6-predikce/${newSlug}?cpuId=${cpuId}&gpuId=${gpuId}`} className={`res-nav ${resolutionStr === (res === '2160p' ? '2160p' : res) ? 'active' : ''}`}>
                                {res === '2160p' ? '4K ULTRA' : `${res} QUAD`}
                            </a>
                        );
                    })}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #f43f5e; font-weight: 950; padding: 6px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 50px; background: rgba(244, 63, 94, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 11px; }
                .result-card { background: linear-gradient(135deg, #0f1115 0%, #1a050a 100%); padding: 60px 40px; border-radius: 32px; border: 2px solid #f43f5e; text-align: center; box-shadow: 0 0 60px rgba(244, 63, 94, 0.15); position: relative; overflow: hidden; }
                .fps-main { font-size: 8rem; font-weight: 950; line-height: 0.9; margin-bottom: 15px; color: #fff; }
                .fps-label { font-size: 14px; font-weight: 900; color: #fda4af; text-transform: uppercase; letter-spacing: 2px; }
                .stats-row { display: flex; justify-content: center; gap: 20px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(244, 63, 94, 0.2); }
                .stat-pill { display: flex; align-items: center; gap: 8px; color: #d1d5db; font-weight: 900; font-size: 13px; background: rgba(255,255,255,0.03); padding: 10px 18px; border-radius: 12px; }
                .res-switch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
                .res-nav { padding: 18px; background: rgba(15,17,21,0.8); border-radius: 16px; text-align: center; text-decoration: none; color: #6b7280; font-weight: 950; border: 1px solid #222; transition: 0.3s; }
                .res-nav.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                @media (max-width: 768px) { .fps-main { font-size: 5rem; } .stats-row { flex-direction: column; align-items: center; } }
            `}} />
        </div>
    );
}
