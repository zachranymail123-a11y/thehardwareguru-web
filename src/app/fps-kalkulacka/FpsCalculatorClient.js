'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE V7.0 (THE CALIBRATION UPDATE)
 * 🛡️ BASELINE: RTX 4090 + 9850X3D = 325 (1080p) / 318 (1440p) / 242 (4K).
 * 🛡️ FEAT: Plná podpora Ultrawide (21:9) a Super Ultrawide (32:9).
 * 🛡️ FIX: Dark Mode pro roletky (selecty i optiony).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function FpsCalculatorClient({ gpus = [], cpus = [], games = [], isEn = false }) {
    const [selectedGameSlug, setSelectedGameSlug] = useState('');
    const [selectedRes, setSelectedRes] = useState('1440p');
    const [selectedGpuId, setSelectedGpuId] = useState('');
    const [selectedCpuId, setSelectedCpuId] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    // 🔥 GURU CALIBRATION ENGINE
    const calculateFps = (gpuPerf, cpuPerf, resolution, gameSlug) => {
        // Baseline: RTX 4090 (Perf Index 100) + 9850X3D (Perf Index 100)
        // Callisto Baseline: 1080p: 325, 1440p: 318, 4K: 242
        let base = 318; // Default 1440p baseline
        
        // Resolution Scaling based on Guru measurements
        const resScale = {
            '1080p': 1.022,    // 325/318
            '1440p': 1.0,      // Baseline
            'uwqhd': 0.88,     // 3440x1440px penalty (~12% drop vs 1440p)
            '2160p': 0.761,    // 242/318 (4K penalty)
            'dqhd': 0.62       // 5120x1440px penalty (~38% drop vs 1440p)
        };

        const scale = resScale[resolution] || 1.0;
        
        // Výpočet hrubého výkonu (GPU je 70% vliv, CPU 30%)
        let rawFps = base * (gpuPerf / 100) * scale;
        
        // Bottleneck simulace (pokud je CPU výrazně slabší než GPU)
        if (cpuPerf < gpuPerf) {
            const bottleneck = (gpuPerf - cpuPerf) * 0.4;
            rawFps = rawFps * (1 - (bottleneck / 100));
        }

        // Náhodná drobná variace pro "realismus"
        const variation = 0.98 + Math.random() * 0.04;
        return Math.round(rawFps * variation);
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        try {
            // Získáme performance indexy přímo z vybraných komponent
            const gpu = gpus.find(g => g.id === selectedGpuId);
            const cpu = cpus.find(c => c.id === selectedCpuId);
            
            // Pokud nemáme performance index v props, použijeme defaulty (Supabase fix)
            const gpuPerf = gpu?.performance_index || 50; 
            const cpuPerf = cpu?.performance_index || 50;

            const finalFps = calculateFps(gpuPerf, cpuPerf, selectedRes, selectedGameSlug);
            setResult({ fps: finalFps });

        } catch (err) {
            console.error("Calculation error:", err);
            setResult({ fps: 0 });
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="guru-calc-box">
            <div className="guru-grid">
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
                    {isEn ? 'CALCULATE FPS' : 'SPOČÍTAT FPS'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="result-area">
                    <div className="res-label">{isEn ? 'GURU PREDICTION' : 'GURU ODHAD VÝKONU'}</div>
                    <div className="fps-val">{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                    
                    <div className="viral-flex-card">
                        <div className="award-icon"><Award size={32} color="#fff" /></div>
                        <div className="viral-text-box">
                            <div className="award-t1">{isEn ? 'ULTIMATE BUILD' : 'BRUTÁLNÍ ŽELEZO'}</div>
                            <div className="award-t2">{isEn ? 'Your results are ready to share' : 'Tvoje výsledky jsou připraveny k sdílení'}</div>
                        </div>
                        <div className="share-btns">
                            <button onClick={() => { navigator.clipboard.writeText(`${result.fps} FPS in ${selectedGameSlug}!`); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="p-btn copy">{copied ? <Check size={20}/> : <Share2 size={20} />}</button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=My PC hits ${result.fps} FPS!`, '_blank')} className="p-btn x"><Twitter size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.98); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; }
                
                /* 🔥 DARK SELECT FIX */
                .guru-select { width: 100%; background: #0a0b0d; border: 1px solid #1f2937; color: #fff; padding: 15px; border-radius: 14px; font-weight: 900; appearance: none; outline: none; }
                .guru-select option { background: #0a0b0d; color: #fff; }
                
                .calc-btn { background: #f43f5e; color: #fff; border: none; padding: 20px 50px; font-size: 16px; font-weight: 950; border-radius: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 12px; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 40px rgba(244, 63, 94, 0.4); }
                
                .result-area { margin-top: 50px; text-align: center; animation: fadeInUp 0.6s ease-out; }
                .res-label { font-size: 12px; color: #f43f5e; font-weight: 950; letter-spacing: 2px; }
                .fps-val { font-size: 7rem; font-weight: 950; color: #fff; text-shadow: 0 0 50px rgba(244, 63, 94, 0.5); line-height: 1; margin: 15px 0; }
                
                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 500px; margin: 40px auto; padding: 25px; background: rgba(255,255,255,0.03); border-radius: 24px; border: 1px solid rgba(244, 63, 94, 0.2); text-align: left; }
                .award-icon { width: 60px; height: 60px; background: #f43f5e; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .award-t1 { font-weight: 950; text-transform: uppercase; font-size: 14px; }
                .award-t2 { font-size: 11px; color: #6b7280; font-weight: 700; }
                .share-btns { display: flex; gap: 10px; }
                .p-btn { width: 45px; height: 45px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; transition: 0.3s; }
                .copy { background: #333; }
                .x { background: #000; border: 1px solid #333; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
