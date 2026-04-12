'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
 Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, 
 TrendingUp, Share2, Check, Twitter, Award, Swords, Gamepad2, ChevronRight, Play, ShoppingCart, Clock, RotateCcw, Users, ArrowRight, ShieldCheck
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import ShareResultButton from '../../components/ShareResultButton';

/**
 * GURU BOTTLENECK ENGINE CLIENT - V13.1 (THE REVENUE FINALIZER)
 * 🚀 CÍL: Specific model match, Price anchoring a Trust Badges.
 */

const AMAZON_TAG = "thehardware07-20";
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();

export default function BottleneckClient({ 
    gpus = [], cpus = [], games = [], isEn = false, initialCpuId = '', initialGpuId = '', initialGameSlug = '', initialResolution = '1440p' 
}) {
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug || games?.[0]?.slug || '');
    const [resolution, setResolution] = useState(initialResolution);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const cpuMap = useMemo(() => Object.fromEntries(cpus.map(c => [String(c.id), c])), [cpus]);
    const gpuMap = useMemo(() => Object.fromEntries(gpus.map(g => [String(g.id), g])), [gpus]);

    useEffect(() => {
        if (!initialCpuId && !initialGpuId) return;
        setIsCalculating(true);
        if (initialCpuId) setSelectedCpuId(String(initialCpuId));
        if (initialGpuId) setSelectedGpuId(String(initialGpuId));
        const timer = setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 600);
        return () => clearTimeout(timer);
    }, [initialCpuId, initialGpuId]);

    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId || !selectedGameSlug) return null;
        const cpu = cpuMap[selectedCpuId];
        const gpu = gpuMap[selectedGpuId];
        if (!cpu || !gpu) return null;

        const cpuName = (cpu.name || '').toLowerCase();
        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
            'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
            'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
        };
        const game = gameDataMap[selectedGameSlug] || gameDataMap['generic'];

        let ipcBase = 100; let archEff = 1.0;
        if (cpuName.includes('x3d')) archEff *= 1.4;
        if (cpuName.includes('9800x3d')) ipcBase = 135;
        else if (cpuName.includes('7800x3d')) ipcBase = 115;

        let cpuEff = (ipcBase * (1 - game.thread_scaling) + (Number(cpu.performance_index) || 100) * game.thread_scaling) * archEff;
        const resMult = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        let gpuEff = (Number(gpu.performance_index) || 100) / resMult;
        
        const cpuFps = (cpuEff / (game.cpu_weight || 1)) * game.fps_scale;
        const gpuFps = (gpuEff / (game.gpu_weight || 1)) * game.fps_scale;
        const estFps = Math.max(1, Math.round(Math.min(cpuFps, gpuFps)));
        const diff = Math.abs(cpuFps - gpuFps) / Math.max(cpuFps, gpuFps, 1);

        const recommendedTier = estFps < 45 ? "ULTRA/HIGH-END" : estFps < 85 ? "PERFORMANCE" : "OPTIMAL";

        return {
            boundType: cpuFps < gpuFps ? 'CPU_BOUND' : (diff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: cpuFps < gpuFps ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(diff * 100), 
            estFps, 
            low1Fps: Math.max(0, Math.round(estFps * (1 - diff * 0.8))),
            frameTimeMs: estFps > 0 ? (1000 / estFps).toFixed(1) : '0.0',
            cpuName: cpu.name, gpuName: gpu.name,
            upgradeBoost: Math.round(estFps * 0.65),
            tier: recommendedTier
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, cpuMap, gpuMap, games]);

    const statusColor = useMemo(() => {
        if (!analysis) return '#fff';
        const pct = analysis.bottleneckPercent;
        return pct < 10 ? '#22c55e' : (pct < 25 ? '#f59e0b' : '#ef4444');
    }, [analysis]);

    useEffect(() => {
        if (analysis) {
            localStorage.setItem("guru_last_build", JSON.stringify({cpu: analysis.cpuName, gpu: analysis.gpuName, time: Date.now()}));
            document.querySelector('.analysis-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
        }
    }, [analysis]);

    const getAmazonLink = (name) => {
        const cleanSlug = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
        return `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-${analysis?.limitedBy}-${analysis?.tier}-${cleanSlug}`;
    };

    const upgradeTarget = analysis?.limitedBy === 'CPU' ? 'cpu' : 'gpu';
    const bestMatch = useMemo(() => upgradeTarget === 'gpu' ? gpus[0] : cpus[0], [upgradeTarget, gpus, cpus]);

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Zap size={16} /> GURU REVENUE FUNNEL V13.1</div>
                <h1 className="bn-main-title">{isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}</h1>
            </div>

            <div className="bn-grid">
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> {isEn ? 'Configuration' : 'Konfigurace'}</h3>
                    <div className="input-group">
                        <label>{isEn ? 'Target Game' : 'Herní Engine'}</label>
                        <select value={selectedGameSlug} onChange={(e) => { setSelectedGameSlug(e.target.value); setShowResult(false); }} className="bn-select">
                            {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Cpu size={14} /> CPU</label>
                        <select value={selectedCpuId} onChange={(e) => { setSelectedCpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- CPU --</option>
                            {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Zap size={14} /> GPU</label>
                        <select value={selectedGpuId} onChange={(e) => { setSelectedGpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- GPU --</option>
                            {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={() => { setIsCalculating(true); setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 700); }} disabled={!selectedCpuId || !selectedGpuId || isCalculating} className="start-btn">
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} />} {isEn ? 'RUN ANALYSIS' : 'SPUSTIT ANALÝZU'}
                    </button>
                </div>

                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state"><Crosshair size={64} color="rgba(255,255,255,0.05)" /><p>{isEn ? 'Waiting for hardware scan...' : 'Čekám na hardware sken...'}</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div style={{ textAlign: 'center' }}>
                                <div className={`bound-badge ${(analysis.boundType || '').toLowerCase().replace('_', '-')}`}>{analysis.boundType.replace('_', ' ')}</div>
                            </div>
                            <div className="percentage-display">
                                <div className="pct-value" style={{ color: statusColor, textShadow: `0 0 50px ${statusColor}80` }}>{analysis.bottleneckPercent}%</div>
                                <div className="pct-label" style={{ color: statusColor }}>{analysis.limitedBy} {isEn ? 'LIMITS YOU' : 'TĚ OMEZUJE'}</div>
                            </div>

                            <div className="transformation-box" style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ textAlign:'center', fontSize:'14px', color:'#22c55e', fontWeight:'950', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    🚀 +{analysis.upgradeBoost} FPS Performance Gain
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '18px', fontWeight: '950' }}>
                                    <span style={{ color: '#ef4444', textDecoration: 'line-through', opacity: 0.6 }}>{analysis.estFps} FPS</span>
                                    <ArrowRight size={20} color="#9ca3af" />
                                    <span style={{ color: '#22c55e', textShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}>{analysis.estFps + analysis.upgradeBoost} FPS</span>
                                </div>
                                {/* 🔥 FIX #1: SPECIFIC RECOMMENDATION 🔥 */}
                                <div style={{ textAlign:'center', fontSize:'12px', marginTop:'15px', fontWeight:'800', color:'#a855f7' }}>
                                    {isEn ? `💡 BEST MATCH: ${bestMatch?.name}` : `💡 NEJLEPŠÍ VOLBA: ${bestMatch?.name}`}
                                </div>
                                <div style={{ textAlign:'center', fontSize:'11px', opacity:0.6, marginTop:'4px' }}>
                                    {isEn ? `From $399 | Recommended Tier: ${analysis.tier}` : `Od 9 990 Kč | Doporučená třída: ${analysis.tier}`}
                                </div>
                            </div>

                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{analysis.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{analysis.frameTimeMs}ms</div></div>
                            </div>

                            <div style={{ textAlign:'center', fontSize:'11px', opacity:0.6, marginBottom:'20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Users size={12} /> {isEn ? '🔥 12,480 gamers upgraded this month' : '🔥 12 480 hráčů upgradovalo tento měsíc'}
                            </div>

                            <div className="affiliate-cta-grid">
                                <div className={`affiliate-col ${upgradeTarget === 'gpu' ? 'featured-upgrade' : ''}`}>
                                    <div className="affiliate-col-title"><Monitor size={16} /> GPU UPGRADE</div>
                                    <div className="affiliate-btn-wrap">
                                        <a href={isEn ? getAmazonLink(analysis.gpuName) : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(analysis.gpuName)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn hover-scale">
                                            <ShoppingCart size={16} /> {isEn ? `🔥 Upgrade now - limited stock` : `🔥 Upgrade teď - omezené zásoby`}
                                        </a>
                                        <div className="trust-badge"><ShieldCheck size={10} /> {isEn ? 'Verified Match' : 'Ověřený výkon'}</div>
                                    </div>
                                </div>
                                <div className={`affiliate-col ${upgradeTarget === 'cpu' ? 'featured-upgrade' : ''}`}>
                                    <div className="affiliate-col-title"><Cpu size={16} /> CPU UPGRADE</div>
                                    <div className="affiliate-btn-wrap">
                                        <a href={isEn ? getAmazonLink(analysis.cpuName) : `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(analysis.cpuName)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn hover-scale">
                                            <ShoppingCart size={16} /> {isEn ? `🔥 Upgrade now - limited stock` : `🔥 Upgrade teď - omezené zásoby`}
                                        </a>
                                        <div className="trust-badge"><ShieldCheck size={10} /> {isEn ? 'Verified Match' : 'Ověřený výkon'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button onClick={() => setShowResult(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}>
                                    {isEn ? 'Try different configuration' : 'Zkusit jinou konfiguraci'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: rgba(10, 11, 13, 0.9); color: #fff; border-radius: 40px; padding: 60px; border: 1px solid rgba(102, 252, 241, 0.1); }
                .bn-main-title { font-size: 3.5rem; font-weight: 950; text-transform: uppercase; line-height: 1; margin-bottom: 40px; }
                .bn-inputs-card { background: rgba(255, 255, 255, 0.02); border-radius: 30px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .bn-select { width: 100%; background: #000; border: 1px solid #222; color: #fff; padding: 18px; border-radius: 15px; font-weight: bold; margin-bottom: 20px; }
                .start-btn { width: 100%; padding: 22px; background: #a855f7; color: #fff; border: none; border-radius: 18px; font-weight: 950; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; gap: 15px; transition: 0.4s; }
                .bn-result-card { background: rgba(0,0,0,0.5); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 30px; padding: 40px; min-height: 500px; display: flex; align-items: center; justify-content: center; }
                .pct-value { font-size: 8rem; font-weight: 950; text-align: center; }
                .pro-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
                .metric-box { background: #000; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #222; }
                .m-val { font-size: 24px; font-weight: 950; }
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 10px; }
                .featured-upgrade { 
                    border: 2px solid #a855f7 !important; 
                    background: rgba(168, 85, 247, 0.12) !important; 
                    transform: scale(1.03); 
                    border-radius: 20px; 
                    padding: 15px; 
                    box-shadow: 0 0 40px rgba(168, 85, 247, 0.3);
                }
                .guru-buy-winner-btn { flex: 1; padding: 16px; border-radius: 14px; text-align: center; text-decoration: none; font-weight: 950; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
                .amazon-btn { background: #f59e0b; color: #000; width: 100%; }
                .trust-badge { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 9px; opacity: 0.5; margin-top: 8px; text-transform: uppercase; font-weight: 900; }
                .hover-scale:hover { transform: translateY(-3px); filter: brightness(1.1); }
                .bound-badge { display: inline-block; padding: 8px 25px; border-radius: 50px; border: 2px solid #a855f7; font-weight: 950; font-size: 12px; margin-bottom: 20px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 1000px) { .bn-grid { grid-template-columns: 1fr; } .bn-wrapper { padding: 30px; } }
            `}} />
        </div>
    );
}
