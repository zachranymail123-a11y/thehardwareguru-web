'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function FpsCalculatorClient({ gpus, cpus }) {
    const [selectedGame, setSelectedGame] = useState('cyberpunk');
    const [selectedRes, setSelectedRes] = useState('1080p');
    const [selectedGpu, setSelectedGpu] = useState('');
    const [selectedCpu, setSelectedCpu] = useState('');
    
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        if (!selectedGpu || !selectedCpu) return;
        
        setIsCalculating(true);
        setResult(null);

        // Simulace složitého výpočtu pro "Wow" efekt (1.5 vteřiny)
        setTimeout(() => {
            const gpu = gpus.find(g => g.id.toString() === selectedGpu);
            const cpu = cpus.find(c => c.id.toString() === selectedCpu);

            if (!gpu || !cpu) {
                setIsCalculating(false);
                return;
            }

            // Mapování herních sloupců
            const gpuGameKey = selectedGame === 'cyberpunk' ? 'cyberpunk_2077' : selectedGame;
            const cpuGameKey = selectedGame; // CPU má v DB jen 'cyberpunk'

            const gpuFpsCol = `${gpuGameKey}_${selectedRes}`;
            const cpuFpsCol = `${cpuGameKey}_${selectedRes}`;

            const gpuFpsData = gpu.game_fps && gpu.game_fps.length > 0 ? gpu.game_fps[0] : {};
            const cpuFpsData = cpu.cpu_game_fps && cpu.cpu_game_fps.length > 0 ? cpu.cpu_game_fps[0] : {};

            const gpuFps = gpuFpsData[gpuFpsCol] || 0;
            const cpuFps = cpuFpsData[cpuFpsCol] || 0;

            let finalFps = 0;
            let bottleneck = 'NONE';
            let bottleneckPercent = 0;

            if (gpuFps === 0 || cpuFps === 0) {
                // Nemáme kompletní data
                finalFps = 0;
            } else {
                finalFps = Math.min(gpuFps, cpuFps);
                if (gpuFps < cpuFps) {
                    bottleneck = 'GPU';
                    bottleneckPercent = Math.round((1 - (gpuFps / cpuFps)) * 100);
                } else if (cpuFps < gpuFps) {
                    bottleneck = 'CPU';
                    bottleneckPercent = Math.round((1 - (cpuFps / gpuFps)) * 100);
                }
            }

            setResult({
                fps: finalFps,
                bottleneck,
                bottleneckPercent,
                gpuName: gpu.name,
                cpuName: cpu.name,
                gpuSlug: gpu.slug,
                cpuSlug: cpu.slug
            });
            setIsCalculating(false);
        }, 1500);
    };

    const getVerdict = () => {
        if (!result) return null;
        if (result.fps === 0) return { text: "Nemáme dostatek dat pro tuto kombinaci.", color: "#6b7280" };
        if (result.fps < 30) return { text: "Nekoukatelné. Tady bude potřeba masivní upgrade.", color: "#ef4444" };
        if (result.fps < 60) return { text: "Hratelné, ale na 60 FPS to nedosáhne. Sniž detaily.", color: "#f59e0b" };
        if (result.fps < 100) return { text: "Skvělý výkon! Zahraješ si naprosto plynule.", color: "#10b981" };
        return { text: "Extrémní výkon! Využiješ i monitory s vysokou obnovovací frekvencí.", color: "#66fcf1" };
    };

    const verdict = getVerdict();

    return (
        <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', marginTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* HRA */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}><Gamepad2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Vyber hru</label>
                    <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="guru-select">
                        <option value="cyberpunk">Cyberpunk 2077</option>
                        <option value="warzone">Call of Duty: Warzone</option>
                        <option value="starfield">Starfield</option>
                    </select>
                </div>

                {/* ROZLIŠENÍ */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#ff0055', textTransform: 'uppercase', letterSpacing: '1px' }}><Monitor size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Vyber rozlišení</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p (FHD)</option>
                        <option value="1440p">1440p (QHD)</option>
                        <option value="2160p">4K (UHD)</option>
                    </select>
                </div>

                {/* GRAFIKA */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', letterSpacing: '1px' }}>Zvol grafickou kartu</label>
                    <select value={selectedGpu} onChange={(e) => setSelectedGpu(e.target.value)} className="guru-select">
                        <option value="">-- Vyber GPU --</option>
                        {gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>

                {/* PROCESOR */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: '950', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}><Cpu size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Zvol procesor</label>
                    <select value={selectedCpu} onChange={(e) => setSelectedCpu(e.target.value)} className="guru-select">
                        <option value="">-- Vyber CPU --</option>
                        {cpus.map(c => <option key={c.id} value={c.id}>{c.vendor} {c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button 
                    onClick={handleCalculate} 
                    disabled={!selectedGpu || !selectedCpu || isCalculating}
                    className="calc-btn"
                >
                    {isCalculating ? <><Loader2 size={20} className="spinner" /> ANALYZUJI VÝKON...</> : <><Zap size={20} /> SPOČÍTAT FPS</>}
                </button>
            </div>

            {/* VÝSLEDEK */}
            {result && !isCalculating && (
                <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>Očekávaný výkon v {selectedRes.toUpperCase()}</h3>
                        <div style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', fontWeight: '950', lineHeight: '1', color: result.fps > 0 ? '#fff' : '#6b7280', textShadow: result.fps > 0 ? '0 0 40px rgba(255,255,255,0.2)' : 'none', margin: '0 0 20px 0' }}>
                            {result.fps > 0 ? `${result.fps} FPS` : 'N/A'}
                        </div>
                        
                        {result.fps > 0 && (
                            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '15px 30px', borderRadius: '50px', color: verdict.color, fontWeight: '950', border: `1px solid ${verdict.color}40`, textTransform: 'uppercase', marginBottom: '30px' }}>
                                <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> {verdict.text}
                            </div>
                        )}
                    </div>

                    {/* BOTTLENECK RADAR (Siloing) */}
                    {result.fps > 0 && result.bottleneck !== 'NONE' && result.bottleneckPercent > 10 && (
                        <div style={{ background: result.bottleneck === 'GPU' ? 'rgba(102, 252, 241, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${result.bottleneck === 'GPU' ? 'rgba(102, 252, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, borderRadius: '20px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: result.bottleneck === 'GPU' ? '#66fcf1' : '#f59e0b', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px', marginBottom: '10px' }}>
                                    <AlertTriangle size={16} /> GURU BOTTLENECK DETEKOVÁN
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#fff' }}>Limituje tě {result.bottleneck === 'GPU' ? 'Grafická karta' : 'Procesor'}</h4>
                                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Přicházíš zhruba o {result.bottleneckPercent} % výkonu {result.bottleneck === 'GPU' ? 'procesoru' : 'grafiky'}. Zvaž upgrade.</p>
                            </div>
                            <a href={result.bottleneck === 'GPU' ? `/gpu-upgrade` : `/cpu-upgrade`} className="upgrade-link-btn" style={{ background: result.bottleneck === 'GPU' ? '#66fcf1' : '#f59e0b', color: '#000' }}>
                                NAJÍT UPGRADE <ArrowRight size={16} />
                            </a>
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-size: 14px; font-weight: bold; outline: none; transition: 0.3s; appearance: none; cursor: pointer; }
                .guru-select:focus { border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
                .guru-select option { background: #0f1115; color: #fff; }
                
                .calc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: #fff; border: none; padding: 20px 50px; font-size: 18px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; border-radius: 16px; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(168, 85, 247, 0.6); }
                .calc-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; background: #374151; }
                
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .upgrade-link-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 25px; border-radius: 12px; font-weight: 950; text-transform: uppercase; text-decoration: none; transition: 0.2s; }
                .upgrade-link-btn:hover { transform: translateX(5px); filter: brightness(1.2); }
            `}} />
        </div>
    );
}
