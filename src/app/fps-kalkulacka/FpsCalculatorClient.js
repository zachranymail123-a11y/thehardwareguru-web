'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check } from 'lucide-react';
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
    const [copied, setCopied] = useState(false);

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);
        setCopied(false);

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

    // GURU VIRAL FLEX FUNKCE
    const handleShare = () => {
        if (!result) return;
        
        const gameName = games.find(g => g.slug === selectedGameSlug)?.name || 'hře';
        const cpuName = cpus.find(c => c.id === selectedCpuId)?.name || 'můj CPU';
        const gpuName = gpus.find(g => g.id === selectedGpuId)?.name || 'moje GPU';
        
        const shareTextEn = `🔥 My rig hits ${result.fps} FPS in ${gameName} on ${selectedRes}! 🚀\n💻 Build: ${cpuName} + ${gpuName}\n👉 Check your performance at: https://thehardwareguru.cz/en/fps-calculator`;
        const shareTextCs = `🔥 Moje sestava dává v ${gameName} na ${selectedRes} brutálních ${result.fps} FPS! 🚀\n💻 Železo: ${cpuName} + ${gpuName}\n👉 Změř si to taky na: https://thehardwareguru.cz/fps-kalkulacka`;

        navigator.clipboard.writeText(isEn ? shareTextEn : shareTextCs).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    return (
        <div className="guru-calc-box">
            <div className="guru-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="input-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Gamepad2 size={14} /> {isEn ? 'GAME' : 'HRA'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p Full HD</option>
                        <option value="1440p">1440p Quad HD</option>
                        <option value="2160p">4K Ultra HD</option>
                    </select>
                </div>
                <div className="input-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Zap size={14} /> GPU</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}
                    </select>
                </div>
                <div className="input-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Cpu size={14} /> CPU</label>
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
                <div style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'EXPECTED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}</div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '10px 0' }}>{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                    
                    {/* VIRAL FLEX CARD */}
                    {result.fps > 0 && (
                        <div style={{ marginTop: '30px', maxWidth: '400px', margin: '30px auto 0', padding: '25px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#e5e7eb', marginBottom: '15px', textTransform: 'uppercase' }}>
                                {isEn ? '🏆 Flex your rig online' : '🏆 Pochlub se na Discordu a FB'}
                            </div>
                            <button onClick={handleShare} className="share-btn">
                                {copied ? <Check size={18} /> : <Share2 size={18} />}
                                {copied ? (isEn ? 'Copied to clipboard!' : 'Zkopírováno!') : (isEn ? 'Copy My Result' : 'Zkopírovat můj výsledek')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; cursor: pointer; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .calc-btn:disabled { opacity: 0.3; }
                .share-btn { width: 100%; background: #fff; color: #000; border: none; padding: 15px 20px; font-size: 14px; font-weight: 950; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; text-transform: uppercase; }
                .share-btn:hover { background: #e5e7eb; transform: translateY(-2px); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
