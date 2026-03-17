'use client';

import React, { useState } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Check, Award, Twitter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Bezpečná SVG ikona Redditu
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

    const getShareDetails = () => {
        const gameName = games.find(g => g.slug === selectedGameSlug)?.name || 'hře';
        const cpuName = cpus.find(c => c.id === selectedCpuId)?.name || 'můj CPU';
        const gpuName = gpus.find(g => g.id === selectedGpuId)?.name || 'moje GPU';
        const url = isEn ? 'https://thehardwareguru.cz/en/fps-calculator' : 'https://thehardwareguru.cz/fps-kalkulacka';
        return { gameName, cpuName, gpuName, url };
    };

    const handleCopyShare = () => {
        if (!result) return;
        const { gameName, cpuName, gpuName, url } = getShareDetails();
        const textEn = `🔥 My rig hits ${result.fps} FPS in ${gameName} on ${selectedRes}! 🚀\n💻 Build: ${cpuName} + ${gpuName}\n👉 Check your performance at: ${url}`;
        const textCs = `🔥 Moje sestava dává v ${gameName} na ${selectedRes} brutálních ${result.fps} FPS! 🚀\n💻 Železo: ${cpuName} + ${gpuName}\n👉 Změř si to taky na: ${url}`;

        navigator.clipboard.writeText(isEn ? textEn : textCs).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const handleXShare = () => {
        if (!result) return;
        const { gameName, cpuName, gpuName, url } = getShareDetails();
        const textEn = `🔥 My rig hits ${result.fps} FPS in ${gameName} on ${selectedRes}!\n💻 Build: ${cpuName} + ${gpuName}\n\nCheck your PC performance at:`;
        const textCs = `🔥 Moje sestava dává v ${gameName} na ${selectedRes} brutálních ${result.fps} FPS!\n💻 Železo: ${cpuName} + ${gpuName}\n\nZměř si to taky na:`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(isEn ? textEn : textCs)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    const handleRedditShare = () => {
        if (!result) return;
        const { gameName, cpuName, gpuName, url } = getShareDetails();
        const titleEn = `My rig hits ${result.fps} FPS in ${gameName} (${selectedRes}). Build: ${cpuName} + ${gpuName}. What's yours?`;
        const titleCs = `Moje sestava dává v ${gameName} na ${selectedRes} přesně ${result.fps} FPS! (Železo: ${cpuName} + ${gpuName})`;
        const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(isEn ? titleEn : titleCs)}`;
        window.open(redditUrl, '_blank', 'noopener,noreferrer');
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
                    <div style={{ fontSize: '6rem', fontWeight: '950', color: '#fff', textShadow: '0 0 40px rgba(168, 85, 247, 0.4)', margin: '10px 0' }}>{result.fps > 0 ? `${result.fps} FPS` : 'N/A'}</div>
                    
                    {result.fps > 0 && (
                        <div className="viral-flex-card">
                            <div className="award-icon"><Award size={32} color="#fff" /></div>
                            <div className="viral-text-box">
                                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {isEn ? 'ACHIEVEMENT LOCKED' : 'ÚSPĚCH ODEMČEN'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>
                                    {isEn ? 'Share your result online' : 'Pochlub se výsledkem online'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button onClick={handleCopyShare} className="premium-share-btn btn-copy" title={isEn ? "Copy to clipboard" : "Kopírovat do schránky"}>
                                    {copied ? <Check className="check-anim" size={20} /> : <Share2 size={20} />}
                                </button>
                                <button onClick={handleXShare} className="premium-share-btn btn-x" title={isEn ? "Share on X" : "Sdílet na X"}>
                                    <Twitter size={20} />
                                </button>
                                <button onClick={handleRedditShare} className="premium-share-btn btn-reddit" title={isEn ? "Share on Reddit" : "Sdílet na Reddit"}>
                                    <RedditIcon size={20} />
                                </button>
                            </div>
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

                .viral-flex-card { 
                    display: flex; align-items: center; gap: 20px;
                    max-width: 520px; margin: 40px auto 0; padding: 25px; 
                    background: rgba(10, 11, 13, 0.8); 
                    border: 1px solid rgba(168, 85, 247, 0.4); 
                    border-radius: 20px; 
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
                    text-align: left;
                    transition: 0.3s;
                }
                .viral-flex-card:hover { transform: translateY(-3px); box-shadow: 0 0 30px rgba(168, 85, 247, 0.2); }
                .award-icon { display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(168, 85, 247, 0.2); border-radius: 15px; flex-shrink: 0; }
                .viral-text-box { flex: 1; }
                
                .premium-share-btn { 
                    width: 48px; height: 48px; border-radius: 12px; 
                    cursor: pointer; display: inline-flex; align-items: center; justify-content: center; 
                    transition: 0.3s; border: none; color: #fff;
                }
                
                .btn-copy { background: linear-gradient(45deg, #a855f7, #c084fc); }
                .btn-copy:hover { transform: scale(1.08); box-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
                
                .btn-x { background: #000; border: 1px solid rgba(255,255,255,0.2); }
                .btn-x:hover { transform: scale(1.08); background: #111; box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }

                .btn-reddit { background: #ff4500; }
                .btn-reddit:hover { transform: scale(1.08); box-shadow: 0 0 15px rgba(255, 69, 0, 0.5); }

                .check-anim { animation: checkPop 0.3s ease-out; }
                .animate-spin { animation: spin 1s linear infinite; }
                
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes checkPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                
                @media (max-width: 500px) {
                    .viral-flex-card { flex-direction: column; text-align: center; }
                    .viral-text-box { margin-bottom: 10px; }
                    .award-icon { margin: 0 auto; }
                    .premium-share-btn { width: 100%; max-width: 200px; height: 45px; margin-bottom: 5px; }
                }
            `}} />
        </div>
    );
}
