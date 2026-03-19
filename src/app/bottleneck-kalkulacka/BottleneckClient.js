'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, TrendingUp, TrendingDown, Layers, Target, Video, Share2, Check, Twitter, Award } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function BottleneckClient({ 
    gpus = [], 
    cpus = [], 
    games = [], 
    isEn = false,
    initialCpuId = '',
    initialGpuId = '',
    initialGameSlug = '',
    initialResolution = '1440p'
}) {
    // Načtení výchozích hodnot, pokud přijdou z URL (díky serverové komponentě)
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug);
    const [resolution, setResolution] = useState(initialResolution);
    
    const [targetFps, setTargetFps] = useState(60);
    const [enableRt, setEnableRt] = useState(false);
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 
    const [isCompSettings, setIsCompSettings] = useState(false); 

    const [isCustomCpu, setIsCustomCpu] = useState(false);
    const [isCustomGpu, setIsCustomGpu] = useState(false);
    const [customCpuScore, setCustomCpuScore] = useState(100);
    const [customGpuScore, setCustomGpuScore] = useState(100);
    const [customVram, setCustomVram] = useState(8);

    const [copied, setCopied] = useState(false);
    const [shareUrlObj, setShareUrlObj] = useState(null);
    const [dynamicGta6Link, setDynamicGta6Link] = useState('');

    const analysis = useMemo(() => {
        if ((!selectedCpuId && !isCustomCpu) || (!selectedGpuId && !isCustomGpu) || !selectedGameSlug) return null;

        const cpu = isCustomCpu ? { name: 'Custom CPU', performance_index: customCpuScore } : cpus.find(c => c.id === selectedCpuId);
        const gpu = isCustomGpu ? { name: 'Custom GPU', performance_index: customGpuScore, vram_gb: customVram } : gpus.find(g => g.id === selectedGpuId);
        const baseGame = games.find(g => g.slug === selectedGameSlug) || { name: 'Obecná hra', slug: 'generic' };

        if (!cpu || !gpu) return null;

        const cpuName = cpu.name.toLowerCase();
        const gpuName = gpu.name.toLowerCase();

        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, api: 'dx12', cpu_weight: 1.2, gpu_weight: 1.5, vram_1440p: 10, is_rt_heavy: true, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, api: 'dx11', cpu_weight: 0.5, gpu_weight: 0.4, vram_1440p: 4, is_rt_heavy: false, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, api: 'dx12', cpu_weight: 1.1, gpu_weight: 1.8, vram_1440p: 12, is_rt_heavy: true, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, api: 'dx11', cpu_weight: 0.4, gpu_weight: 0.3, vram_1440p: 4, is_rt_heavy: false, fps_scale: 4.0 },
            'generic': { thread_scaling: 0.6, api: 'dx12', cpu_weight: 1.0, gpu_weight: 1.0, vram_1440p: 8, is_rt_heavy: false, fps_scale: 1.4 }
        };
        const game = gameDataMap[baseGame.slug] || gameDataMap['generic'];

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

        if (cpuName.includes('x3d')) archEfficiency *= (1 + (1 - game.thread_scaling) * 0.45);

        let cpuEffective = (singleCoreScore * (1 - game.thread_scaling) + multiCoreScore * game.thread_scaling) * archEfficiency;
        if (isStreaming) cpuEffective *= 0.85; 
        if (game.api === 'dx11' && (gpuName.includes('rx ') || gpuName.includes('radeon'))) cpuEffective *= 0.90; 

        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution];
        let gpuEffective = gpu.performance_index / resMultiplier;

        if (isCompSettings) {
            gpuEffective *= 1.4; 
            cpuEffective *= 0.9; 
        }

        if (enableUpscaling) {
            gpuEffective *= (resolution === '2160p' ? 1.45 : 1.25); 
            cpuEffective *= 0.95; 
        }

        let requiredVram = game.vram_1440p;
        if (resolution === '1080p') requiredVram *= 0.75;
        if (resolution === '2160p') requiredVram *= 1.4;
        if (isCompSettings) requiredVram *= 0.6; 
        
        const actualVram = gpu.vram_gb || 8;
        let vramWarning = false;
        if (actualVram < requiredVram) {
            gpuEffective *= 0.65; 
            vramWarning = true;
        }

        if (enableRt && game.is_rt_heavy) {
            let rtMod = 0.5;
            if (gpuName.includes('rtx 40') || gpuName.includes('rtx 50')) rtMod = 0.95;
            else if (gpuName.includes('rtx 30')) rtMod = 0.80;
            else if (gpuName.includes('rx 79') || gpuName.includes('rx 78')) rtMod = 0.75;
            gpuEffective *= rtMod;
            cpuEffective *= 0.85; 
        }

        const rawCpuFps = (cpuEffective / game.cpu_weight) * game.fps_scale;
        const rawGpuFps = (gpuEffective / game.gpu_weight) * game.fps_scale;
        
        let estFps = Math.min(rawCpuFps, rawGpuFps);
        const cpuFpsCap = ipcBase * (isCompSettings ? 3.5 : 2.5);
        estFps = Math.min(estFps, cpuFpsCap);
        estFps = Math.max(10, Math.round(estFps));

        const diff = Math.abs(rawCpuFps - rawGpuFps) / Math.max(rawCpuFps, rawGpuFps);
        let boundType = 'BALANCED';
        let limitedBy = '';
        let bottleneckPercent = Math.round(diff * 100);

        if (diff < 0.08) { boundType = 'BALANCED'; bottleneckPercent = 0; } 
        else if (rawCpuFps < rawGpuFps) { boundType = 'CPU_BOUND'; limitedBy = 'CPU'; } 
        else { boundType = 'GPU_BOUND'; limitedBy = 'GPU'; }

        let latencyPenalty = game.thread_scaling < 0.4 ? 1.25 : 1.0; 
        if (vramWarning) latencyPenalty *= 1.5;
        let frameTimeMs = ((1000 / estFps) * latencyPenalty).toFixed(1);

        let low1Pct = 1 - (diff * 0.85); 
        if (vramWarning) low1Pct -= 0.3; 
        if (isStreaming) low1Pct -= 0.15; 
        low1Pct = Math.max(0.2, Math.min(0.95, low1Pct)); 
        let low1Fps = Math.round(estFps * low1Pct);

        return {
            boundType, limitedBy, bottleneckPercent, estFps, low1Fps, frameTimeMs,
            vramWarning, stutterWarning: low1Pct < 0.6 || vramWarning,
            requiredVram: Math.round(requiredVram * 10) / 10, actualVram,
            meetsTarget: estFps >= targetFps,
            cpuName: cpu.name, gpuName: gpu.name, gameName: baseGame.name
        };

    }, [selectedCpuId, selectedGpuId, selectedGameSlug, resolution, targetFps, enableRt, enableUpscaling, isStreaming, isCompSettings, isCustomCpu, isCustomGpu, customCpuScore, customGpuScore, customVram, cpus, gpus, games]);

    useEffect(() => {
        if (analysis && selectedCpuId && selectedGpuId && selectedGameSlug && !isCustomCpu && !isCustomGpu) {
            const cpu = cpus.find(c => c.id === selectedCpuId);
            const gpu = gpus.find(g => g.id === selectedGpuId);
            
            if (cpu && gpu) {
                const cleanCpu = cpu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const cleanGpu = gpu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                
                const slugBase = `${cleanCpu}-vs-${cleanGpu}-${selectedGameSlug}-${resolution}`;
                const basePath = isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka';
                const fullUrl = `https://thehardwareguru.cz${basePath}/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;

                setShareUrlObj({ url: fullUrl, cpu: cpu.name, gpu: gpu.name, game: analysis.gameName });

                const gta6BasePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
                const gta6Slug = `${cleanCpu}-vs-${cleanGpu}-${resolution}`;
                setDynamicGta6Link(`${gta6BasePath}/${gta6Slug}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`);

                supabase.from('generated_predictions').upsert({
                    slug_base: slugBase,
                    cpu_id: selectedCpuId,
                    gpu_id: selectedGpuId,
                    full_url: fullUrl,
                    last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' })
                .then(({ error }) => {
                    if (error) console.error("SEO Sitemapa chyba:", error.message);
                });
            }
        } else {
            setShareUrlObj(null);
            setDynamicGta6Link('');
        }
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isCustomCpu, isCustomGpu, cpus, gpus, isEn]);

    const getShareText = () => {
        if (!analysis) return '';
        const hwText = shareUrlObj ? `${shareUrlObj.cpu} + ${shareUrlObj.gpu}` : 'Můj PC';
        if (isEn) {
            return `🔥 My rig (${hwText}) has a ${analysis.bottleneckPercent}% ${analysis.boundType.replace('_', ' ')} in ${analysis.gameName} on ${resolution}! What's yours? 🚀`;
        }
        return `🔥 Moje sestava (${hwText}) má v ${analysis.gameName} na ${resolution} přesně ${analysis.bottleneckPercent}% ${analysis.limitedBy} Bottleneck! Jak jsi na tom ty? 🚀`;
    };

    const handleCopyShare = () => {
        if (!shareUrlObj) return;
        const text = `${getShareText()}\n👉 Zjisti to tady: ${shareUrlObj.url}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const handleXShare = () => {
        if (!shareUrlObj) return;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(shareUrlObj.url)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    const handleRedditShare = () => {
        if (!shareUrlObj) return;
        const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrlObj.url)}&title=${encodeURIComponent(getShareText())}`;
        window.open(redditUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1>{isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}</h1>
                <p>{isEn ? 'Find out what is holding your PC back in real-time.' : 'Odhal úzké hrdlo svého počítače s profesionální přesností.'}</p>
            </div>

            <div className="bn-grid">
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

                            {/* VIRÁLNÍ SDÍLECÍ KARTA */}
                            {shareUrlObj && (
                                <div className="viral-flex-card" style={{ marginTop: '30px', marginBottom: '30px' }}>
                                    <div className="award-icon"><Award size={28} color="#fff" /></div>
                                    <div className="viral-text-box">
                                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {isEn ? 'SIMULATION COMPLETE' : 'SIMULACE DOKONČENA'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>
                                            {isEn ? 'Share your result online' : 'Pochlub se výsledkem online'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <button onClick={handleCopyShare} className="premium-share-btn btn-copy" title={isEn ? "Copy Link" : "Kopírovat odkaz"}>
                                            {copied ? <Check className="check-anim" size={18} /> : <Share2 size={18} />}
                                        </button>
                                        <button onClick={handleXShare} className="premium-share-btn btn-x" title="X">
                                            <Twitter size={18} />
                                        </button>
                                        <button onClick={handleRedditShare} className="premium-share-btn btn-reddit" title="Reddit">
                                            <RedditIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

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

            {/* 🔥 REÁLNÉ PROLINKOVÁNÍ (Zobrazí se po analýze) */}
            {analysis && (
                <>
                    {/* 💰 ADSENSE SLOT */}
                    <div style={{ margin: '40px 0', minHeight: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#4b5563', margin: '15px 0', fontWeight: 'bold', letterSpacing: '2px' }}>SPONZOROVANÝ OBSAH</span>
                        <ins className="adsbygoogle"
                             style={{ display: 'block', width: '100%' }}
                             data-ad-client="ca-pub-5468223287024993"
                             data-ad-slot="1234567890" 
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                    </div>

                    <div className="guru-hub-links">
                        <h3 style={{ fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '20px' }}>
                            {isEn ? 'Explore More Tools' : 'Další GURU Nástroje a Kalkulačky'}
                        </h3>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="hub-btn">
                                <Monitor size={18} color="#66fcf1" /> {isEn ? 'FPS Calculator' : 'FPS Kalkulačka'}
                            </a>
                            {dynamicGta6Link && (
                                <a href={dynamicGta6Link} className="hub-btn gta-btn">
                                    <Sparkles size={18} color="#f43f5e" /> {isEn ? 'Will it run GTA VI?' : 'Rozjede to GTA VI?'}
                                </a>
                            )}
                        </div>
                    </div>
                </>
            )}

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

                /* VIRÁLNÍ KARTA */
                .viral-flex-card { display: flex; align-items: center; gap: 15px; padding: 20px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); text-align: left; }
                .award-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(168, 85, 247, 0.2); border-radius: 12px; flex-shrink: 0; }
                .viral-text-box { flex: 1; }
                .premium-share-btn { width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.3s; border: none; color: #fff; }
                .btn-copy { background: linear-gradient(45deg, #a855f7, #c084fc); }
                .btn-x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
                .btn-reddit { background: #ff4500; }
                .premium-share-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
                .check-anim { animation: checkPop 0.3s ease-out; }

                /* GURU HUB ODKAZY */
                .guru-hub-links { margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
                .hub-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 12px; color: #d1d5db; font-weight: 900; font-size: 13px; text-decoration: none; transition: 0.3s; text-transform: uppercase; }
                .hub-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #fff; transform: translateY(-2px); }
                .hub-btn.gta-btn { border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.05); }
                .hub-btn.gta-btn:hover { border-color: rgba(244, 63, 94, 0.6); background: rgba(244, 63, 94, 0.1); }

                .warning-box { display: flex; gap: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 20px; border-radius: 16px; margin-bottom: 20px; color: #fca5a5; font-size: 13px; line-height: 1.5; }
                .warning-box.info { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); color: #93c5fd; }
                .warning-box strong { display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                .warning-box:not(.info) strong { color: #ef4444; }
                .warning-box.info strong { color: #60a5fa; }

                .recommendation { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; }
                .recommendation h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 900; color: #fff; text-transform: uppercase; }
                .recommendation p { margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.6; }
                
                @keyframes checkPop { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
            `}} />
        </div>
    );
}
