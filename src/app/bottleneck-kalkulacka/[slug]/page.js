'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { 
 Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, 
 Layers, Gamepad2, Play, Activity, ShoppingCart, Share2, Check, Twitter, Award, Swords, ChevronRight
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import ShareResultButton from '../../components/ShareResultButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel |Ryzen |Core /gi, '').trim();

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
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
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

        const cpuName = cpu.name.toLowerCase();
        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
            'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
            'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
        };
        const game = gameDataMap[baseGame?.slug] || gameDataMap['generic'];

        let ipcBase = 100; let archEfficiency = 1.0;
        if (cpuName.includes('x3d')) archEfficiency *= 1.4;
        let cpuEffective = (ipcBase * (1 - game.thread_scaling) + (Number(cpu.performance_index) || 100) * game.thread_scaling) * archEfficiency;
        if (isStreaming) cpuEffective *= 0.85;

        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        let gpuEffective = (Number(gpu.performance_index) || 100) / resMultiplier;
        if (enableUpscaling) gpuEffective *= 1.3;
        
        const rawCpuFps = (cpuEffective / (game.cpu_weight || 1)) * game.fps_scale;
        const rawGpuFps = (gpuEffective / (game.gpu_weight || 1)) * game.fps_scale;
        const estFps = Math.max(1, Math.round(Math.min(rawCpuFps, rawGpuFps)));
        const diff = Math.abs(rawCpuFps - rawGpuFps) / Math.max(rawCpuFps, rawGpuFps);

        return {
            boundType: rawCpuFps < rawGpuFps ? 'CPU_BOUND' : (diff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: rawCpuFps < rawGpuFps ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(diff * 100), 
            estFps, 
            frameTimeMs: estFps > 0 ? (1000 / estFps).toFixed(1) : '0.0',
            cpuName: cpu.name, gpuName: gpu.name, gameName: baseGame?.name || 'Hra'
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, enableUpscaling, isStreaming, cpus, gpus, games]);

    useEffect(() => {
        if (typeof window === 'undefined' || !analysis) return;
        const cpuSafe = String(analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const gpuSafe = String(analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slugBase = `${cpuSafe}-vs-${gpuSafe}-${selectedGameSlug}-${resolution}`;
        setShareUrl(`https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`);
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isEn]);

    // 🔥 V10 HARD-LOCK REDIRECT LOGIC 🔥
    const handleAffiliateClick = (e, name, type) => {
        e.preventDefault();
        const cleanName = normalizeName(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '+');
        
        if (isEn) {
            window.location.href = `https://www.amazon.com/s?k=${cleanName}&tag=thehardware07-20`;
            return;
        }

        const subId = `v10-bn-${type}`;
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${cleanName}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subId}`;
        
        if (navigator.sendBeacon) {
            const payload = { platform: 'heureka', category: `bn_${type}`, sub_id: subId, page: pathname };
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
                        <label>{isEn ? 'Game Engine' : 'Herní Engine'}</label>
                        <select value={selectedGameSlug} onChange={(e) => { setSelectedGameSlug(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">{isEn ? '-- Select game --' : '-- Vyber hru --'}</option>
                            {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{isEn ? 'Resolution' : 'Rozlišení'}</label>
                        <div className="res-toggles">
                            {['1080p', '1440p', '2160p'].map(res => (
                                <button key={res} onClick={() => { setResolution(res); setShowResult(false); }} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res === '2160p' ? '4K' : res}</button>
                            ))}
                        </div>
                    </div>
                    <div className="toggle-grid">
                        <div className="toggle-row" onClick={() => { setEnableUpscaling(!enableUpscaling); setShowResult(false); }}>
                            <div className={`switch ${enableUpscaling ? 'on' : 'off'}`}></div><span>DLSS / FSR</span>
                        </div>
                        <div className="toggle-row" onClick={() => { setIsStreaming(!isStreaming); setShowResult(false); }}>
                            <div className={`switch ${isStreaming ? 'on' : 'off'}`}></div><span>OBS Stream</span>
                        </div>
                    </div>
                    <hr className="bn-divider" />
                    <div className="input-group">
                        <label><Cpu size={14} /> CPU</label>
                        <select value={selectedCpuId} onChange={(e) => { setSelectedCpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">{isEn ? '-- Select processor --' : '-- Vyber procesor --'}</option>
                            {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Zap size={14} /> GPU</label>
                        <select value={selectedGpuId} onChange={(e) => { setSelectedGpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">{isEn ? '-- Select graphics --' : '-- Vyber grafiku --'}</option>
                            {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleStart} disabled={!selectedCpuId || !selectedGpuId || !selectedGameSlug || isCalculating} className="start-btn">
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} />} {isEn ? 'START SIMULATION' : 'SPUSTIT SIMULACI'}
                    </button>
                    {analysis && (
                        <div style={{ marginTop: '20px' }}>
                            <ShareResultButton cpu={a.cpuName} gpu={a.gpuName} resolution={resolution} bottleneck={`${a.bottleneckPercent} %`} score={100 - a.bottleneckPercent} isEn={isEn} />
                        </div>
                    )}
                </div>

                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state"><Crosshair size={64} color="rgba(255,255,255,0.05)" /><p>{isEn ? 'Select hardware and start simulation.' : 'Nastav hardware a spusť simulaci.'}</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div style={{ textAlign: 'center' }}><div className={`bound-badge ${a.boundType.toLowerCase().replace('_', '-')}`}>{a.boundType.replace('_', ' ')}</div></div>
                            <div className="percentage-display">
                                <div className="pct-value" style={{ color: statusColor }}>{a.bottleneckPercent}%</div>
                                <div className="pct-label" style={{ color: statusColor }}>{a.limitedBy} {isEn ? 'bottlenecks you by' : 'tě brzdí o'} {a.bottleneckPercent}%</div>
                            </div>
                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{a.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{a.frameTimeMs}ms</div></div>
                            </div>
                            
                            <div className="affiliate-cta-grid" style={{ marginTop: '30px' }}>
                                <div className="affiliate-col">
                                    <div className="aff-title"><Monitor size={14}/> {isEn ? 'BUY GPU' : 'KOUPIT GRAFIKU'}</div>
                                    <a href="#" onClick={(e) => handleAffiliateClick(e, a.gpuName, 'gpu')} className={`guru-buy-winner-btn ${isEn ? 'amazon-btn' : 'heureka-btn'}`}>
                                        <ShoppingCart size={16}/> {isEn ? 'Amazon' : 'Heureka.cz'}
                                    </a>
                                </div>
                                <div className="affiliate-col">
                                    <div className="aff-title"><Cpu size={14}/> {isEn ? 'BUY CPU' : 'KOUPIT PROCESOR'}</div>
                                    <a href="#" onClick={(e) => handleAffiliateClick(e, a.cpuName, 'cpu')} className={`guru-buy-winner-btn ${isEn ? 'amazon-btn' : 'heureka-btn'}`}>
                                        <ShoppingCart size={16}/> {isEn ? 'Amazon' : 'Heureka.cz'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 GURU TOOLS - PŘEPÍNACÍ TLAČÍTKA 🔥 */}
            <div className="guru-tools-nav" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
                <a href="/fps-kalkulacka" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <Gamepad2 size={24} color="#06b6d4" />
                    <span style={{ fontSize: '16px', fontWeight: '950', color: '#fff' }}>FPS KALKULAČKA</span>
                </a>
                <a href="/bottleneck-kalkulacka" style={{ background: '#fff', border: '1px solid #a855f7', padding: '20px', borderRadius: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <Activity size={24} color="#000" />
                    <span style={{ fontSize: '16px', fontWeight: '950', color: '#000' }}>BOTTLENECK TEST</span>
                </a>
            </div>

            <div style={{ marginTop: '40px' }}><HeurekaButtons isEn={isEn} /></div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { color: #fff; width: 100%; }
                .bn-header { text-align: center; margin-bottom: 50px; }
                .bn-main-title { font-size: 3.5rem; font-weight: 950; text-transform: uppercase; margin: 10px 0; }
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
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
                .affiliate-col { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; }
                .aff-title { font-size: 10px; font-weight: 900; color: #a855f7; margin-bottom: 10px; }
                .guru-buy-winner-btn { width: 100%; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 5px; }
                .heureka-btn { background: #3b82f6; color: #fff; }
                .amazon-btn { background: #f59e0b; color: #000; }
                .switch { width: 40px; height: 20px; background: #333; border-radius: 20px; position: relative; }
                .switch.on { background: #a855f7; }
                .switch::after { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: 0.2s; }
                .switch.on::after { left: 22px; }
                .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: #000; border-radius: 10px; margin-top: 10px; border: 1px solid #111; font-size: 12px; font-weight: 800; }
                .bound-badge { display: inline-block; padding: 8px 20px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
                @media (max-width: 1000px) { .bn-grid { grid-template-columns: 1fr; } .bn-main-title { font-size: 2rem; } }
            `}} />
        </div>
    );
}
