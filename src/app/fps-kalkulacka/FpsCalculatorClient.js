'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

    // 🔥 GURU REFERENCE ENGINE V8.0 - KALIBRACE PROTI RTX 4090
    const calculateFps = (gpuPerfIndex, cpuPerfIndex, resolution, gameSlug) => {
        const slug = gameSlug.toLowerCase();
        
        // 1. URČENÍ KATEGORIE A REFERENČNÍCH DAT (DATA PRO RTX 4090)
        let category = 'medium';
        if (slug.includes('callisto') || slug.includes('valorant') || slug.includes('counter-strike')) {
            category = 'light';
        } else if (slug.includes('expedition') || slug.includes('alan-wake') || slug.includes('cyberpunk') || slug.includes('gta-6')) {
            category = 'extreme';
        }

        // Baseline hodnoty pro RTX 4090 (Perf Index 100)
        const baselines4090 = {
            'light': { '1080p': 325, '1440p': 318, '2160p': 242 },
            'medium': { '1080p': 239, '1440p': 183, '2160p': 110 },
            'extreme': { '1080p': 100, '1440p': 71, '2160p': 57 }
        };

        const baseFps4090 = baselines4090[category][resolution] || baselines4090[category]['1440p'];

        // 2. VÝPOČET POMĚRU VÝKONU (GPU PERF INDEX VŮČI 100 U 4090)
        // Pokud má karta index 50, dává 50% FPS co 4090
        const gpuRatio = gpuPerfIndex / 100;
        let finalFps = baseFps4090 * gpuRatio;

        // 3. VLIV PROCESORU (DOPLŇKOVÝ)
        // Pokud je CPU slabé, strhne výkon o dalších max 15-20%
        const cpuWeight = category === 'extreme' ? 0.05 : 0.15;
        const cpuRatio = cpuPerfIndex / 100;
        finalFps = (finalFps * (1 - cpuWeight)) + (finalFps * cpuWeight * cpuRatio);

        return Math.round(finalFps);
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);

        try {
            const gpu = gpus.find(g => g.id === selectedGpuId);
            const cpu = cpus.find(c => c.id === selectedCpuId);
            
            // Extrakce indexů (pokud chybí, dáváme 50 jako střed)
            const gpuPerf = gpu?.performance_index || 50; 
            const cpuPerf = cpu?.performance_index || 50;

            const finalFps = calculateFps(gpuPerf, cpuPerf, selectedRes, selectedGameSlug);
            setResult({ fps: finalFps });

            // LOGOVÁNÍ PRO SITEMAPU (NEMĚNÍME)
            const getGtaUrl = (res) => {
                const basePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
                const cpuSlug = cpu?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cpu';
                const gpuSlug = gpu?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'gpu';
                return `https://thehardwareguru.cz${basePath}/${cpuSlug}-vs-${gpuSlug}-${res}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
            };

            const resolutions = ['1080p', '1440p', '2160p'];
            const logPromises = resolutions.map(res => 
                supabase.from('generated_predictions').upsert({
                    full_url: getGtaUrl(res),
                    last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' })
            );
            await Promise.all(logPromises);
        } catch (err) { console.error(err); setResult({ fps: 0 }); } finally { setIsCalculating(false); }
    };

    // UI pomocníci
    const getGtaPredictionPath = (res) => {
        const gpu = gpus.find(g => g.id === selectedGpuId);
        const cpu = cpus.find(c => c.id === selectedCpuId);
        const cpuSlug = cpu?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cpu';
        const gpuSlug = gpu?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'gpu';
        const basePath = isEn ? '/en/fps-calculator/gta-6-prediction' : '/fps-kalkulacka/gta-6-predikce';
        return `${basePath}/${cpuSlug}-vs-${gpuSlug}-${res}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
    };

    return (
        <div className="guru-calc-box">
            <div className="guru-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="input-field"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Gamepad2 size={14} /> {isEn ? 'GAME' : 'HRA'}</label>
                    <select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>
                        {games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                    </select></div>
                <div className="input-field"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label>
                    <select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select">
                        <option value="1080p">1080p Full HD</option><option value="1440p">1440p Quad HD</option><option value="2160p">4K Ultra HD</option>
                    </select></div>
                <div className="input-field"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Zap size={14} /> GPU</label>
                    <select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>
                        {gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}
                    </select></div>
                <div className="input-field"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950', color: '#9ca3af', textTransform: 'uppercase' }}><Cpu size={14} /> CPU</label>
                    <select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select">
                        <option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>
                        {cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="animate-spin" /> : <Zap size={18} />} {isEn ? 'CALCULATE' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="result-area" style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.7s ease-out' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>OČEKÁVANÝ VÝKON</div>
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '10px 0' }}>{result.fps} FPS</div>
                    
                    <div className="viral-flex-card">
                        <div className="award-icon"><Award size={32} color="#fff" /></div>
                        <div className="viral-text-box"><div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>ÚSPĚCH ODEMČEN</div><div style={{ fontSize: '11px', color: '#a855f7' }}>Sdílej výsledek online</div></div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => {navigator.clipboard.writeText(`Dávám ${result.fps} FPS!`); setCopied(true); setTimeout(()=>setCopied(false),2000)}} className="premium-share-btn btn-copy">{copied ? <Check size={20} /> : <Share2 size={20} />}</button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=I got ${result.fps} FPS!`, '_blank')} className="premium-share-btn btn-x"><Twitter size={20} /></button>
                            <button onClick={() => window.open(`https://www.reddit.com/submit?title=My FPS Result`, '_blank')} className="premium-share-btn btn-reddit"><RedditIcon size={20} /></button>
                        </div>
                    </div>

                    <div className="gta-hype-box" style={{ marginTop: '30px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '6px 15px', borderRadius: '50px', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase' }}><Sparkles size={14} /> AI PREDIKČNÍ ENGINE</span>
                        <h3 style={{ fontSize: '20px', fontWeight: '950', marginTop: '15px', color: '#fff' }}>ROZJEDE TO GTA VI?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                            <a href={getGtaPredictionPath('1080p')} className="gta-res-btn"><span className="res-big">1080p</span><span className="res-small">Full HD</span></a>
                            <a href={getGtaPredictionPath('1440p')} className="gta-res-btn"><span className="res-big">1440p</span><span className="res-small">Quad HD</span></a>
                            <a href={getGtaPredictionPath('2160p')} className="gta-res-btn"><span className="res-big">4K</span><span className="res-small">Ultra HD</span></a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: #000; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; }
                .calc-btn { background: #a855f7; color: #fff; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 520px; margin: 40px auto 0; padding: 25px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; text-align: left; }
                .premium-share-btn { width: 48px; height: 48px; border-radius: 12px; cursor: pointer; border: none; color: #fff; display: flex; align-items: center; justify-content: center; }
                .btn-copy { background: #a855f7; } .btn-x { background: #000; border: 1px solid #333; } .btn-reddit { background: #ff4500; }
                .gta-hype-box { max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, rgba(15, 17, 21, 0.9), rgba(159, 18, 57, 0.15)); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 20px; padding: 30px 25px; }
                .gta-res-btn { display: flex; flex-direction: column; align-items: center; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.4); padding: 15px 10px; border-radius: 14px; text-decoration: none; color: #fff; }
                .animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
