'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
 Cpu, Monitor, Zap, Settings2, Sparkles, 
 Play, ShoppingCart, ShieldCheck, Crosshair, Users, TrendingUp, Clock, Share2
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE CLIENT - V14.1 (THE REVENUE & VIRAL UNIFIER)
 * 🚀 CÍL: Sjednotit CZ/EN verzi, fixnout "empty" EN stav a vrátit sdílení.
 */

const AMAZON_TAG = "thehardware07-20";

const encodeHeureka = (name = '') => {
    const safe = String(name || '');
    const clean = safe.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim().replace(/\s+/g, '+');
};

export default function BottleneckClient({ 
    gpus = [], cpus = [], games = [], isEn = false, initialCpuId = '', initialGpuId = ''
}) {
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const cpuMap = useMemo(() => Object.fromEntries(cpus.map(c => [String(c.id), c])), [cpus]);
    const gpuMap = useMemo(() => Object.fromEntries(gpus.map(g => [String(g.id), g])), [gpus]);

    useEffect(() => {
        if (initialCpuId || initialGpuId) {
            setIsCalculating(true);
            const timer = setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 600);
            return () => clearTimeout(timer);
        }
    }, [initialCpuId, initialGpuId]);

    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId) return null;
        const cpu = cpuMap[selectedCpuId];
        const gpu = gpuMap[selectedGpuId];
        if (!cpu || !gpu) return null;

        const cpuPerf = Number(cpu.performance_index) || 100;
        const gpuPerf = Number(gpu.performance_index) || 100;

        const normalizedCpu = cpuPerf * 2.9;
        const isCpuBottleneck = gpuPerf > normalizedCpu;
        const diff = Math.abs(gpuPerf - normalizedCpu) / Math.max(gpuPerf, normalizedCpu, 1);
        const percentage = Math.max(0, Math.min(Math.round(diff * 100), 100));

        // 🔥 Dynamický výběr upgradu (+25% výkonu)
        const upgradeGpu = gpus.find(g => g.performance_index > gpuPerf * 1.25) || gpus[0];
        const upgradeCpu = cpus.find(c => c.performance_index > cpuPerf * 1.25) || cpus[0];

        return {
            percentage,
            type: percentage < 15 ? 'Balanced' : (isCpuBottleneck ? 'CPU' : 'GPU'),
            cpu, gpu, upgradeGpu, upgradeCpu,
            afterFps: Math.round(60 * (1 + (percentage / 100) + 0.2))
        };
    }, [showResult, selectedCpuId, selectedGpuId, cpuMap, gpuMap, gpus, cpus]);

    const getAmazonLink = (name) => {
        const q = encodeURIComponent(`${name} buy now best price deal gaming fps benchmark`);
        return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=bn-hub`;
    };

    const getHeurekaLink = (name, cat) => {
        const q = encodeHeureka(name);
        return `https://${cat}.heureka.cz/f:q:${q}/?utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842`;
    };

    const getSmartyLink = (name) => {
        const q = encodeURIComponent(String(name || '').replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim());
        return `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${q}`)}`;
    };

    return (
        <div className="bn-wrapper" style={{ color: '#fff', fontFamily: 'sans-serif' }}>
            <div className="bn-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ color: '#66fcf1', fontSize: '11px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '3px', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(102,252,241,0.3)', padding: '6px 20px', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
                    <Zap size={14} /> GURU REVENUE ENGINE V14.1
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 950, textTransform: 'uppercase', marginTop: '20px' }}>
                    {isEn ? 'Bottleneck Analysis' : 'Bottleneck Analýza'}
                </h1>
            </div>

            <div className="bn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* INPUTS */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', opacity: 0.7, fontSize: '14px', fontWeight: 700 }}>
                        <Settings2 size={18} /> {isEn ? 'Configuration' : 'Konfigurace'}
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, marginBottom: '8px', opacity: 0.5 }}>CPU</label>
                        <select value={selectedCpuId} onChange={e => { setSelectedCpuId(e.target.value); setShowResult(false); }} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>
                            <option value="">-- CPU --</option>
                            {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, marginBottom: '8px', opacity: 0.5 }}>GPU</label>
                        <select value={selectedGpuId} onChange={e => { setSelectedGpuId(e.target.value); setShowResult(false); }} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>
                            <option value="">-- GPU --</option>
                            {gpus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <button onClick={() => { setIsCalculating(true); setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 700); }} disabled={!selectedCpuId || !selectedGpuId || isCalculating} style={{ width: '100%', padding: '18px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}>
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} fill="currentColor" />} {isEn ? 'RUN ANALYSIS' : 'SPUSTIT ANALÝZU'}
                    </button>
                </div>

                {/* RESULT DISPLAY */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {analysis ? (
                        <>
                            <div style={{ fontSize: '72px', fontWeight: 950, color: analysis.percentage > 20 ? '#ef4444' : '#22c55e', lineHeight: 1 }}>{analysis.percentage}%</div>
                            <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', color: analysis.percentage > 20 ? '#ef4444' : '#22c55e', marginTop: '10px', letterSpacing: '2px' }}>
                                {analysis.type} {isEn ? 'BOTTLENECK' : 'LIMITACE'}
                            </div>
                            
                            {/* 🔥 SHARE BUTTON (VIRAL LOOP) */}
                            <div style={{ marginTop: '20px' }}>
                                <button 
                                    onClick={() => {
                                        const text = isEn ? `Check my PC Bottleneck result: ${analysis.percentage}%!` : `Moje PC má ${analysis.percentage}% bottleneck! Koukni sem:`;
                                        const url = window.location.href;
                                        if (navigator.share) navigator.share({ title: 'Hardware Guru', text, url });
                                        else { navigator.clipboard.writeText(url); alert(isEn ? 'Link copied!' : 'Odkaz zkopírován!'); }
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '8px 20px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Share2 size={14} /> {isEn ? 'SHARE RESULT' : 'SDÍLET VÝSLEDEK'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ opacity: 0.3 }}>
                            <Crosshair size={64} strokeWidth={1} style={{ marginBottom: '20px' }} />
                            <div style={{ fontSize: '13px' }}>{isEn ? 'Select hardware to begin' : 'Vyber hardware pro analýzu'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 AGGRESIVNÍ AFFILIATE BLOKY */}
            {analysis && (
                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '40px auto 0' }}>
                    
                    {/* GPU UPGRADE */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '28px', padding: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '20px' }}>
                            <Monitor size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {isEn ? 'GPU UPGRADE' : 'UPGRADE GRAFIKY'}
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '8px' }}>{isEn ? 'From $499' : 'Guru cena od 11 990 Kč'}</div>
                        <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 900, marginBottom: '4px' }}>📉 {isEn ? `Losing up to ${analysis.percentage}% FPS` : `Ztrácíš až ${analysis.percentage}% výkonu`}</div>
                        <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', marginBottom: '15px' }}>
                             🚀 60 FPS → {analysis.afterFps} FPS {isEn ? 'boost' : 'po upgradu'}
                        </div>
                        <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '20px' }}>🔥 {analysis.upgradeGpu.name}</div>
                        <a href={isEn ? getAmazonLink(analysis.upgradeGpu.name) : getHeurekaLink(analysis.upgradeGpu.name, 'graficke-karty')} target="_blank" rel="nofollow sponsored" style={{ background: isEn ? '#f59e0b' : '#3b82f6', color: isEn ? '#000' : '#fff', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', textTransform: 'uppercase' }}>
                            {isEn ? 'AMAZON DEALS' : 'NAJÍT NEJLEVNĚJŠÍ CENU'}
                        </a>
                        {!isEn && (
                            <a href={getSmartyLink(analysis.upgradeGpu.name)} target="_blank" rel="nofollow" style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
                        )}
                    </div>

                    {/* CPU UPGRADE */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '28px', padding: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ color: '#a855f7', fontWeight: 950, fontSize: '13px', textTransform: 'uppercase', marginBottom: '20px' }}>
                            <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {isEn ? 'CPU UPGRADE' : 'UPGRADE PROCESORU'}
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '8px' }}>{isEn ? 'From $299' : 'Guru cena od 6 490 Kč'}</div>
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 900, marginBottom: '4px' }}>⚠️ {isEn ? 'CPU is limiting your build' : 'Procesor brzdí tvou grafiku'}</div>
                        <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px', fontWeight: 900, width: '100%', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', marginBottom: '15px' }}>
                             🚀 {isEn ? '+35% smoother gameplay' : '+35% plynulejší hraní'}
                        </div>
                        <div style={{ fontWeight: 900, color: '#a855f7', marginBottom: '20px' }}>🔥 {analysis.upgradeCpu.name}</div>
                        <a href={isEn ? getAmazonLink(analysis.upgradeCpu.name) : getHeurekaLink(analysis.upgradeCpu.name, 'procesory')} target="_blank" rel="nofollow sponsored" style={{ background: isEn ? '#f59e0b' : '#3b82f6', color: isEn ? '#000' : '#fff', padding: '18px', borderRadius: '14px', textDecoration: 'none', fontWeight: 950, width: '100%', textAlign: 'center', textTransform: 'uppercase' }}>
                            {isEn ? 'AMAZON DEALS' : 'NAJÍT NEJLEVNĚJŠÍ CENU'}
                        </a>
                        {!isEn && (
                            <a href={getSmartyLink(analysis.upgradeCpu.name)} target="_blank" rel="nofollow" style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>Koupit na Smarty.cz</a>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 800px) { .bn-grid { grid-template-columns: 1fr !important; } }
            `}} />
        </div>
    );
}
