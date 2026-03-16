'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, CheckCircle2 } from 'lucide-react';

export default function FpsCalculatorClient({ gpus = [], cpus = [], games = [], isEn = false }) {
    const [selectedGameSlug, setSelectedGameSlug] = useState('');
    const [selectedRes, setSelectedRes] = useState('1440p');
    const [selectedGpuId, setSelectedGpuId] = useState('');
    const [selectedCpuId, setSelectedCpuId] = useState('');
    
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            const gpu = gpus.find(g => g.id.toString() === selectedGpuId);
            const cpu = cpus.find(c => c.id.toString() === selectedCpuId);

            if (!gpu || !cpu) {
                setIsCalculating(false);
                return;
            }

            // GURU LOGIKA: Převod slugu hry na název sloupce v DB (podle toho co známe z matic)
            const dbGameBase = selectedGameSlug.replace(/-/g, '_');
            const fpsKey = `${dbGameBase}_${selectedRes === '2160p' ? '4k' : selectedRes}`;

            const gpuFpsData = gpu.game_fps?.[0] || {};
            const cpuFpsData = cpu.cpu_game_fps?.[0] || {};

            // Najdeme FPS pro obě komponenty
            const gpuFps = gpuFpsData[fpsKey] || gpuFpsData[selectedGameSlug.replace(/-/g, '_') + '_' + selectedRes] || 0;
            const cpuFps = cpuFpsData[fpsKey] || cpuFpsData[selectedGameSlug.split('-')[0] + '_' + selectedRes] || 0;

            const finalFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);

            setResult({
                fps: Math.round(finalFps),
                bottleneck: gpuFps < cpuFps ? 'GPU' : 'CPU',
                gpuName: gpu.name,
                cpuName: cpu.name
            });
            setIsCalculating(false);
        }, 1200);
    };

    return (
        <div className="guru-calculator-box">
            <div className="guru-inputs-grid">
                {/* DYNAMICKÝ VÝBĚR HER */}
                <div className="input-group">
                    <label><Gamepad2 size={14} /> {isEn ? 'SELECT GAME' : 'VYBER HRU'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(game => <option key={game.id} value={game.slug}>{game.name}</option>)}
                    </select>
                </div>

                {/* ROZLIŠENÍ */}
                <div className="input-group">
                    <label><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p Full HD</option>
                        <option value="1440p">1440p Quad HD</option>
                        <option value="2160p">2160p 4K Ultra HD</option>
                    </select>
                </div>

                {/* DYNAMICKÁ GPU */}
                <div className="input-group">
                    <label><Zap size={14} /> {isEn ? 'GRAPHICS CARD' : 'GRAFICKÁ KARTA'}</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id.toString()}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>

                {/* DYNAMICKÁ CPU */}
                <div className="input-group">
                    <label><Cpu size={14} /> {isEn ? 'PROCESSOR' : 'PROCESOR'}</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id.toString()}>{c.vendor} {c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={!selectedGpuId || !selectedCpuId || !selectedGameSlug || isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="spinner" /> : <Zap size={20} />} {isEn ? 'CALCULATE PERFORMANCE' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="result-area">
                    <div className="result-label">{isEn ? 'ESTIMATED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}</div>
                    <div className="result-value">{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                    {result.fps > 0 && <div className="result-verdict"><CheckCircle2 size={16} /> {isEn ? 'ANALYSIS COMPLETE' : 'ANALÝZA DOKONČENA'}</div>}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calculator-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .guru-inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
                .input-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-size: 14px; font-weight: 900; outline: none; transition: 0.3s; cursor: pointer; appearance: none; }
                .guru-select:focus { border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
                .calc-btn { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; text-transform: uppercase; border-radius: 14px; cursor: pointer; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .calc-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .result-area { margin-top: 50px; text-align: center; animation: fadeIn 0.5s ease-out; }
                .result-label { font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; }
                .result-value { font-size: 6rem; font-weight: 950; color: #fff; line-height: 1; margin: 10px 0; text-shadow: 0 0 40px rgba(168, 85, 247, 0.3); }
                .result-verdict { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 50px; font-size: 12px; font-weight: 950; text-transform: uppercase; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
