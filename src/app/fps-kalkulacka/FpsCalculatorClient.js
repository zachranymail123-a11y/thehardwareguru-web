'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE V7.1 (ULTIMATE CALIBRATION & GTA VI RESTORE)
 * 🛡️ BASELINE: RTX 4090 + 9850X3D = 325 (1080p) / 318 (1440p) / 242 (4K).
 * 🛡️ FIX: Znovu přidány GTA VI predikce a kompletní SEO linkování.
 * 🛡️ FIX: Vylepšený Dark Mode pro SELECTY a OPTIONY.
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
    const [copied, setCopied] = useState(false);

    // 🔥 GURU FPS ENGINE V7.1 - KALIBRACE PODLE TVÝCH DAT
    const calculateFps = (gpuPerf, cpuPerf, resolution) => {
        // RTX 4090 + 9850X3D (Perf Index 100/100) -> Baseline 318 FPS na 1440p
        let base = 318;
        const resScale = {
            '1080p': 1.022,    // Výsledek 325 FPS
            '1440p': 1.0,      // Výsledek 318 FPS
            'uwqhd': 0.88,     // Ultrawide odhad
            '2160p': 0.761,    // Výsledek 242 FPS
            'dqhd': 0.62       // Super Ultrawide odhad
        };

        const scale = resScale[resolution] || 1.0;
        // Výpočet zohledňující brutální GPU výkon (4090 = 100 perf index)
        let rawFps = base * (gpuPerf / 100) * scale;
        
        // Změna vlivu CPU (u her jako Callisto je vliv menší u highendu)
        const cpuFactor = cpuPerf / 100;
        rawFps = (rawFps * 0.8) + (rawFps * 0.2 * cpuFactor);

        return Math.round(rawFps);
    };

    const getGtaPath = (res) => {
        const cpu = cpus.find(c => c.id === selectedCpuId)?.name || 'cpu';
        const gpu = gpus.find(g => g.id === selectedGpuId)?.name || 'gpu';
        const slug = `${cpu}-vs-${gpu}-${res}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return isEn ? `/en/fps-calculator/gta-6-prediction/${slug}` : `/fps-kalkulacka/gta-6-predikce/${slug}`;
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        const gpu = gpus.find(g => g.id === selectedGpuId);
        const cpu = cpus.find(c => c.id === selectedCpuId);
        
        // Pokud DB nemá performance_index, dáváme 100 (aby 4090 jela naplno)
        const gpuPerf = gpu?.performance_index || 100;
        const cpuPerf = cpu?.performance_index || 100;

        const finalFps = calculateFps(gpuPerf, cpuPerf, selectedRes);
        
        setTimeout(() => {
            setResult({ fps: finalFps });
            setIsCalculating(false);
        }, 800);
    };

    return (
        <div className="guru-calc-box">
            <div className="guru-grid">
                <div className="input-field">
                    <label><Gamepad2 size={14} /> {isEn ? 'GAME' : 'HRA'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(g => <option key={g.id} value={g.slug} style={{background: '#0a0b0d'}}>{g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1920x1080 (Full HD)</option>
                        <option value="1440p">2560x1440 (QHD)</option>
                        <option value="uwqhd">3440x1440 (Ultrawide)</option>
                        <option value="2160p">3840x2160 (4K Ultra)</option>
                        <option value="dqhd">5120x1440 (Super UW)</option>
                    </select>
                </div>
                <div className="input-field">
                    <label><Zap size={14} /> GPU</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id} style={{background: '#0a0b0d'}}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label><Cpu size={14} /> CPU</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id} style={{background: '#0a0b0d'}}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    {isEn ? 'CALCULATE' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && (
                <div className="result-area">
                    <div className="res-label">{isEn ? 'GURU FPS PREDICTION' : 'GURU ODHAD VÝKONU'}</div>
                    <div className="fps-val">{result.fps} FPS</div>
                    
                    <div className="gta-bait-box">
                        <div className="gta-tag"><Sparkles size={14} /> NEXT-GEN AI</div>
                        <h3>{isEn ? 'RUN GTA VI ON THIS RIG?' : 'POJEDE TI NA TOM GTA VI?'}</h3>
                        <div className="gta-links">
                            <a href={getGtaPath('1080p')}>1080p <ArrowRight size={14}/></a>
                            <a href={getGtaPath('1440p')}>1440p <ArrowRight size={14}/></a>
                            <a href={getGtaPath('2160p')}>4K <ArrowRight size={14}/></a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.98); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; }
                .guru-select { width: 100%; background: #0a0b0d !important; color: #fff !important; border: 1px solid #1f2937; padding: 15px; border-radius: 12px; font-weight: 950; cursor: pointer; }
                .calc-btn { background: #f43f5e; color: #fff; border: none; padding: 20px 60px; font-size: 16px; font-weight: 950; border-radius: 16px; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; }
                .calc-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(244, 63, 94, 0.4); }
                .result-area { margin-top: 40px; animation: fadeIn 0.5s ease-out; }
                .res-label { font-size: 12px; color: #f43f5e; font-weight: 950; letter-spacing: 2px; }
                .fps-val { font-size: 7rem; font-weight: 950; color: #fff; margin: 10px 0; text-shadow: 0 0 40px rgba(244, 63, 94, 0.3); }
                .gta-bait-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(0,0,0,0.5)); border: 1px solid rgba(244, 63, 94, 0.3); padding: 30px; border-radius: 24px; margin-top: 40px; }
                .gta-tag { display: inline-flex; align-items: center; gap: 6px; background: #f43f5e; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 950; margin-bottom: 15px; }
                .gta-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
                .gta-links a { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
                .gta-links a:hover { background: #f43f5e; border-color: #f43f5e; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
