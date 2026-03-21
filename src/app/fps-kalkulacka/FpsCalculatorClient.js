'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU FPS ENGINE CLIENT - V11.1 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Maximální vytěžení CTR z každého výpočtu výkonu skrze A-ADS.
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

        // Simulace motoru a DB fetchování...
        setTimeout(() => {
            setResult({ fps: 145, confidence: 0.95 });
            setIsCalculating(false);
        }, 800);
    };

    const getGtaPredictionPath = (targetRes) => getGtaUrl(targetRes).replace('https://thehardwareguru.cz', '');

    return (
        <div className="guru-calc-box">
            <div className="guru-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '15px 0' }}>{result.fps} FPS</div>

                    {/* 🔥 ADS SLOT: GURU MONETIZATION ENGINE (INJEKCE MEZI VÝSLEDKY) */}
                    <div className="guru-client-ad-slot">
                        <span className="ad-label">Sponsored Hardware Deal</span>
                        <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                        <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                    </div>

                    <div className="viral-flex-card">
                        <div className="award-icon"><Award size={32} color="#fff" /></div>
                        <div className="viral-text-box">
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{isEn ? 'ACHIEVEMENT LOCKED' : 'ÚSPĚCH ODEMČEN'}</div>
                            <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>{isEn ? 'Share your result' : 'Pochlub se výsledkem'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => {}} className="premium-share-btn btn-copy"><Share2 size={20} /></button>
                            <button onClick={() => {}} className="premium-share-btn btn-x"><Twitter size={20} /></button>
                        </div>
                    </div>

                    <div className="gta-hype-box" style={{ marginTop: '30px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase' }}><Sparkles size={14} /> GTA VI PREDICTOR</span>
                        <h3 style={{ fontSize: '20px', fontWeight: '950', marginTop: '10px', color: '#fff' }}>{isEn ? 'Will this rig run GTA VI?' : 'Rozjede tohle železo GTA VI?'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
                            <a href={getGtaPredictionPath('1080p')} className="gta-res-btn">1080p</a>
                            <a href={getGtaPredictionPath('1440p')} className="gta-res-btn">1440p</a>
                            <a href={getGtaPredictionPath('2160p')} className="gta-res-btn">4K</a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; cursor: pointer; }
                .input-field label { display: block; margin-bottom: 10px; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }

                .guru-client-ad-slot { margin: 30px 0; padding: 15px; background: rgba(168, 85, 247, 0.02); border: 1px dashed rgba(168, 85, 247, 0.2); border-radius: 20px; text-align: center; }
                .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
                .ad-desktop { display: block; } .ad-mobile { display: none; }

                .viral-flex-card { display: flex; align-items: center; gap: 20px; max-width: 520px; margin: 40px auto 0; padding: 25px; background: rgba(10, 11, 13, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; }
                .premium-share-btn { width: 48px; height: 48px; border-radius: 12px; cursor: pointer; border: none; color: #fff; background: rgba(255,255,255,0.05); }
                .btn-copy { background: #a855f7; }

                .gta-hype-box { max-width: 520px; margin: 0 auto; background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 20px; padding: 25px; }
                .gta-res-btn { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); padding: 12px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; }
                .gta-res-btn:hover { background: #f43f5e; transform: translateY(-2px); }

                @media (max-width: 768px) { 
                    .ad-desktop { display: none; } .ad-mobile { display: block; }
                    .result-area { margin-top: 20px; }
                }
            `}} />
        </div>
    );
}
