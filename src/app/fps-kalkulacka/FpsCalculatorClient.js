'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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
                        {/* GURU: TADY JE TO - POŽÍVÁME SLOUPCE VENDOR A NAME */}
                        {cpus.map(c => <option key={c.id} value={c.id}>{c.vendor} {c.name}</option>)}
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
                <div className="result-area">
                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>{isEn ? 'ESTIMATED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}</div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff' }}>{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; cursor: pointer; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .result-area { margin-top: 40px; text-align: center; }
            `}} />
        </div>
    );
}
