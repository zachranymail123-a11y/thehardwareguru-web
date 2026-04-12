'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { 
 Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, 
 Layers, Gamepad2, Play, Activity, ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import ShareResultButton from '../../components/ShareResultButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel |Ryzen |Core /gi, '').trim();

export default function BottleneckClient({ 
    gpus = [], cpus = [], games = [], isEn = false, initialCpuId = '', initialGpuId = '', initialGameSlug = '', initialResolution = '1440p' 
}) {
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug);
    const [resolution, setResolution] = useState(initialResolution);
    const [isCalculating, setIsCalculating] = useState(false);
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 
    const [showResult, setShowResult] = useState(false);
    const pathname = usePathname() || '';

    useEffect(() => {
        if (initialCpuId) setShowResult(true);
    }, [initialCpuId]);

    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId || !selectedGameSlug) return null;
        const cpu = cpus.find(c => String(c.id) === String(selectedCpuId));
        const gpu = gpus.find(g => String(g.id) === String(selectedGpuId));
        const baseGame = games.find(g => String(g.slug) === String(selectedGameSlug));
        if (!cpu || !gpu) return null;

        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        const cpuEff = (Number(cpu.performance_index) || 100) * (isStreaming ? 0.85 : 1);
        const gpuEff = (Number(gpu.performance_index) || 100) / resMultiplier * (enableUpscaling ? 1.3 : 1);
        
        const estFps = Math.max(1, Math.round(Math.min(cpuEff, gpuEff) * 1.4));
        const diff = Math.abs(cpuEff - gpuEff) / Math.max(cpuEff, gpuEff);

        return {
            boundType: cpuEff < gpuEff ? 'CPU_BOUND' : (diff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: cpuEff < gpuEff ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(diff * 100), 
            estFps, 
            frameTimeMs: estFps > 0 ? (1000 / estFps).toFixed(1) : '0.0',
            cpuName: cpu.name, gpuName: gpu.name, gameName: baseGame?.name || 'Game'
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, enableUpscaling, isStreaming, cpus, gpus, games]);

    // 🔥 V10 HARD-LOCK REDIRECT 🔥
    const handleHeurekaClick = (e, name, cat) => {
        e.preventDefault();
        const cleanName = normalizeName(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
        const subId = `v10-bn-${cat}`;
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: `bn_${cat}`, sub_id: subId, page: pathname };
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        setTimeout(() => { window.location.href = targetUrl; }, 150);
    };

    const handleStart = () => {
        setIsCalculating(true);
        setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 800);
    };

    const a = analysis || {};
    const statusColor = (a.bottleneckPercent || 0) < 15 ? '#10b981' : ((a.bottleneckPercent || 0) < 30 ? '#f59e0b' : '#ef4444');

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1 className="bn-main-title">{isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}</h1>
                <p className="bn-sub-title">{isEn ? 'Find the weakest link in your rig.' : 'Najdi nejslabší článek své sestavy.'}</p>
            </div>

            <div className="bn-grid">
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> {isEn ? 'Configuration' : 'Konfigurace'}</h3>
                    <div className="input-group">
                        <label>Herní Engine</label>
                        <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="bn-select">
                            <option value="">-- Vyber hru --</option>
                            {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Rozlišení</label>
                        <div className="res-toggles">
                            {['1080p', '1440p', '2160p'].map(res => (
                                <button key={res} onClick={() => setResolution(res)} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res === '2160p' ? '4K' : res}</button>
                            ))}
                        </div>
                    </div>
                    <div className="toggle-grid">
                        <div className="toggle-row" onClick={() => setEnableUpscaling(!enableUpscaling)}>
                            <div className={`switch ${enableUpscaling ? 'on' : 'off'}`}></div><span>DLSS / FSR</span>
                        </div>
                        <div className="toggle-row" onClick={() => setIsStreaming(!isStreaming)}>
                            <div className={`switch ${isStreaming ? 'on' : 'off'}`}></div><span>OBS Stream</span>
                        </div>
                    </div>
                    <hr className="bn-divider" />
                    <div className="input-group">
                        <label><Cpu size={14} /> CPU</label>
                        <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="bn-select">
                            <option value="">-- Vyber procesor --</option>
                            {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Zap size={14} /> GPU</label>
                        <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="bn-select">
                            <option value="">-- Vyber grafiku --</option>
                            {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleStart} disabled={!selectedCpuId || !selectedGpuId || isCalculating} className="start-btn">
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} />} SPUSTIT SIMULACI
                    </button>
                </div>

                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state"><Crosshair size={64} color="rgba(255,255,255,0.05)" /><p>Nastav hardware a spusť simulaci.</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div className="bound-badge-wrap"><div className={`bound-badge ${a.boundType.toLowerCase().replace('_', '-')}`}>{a.boundType.replace('_', ' ')}</div></div>
                            <div className="pct-value" style={{ color: statusColor }}>{a.bottleneckPercent}%</div>
                            <div className="pct-label" style={{ color: statusColor }}>{a.limitedBy} tě brzdí o {a.bottleneckPercent}%</div>
                            
                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{a.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{a.frameTimeMs}ms</div></div>
                            </div>

                            <div className="affiliate-cta-grid">
                                <div className="affiliate-col">
                                    <div className="aff-title"><Monitor size={14}/> KOUPIT GRAFIKU</div>
                                    <div className="aff-pain">Ztrácíš {a.bottleneckPercent}% výkonu</div>
                                    <a href="#" onClick={(e) => handleHeurekaClick(e, a.gpuName, 'gpu')} className="guru-buy-winner-btn heureka-btn"><ShoppingCart size={16}/> Heureka.cz</a>
                                </div>
                                <div className="affiliate-col">
                                    <div className="aff-title"><Cpu size={14}/> KOUPIT PROCESOR</div>
                                    <div className="aff-pain">CPU brzdí tvůj výkon</div>
                                    <a href="#" onClick={(e) => handleHeurekaClick(e, a.cpuName, 'cpu')} className="guru-buy-winner-btn heureka-btn"><ShoppingCart size={16}/> Heureka.cz</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 GURU TOOLS - CHYBĚJÍCÍ TLAČÍTKA NA KALKULAČKY 🔥 */}
            <div className="guru-tools-nav">
                <a href="/fps-kalkulacka" className="tool-btn fps">
                    <Gamepad2 size={24} /> <span>FPS KALKULAČKA</span>
                </a>
                <a href="/bottleneck-kalkulacka" className="tool-btn bn active">
                    <Activity size={24} /> <span>BOTTLENECK TEST</span>
                </a>
            </div>

            <div style={{ marginTop: '40px' }}><HeurekaButtons isEn={isEn} /></div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { color: #fff; width: 100%; }
                .bn-header { text-align: center; margin-bottom: 50px; }
                .bn-main-title { font-size: 3.5rem; fontWeight: 950; text-transform: uppercase; margin: 10px 0; }
                .bn-sub-title { color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; }
                .pred-badge { display: inline-flex; align-items: center; gap: 10px; color: #a855f7; font-weight: 950; padding: 10px 30px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 20px; font-size: 12px; border: 1px solid rgba(168, 85, 247, 0.2); }
                .bn-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; }
                .bn-inputs-card { background: rgba(255, 255, 255, 0.02); border-radius: 24px; padding: 35px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .bn-select { width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 16px; border-radius: 12px; margin-bottom: 15px; font-weight: 700; }
                .res-toggles { display: flex; gap: 10px; margin-bottom: 15px; }
                .res-btn { flex: 1; padding: 12px; background: #000; border: 1px solid #333; color: #666; border-radius: 10px; font-weight: 900; cursor: pointer; }
                .res-btn.active { border-color: #a855f7; color: #fff; background: rgba(168, 85, 247, 0.1); }
                .start-btn { width: 100%; padding: 20px; background: #a855f7; color: #fff; border: none; border-radius: 15px; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; }
                .bn-result-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 24px; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 500px; }
                .pct-value { font-size: 8rem; font-weight: 950; text-align: center; line-height: 1; }
                .pct-label { text-align: center; font-weight: 900; text-transform: uppercase; margin-top: 10px; }
                .pro-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
                .metric-box { background: #000; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #111; }
                .m-label { font-size: 10px; color: #555; font-weight: 900; margin-bottom: 5px; }
                .m-val { font-size: 24px; font-weight: 950; }
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .affiliate-col { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; text-align: center; }
                .aff-title { font-size: 10px; font-weight: 900; color: #a855f7; margin-bottom: 10px; }
                .aff-pain { font-size: 11px; color: #ef4444; font-weight: 800; margin-bottom: 15px; }
                .heureka-btn { background: #3b82f6; color: #fff; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 5px; }
                .guru-tools-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 40px; }
                .tool-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; border-radius: 15px; text-decoration: none; font-weight: 950; border: 1px solid transparent; transition: 0.3s; }
                .tool-btn.fps { background: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.2); color: #06b6d4; }
                .tool-btn.bn { background: rgba(168, 85, 247, 0.05); border-color: rgba(168, 85, 247, 0.2); color: #a855f7; }
                .tool-btn.active { background: #fff; color: #000; }
                .switch { width: 40px; height: 20px; background: #333; border-radius: 20px; position: relative; }
                .switch.on { background: #a855f7; }
                .switch::after { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: 0.2s; }
                .switch.on::after { left: 22px; }
                .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: #000; border-radius: 10px; margin-top: 10px; border: 1px solid #111; font-size: 12px; font-weight: 800; }
                @media (max-width: 1000px) { .bn-grid { grid-template-columns: 1fr; } .bn-main-title { font-size: 2rem; } }
            `}} />
        </div>
    );
}
