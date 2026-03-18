'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles } from 'lucide-react';
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

    const getGtaUrl = (res) => {
        const cpuName = cpus.find(c => c.id === selectedCpuId)?.name || 'cpu';
        const gpuName = gpus.find(g => g.id === selectedGpuId)?.name || 'gpu';
        const cleanCpu = cpuName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanGpu = gpuName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const basePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
        return `https://thehardwareguru.cz${basePath}/${cleanCpu}-vs-${cleanGpu}-${res}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
    };

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

            // 🔥 GURU CALIBRATION FIX
            // 1. Získáme základ z DB
            const rawBase = (gpuFps > 0 && cpuFps > 0) ? Math.min(gpuFps, cpuFps) : Math.max(gpuFps, cpuFps);
            
            // 2. Aplikujeme koeficienty podle tvých naměřených her
            let multiplier = 2.84; // Default pro Callisto
            if (selectedGameSlug.includes('battlefield-6')) multiplier = 2.71;
            if (selectedGameSlug.includes('cyberpunk-2077')) multiplier = 2.68;

            const finalFps = rawBase * multiplier;

            setResult({ fps: Math.round(finalFps) });

            const resolutions = ['1080p', '1440p', '2160p'];
            const logPromises = resolutions.map(res => 
                supabase.from('generated_predictions').upsert({
                    full_url: getGtaUrl(res),
                    last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' })
            );
            await Promise.all(logPromises);

        } catch (err) {
            setResult({ fps: 0 });
        } finally {
            setIsCalculating(false);
        }
    };

    const handleCopyShare = () => {
        const gameName = games.find(g => g.slug === selectedGameSlug)?.name || 'hře';
        const url = isEn ? 'https://thehardwareguru.cz/en/fps-calculator' : 'https://thehardwareguru.cz/fps-kalkulacka';
        const text = isEn ? `🔥 My rig hits ${result?.fps} FPS in ${gameName}! Check: ${url}` : `🔥 Moje sestava dává v ${gameName} přesně ${result?.fps} FPS! Změř si to taky na: ${url}`;
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); });
    };

    const getGtaPredictionPath = (targetRes) => {
        const url = getGtaUrl(targetRes);
        return url.replace('https://thehardwareguru.cz', '');
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
                <div className="result-area" style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.7s ease-out' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'EXPECTED PERFORMANCE' : 'OČEKÁVANÝ VÝKON'}</div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '10px 0' }}>{result.fps} FPS</div>
                    
                    <div className="viral-flex-card">
                        <div className="award-icon"><Award size={32} color="#fff" /></div>
                        <div className="viral-text-box">
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{isEn ? 'ACHIEVEMENT LOCKED' : 'ÚSPĚCH ODEMČEN'}</div>
                            <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>{isEn ? 'Share your result online' : 'Pochlub se výsledkem online'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleCopyShare} className="premium-share-btn btn-copy">{copied ? <Check size={20} /> : <Share2 size={20} />}</button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`, '_blank')} className="premium-share-btn btn-x"><Twitter size={20} /></button>
                        </div>
                    </div>

                    <div className="gta-hype-box" style={{ marginTop: '30px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '6px 15px', borderRadius: '50px', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase' }}><Sparkles size={14} /> AI PREDIKČNÍ ENGINE</span>
                        <h3 style={{ fontSize: '20px', fontWeight: '950', marginTop: '15px', color: '#fff' }}>{isEn ? 'Will this rig run GTA VI?' : 'Rozjede tohle železo GTA VI?'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                            <a href={getGtaPredictionPath('1080p')} className="gta-res-btn">1080p</a>
                            <a href={getGtaPredictionPath('1440p')} className="gta-res-btn">1440p</a>
                            <a href={getGtaPredictionPath('2160p')} className="gta-res-btn">4K</a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 520px; margin: 40px auto 0; padding: 25px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; text-align: left; }
                .premium-share-btn { width: 48px; height: 48px; border-radius: 12px; cursor: pointer; border: none; color: #fff; display: flex; align-items: center; justify-content: center; }
                .btn-copy { background: #a855f7; } .btn-x { background: #000; border: 1px solid #333; }
                .gta-res-btn { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.4); padding: 15px; border-radius: 14px; text-decoration: none; color: #fff; font-weight: 900; display: block; text-align: center; }
                .animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
