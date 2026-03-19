'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, TrendingUp, TrendingDown, Layers, Target, Video, Share2, Check, Twitter, Award, Swords, Newspaper, Lightbulb, Gamepad2, ChevronRight, Play } from 'lucide-react';

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function BottleneckClient({ 
    gpus = [], cpus = [], games = [], isEn = false, initialCpuId = '', initialGpuId = '', initialGameSlug = '', initialResolution = '1440p'
}) {
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug);
    const [resolution, setResolution] = useState(initialResolution);
    
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResult, setShowResult] = useState(!!initialCpuId);

    const [enableRt, setEnableRt] = useState(false);
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 
    const [isCompSettings, setIsCompSettings] = useState(false); 

    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // 🚀 ENGINE ANALÝZA (IDENTICKÁ MATEMATIKA)
    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId || !selectedGameSlug) return null;

        const cpu = (cpus || []).find(c => String(c.id) === String(selectedCpuId));
        const gpu = (gpus || []).find(g => String(g.id) === String(selectedGpuId));
        const baseGame = (games || []).find(g => String(g.slug) === String(selectedGameSlug)) || { name: 'Obecná hra', slug: 'generic' };

        if (!cpu || !gpu) return null;

        const cpuName = (cpu.name || '').toLowerCase();
        const gpuName = (gpu.name || '').toLowerCase();

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

    // 🛠️ FIX: Inicializace odkazů a Supabase pouze na klientovi (useEffect)
    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const sb = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

        if (analysis && !initialCpuId) {
            const cleanCpu = (analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const cleanGpu = (analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const slugBase = `${cleanCpu}-vs-${cleanGpu}-${selectedGameSlug}-${resolution}`;
            const fullUrl = `https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
            setShareUrl(fullUrl);

            if (sb) {
                sb.from('generated_predictions').upsert({
                    slug_base: slugBase, cpu_id: selectedCpuId, gpu_id: selectedGpuId, full_url: fullUrl, last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' }).catch(() => {});
            }
        } else {
            setShareUrl(`https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}`);
        }
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isEn, initialCpuId]);

    const handleStart = () => {
        setIsCalculating(true);
        setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 800);
    };

    const handleCopyShare = () => {
        const text = isEn ? `🔥 My rig bottleneck result: ${shareUrl}` : `🔥 Moje sestava má v ${analysis?.gameName} přesně ${analysis?.bottleneckPercent}% Bottleneck! 👉 ${shareUrl}`;
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); });
    };

    const gta6DynamicLink = analysis ? `/${isEn ? 'en/fps-calculator/gta-6-prediction' : 'fps-kalkulacka/gta-6-predikce'}/${(analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${(analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${resolution}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}` : '';

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1>{isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}</h1>
                <p>Odhal pravdu o výkonu svého počítače.</p>
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
                        <div className="empty-state"><Crosshair size={48} color="rgba(255,255,255,0.1)" /><p>Nastav hardware a spusť simulaci.</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div className={`bound-badge ${analysis.boundType.toLowerCase().replace('_', '-')}`}>{analysis.boundType.replace('_', ' ')}</div>
                            <div className="percentage-display">
                                <div className="pct-value">{analysis.bottleneckPercent}%</div>
                                <div className="pct-label">{analysis.limitedBy} tě brzdí o {analysis.bottleneckPercent}%</div>
                            </div>
                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{analysis.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">1% LOWS</div><div className="m-val">{analysis.low1Fps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{analysis.frameTimeMs}ms</div></div>
                            </div>
                            {gta6DynamicLink && (
                                <a href={gta6DynamicLink} className="gta-cta"><Sparkles size={20} /> ROZJEDE TO GTA VI?</a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="massive-seo-hub">
                <div className="viral-flex-card">
                    <div className="award-icon"><Award size={28} /></div>
                    <div className="viral-text-box">
                        <div style={{fontWeight: 900}}>SDÍLET VÝSLEDEK</div>
                        <div style={{fontSize: '11px', color: '#a855f7'}}>Pochlub se sestavou</div>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={handleCopyShare} className="premium-share-btn btn-copy">{copied ? <Check size={18}/> : <Share2 size={18} />}</button>
                    </div>
                </div>

                <div className="hub-grid" style={{marginTop: '40px'}}>
                    <div className="hub-column">
                        <div className="hub-col-header"><Swords size={16} color="#f43f5e" /> Souboje</div>
                        <ul className="hub-links-list">
                            <li><a href="/gpuvs"><ChevronRight size={14} /> Grafiky</a></li>
                            <li><a href="/cpuvs"><ChevronRight size={14} /> Procesory</a></li>
                        </ul>
                    </div>
                    <div className="hub-column">
                        <div className="hub-col-header"><Gamepad2 size={16} color="#a855f7" /> Guru Hub</div>
                        <ul className="hub-links-list">
                            <li><a href="/ocekavane-hry"><ChevronRight size={14} /> Archiv her</a></li>
                            <li><a href="/clanky"><ChevronRight size={14} /> Články</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: #0a0b0d; color: #fff; border-radius: 24px; padding: 40px; }
                .bn-header { text-align: center; margin-bottom: 40px; }
                .pred-badge { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; font-weight: 900; padding: 6px 20px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 20px; text-transform: uppercase; font-size: 11px; }
                .bn-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; }
                .bn-inputs-card { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 30px; border: 1px solid rgba(255,255,255,0.05); }
                .input-group { margin-bottom: 20px; }
                .input-group label { display: block; font-size: 11px; font-weight: 900; color: #9ca3af; margin-bottom: 8px; text-transform: uppercase; }
                .bn-select { width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 10px; }
                .res-btn { flex: 1; padding: 10px; background: #111; border: 1px solid #333; color: #9ca3af; border-radius: 8px; font-weight: 900; cursor: pointer; }
                .res-btn.active { border-color: #a855f7; color: #fff; background: rgba(168, 85, 247, 0.1); }
                .start-btn { width: 100%; margin-top: 20px; padding: 15px; background: #a855f7; color: #fff; border: none; border-radius: 12px; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
                .bn-result-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 20px; padding: 40px; min-height: 400px; }
                .pct-value { font-size: 5rem; font-weight: 950; text-align: center; color: #fff; text-shadow: 0 0 30px rgba(168, 85, 247, 0.5); }
                .pct-label { text-align: center; color: #a855f7; font-weight: 900; text-transform: uppercase; }
                .pro-metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 30px 0; }
                .metric-box { background: #000; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #222; }
                .m-label { font-size: 10px; color: #666; font-weight: 900; }
                .m-val { font-size: 20px; font-weight: 900; }
                .gta-cta { display: flex; align-items: center; justify-content: center; gap: 10px; background: #f43f5e; color: #fff; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 900; margin-top: 20px; }
                .viral-flex-card { display: flex; align-items: center; gap: 15px; padding: 20px; background: #000; border: 1px solid #a855f7; border-radius: 16px; margin-top: 40px; }
                .premium-share-btn { padding: 10px; border-radius: 8px; border: none; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; }
                .btn-copy { background: #a855f7; }
                .massive-seo-hub { margin-top: 60px; border-top: 1px solid #222; padding-top: 40px; }
                .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .hub-links-list { list-style: none; padding: 0; }
                .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 14px; display: flex; align-items: center; margin-bottom: 10px; }
                .toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
                .toggle-row { display: flex; align-items: center; gap: 8px; cursor: pointer; background: #111; padding: 8px; border-radius: 8px; font-size: 10px; font-weight: 900; }
                .switch { width: 30px; height: 16px; background: #333; border-radius: 10px; position: relative; }
                .switch.on { background: #a855f7; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .res-toggles { display: flex; gap: 10px; }
                .bound-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; font-weight: 900; text-transform: uppercase; font-size: 12px; margin-bottom: 20px; }
            `}} />
        </div>
    );
}
