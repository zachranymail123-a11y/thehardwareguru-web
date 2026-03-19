'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, TrendingUp, TrendingDown, Layers, Target, Video } from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE - V4.0 (THE PROFESSIONAL SIMULATOR)
 * 🛡️ UPDATE: Dynamic X3D scaling, DLSS CPU penalty, Per-game FPS scaling.
 * 🛡️ UPDATE: Engine latency model, Streaming penalty, Mathematical 1% Lows.
 * 🛡️ SEO: Automatický zápis unikátních kombinací do DB na pozadí.
 */

// BROWSER Supabase client pro klientskou komponentu
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BottleneckClient({ gpus = [], cpus = [], games = [], isEn = false }) {
    // --- STAV Aplikace ---
    const [selectedCpuId, setSelectedCpuId] = useState('');
    const [selectedGpuId, setSelectedGpuId] = useState('');
    const [selectedGameSlug, setSelectedGameSlug] = useState('');
    
    // Konfigurace zátěže
    const [resolution, setResolution] = useState('1440p');
    const [targetFps, setTargetFps] = useState(60);
    const [enableRt, setEnableRt] = useState(false);
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); // OBS zátěž
    const [isCompSettings, setIsCompSettings] = useState(false); // Low details pro e-sports

    // Custom HW
    const [isCustomCpu, setIsCustomCpu] = useState(false);
    const [isCustomGpu, setIsCustomGpu] = useState(false);
    const [customCpuScore, setCustomCpuScore] = useState(100);
    const [customGpuScore, setCustomGpuScore] = useState(100);
    const [customVram, setCustomVram] = useState(8);

    // --- JÁDRO SIMULÁTORU (Memoized pro instant reaction) ---
    const analysis = useMemo(() => {
        if ((!selectedCpuId && !isCustomCpu) || (!selectedGpuId && !isCustomGpu) || !selectedGameSlug) return null;

        const cpu = isCustomCpu ? { name: 'Custom CPU', performance_index: customCpuScore } : cpus.find(c => c.id === selectedCpuId);
        const gpu = isCustomGpu ? { name: 'Custom GPU', performance_index: customGpuScore, vram_gb: customVram } : gpus.find(g => g.id === selectedGpuId);
        const baseGame = games.find(g => g.slug === selectedGameSlug) || { name: 'Obecná hra', slug: 'generic' };

        if (!cpu || !gpu) return null;

        const cpuName = cpu.name.toLowerCase();
        const gpuName = gpu.name.toLowerCase();

        // 1. ADVANCED GAME ENGINE PROFILES
        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, api: 'dx12', cpu_weight: 1.2, gpu_weight: 1.5, vram_1440p: 10, is_rt_heavy: true, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, api: 'dx11', cpu_weight: 0.5, gpu_weight: 0.4, vram_1440p: 4, is_rt_heavy: false, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, api: 'dx12', cpu_weight: 1.1, gpu_weight: 1.8, vram_1440p: 12, is_rt_heavy: true, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, api: 'dx11', cpu_weight: 0.4, gpu_weight: 0.3, vram_1440p: 4, is_rt_heavy: false, fps_scale: 4.0 },
            'generic': { thread_scaling: 0.6, api: 'dx12', cpu_weight: 1.0, gpu_weight: 1.0, vram_1440p: 8, is_rt_heavy: false, fps_scale: 1.4 }
        };
        const game = gameDataMap[baseGame.slug] || gameDataMap['generic'];

        // 2. CPU IPC MODEL & BACKGROUND LOAD
        let ipcBase = 100; 
        let archEfficiency = 1.0;

        if (cpuName.includes('9800x3d') || cpuName.includes('9950x3d')) { ipcBase = 135; archEfficiency = 1.05; }
        else if (cpuName.includes('ryzen 9000')) { ipcBase = 125; archEfficiency = 1.05; }
        else if (cpuName.includes('7800x3d') || cpuName.includes('7950x3d')) { ipcBase = 115; archEfficiency = 1.0; }
        else if (cpuName.includes('ryzen 7000') || cpuName.includes('7600x') || cpuName.includes('7700x') || cpuName.includes('7900x') || cpuName.includes('7950x')) { ipcBase = 110; archEfficiency = 0.95; }
        else if (cpuName.includes('5800x3d')) { ipcBase = 95; archEfficiency = 0.95; }
        else if (cpuName.includes('ryzen 5000') || cpuName.includes('5600') || cpuName.includes('5800') || cpuName.includes('5900') || cpuName.includes('5950')) { ipcBase = 85; archEfficiency = 0.85; }
        else if (cpuName.includes('ryzen 3000')) { ipcBase = 65; archEfficiency = 0.80; }
        
        else if (cpuName.includes('core ultra') || cpuName.includes('285k') || cpuName.includes('265k') || cpuName.includes('245k')) { ipcBase = 130; archEfficiency = 1.05; }
        else if (cpuName.includes('14900') || cpuName.includes('14700') || cpuName.includes('14600')) { ipcBase = 125; archEfficiency = 1.0; }
        else if (cpuName.includes('13900') || cpuName.includes('13700') || cpuName.includes('13600')) { ipcBase = 115; archEfficiency = 1.0; }
        else if (cpuName.includes('12900') || cpuName.includes('12700') || cpuName.includes('12600') || cpuName.includes('12400')) { ipcBase = 100; archEfficiency = 0.95; }
        else if (cpuName.includes('11900') || cpuName.includes('11700') || cpuName.includes('11600') || cpuName.includes('11400')) { ipcBase = 80; archEfficiency = 0.85; }
        else if (cpuName.includes('10900') || cpuName.includes('10700') || cpuName.includes('10600') || cpuName.includes('10400')) { ipcBase = 75; archEfficiency = 0.80; }

        if (isCustomCpu) ipcBase = customCpuScore * 0.8; 

        let singleCoreScore = ipcBase;
        let multiCoreScore = cpu.performance_index;

        // X3D DYNAMIC CACHE SCALING
        if (cpuName.includes('x3d')) {
            // Obrovský boost v hrách náročných na jedno vlákno a paměť (CS2, Valorant)
            archEfficiency *= (1 + (1 - game.thread_scaling) * 0.45);
        }

        let cpuEffective = (
            singleCoreScore * (1 - game.thread_scaling) + 
            multiCoreScore * game.thread_scaling
        ) * archEfficiency;

        // Background penalty (Streaming / OBS)
        if (isStreaming) {
            cpuEffective *= 0.85; // OBS si ukousne vlákna
        }

        // DX11 Overhead penalty
        if (game.api === 'dx11' && (gpuName.includes('rx ') || gpuName.includes('radeon'))) {
            cpuEffective *= 0.90; 
        }

        // 3. GPU MODEL & UPSCALING TRADE-OFF
        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution];
        let gpuEffective = gpu.performance_index / resMultiplier;

        if (isCompSettings) {
            gpuEffective *= 1.4; // Low details odlehčí grafice
            cpuEffective *= 0.9; // Ale natlačí víc FPS do CPU = vyšší CPU bottleneck šance
        }

        if (enableUpscaling) {
            gpuEffective *= (resolution === '2160p' ? 1.45 : 1.25); // DLSS pomáhá grafice
            cpuEffective *= 0.95; // Ale mírně zvyšuje CPU overhead (příprava více frames)
        }

        // 4. VRAM & RT PENALTIES
        let requiredVram = game.vram_1440p;
        if (resolution === '1080p') requiredVram *= 0.75;
        if (resolution === '2160p') requiredVram *= 1.4;
        if (isCompSettings) requiredVram *= 0.6; // Low textures = low VRAM
        
        const actualVram = gpu.vram_gb || 8;
        let vramWarning = false;
        if (actualVram < requiredVram) {
            gpuEffective *= 0.65; // Agresivní drop
            vramWarning = true;
        }

        if (enableRt && game.is_rt_heavy) {
            let rtMod = 0.5;
            if (gpuName.includes('rtx 40') || gpuName.includes('rtx 50')) rtMod = 0.95;
            else if (gpuName.includes('rtx 30')) rtMod = 0.80;
            else if (gpuName.includes('rx 79') || gpuName.includes('rx 78')) rtMod = 0.75;
            
            gpuEffective *= rtMod;
            cpuEffective *= 0.85; // RT dusí i procesor (BVH updates)
        }

        // 5. FPS ESTIMATE (Per-game scale)
        const rawCpuFps = (cpuEffective / game.cpu_weight) * game.fps_scale;
        const rawGpuFps = (gpuEffective / game.gpu_weight) * game.fps_scale;
        
        let estFps = Math.min(rawCpuFps, rawGpuFps);
        
        // Hard CPU Limit (e-sports)
        const cpuFpsCap = ipcBase * (isCompSettings ? 3.5 : 2.5);
        estFps = Math.min(estFps, cpuFpsCap);
        
        estFps = Math.max(10, Math.round(estFps));

        // 6. BOTTLENECK MATH
        const diff = Math.abs(rawCpuFps - rawGpuFps) / Math.max(rawCpuFps, rawGpuFps);
        let boundType = 'BALANCED';
        let limitedBy = '';
        let bottleneckPercent = Math.round(diff * 100);

        if (diff < 0.08) {
            boundType = 'BALANCED';
            bottleneckPercent = 0; 
        } else if (rawCpuFps < rawGpuFps) {
            boundType = 'CPU_BOUND';
            limitedBy = 'CPU';
        } else {
            boundType = 'GPU_BOUND';
            limitedBy = 'GPU';
        }

        // 7. PROFESSIONAL METRICS (Latency & Mathematical 1% Lows)
        let latencyPenalty = game.thread_scaling < 0.4 ? 1.25 : 1.0; // Staré DX11 hry mají horší frame pacing
        if (vramWarning) latencyPenalty *= 1.5;
        
        let frameTimeMs = ((1000 / estFps) * latencyPenalty).toFixed(1);

        // Dynamické 1% Lows založené na míře bottlenecku
        let low1Pct = 1 - (diff * 0.85); // Čím větší bottleneck, tím horší záseky
        if (vramWarning) low1Pct -= 0.3; // VRAM stutters
        if (isStreaming) low1Pct -= 0.15; // OBS frame drops
        
        low1Pct = Math.max(0.2, Math.min(0.95, low1Pct)); // Clamp between 20% and 95% of AVG FPS
        let low1Fps = Math.round(estFps * low1Pct);

        return {
            boundType,
            limitedBy,
            bottleneckPercent,
            estFps,
            low1Fps,
            frameTimeMs,
            vramWarning,
            stutterWarning: low1Pct < 0.6 || vramWarning,
            requiredVram: Math.round(requiredVram * 10) / 10,
            actualVram,
            meetsTarget: estFps >= targetFps
        };

    }, [selectedCpuId, selectedGpuId, selectedGameSlug, resolution, targetFps, enableRt, enableUpscaling, isStreaming, isCompSettings, isCustomCpu, isCustomGpu, customCpuScore, customGpuScore, customVram, cpus, gpus, games]);

    // --- SEO AUTOMATICKÝ ZÁPIS DO DB ---
    useEffect(() => {
        if (analysis && selectedCpuId && selectedGpuId && selectedGameSlug && !isCustomCpu && !isCustomGpu) {
            const cpu = cpus.find(c => c.id === selectedCpuId);
            const gpu = gpus.find(g => g.id === selectedGpuId);
            
            if (cpu && gpu) {
                const cleanCpu = cpu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const cleanGpu = gpu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                
                // Unikátní SEO slug
                const slugBase = `${cleanCpu}-vs-${cleanGpu}-${selectedGameSlug}-${resolution}`;
                const fullUrl = `https://thehardwareguru.cz/bottleneck-kalkulacka/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;

                supabase.from('generated_predictions').upsert({
                    slug_base: slugBase,
                    cpu_id: selectedCpuId,
                    gpu_id: selectedGpuId,
                    full_url: fullUrl,
                    last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' })
                .then(({ error }) => {
                    if (error) console.error("SEO Sitemapa - chyba zápisu:", error.message);
                });
            }
        }
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isCustomCpu, isCustomGpu, cpus, gpus]);

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1>{isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}</h1>
                <p>{isEn ? 'Find out what is holding your PC back in real-time.' : 'Odhal úzké hrdlo svého počítače s profesionální přesností.'}</p>
            </div>

            <div className="bn-grid">
                {/* LÉVÝ PANEL - VSTUPY */}
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> {isEn ? 'Configuration' : 'Konfigurace Zátěže'}</h3>
                    
                    <div className="input-group">
                        <label>{isEn ? 'Game Engine' : 'Herní Engine'}</label>
                        <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="bn-select">
                            <option value="">-- {isEn ? 'Select Game' : 'Vyber hru'} --</option>
                            {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>{isEn ? 'Resolution' : 'Rozlišení'}</label>
                        <div className="res-toggles">
                            {['1080p', '1440p', '2160p'].map(res => (
                                <button key={res} onClick={() => setResolution(res)} className={`res-btn ${resolution === res ? 'active' : ''}`}>
                                    {res === '2160p' ? '4K' : res}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{isEn ? 'Target Refresh Rate' : 'Cílové FPS (Monitor)'}</label>
                        <div className="res-toggles">
                            {[60, 144, 240].map(fps => (
                                <button key={fps} onClick={() => setTargetFps(fps)} className={`res-btn ${targetFps === fps ? 'active' : ''}`}>
                                    {fps} Hz
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pro Toggles */}
                    <div className="toggle-grid">
                        <div className="toggle-row" onClick={() => setEnableUpscaling(!enableUpscaling)}>
                            <div className={`switch ${enableUpscaling ? 'on' : 'off'}`}></div>
                            <span>DLSS / FSR</span>
                        </div>
                        <div className="toggle-row" onClick={() => setEnableRt(!enableRt)}>
                            <div className={`switch ${enableRt ? 'on' : 'off'}`}></div>
                            <span>Ray Tracing</span>
                        </div>
                        <div className="toggle-row" onClick={() => setIsCompSettings(!isCompSettings)}>
                            <div className={`switch ${isCompSettings ? 'on' : 'off'}`}></div>
                            <span>Low Settings</span>
                        </div>
                        <div className="toggle-row" onClick={() => setIsStreaming(!isStreaming)}>
                            <div className={`switch ${isStreaming ? 'on' : 'off'}`}></div>
                            <span>OBS Stream</span>
                        </div>
                    </div>

                    <hr className="bn-divider" />

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label><Cpu size={14} /> CPU</label>
                            <span className="custom-link" onClick={() => setIsCustomCpu(!isCustomCpu)}>{isCustomCpu ? 'Vybrat ze seznamu' : '+ Vlastní CPU'}</span>
                        </div>
                        {isCustomCpu ? (
                            <div className="custom-slider-box">
                                <label>Multicore Skóre (Index: {customCpuScore})</label>
                                <input type="range" min="30" max="200" value={customCpuScore} onChange={(e) => setCustomCpuScore(Number(e.target.value))} className="bn-slider" />
                            </div>
                        ) : (
                            <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="bn-select">
                                <option value="">-- {isEn ? 'Select CPU' : 'Vyber procesor'} --</option>
                                {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label><Zap size={14} /> GPU</label>
                            <span className="custom-link" onClick={() => setIsCustomGpu(!isCustomGpu)}>{isCustomGpu ? 'Vybrat ze seznamu' : '+ Vlastní GPU'}</span>
                        </div>
                        {isCustomGpu ? (
                            <>
                                <div className="custom-slider-box">
                                    <label>Hrubý výkon (Index: {customGpuScore})</label>
                                    <input type="range" min="30" max="250" value={customGpuScore} onChange={(e) => setCustomGpuScore(Number(e.target.value))} className="bn-slider" />
                                </div>
                                <div className="custom-slider-box" style={{ marginTop: '10px' }}>
                                    <label>VRAM ({customVram} GB)</label>
                                    <input type="range" min="4" max="24" step="2" value={customVram} onChange={(e) => setCustomVram(Number(e.target.value))} className="bn-slider" />
                                </div>
                            </>
                        ) : (
                            <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="bn-select">
                                <option value="">-- {isEn ? 'Select GPU' : 'Vyber grafiku'} --</option>
                                {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* PRAVÝ PANEL - VÝSLEDEK */}
                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state">
                            <Crosshair size={48} color="rgba(255,255,255,0.1)" />
                            <p>{isEn ? 'Select hardware to run simulation.' : 'Vyber HW a spusť inženýrskou simulaci.'}</p>
                        </div>
                    ) : (
                        <div className="analysis-board">
                            
                            {analysis.meetsTarget ? (
                                <div className="target-badge success"><Target size={14}/> {isEn ? 'Target Hit' : 'Cíl splněn'} ({targetFps} FPS)</div>
                            ) : (
                                <div className="target-badge fail"><Target size={14}/> {isEn ? 'Target Missed' : 'Nedosahuje cíle'} ({targetFps} FPS)</div>
                            )}

                            <div className="status-header" style={{ marginTop: '15px' }}>
                                {analysis.boundType === 'CPU_BOUND' && <div className="bound-badge cpu"><TrendingDown size={20} /> CPU BOTTLENECK</div>}
                                {analysis.boundType === 'GPU_BOUND' && <div className="bound-badge gpu"><TrendingUp size={20} /> GPU BOTTLENECK</div>}
                                {analysis.boundType === 'BALANCED' && <div className="bound-badge balanced"><Sparkles size={20} /> BALANCED BUILD</div>}
                            </div>

                            <div className="percentage-display">
                                <div className="pct-value">{analysis.bottleneckPercent}<span style={{ fontSize: '2rem' }}>%</span></div>
                                <div className="pct-label">
                                    {analysis.boundType === 'BALANCED' 
                                        ? (isEn ? 'Optimal utilization' : 'Optimální využití systému') 
                                        : `${analysis.limitedBy} ${isEn ? 'is holding you back by' : 'tě brzdí o'} ${analysis.bottleneckPercent}%`}
                                </div>
                            </div>

                            <div className="pro-metrics-grid">
                                <div className="metric-box">
                                    <div className="m-label">AVG FPS</div>
                                    <div className="m-val">{analysis.estFps}</div>
                                </div>
                                <div className={`metric-box ${analysis.stutterWarning ? 'alert' : ''}`}>
                                    <div className="m-label">1% LOWS</div>
                                    <div className="m-val">{analysis.low1Fps}</div>
                                </div>
                                <div className="metric-box">
                                    <div className="m-label">LATENCY</div>
                                    <div className="m-val">{analysis.frameTimeMs} <span style={{fontSize:'12px'}}>ms</span></div>
                                </div>
                            </div>

                            {isStreaming && (
                                <div className="warning-box info">
                                    <Video size={18} color="#60a5fa" style={{flexShrink: 0}} />
                                    <div>
                                        <strong>OBS Zátěž aktivní</strong> Streaming ubírá výkon procesoru, což zvyšuje šanci na stuttering a snižuje tvoje 1% Lows.
                                    </div>
                                </div>
                            )}

                            {analysis.vramWarning && (
                                <div className="warning-box">
                                    <AlertTriangle size={18} color="#ef4444" style={{flexShrink: 0}} />
                                    <div>
                                        <strong>VRAM Nedostatek!</strong> Hra vyžaduje {analysis.requiredVram}GB VRAM pro toto nastavení, ale karta má jen {analysis.actualVram}GB. Očekávej drastické propady a stuttering.
                                    </div>
                                </div>
                            )}

                            <div className="recommendation">
                                <h4>💡 {isEn ? 'Guru Recommendation' : 'Profesionální verdikt'}</h4>
                                
                                {analysis.boundType === 'CPU_BOUND' && (
                                    <p>Tvoje grafika čeká na instrukce od procesoru. Máš velký rozdíl mezi AVG FPS a 1% Lows ({analysis.low1Fps}), takže hra působí trhaně. Zapnutí upscalingu to jen zhorší. Zkus zvýšit rozlišení na {resolution === '1080p' ? '1440p' : '4K'} nebo <strong>upgraduj procesor</strong> na model s vyšším IPC (např. X3D).</p>
                                )}
                                {analysis.boundType === 'GPU_BOUND' && (
                                    <p>Tvá sestava je limitována hrubým výkonem grafiky. Pozitivní je, že procesor vše stíhá a obraz je plynulý bez záseků (latence {analysis.frameTimeMs}ms). Pokud ti nestačí průměrné FPS, zapni DLSS/FSR nebo zvaž <strong>upgrade GPU</strong>.</p>
                                )}
                                {analysis.boundType === 'BALANCED' && (
                                    <p>Hardware je ve vyvážené symbióze. Žádná komponenta zbytečně neškrtí druhou a frame-pacing je optimální. Toto je ukázkový build pro dané rozlišení.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: #0a0b0d; color: #fff; border-radius: 24px; padding: 40px; }
                .bn-header { text-align: center; margin-bottom: 40px; }
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-weight: 900; padding: 6px 20px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 20px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                .bn-header h1 { font-size: 3rem; font-weight: 950; margin: 0 0 10px 0; text-transform: uppercase; }
                .bn-header p { color: #9ca3af; font-size: 16px; margin: 0; }
                
                .bn-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; }
                @media (max-width: 800px) { .bn-grid { grid-template-columns: 1fr; } }
                
                .bn-inputs-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 30px; }
                .section-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 900; color: #fff; margin: 0 0 25px 0; text-transform: uppercase; }
                .input-group { margin-bottom: 25px; }
                .input-group label { display: block; font-size: 11px; font-weight: 900; color: #9ca3af; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .bn-select { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; }
                .bn-select:focus { border-color: #a855f7; outline: none; }
                
                .res-toggles { display: flex; gap: 10px; }
                .res-btn { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 12px; border-radius: 12px; font-weight: 900; font-size: 13px; cursor: pointer; transition: 0.2s; }
                .res-btn.active { background: rgba(168, 85, 247, 0.15); border-color: #a855f7; color: #fff; }
                
                .toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
                .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px 12px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.02); }
                .toggle-row:hover { background: rgba(255,255,255,0.02); }
                .switch { width: 36px; height: 20px; border-radius: 50px; background: #374151; position: relative; transition: 0.3s; flex-shrink: 0; }
                .switch::after { content: ''; position: absolute; width: 14px; height: 14px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: 0.3s; }
                .switch.on { background: #a855f7; }
                .switch.on::after { left: 19px; }
                .toggle-row span { font-size: 11px; font-weight: 900; color: #d1d5db; text-transform: uppercase; }

                .bn-divider { border: 0; height: 1px; background: rgba(255,255,255,0.05); margin: 30px 0; }
                
                .custom-link { font-size: 11px; color: #a855f7; cursor: pointer; font-weight: bold; text-transform: uppercase; }
                .custom-slider-box { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
                .bn-slider { width: 100%; cursor: pointer; accent-color: #a855f7; }

                .bn-result-card { background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(0,0,0,0.5)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 20px; padding: 40px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
                .empty-state { text-align: center; color: #6b7280; font-weight: bold; }
                
                .target-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 12px; border-radius: 50px; margin: 0 auto; }
                .target-badge.success { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
                .target-badge.fail { background: rgba(239, 68, 68, 0.2); color: #f87171; }

                .status-header { text-align: center; margin-bottom: 20px; }
                .bound-badge { display: inline-flex; align-items: center; gap: 8px; font-weight: 950; padding: 8px 25px; border-radius: 50px; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
                .bound-badge.cpu { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
                .bound-badge.gpu { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
                .bound-badge.balanced { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }

                .percentage-display { text-align: center; margin: 30px 0; }
                .pct-value { font-size: 6rem; font-weight: 950; line-height: 1; color: #fff; text-shadow: 0 0 30px rgba(168, 85, 247, 0.4); }
                .pct-label { font-size: 14px; font-weight: bold; color: #9ca3af; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }

                .pro-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px; }
                .metric-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 14px; text-align: center; }
                .metric-box.alert { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.1); }
                .metric-box.alert .m-val { color: #fbbf24; }
                .m-label { font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px; }
                .m-val { font-size: 22px; font-weight: 950; color: #fff; }

                .warning-box { display: flex; gap: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 20px; border-radius: 16px; margin-bottom: 20px; color: #fca5a5; font-size: 13px; line-height: 1.5; }
                .warning-box.info { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); color: #93c5fd; }
                .warning-box strong { display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                .warning-box:not(.info) strong { color: #ef4444; }
                .warning-box.info strong { color: #60a5fa; }

                .recommendation { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; }
                .recommendation h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 900; color: #fff; text-transform: uppercase; }
                .recommendation p { margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.6; }
            `}} />
        </div>
    );
}
