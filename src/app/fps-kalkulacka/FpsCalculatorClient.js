'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE CLIENT - V1.7 (BUILD FIX)
 * 🛡️ FIX: Odstraněna neexistující knihovna @supabase/auth-helpers-nextjs.
 * 🛡️ FIX: Použit standardní @supabase/supabase-js kompatibilní s tvým package.json.
 */

// Inicializace klienta přímo pro prohlížeč
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

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        try {
            // GURU: Dotahujeme FPS data přímo přes standardní Supabase klient
            const [gpuFpsRes, cpuFpsRes] = await Promise.all([
                supabase.from('game_fps').select('*').eq('gpu_id', selectedGpuId).maybeSingle(),
                supabase.from('cpu_game_fps').select('*').eq('cpu_id', selectedCpuId).maybeSingle()
            ]);

            const gpuData = gpuFpsRes.data || {};
            const cpuData = cpuFpsRes.data || {};

            const dbBase = selectedGameSlug.replace(/-/g, '_');
            const resKey = selectedRes === '2160p' ? '4k' : selectedRes;
            const columnKey = `${dbBase}_${resKey}`;

            const gpuFps = gpuData[columnKey] || 0;
            const cpuFps = cpuData[columnKey] || 0;

            const finalFps = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);

            setResult({ fps: Math.round(finalFps) });
        } catch (err) {
            console.error("Guru Calc Error:", err);
            setResult({ fps: 0 });
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="guru-calc-container">
            <div className="guru-grid">
                <div className="input-field">
                    <label><Gamepad2 size={14} /> {isEn ? 'SELECT GAME' : 'VYBER HRU'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)}>
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                    </select>
                </div>

                <div className="input-field">
                    <label><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)}>
                        <option value="1080p">1080p Full HD</option>
                        <option value="1440p">1440p Quad HD</option>
                        <option value="2160p">4K Ultra HD</option>
                    </select>
                </div>

                <div className="input-field">
                    <label><Zap size={14} /> GPU</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)}>
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>

                <div className="input-field">
                    <label><Cpu size={14} /> CPU</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)}>
                        <option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id}>{c.vendor} {c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={!selectedGpuId || !selectedCpuId || !selectedGameSlug || isCalculating} className="guru-calc-btn">
                    {isCalculating ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    {isEn ? 'CALCULATE FPS' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="guru-result-box">
                    <div style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        {isEn ? 'ESTIMATED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}
                    </div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)' }}>
                        {result.fps > 0 ? `${result.fps} FPS` : 'N/A'}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50px', fontSize: '11px', fontWeight: '950' }}>
                        <CheckCircle2 size={14} /> {isEn ? 'SIMULATION COMPLETE' : 'SIMULACE DOKONČENA'}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-container { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field { display: flex; flex-direction: column; gap: 10px; }
                .input-field label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
                .input-field select { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; outline: none; transition: 0.3s; cursor: pointer; appearance: none; }
                .input-field select:focus { border-color: #a855f7; }
                .guru-calc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border: none; padding: 20px 40px; font-size: 16px; font-weight: 950; text-transform: uppercase; border-radius: 16px; cursor: pointer; transition: 0.3s; width: 100%; max-width: 400px; }
                .guru-calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .guru-calc-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .guru-result-box { margin-top: 50px; text-align: center; animation: guruFadeIn 0.5s ease-out; }
                @keyframes guruFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
