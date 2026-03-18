'use client';

import React, { useState } from 'react';
import { 
  Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, 
  Twitter, Sparkles, ArrowRight, Facebook 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE V7.6 (THE EXPEDITION 33 CALIBRATION)
 * 🛡️ BASELINE 1 (Callisto): 325 / 318 / 242 (Light/CPU Bound)
 * 🛡️ BASELINE 2 (RE Requiem): 239 / 183 / 110 (Medium)
 * 🛡️ BASELINE 3 (Expedition 33): 100 / 71 / 57 (Extreme/Next-Gen)
 * 🛡️ FIX: Dynamické koeficienty pro 3 stupně náročnosti her.
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

    // 🔥 GURU DYNAMIC ENGINE V7.6
    const calculateFps = (gpuPerf, cpuPerf, resolution, gameSlug) => {
        const slug = gameSlug.toLowerCase();
        
        // 1. URČENÍ KATEGORIE NÁROČNOSTI (BASELINE)
        let category = 'medium';
        if (slug.includes('callisto') || slug.includes('valorant') || slug.includes('counter-strike') || slug.includes('roblox')) {
            category = 'light';
        } else if (slug.includes('expedition') || slug.includes('alan-wake') || slug.includes('cyberpunk') || slug.includes('gta-6')) {
            category = 'extreme';
        }

        // 2. NASTAVENÍ BASELINE PODLE TVÝCH MĚŘENÍ (RTX 4090 @ 1440p)
        const baselines = {
            'light': 318,
            'medium': 183,
            'extreme': 71
        };
        let base = baselines[category];

        // 3. NASTAVENÍ PROPADU VÝKONU (RESOLUTION SCALING)
        const resScales = {
            'light': { '1080p': 1.022, '1440p': 1.0, 'uwqhd': 0.88, '2160p': 0.761, 'dqhd': 0.65 },
            'medium': { '1080p': 1.306, '1440p': 1.0, 'uwqhd': 0.78, '2160p': 0.601, 'dqhd': 0.52 },
            'extreme': { '1080p': 1.408, '1440p': 1.0, 'uwqhd': 0.85, '2160p': 0.802, 'dqhd': 0.70 } // 100/71 a 57/71
        };

        const scale = resScales[category][resolution] || 1.0;
        let rawFps = base * (gpuPerf / 100) * scale;
        
        // 4. CPU VLIV (U extreme her je karta tak udušená, že procesor skoro nic neřeší)
        const cpuWeight = category === 'extreme' ? 0.05 : (category === 'medium' ? 0.15 : 0.30);
        const cpuFactor = cpuPerf / 100;
        rawFps = (rawFps * (1 - cpuWeight)) + (rawFps * cpuWeight * cpuFactor);

        return Math.round(rawFps);
    };

    const getGtaUrl = (res) => {
        const cpu = cpus.find(c => c.id === selectedCpuId)?.name || 'cpu';
        const gpu = gpus.find(g => g.id === selectedGpuId)?.name || 'gpu';
        const slug = `${cpu}-vs-${gpu}-${res}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const basePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
        return `${basePath}/${slug}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        const gpu = gpus.find(g => g.id === selectedGpuId);
        const cpu = cpus.find(c => c.id === selectedCpuId);
        const gpuPerf = gpu?.performance_index || 100;
        const cpuPerf = cpu?.performance_index || 100;

        const mainFps = calculateFps(gpuPerf, cpuPerf, selectedRes, selectedGameSlug);
        const gtaPrediction = calculateFps(gpuPerf, cpuPerf, '1440p', 'gta-6') * 0.55; // GTA 6 náročnost

        // Zápis pro SEO Sitemapu
        const resolutions = ['1080p', '1440p', '2160p'];
        const logPromises = resolutions.map(res => 
            supabase.from('generated_predictions').upsert({
                full_url: `https://thehardwareguru.cz${getGtaUrl(res)}`,
                last_requested: new Date().toISOString()
            }, { onConflict: 'full_url' })
        );
        await Promise.all(logPromises);

        setTimeout(() => {
            setResult({ fps: mainFps, gta: Math.round(gtaPrediction) });
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
                        <option value="uwqhd">3440x1440px (Ultrawide)</option>
                        <option value="2160p">3840x2160 (4K Ultra)</option>
                        <option value="dqhd">5120x1440px (Super UW)</option>
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
                    
                    <div className="share-buttons">
                        <button onClick={() => {navigator.clipboard.writeText(`Dávám ${result.fps} FPS v ${selectedGameSlug}!`); setCopied(true); setTimeout(()=>setCopied(false),2000);}} className="s-btn copy">{copied ? <Check size={20}/> : <Share2 size={20}/>}</button>
                    </div>

                    <div className="gta-bait-box">
                        <div className="gta-tag"><Sparkles size={14} /> AI EXCLUSIVE</div>
                        <h3>{isEn ? 'GTA VI ESTIMATED PERFORMANCE' : 'ODHAD VÝKONU V GTA VI'}</h3>
                        <div className="gta-fps-preview">
                            <span style={{fontSize: '3.5rem', fontWeight: '950', color: '#f43f5e'}}>{result.gta} FPS</span>
                            <span style={{fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase'}}>(1440p High Preset)</span>
                        </div>
                        <div className="gta-links-header">{isEn ? 'DETAILED PREDICTIONS:' : 'DETAILNÍ PREDIKCE:'}</div>
                        <div className="gta-links">
                            <a href={getGtaUrl('1080p')}>1080p <ArrowRight size={14}/></a>
                            <a href={getGtaUrl('1440p')}>1440p <ArrowRight size={14}/></a>
                            <a href={getGtaUrl('2160p')}>4K <ArrowRight size={14}/></a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.98); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; }
                .guru-select { width: 100%; background: #0a0b0d !important; color: #fff !important; border: 1px solid #1f2937; padding: 15px; border-radius: 12px; font-weight: 950; }
                .calc-btn { background: #f43f5e; color: #fff; border: none; padding: 20px 60px; font-size: 16px; font-weight: 950; border-radius: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
                .result-area { margin-top: 40px; text-align: center; }
                .fps-val { font-size: 7rem; font-weight: 950; color: #fff; text-shadow: 0 0 40px rgba(244, 63, 94, 0.3); }
                .gta-bait-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(0,0,0,0.8)); border: 1px solid rgba(244, 63, 94, 0.3); padding: 35px; border-radius: 24px; margin-top: 40px; }
                .gta-fps-preview { margin: 20px 0; display: flex; flex-direction: column; align-items: center; }
                .gta-links-header { font-size: 10px; font-weight: 950; color: #6b7280; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; }
                .gta-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .gta-links a { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; }
                .gta-links a:hover { background: #f43f5e; }
                .share-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }
                .s-btn { width: 50px; height: 50px; border-radius: 14px; border: none; cursor: pointer; color: #fff; background: #333; display: flex; align-items: center; justify-content: center; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
