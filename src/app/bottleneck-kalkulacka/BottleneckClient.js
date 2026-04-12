'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
 Cpu, Monitor, Zap, Settings2, Sparkles, 
 Play, ShoppingCart, ArrowRight, ShieldCheck, Crosshair, Users
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE CLIENT - V13.2 (AFFILIATE SNIPER EDITION)
 * 🚀 CÍL: Fix Heureka encodingu, tracking hygiene a deep-category matching.
 */

const AMAZON_TAG = "thehardware07-20";

// 🔥 FIX: Čistý encoding pro Heureku (mezery na pluska pro kategorii f:q:)
const encodeHeureka = (name = '') => {
    return name
        .replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '')
        .trim()
        .replace(/\s+/g, '+');
};

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

        const resMult = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        const cpuPerf = Number(cpu.performance_index) || 100;
        const gpuPerf = Number(gpu.performance_index) || 100;

        const cpuFps = cpuPerf * 1.2;
        const gpuFps = gpuPerf / resMult;
        const estFps = Math.max(1, Math.round(Math.min(cpuFps, gpuFps)));
        const diff = Math.abs(cpuFps - gpuFps) / Math.max(cpuFps, gpuFps, 1);

        return {
            boundType: cpuFps < gpuFps ? 'CPU_BOUND' : (diff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: cpuFps < gpuFps ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(diff * 100), 
            estFps, 
            frameTimeMs: (1000 / estFps).toFixed(1),
            cpuName: cpu.name, gpuName: gpu.name,
            upgradeBoost: Math.round(estFps * 0.65),
            tier: estFps < 60 ? "HIGH-END" : "OPTIMAL"
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, cpuMap, gpuMap]);

    const statusColor = useMemo(() => {
        if (!analysis) return '#fff';
        const pct = analysis.bottleneckPercent;
        return pct < 10 ? '#22c55e' : (pct < 25 ? '#f59e0b' : '#ef4444');
    }, [analysis]);

    // 🔥 AFFILIATE LINK GENERATORS 🔥
    const getAmazonLink = (name) => {
        const query = `${name} gaming upgrade buy best price`;
        return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-hub`;
    };

    const getHeurekaGpuLink = (name) => {
        const q = encodeHeureka(name);
        return `https://graficke-karty.heureka.cz/f:q:${q}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
    };

    const getHeurekaCpuLink = (name) => {
        const q = encodeHeureka(name);
        // 🔥 Přidán parametr h[fraze] pro vynucení relevance v kategorii
        return `https://procesory.heureka.cz/f:q:${q}/?h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
    };

    const getSmartyLink = (name) => {
        const q = name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();
        return `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(q)}`)}`;
    };

    const upgradeTarget = analysis?.limitedBy === 'CPU' ? 'cpu' : 'gpu';

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Zap size={16} /> GURU REVENUE ENGINE V13.2</div>
                <h1 className="bn-main-title">{isEn ? 'Bottleneck Analysis' : 'Bottleneck Analýza'}</h1>
            </div>

            <div className="bn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> {isEn ? 'Configuration' : 'Konfigurace'}</h3>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label>CPU</label>
                        <select value={selectedCpuId} onChange={(e) => { setSelectedCpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- CPU --</option>
                            {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label>GPU</label>
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
                        <div className="empty-state" style={{ textAlign: 'center', opacity: 0.3 }}><Crosshair size={64} /><p>{isEn ? 'Select hardware to begin' : 'Vyber hardware pro analýzu'}</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div className="percentage-display" style={{ textAlign: 'center' }}>
                                <div className="pct-value" style={{ color: statusColor, fontSize: '5rem', fontWeight: 950 }}>{analysis.bottleneckPercent}%</div>
                                <div className="pct-label" style={{ color: statusColor, fontWeight: 800 }}>{analysis.limitedBy} {isEn ? 'BOTTLENECK' : 'LIMITACE'}</div>
                            </div>

                            <div className="affiliate-cta-grid" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* 🔥 DYNAMICKÁ DOPORUČENÁ SEKCE 🔥 */}
                                <div className="upgrade-box" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '2px solid #a855f7', padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 950, color: '#a855f7', marginBottom: '10px' }}>TOP RECOMMENDATION</div>
                                    
                                    {upgradeTarget === 'gpu' ? (
                                        <>
                                            <div style={{ fontWeight: 900, marginBottom: '15px' }}>{analysis.gpuName}</div>
                                            <a href={isEn ? getAmazonLink(analysis.gpuName) : getHeurekaGpuLink(analysis.gpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn" style={{ background: '#f59e0b', color: '#000', width: '100%', padding: '15px', borderRadius: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'center', gap: '10px', fontWeight: 950 }}>
                                                <ShoppingCart size={18} /> {isEn ? 'Find Best GPU Price' : 'Najít nejlepší cenu GPU'}
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: 900, marginBottom: '15px' }}>{analysis.cpuName}</div>
                                            <a href={isEn ? getAmazonLink(analysis.cpuName) : getHeurekaCpuLink(analysis.cpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn" style={{ background: '#f59e0b', color: '#000', width: '100%', padding: '15px', borderRadius: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'center', gap: '10px', fontWeight: 950 }}>
                                                <ShoppingCart size={18} /> {isEn ? 'Find Best CPU Price' : 'Najít nejlepší cenu CPU'}
                                            </a>
                                        </>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', opacity: 0.6, marginTop: '10px', justifyContent: 'center' }}>
                                        <ShieldCheck size={12} /> {isEn ? 'Verified Store Matching' : 'Ověřené párování s e-shopy'}
                                    </div>
                                </div>

                                {/* SEKUNDÁRNÍ LINK NA SMARTY */}
                                {!isEn && (
                                    <a href={getSmartyLink(upgradeTarget === 'gpu' ? analysis.gpuName : analysis.cpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', textDecoration: 'underline' }}>
                                        Koupit na Smarty.cz
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: rgba(10, 11, 13, 0.9); border-radius: 30px; padding: 40px; border: 1px solid rgba(168, 85, 247, 0.1); }
                .bn-main-title { font-size: 2.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; }
                .bn-inputs-card { background: rgba(255, 255, 255, 0.02); border-radius: 24px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .bn-select { width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 15px; border-radius: 12px; font-weight: bold; }
                .start-btn { width: 100%; padding: 18px; background: #a855f7; color: #fff; border: none; border-radius: 12px; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
                .start-btn:hover { background: #9333ea; transform: translateY(-2px); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 800px) { .bn-grid { grid-template-columns: 1fr !important; } }
            `}} />
        </div>
    );
}
