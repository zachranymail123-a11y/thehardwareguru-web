'use client';

import React, { useState } from 'react';
import { 
  Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, 
  Twitter, Sparkles, ArrowRight, Facebook 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE V7.2 (THE VIRAL UPDATE)
 * 🛡️ BASELINE: RTX 4090 + 9850X3D = 325 (1080p) / 318 (1440p) / 242 (4K).
 * 🛡️ FEAT: Guru Viral Hub (X, Facebook, Reddit, Copy Link).
 * 🛡️ FIX: Dark Mode pro SELECTY a OPTIONY.
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

    const calculateFps = (gpuPerf, cpuPerf, resolution) => {
        let base = 318;
        const resScale = { '1080p': 1.022, '1440p': 1.0, 'uwqhd': 0.88, '2160p': 0.761, 'dqhd': 0.62 };
        const scale = resScale[resolution] || 1.0;
        let rawFps = base * (gpuPerf / 100) * scale;
        const cpuFactor = cpuPerf / 100;
        rawFps = (rawFps * 0.8) + (rawFps * 0.2 * cpuFactor);
        return Math.round(rawFps);
    };

    const getGtaPath = (res) => {
        const cpu = cpus.find(c => c.id === selectedCpuId)?.name || 'cpu';
        const gpu = gpus.find(g => g.id === selectedGpuId)?.name || 'gpu';
        const slug = `${cpu}-vs-${gpu}-${res}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return isEn ? `/en/fps-calculator/gta-6-prediction/${slug}` : `/fps-kalkulacka/gta-6-predikce/${slug}`;
    };

    const handleCalculate = async () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true);
        setResult(null);
        const gpu = gpus.find(g => g.id === selectedGpuId);
        const cpu = cpus.find(c => c.id === selectedCpuId);
        const gpuPerf = gpu?.performance_index || 100;
        const cpuPerf = cpu?.performance_index || 100;
        const finalFps = calculateFps(gpuPerf, cpuPerf, selectedRes);
        setTimeout(() => { setResult({ fps: finalFps }); setIsCalculating(false); }, 800);
    };

    const getShareText = () => {
        const game = games.find(g => g.slug === selectedGameSlug)?.name || 'GTA VI';
        const url = `https://thehardwareguru.cz${isEn ? '/en/fps-calculator' : '/fps-kalkulacka'}`;
        return isEn 
            ? `🔥 My rig hits ${result?.fps} FPS in ${game} at ${selectedRes}! Check yours at: ${url}` 
            : `🔥 Moje sestava dává v ${game} na ${selectedRes} přesně ${result?.fps} FPS! Změř si to taky na: ${url}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    
                    <div className="viral-share-hub">
                        <div style={{fontSize: '11px', fontWeight: '950', marginBottom: '15px', color: '#6b7280', textTransform: 'uppercase'}}>{isEn ? 'Share your build' : 'Pochlub se sestavou'}</div>
                        <div className="share-buttons">
                            <button onClick={handleCopy} className="s-btn copy">{copied ? <Check size={20}/> : <Share2 size={20}/>}</button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`, '_blank')} className="s-btn x"><Twitter size={20}/></button>
                            <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://thehardwareguru.cz/fps-kalkulacka')}`, '_blank')} className="s-btn fb"><Facebook size={20}/></button>
                            <button onClick={() => window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(getShareText())}`, '_blank')} className="s-btn reddit"><RedditIcon size={20}/></button>
                        </div>
                    </div>

                    <div className="gta-bait-box">
                        <div className="gta-tag"><Sparkles size={14} /> NEXT-GEN AI</div>
                        <h3>{isEn ? 'RUN GTA VI ON THIS RIG?' : 'POJEDE TI NA TOM GTA VI?'}</h3>
                        <div className="gta-links">
                            <a href={getGtaPath('1080p')}>1080p <ArrowRight size={14}/></a>
                            <a href={getGtaPath('1440p')}>1440p <ArrowRight size={14}/></a>
                            <a href={getGtaPath('2160p')}>4K <ArrowRight size={14}/></a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.98); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .input-field label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; }
                .guru-select { width: 100%; background: #0a0b0d !important; color: #fff !important; border: 1px solid #1f2937; padding: 15px; border-radius: 12px; font-weight: 950; }
                .calc-btn { background: #f43f5e; color: #fff; border: none; padding: 20px 60px; font-size: 16px; font-weight: 950; border-radius: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
                .calc-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(244, 63, 94, 0.4); }
                .result-area { margin-top: 40px; animation: fadeIn 0.5s ease-out; }
                .res-label { font-size: 12px; color: #f43f5e; font-weight: 950; letter-spacing: 2px; }
                .fps-val { font-size: 7rem; font-weight: 950; color: #fff; margin: 10px 0; text-shadow: 0 0 40px rgba(244, 63, 94, 0.3); }
                
                .viral-share-hub { max-width: 400px; margin: 30px auto; }
                .share-buttons { display: flex; justify-content: center; gap: 15px; }
                .s-btn { width: 50px; height: 50px; border-radius: 14px; border: none; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .copy { background: #4b5563; }
                .x { background: #000; border: 1px solid #333; }
                .fb { background: #1877f2; }
                .reddit { background: #ff4500; }
                .s-btn:hover { transform: translateY(-5px); filter: brightness(1.2); }

                .gta-bait-box { background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(0,0,0,0.5)); border: 1px solid rgba(244, 63, 94, 0.3); padding: 30px; border-radius: 24px; margin-top: 40px; }
                .gta-tag { display: inline-flex; align-items: center; gap: 6px; background: #f43f5e; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 950; margin-bottom: 15px; }
                .gta-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
                .gta-links a { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
                .gta-links a:hover { background: #f43f5e; border-color: #f43f5e; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
