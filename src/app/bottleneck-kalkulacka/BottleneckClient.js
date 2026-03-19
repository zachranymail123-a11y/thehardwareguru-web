'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, 
  TrendingUp, TrendingDown, Layers, Target, Video, Share2, Check, 
  Twitter, Award, Swords, Newspaper, Lightbulb, Gamepad2, ChevronRight, Play 
} from 'lucide-react';

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
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug);
    const [resolution, setResolution] = useState(initialResolution);
    
    // START BUTTON STATE
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResult, setShowResult] = useState(!!initialCpuId);

    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 

    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // 🚀 ENGINE ANALÝZA (MATEMATIKA NEDOTČENA)
    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId || !selectedGameSlug) return null;

        const cpu = (cpus || []).find(c => String(c.id) === String(selectedCpuId));
        const gpu = (gpus || []).find(g => String(g.id) === String(selectedGpuId));
        const baseGame = (games || []).find(g => String(g.slug) === String(selectedGameSlug)) || { name: 'Obecná hra', slug: 'generic' };

        if (!cpu || !gpu) return null;

        const cpuName = (cpu.name || '').toLowerCase();
        const gpuName = (gpu.name || '').toLowerCase();

        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
            'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
        };
        const game = gameDataMap[baseGame.slug] || gameDataMap['generic'];

        let ipcBase = 100; 
        let archEfficiency = 1.0;
        if (cpuName.includes('x3d')) archEfficiency *= (1 + (1 - game.thread_scaling) * 0.45);
        if (cpuName.includes('9800x3d') || cpuName.includes('9950x3d')) ipcBase = 135;
        else if (cpuName.includes('ryzen 9000')) ipcBase = 125;
        else if (cpuName.includes('7800x3d')) ipcBase = 115;

        let cpuEffective = (ipcBase * (1 - game.thread_scaling) + (cpu.performance_index || 100) * game.thread_scaling) * archEfficiency;
        if (isStreaming) cpuEffective *= 0.85;

        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        let gpuEffective = (gpu.performance_index || 100) / resMultiplier;
        if (enableUpscaling) gpuEffective *= 1.3;
        
        const rawCpuFps = (cpuEffective / game.cpu_weight) * game.fps_scale;
        const rawGpuFps = (gpuEffective / game.gpu_weight) * game.fps_scale;
        const estFps = Math.round(Math.min(rawCpuFps, rawGpuFps));
        const diff = Math.abs(rawCpuFps - rawGpuFps) / Math.max(rawCpuFps, rawGpuFps);

        return {
            boundType: rawCpuFps < rawGpuFps ? 'CPU_BOUND' : (diff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: rawCpuFps < rawGpuFps ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(diff * 100), estFps, low1Fps: Math.round(estFps * (1 - diff * 0.8)),
            frameTimeMs: (1000 / estFps).toFixed(1), cpuName: cpu.name, gpuName: gpu.name, gameName: baseGame.name
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, enableUpscaling, isStreaming, cpus, gpus, games]);

    // 🛠️ ASYNCHRONNÍ KLIENTSKÉ OPERACE
    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const sb = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

        if (analysis) {
            const cleanCpu = (analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const cleanGpu = (analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const slugBase = `${cleanCpu}-vs-${cleanGpu}-${selectedGameSlug}-${resolution}`;
            const fullUrl = `https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
            setShareUrl(fullUrl);

            if (sb && !initialCpuId) {
                sb.from('generated_predictions').upsert({
                    slug_base: slugBase, cpu_id: selectedCpuId, gpu_id: selectedGpuId, full_url: fullUrl, last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' }).catch(() => {});
            }
        } else {
            setShareUrl(`https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}`);
        }
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isEn, initialCpuId]);

    // --- 🛠️ FUNKCE OBSLUHY (VŠECHNY DEFINOVÁNY) ---
    const handleStart = () => {
        setIsCalculating(true);
        setTimeout(() => { 
            setShowResult(true); 
            setIsCalculating(false); 
        }, 800);
    };

    const getShareText = () => {
        if (!analysis) return isEn ? "Check out the PC Bottleneck Simulator! 🚀" : "Otestuj svůj PC v GURU Bottleneck Simulátoru! 🚀";
        return isEn 
            ? `🔥 My rig has a ${analysis.bottleneckPercent}% ${analysis.boundType.replace('_', ' ')} in ${analysis.gameName}! 🚀`
            : `🔥 Moje sestava má v ${analysis.gameName} přesně ${analysis.bottleneckPercent}% ${analysis.limitedBy} Bottleneck! 🚀`;
    };

    const handleCopyShare = () => {
        navigator.clipboard.writeText(`${getShareText()}\n👉 ${shareUrl}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const handleXShare = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleRedditShare = () => {
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(getShareText())}`, '_blank');
    };

    const gta6DynamicLink = analysis ? `/${isEn ? 'en/fps-calculator/gta-6-prediction' : 'fps-kalkulacka/gta-6-predikce'}/${(analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${(analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${resolution}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}` : '';

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1 style={{ fontSize: '3rem', fontWeight: '950', textTransform: 'uppercase', margin: '10px 0' }}>
                    {isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>Odhal pravdu o výkonu svého počítače.</p>
            </div>

            <div className="bn-grid">
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> Konfigurace</h3>
                    <div className="input-group">
                        <label>Herní Engine</label>
                        <select value={selectedGameSlug} onChange={(e) => { setSelectedGameSlug(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber hru --</option>
                            {(games || []).map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Rozlišení</label>
                        <div className="res-toggles">
                            {['1080p', '1440p', '2160p'].map(res => (
                                <button key={res} onClick={() => { setResolution(res); setShowResult(false); }} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res === '2160p' ? '4K' : res}</button>
                            ))}
                        </div>
                    </div>
                    <div className="toggle-grid">
                        <div className="toggle-row" onClick={() => { setEnableUpscaling(!enableUpscaling); setShowResult(false); }}>
                            <div className={`switch ${enableUpscaling ? 'on' : 'off'}`}></div>
                            <span>DLSS / FSR</span>
                        </div>
                        <div className="toggle-row" onClick={() => { setIsStreaming(!isStreaming); setShowResult(false); }}>
                            <div className={`switch ${isStreaming ? 'on' : 'off'}`}></div>
                            <span>OBS Stream</span>
                        </div>
                    </div>
                    <hr className="bn-divider" />
                    <div className="input-group">
                        <label><Cpu size={14} /> CPU</label>
                        <select value={selectedCpuId} onChange={(e) => { setSelectedCpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber procesor --</option>
                            {(cpus || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Zap size={14} /> GPU</label>
                        <select value={selectedGpuId} onChange={(e) => { setSelectedGpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber grafiku --</option>
                            {(gpus || []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleStart} disabled={!selectedCpuId || !selectedGpuId || !selectedGameSlug || isCalculating} className="start-btn">
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} />} SPUSTIT SIMULACI
                    </button>
                </div>

                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state">
                            <Crosshair size={48} color="rgba(255,255,255,0.1)" />
                            <p>Nastav hardware a spusť simulaci.</p>
                        </div>
                    ) : (
                        <div className="analysis-board">
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div className={`bound-badge ${analysis.boundType.toLowerCase().replace('_', '-')}`}>
                                    {analysis.boundType.replace('_', ' ')}
                                </div>
                            </div>
                            <div className="percentage-display">
                                <div className="pct-value">{analysis.bottleneckPercent}%</div>
                                <div className="pct-label">{analysis.limitedBy} tě brzdí o {analysis.bottleneckPercent}%</div>
                            </div>
                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{analysis.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">1% LOWS</div><div className="m-val">{analysis.low1Fps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{analysis.frameTimeMs}ms</div></div>
                            </div>
                            <div className="recommendation">
                                <h4 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '10px' }}>💡 Guru Verdikt</h4>
                                <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>{analysis.boundType === 'CPU_BOUND' ? 'Tvoje grafika se nudí. Potřebuješ silnější procesor pro maximální plynulost.' : 'Sestava je limitována grafikou. Obraz bude plynulý, ale pro víc FPS budeš muset snížit detaily.'}</p>
                            </div>
                            {gta6DynamicLink && (
                                <a href={gta6DynamicLink} className="gta-cta">
                                    <Sparkles size={20} /> ROZJEDE TO GTA VI?
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="massive-seo-hub">
                <div className="viral-flex-card">
                    <div className="award-icon"><Award size={28} color="#a855f7" /></div>
                    <div className="viral-text-box">
                        <div style={{ fontWeight: '950', color: '#fff' }}>SDÍLET KALKULAČKU</div>
                        <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>Pošli tento nástroj přátelům</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyShare} className="premium-share-btn btn-copy" title="Kopírovat">
                            {copied ? <Check size={18} /> : <Share2 size={18} />}
                        </button>
                        <button onClick={handleXShare} className="premium-share-btn btn-x" title="Sdílet na X">
                            <Twitter size={18} />
                        </button>
                        <button onClick={handleRedditShare} className="premium-share-btn btn-reddit" title="Sdílet na Reddit">
                            <RedditIcon size={18} />
                        </button>
                    </div>
                </div>

                <div className="hub-grid" style={{ marginTop: '50px' }}>
                    <div className="hub-column">
                        <div className="hub-col-header"><Swords size={16} color="#ff0055" /> Souboje</div>
                        <ul className="hub-links-list">
                            <li><a href="/gpuvs"><ChevronRight size={14} /> Grafické karty</a></li>
                            <li><a href="/cpuvs"><ChevronRight size={14} /> Procesory</a></li>
                        </ul>
                    </div>
                    <div className="hub-column">
                        <div className="hub-col-header"><Gamepad2 size={16} color="#66fcf1" /> Guru Hub</div>
                        <ul className="hub-links-list">
                            <li><a href="/ocekavane-hry"><ChevronRight size={14} /> Archiv her</a></li>
                            <li><a href="/cs/deals"><ChevronRight size={14} /> Slevy na hry</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: rgba(10, 11, 13, 0.95); color: #fff; border-radius: 30px; padding: 50px; border: 1px solid rgba(102, 252, 241, 0.1); backdrop-filter: blur(10px); }
                .bn-header { text-align: center; margin-bottom: 50px; }
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-weight: 950; padding: 8px 25px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 25px; text-transform: uppercase; font-size: 12px; border: 1px solid rgba(168, 85, 247, 0.2); }
                .bn-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; }
                @media (max-width: 900px) { .bn-grid { grid-template-columns: 1fr; } }
                .bn-inputs-card { background: rgba(255, 255, 255, 0.02); border-radius: 24px; padding: 35px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .section-title { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 950; color: #fff; margin-bottom: 30px; text-transform: uppercase; }
                .input-group { margin-bottom: 25px; }
                .input-group label { display: block; font-size: 12px; font-weight: 950; color: #9ca3af; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
                .bn-select { width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; outline: none; transition: 0.3s; }
                .bn-select:focus { border-color: #a855f7; }
                .res-toggles { display: flex; gap: 10px; }
                .res-btn { flex: 1; padding: 12px; background: #000; border: 1px solid #333; color: #9ca3af; border-radius: 10px; font-weight: 950; cursor: pointer; transition: 0.3s; }
                .res-btn.active { border-color: #a855f7; color: #fff; background: rgba(168, 85, 247, 0.15); }
                .start-btn { width: 100%; margin-top: 20px; padding: 18px; background: #a855f7; color: #fff; border: none; border-radius: 14px; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.4s; text-transform: uppercase; font-size: 15px; }
                .start-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .bn-result-card { background: linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(0,0,0,0.4) 100%); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 24px; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 500px; }
                .pct-value { font-size: 7rem; font-weight: 950; text-align: center; color: #fff; text-shadow: 0 0 40px rgba(168, 85, 247, 0.6); line-height: 1; }
                .pct-label { text-align: center; color: #a855f7; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; }
                .pro-metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 40px 0; }
                .metric-box { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.03); }
                .m-label { font-size: 11px; color: #666; font-weight: 950; text-transform: uppercase; margin-bottom: 5px; }
                .m-val { font-size: 24px; font-weight: 950; color: #fff; }
                .gta-cta { display: flex; align-items: center; justify-content: center; gap: 12px; background: #f43f5e; color: #fff; padding: 18px; border-radius: 14px; text-decoration: none; font-weight: 950; margin-top: 30px; transition: 0.3s; box-shadow: 0 10px 25px rgba(244, 63, 94, 0.3); }
                .gta-cta:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(244, 63, 94, 0.4); }
                .viral-flex-card { display: flex; align-items: center; gap: 20px; padding: 25px; background: #000; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 20px; margin-top: 60px; }
                .premium-share-btn { width: 44px; height: 44px; border-radius: 12px; border: none; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .btn-copy { background: #a855f7; }
                .btn-x { background: #111; border: 1px solid #333; }
                .btn-reddit { background: #ff4500; }
                .premium-share-btn:hover { transform: translateY(-3px); filter: brightness(1.2); }
                .massive-seo-hub { margin-top: 80px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 50px; }
                .hub-main-title { text-align: center; text-transform: uppercase; font-weight: 950; letter-spacing: 2px; margin-bottom: 40px; }
                .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .hub-column { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); }
                .hub-col-header { display: flex; align-items: center; gap: 10px; font-weight: 950; text-transform: uppercase; margin-bottom: 20px; font-size: 14px; }
                .hub-links-list { list-style: none; padding: 0; }
                .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 12px; font-weight: bold; transition: 0.2s; }
                .hub-links-list a:hover { color: #fff; transform: translateX(5px); }
                .toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
                .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; background: #000; padding: 12px; border-radius: 12px; font-size: 11px; font-weight: 950; border: 1px solid #222; }
                .switch { width: 34px; height: 18px; background: #333; border-radius: 10px; position: relative; transition: 0.3s; }
                .switch::after { content: ''; position: absolute; width: 14px; height: 14px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s; }
                .switch.on { background: #a855f7; }
                .switch.on::after { left: 18px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .bound-badge { display: inline-block; padding: 8px 25px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; font-weight: 950; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; color: #fff; }
                .bn-divider { border: 0; height: 1px; background: rgba(255,255,255,0.05); margin: 30px 0; }
            `}} />
        </div>
    );
}
