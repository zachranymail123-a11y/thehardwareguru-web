'use client';

import React, { useState, useMemo } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SeznamAd from '../../components/SeznamAd';

/**
 * GURU FPS ENGINE CLIENT - V11.4 (ALGORITHMIC FIX)
 * 🚀 CÍL: Nahrazení hardcoded "145 FPS" reálným AI výpočtem.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function FpsCalculatorClient({ gpus = [], cpus = [], games = [], isEn = false }) {
    const [selectedGameSlug, setSelectedGameSlug] = useState('');
    const [selectedRes, setSelectedRes] = useState('1440p');
    const [selectedGpuId, setSelectedGpuId] = useState('');
    const [selectedCpuId, setSelectedCpuId] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const getGtaUrl = (res) => {
        const cpuName = cpus.find(c => c.id === selectedCpuId)?.name || 'cpu';
        const gpuName = gpus.find(g => g.id === selectedGpuId)?.name || 'gpu';
        const cleanCpu = cpuName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanGpu = gpuName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const basePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
        return `https://thehardwareguru.cz${basePath}/${cleanCpu}-vs-${cleanGpu}-${res}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
    };

    // 🚀 GURU AI ENGINE: Analýza dat z databáze a výpočet reálných FPS
    const performCalculation = () => {
        const cpu = Array.isArray(cpus) ? cpus.find(c => String(c.id) === String(selectedCpuId)) : null;
        const gpu = Array.isArray(gpus) ? gpus.find(g => String(g.id) === String(selectedGpuId)) : null;
        const game = Array.isArray(games) ? games.find(g => String(g.slug) === String(selectedGameSlug)) : null;

        if (!cpu || !gpu || !game) return null;

        const cpuName = String(cpu.name || '').toLowerCase();

        // Profily her (stejné jako v Bottleneck Kalkulačce)
        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
            'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
            'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
        };
        
        const gData = gameDataMap[game.slug] || gameDataMap['generic'];

        let ipcBase = 100; 
        let archEfficiency = 1.0;
        if (cpuName.includes('x3d')) archEfficiency *= 1.4;
        if (cpuName.includes('9800x3d')) ipcBase = 135;
        else if (cpuName.includes('7800x3d')) ipcBase = 115;

        const cpuEffective = (ipcBase * (1 - gData.thread_scaling) + (Number(cpu.performance_index) || 100) * gData.thread_scaling) * archEfficiency;
        
        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[selectedRes] || 1.5;
        const gpuEffective = (Number(gpu.performance_index) || 100) / resMultiplier;
        
        const rawCpuFps = (cpuEffective / (gData.cpu_weight || 1)) * gData.fps_scale;
        const rawGpuFps = (gpuEffective / (gData.gpu_weight || 1)) * gData.fps_scale;

        // Vypočtené FPS je limitováno nejslabším článkem (CPU nebo GPU)
        const estFps = Math.max(1, Math.round(Math.min(rawCpuFps, rawGpuFps)));
        
        return { fps: estFps, confidence: 0.95 };
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            const calculatedResult = performCalculation();
            if(calculatedResult) {
               setResult(calculatedResult);
            } else {
               setResult({ fps: 0, confidence: 0 }); // Fallback pro chybu 
            }
            setIsCalculating(false);
        }, 800);
    };

    const getGtaPredictionPath = (targetRes) => getGtaUrl(targetRes).replace('https://thehardwareguru.cz', '');

    return (
        <div className="guru-calc-box">
            <div className="guru-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="input-field">
                    <label><Gamepad2 size={14} /> {isEn ? 'GAME' : 'HRA'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p Full HD</option>
                        <option value="1440p">1440p Quad HD</option>
                        <option value="2160p">4K Ultra HD</option>
                    </select>
                </div>
                <div className="input-field">
                    <label><Zap size={14} /> GPU</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label><Cpu size={14} /> CPU</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={!selectedGpuId || !selectedCpuId || !selectedGameSlug || isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    {isEn ? 'CALCULATE' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="result-area" style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.7s ease-out' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'EXPECTED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}</div>
                    <div className="fps-value" style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '15px 0' }}>{result.fps} FPS</div>

                    {/* 🔥 SEZNAM AD: GURU MONETIZATION ENGINE (STRIKTNÍ SEPARACE) */}
                    <div style={{ margin: '30px 0' }}>
                        <div className="ad-desktop-wrapper">
                            <SeznamAd zoneId={408658} width={480} height={300} />
                        </div>
                        <div className="ad-mobile-wrapper">
                            <SeznamAd zoneId={408651} width={300} height={250} />
                        </div>
                    </div>

                    <div className="viral-flex-card">
                        <div className="award-icon"><Award size={32} color="#fff" /></div>
                        <div className="viral-text-box">
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{isEn ? 'ACHIEVEMENT LOCKED' : 'ÚSPĚCH ODEMČEN'}</div>
                            <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>{isEn ? 'Share your result' : 'Pochlub se výsledkem'}</div>
                        </div>
                        <div className="viral-btns" style={{ display: 'flex', gap: '10px' }}>
                            <button className="premium-share-btn btn-copy"><Share2 size={20} /></button>
                            <button className="premium-share-btn btn-x"><Twitter size={20} /></button>
                        </div>
                    </div>

                    <div className="gta-hype-box" style={{ marginTop: '30px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase' }}><Sparkles size={14} /> GTA VI PREDICTOR</span>
                        <h3 className="gta-title" style={{ fontSize: '20px', fontWeight: '950', marginTop: '10px', color: '#fff' }}>{isEn ? 'Will this rig run GTA VI?' : 'Rozjede tohle železo GTA VI?'}</h3>
                        <div className="gta-res-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
                            <a href={getGtaPredictionPath('1080p')} className="gta-res-btn">1080p</a>
                            <a href={getGtaPredictionPath('1440p')} className="gta-res-btn">1440p</a>
                            <a href={getGtaPredictionPath('2160p')} className="gta-res-btn">4K</a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; cursor: pointer; }
                .input-field label { display: block; margin-bottom: 10px; font-size: 11px; font-weight: 950; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }

                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 520px; margin: 40px auto 0; padding: 25px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; text-align: left; }
                .premium-share-btn { width: 48px; height: 48px; border-radius: 12px; cursor: pointer; border: none; color: #fff; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .premium-share-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }
                .btn-copy { background: #a855f7; }

                .gta-hype-box { max-width: 520px; margin: 0 auto; background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 20px; padding: 25px; }
                .gta-res-btn { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); padding: 12px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; text-align: center; }
                .gta-res-btn:hover { background: #f43f5e; transform: translateY(-2px); }

                /* 🚀 RESPONSIVE ADS SYSTEM */
                .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
                .ad-mobile-wrapper { display: none; width: 100%; }

                @media (max-width: 768px) { 
                    .guru-calc-box { padding: 20px !important; border-radius: 20px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .fps-value { font-size: 3.5rem !important; }
                    .viral-flex-card { flex-direction: column; text-align: center; gap: 15px; }
                    .viral-btns { width: 100%; justify-content: center; gap: 15px !important; }
                    .gta-res-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
                    .calc-btn { width: 100%; justify-content: center; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
