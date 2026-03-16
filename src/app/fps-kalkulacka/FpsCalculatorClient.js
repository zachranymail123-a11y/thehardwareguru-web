'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

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

            // Normalizace klíče hry pro DB sloupce (např. cyberpunk-2077 -> cyberpunk_2077)
            const dbGameKey = selectedGameSlug.replace(/-/g, '_');
            const fpsKey = `${dbGameKey}_${selectedRes}`;

            const gpuFpsData = gpu.game_fps?.[0] || {};
            const cpuFpsData = cpu.cpu_game_fps?.[0] || {};

            const gpuFps = gpuFpsData[fpsKey] || 0;
            // CPU tabulka má sloupce často bez prefixu hry nebo jinak, zkusíme najít shodu
            const cpuFps = cpuFpsData[fpsKey] || cpuFpsData[`${selectedGameSlug.split('-')[0]}_${selectedRes}`] || 0;

            let finalFps = Math.min(gpuFps, cpuFps);
            if (gpuFps === 0 || cpuFps === 0) finalFps = Math.max(gpuFps, cpuFps); // Fallback pokud jedno chybí

            setResult({
                fps: Math.round(finalFps),
                gpuName: gpu.name,
                cpuName: cpu.name,
                bottleneck: gpuFps < cpuFps ? 'GPU' : 'CPU',
                percent: Math.round(Math.abs(1 - (gpuFps / cpuFps)) * 100)
            });
            setIsCalculating(false);
        }, 1200);
    };

    return (
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* DYNAMICKÝ SELECT HER */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase' }}><Gamepad2 size={14} /> {isEn ? 'Game' : 'Vyber hru'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select Game --' : '-- Vyber hru --'}</option>
                        {games.map(game => <option key={game.id} value={game.slug}>{game.name}</option>)}
                    </select>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#ff0055', textTransform: 'uppercase' }}><Monitor size={14} /> {isEn ? 'Resolution' : 'Rozlišení'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p (FHD)</option>
                        <option value="1440p">1440p (QHD)</option>
                        <option value="2160p">4K (UHD)</option>
                    </select>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase' }}>{isEn ? 'GPU' : 'Grafika'}</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select GPU --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id.toString()}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#f59e0b', textTransform: 'uppercase' }}><Cpu size={14} /> {isEn ? 'CPU' : 'Procesor'}</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select CPU --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id.toString()}>{c.vendor} {c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button onClick={handleCalculate} disabled={!selectedGpuId || !selectedCpuId || !selectedGameSlug || isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="spinner" /> : <Zap size={20} />} {isEn ? 'CALCULATE' : 'SPOČÍTAT FPS'}
                </button>
            </div>

            {result && !isCalculating && (
                <div style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>Očekávaný výkon</div>
                    <div style={{ fontSize: '5rem', fontWeight: '950', color: '#fff' }}>{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px; border-radius: 10px; cursor: pointer; }
                .calc-btn { background: #a855f7; color: #fff; padding: 15px 40px; border-radius: 12px; font-weight: 950; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 10px; }
                .calc-btn:disabled { opacity: 0.3; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}} />
        </div>
    );
}
