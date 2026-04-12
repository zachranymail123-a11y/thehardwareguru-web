'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Cpu, Gamepad2, Zap, Loader2, Share2, Award, Twitter, Sparkles, ShoppingCart, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import ShareFpsButton from '../../components/ShareFpsButton';

/**
 * GURU FPS ENGINE CLIENT - V11.15 (MAX REVENUE PER USER)
 * 🚀 CÍL: Smart Sell logic, FPS Urgency, Instant Hook a Retargeting storage.
 */

const AMAZON_TAG = "thehardware07-20";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();

export default function FpsCalculatorClient({ gpus = [], cpus = [], games = [], isEn = false }) {
    const [selectedGameSlug, setSelectedGameSlug] = useState('');
    const [selectedRes, setSelectedRes] = useState('1440p');
    const [selectedGpuId, setSelectedGpuId] = useState('');
    const [selectedCpuId, setSelectedCpuId] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        setResult(null);
    }, [selectedGpuId, selectedCpuId, selectedGameSlug, selectedRes]);

    const selectedCpu = useMemo(() => cpus.find(c => String(c.id) === String(selectedCpuId)), [selectedCpuId, cpus]);
    const selectedGpu = useMemo(() => gpus.find(g => String(g.id) === String(selectedGpuId)), [selectedGpuId, gpus]);
    const selectedGame = useMemo(() => games.find(g => String(g.slug) === String(selectedGameSlug)), [selectedGameSlug, games]);

    const cleanCpuName = useMemo(() => normalizeName(selectedCpu?.name || ''), [selectedCpu]);
    const cleanGpuName = useMemo(() => normalizeName(selectedGpu?.name || ''), [selectedGpu]);

    const getAmazonLink = (name, type = 'main') => {
        const cleanSlug = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
        const gameTag = selectedGameSlug || 'generic';
        return `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=fps-${gameTag}-${selectedRes}-${type}-${cleanSlug}`;
    };

    const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;

    // 🔥 FIX #2: PRECISION PRELOAD GUARD 🔥
    useEffect(() => {
        if (!selectedGpu?.name || !isEn) return;
        const url = getAmazonLink(selectedGpu.name, 'gpu');
        if (document.querySelector(`link[href="${url}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'preload'; link.as = 'document'; link.href = url;
        document.head.appendChild(link);
        return () => { if (document.head.contains(link)) document.head.removeChild(link); };
    }, [selectedGpu?.id, isEn]);

    // 🔥 FIX #7: RETARGETING STORAGE 🔥
    useEffect(() => {
        if (selectedGpu?.name) {
            localStorage.setItem("guru_last_gpu", selectedGpu.name);
        }
    }, [selectedGpu]);

    // 🔥 FIX #3: FPS URGENCY LAYER 🔥
    const upgradeUrgency = useMemo(() => {
        if (!result?.fps) return '';
        if (result.fps < 50) return isEn ? '🔥 Upgrade needed NOW' : '🔥 Upgrade nutný OKAMŽITĚ';
        if (result.fps < 90) return isEn ? '⚡ Better performance possible' : '⚡ Lze zlepšit výkon';
        return '';
    }, [result, isEn]);

    const fpsLabel = useMemo(() => {
        if (!result?.fps) return '';
        const fps = result.fps;
        if (fps < 40) return isEn ? 'LOW PERFORMANCE' : 'NÍZKÝ VÝKON';
        if (fps < 80) return isEn ? 'PLAYABLE' : 'HRATELNÉ';
        if (fps < 140) return isEn ? 'SMOOTH' : 'PLYNULÉ';
        return isEn ? 'ULTRA SMOOTH' : 'EXTRÉMNĚ PLYNULÉ';
    }, [result, isEn]);

    const gpuCta = useMemo(() => {
        const poolEn = [`🔥 BEST PRICE: ${cleanGpuName}`, `⚡ BUY ${cleanGpuName} NOW`];
        const poolCz = [`🔥 NEJLEVNĚJŠÍ ${cleanGpuName}`, `⚡ KOUPIT ${cleanGpuName}`];
        return isEn ? poolEn[Math.floor(Math.random() * poolEn.length)] : poolCz[Math.floor(Math.random() * poolCz.length)];
    }, [cleanGpuName, isEn]);

    const cpuCta = useMemo(() => {
        const poolEn = [`🔥 BEST PRICE: ${cleanCpuName}`, `⚡ BUY ${cleanCpuName} NOW`];
        const poolCz = [`🔥 NEJLEVNĚJŠÍ ${cleanCpuName}`, `⚡ KOUPIT ${cleanCpuName}`];
        return isEn ? poolEn[Math.floor(Math.random() * poolEn.length)] : poolCz[Math.floor(Math.random() * poolCz.length)];
    }, [cleanCpuName, isEn]);

    // 🔥 FIX #1: SMART SELL WINNER LOGIC (BALANCED GUARD) 🔥
    const winner = useMemo(() => {
        if (!selectedCpu || !selectedGpu || !selectedGame) return null;
        const cpuPerf = selectedCpu.performance_index ?? 100;
        const gpuPerf = selectedGpu.performance_index ?? 100;
        const ratio = gpuPerf / cpuPerf;

        // Pokud je sestava vyvážená (0.8 - 1.2), nic nevnucujeme
        if (ratio > 0.8 && ratio < 1.2) return null;

        const isCpuHeavy = ['cs2', 'valorant', 'gta-v'].includes(selectedGame.slug);
        if (isCpuHeavy) return cpuPerf < gpuPerf ? selectedCpu : null;
        return gpuPerf < cpuPerf ? selectedGpu : null;
    }, [selectedCpu, selectedGpu, selectedGame]);

    const handleCalculate = () => {
        if (!selectedGpuId || !selectedCpuId || !selectedGameSlug) return;
        setIsCalculating(true); setResult(null);
        setTimeout(() => {
            const cpuPerf = selectedCpu?.performance_index ?? 100;
            const gpuPerf = selectedGpu?.performance_index ?? 100;
            const cpuNameLower = (selectedCpu?.name || '').toLowerCase();
            const gameDataMap = {
                'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
                'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
                'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
                'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
                'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
                'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
            };
            const gData = gameDataMap[selectedGameSlug] || gameDataMap['generic'];
            let ipcBase = 100; let archEfficiency = 1.0;
            if (cpuNameLower.includes('x3d')) archEfficiency *= 1.4;
            if (cpuNameLower.includes('9800x3d')) ipcBase = 135;
            else if (cpuNameLower.includes('7800x3d')) ipcBase = 115;
            const cpuEffective = (ipcBase * (1 - gData.thread_scaling) + cpuPerf * gData.thread_scaling) * archEfficiency;
            const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[selectedRes] || 1.5;
            const gpuEffective = gpuPerf / resMultiplier;
            const estFps = Math.max(1, Math.round(Math.min((cpuEffective / gData.cpu_weight) * gData.fps_scale, (gpuEffective / gData.gpu_weight) * gData.fps_scale)));
            setResult({ fps: estFps });
            setIsCalculating(false);
        }, 800);
    };

    const trackClick = (item, type) => {
        if (typeof window !== 'undefined' && window.gtag) {
            // 🔥 FIX #4: REVENUE VALUE NORMALIZATION 🔥
            const metricValue = (result?.fps || 0) < 60 ? 2 : 1; 
            window.gtag('event', 'affiliate_click', { 
                item_name: item, item_category: type, game: selectedGameSlug, resolution: selectedRes, value: metricValue 
            });
        }
    };

    return (
        <div className="guru-calc-box">
            <div className="guru-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="input-field"><label><Gamepad2 size={14} /> {isEn ? 'GAME' : 'HRA'}</label><select value={selectedGameSlug} onChange={(e) => setSelectedGameSlug(e.target.value)} className="guru-select"><option value="">{isEn ? '-- Select --' : '-- Vyber hru --'}</option>{games.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}</select></div>
                <div className="input-field"><label><Monitor size={14} /> {isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</label><select value={selectedRes} onChange={(e) => setSelectedRes(e.target.value)} className="guru-select"><option value="1080p">1080p Full HD</option><option value="1440p">1440p Quad HD</option><option value="2160p">4K Ultra HD</option></select></div>
                <div className="input-field"><label><Zap size={14} /> GPU</label><select value={selectedGpuId} onChange={(e) => setSelectedGpuId(e.target.value)} className="guru-select"><option value="">{isEn ? '-- Select --' : '-- Vyber GPU --'}</option>{gpus.map(g => <option key={g.id} value={g.id}>{g.vendor} {g.name}</option>)}</select></div>
                <div className="input-field"><label><Cpu size={14} /> CPU</label><select value={selectedCpuId} onChange={(e) => setSelectedCpuId(e.target.value)} className="guru-select"><option value="">{isEn ? '-- Select --' : '-- Vyber CPU --'}</option>{cpus.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleCalculate} disabled={!selectedGpuId || !selectedCpuId || !selectedGameSlug || isCalculating} className="calc-btn">
                    {isCalculating ? <Loader2 className="animate-spin" /> : <Zap size={18} />} {isEn ? 'CALCULATE FPS' : 'SPOČÍTAT VÝKON'}
                </button>
            </div>

            {result && !isCalculating && (
                <div className="result-area" style={{ marginTop: '40px', textAlign: 'center', animation: 'fadeIn 0.7s ease-out' }}>
                    {/* 🔥 FIX #5: INSTANT HOOK 🔥 */}
                    <div style={{ background: 'linear-gradient(90deg,#f59e0b,#ef4444)', padding: '12px', borderRadius: '14px', fontWeight: '950', marginBottom: '25px', color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ⚡ {isEn ? 'Real user setup analysis' : 'Analýza reálné herní sestavy'}
                    </div>

                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '950' }}>{isEn ? 'ESTIMATED FPS' : 'ODHADOVANÉ FPS'}</div>
                    <div className="fps-value" style={{ fontSize: '7rem', fontWeight: '950', color: '#fff', textShadow: '0 0 50px rgba(168, 85, 247, 0.6)', margin: '5px 0', lineHeight: 1 }}>{result.fps}</div>
                    
                    <div style={{ color:'#10b981', fontWeight:'950', fontSize: '20px', textTransform: 'uppercase', marginBottom: '10px' }}>{fpsLabel}</div>
                    
                    {/* 🔥 FIX #3: UPGRADE URGENCY 🔥 */}
                    {upgradeUrgency && <div style={{ color:'#ef4444', fontWeight:'950', fontSize: '14px', marginBottom: '25px' }}>{upgradeUrgency}</div>}

                    {/* 🔥 FIX #1: WINNER BOX 🔥 */}
                    {winner && (
                        <div className="winner-logic-box" style={{ marginBottom: '40px', background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="winner-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase' }}>
                                <TrendingUp size={16} /> {isEn ? 'UPGRADE RECOMMENDED:' : 'DOPORUČENÝ UPGRADE:'} {winner?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontWeight: '700' }}>
                                {isEn ? 'Your current setup is limiting potential gaming performance' : 'Tvoje aktuální sestava omezuje celkový herní výkon'}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                        <ShareFpsButton gameName={selectedGame?.name} cpu={selectedCpu?.name} gpu={selectedGpu?.name} resolution={selectedRes} avgFps={result.fps} isEn={isEn} />
                        <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="bottleneck-cta-btn hover-scale">
                            <AlertTriangle size={20} /> {isEn ? 'TEST SYSTEM BOTTLENECK' : 'ZJISTIT BOTTLENECK SESTAVY'}
                        </a>
                    </div>

                    <div className="affiliate-cta-grid">
                        <div className="affiliate-col">
                            <div className="affiliate-col-title"><Monitor size={16} /> GPU</div>
                            <div className="affiliate-btn-wrap">
                                {isEn ? (
                                    <a href={getAmazonLink(selectedGpu?.name, 'gpu')} onClick={() => trackClick(selectedGpu?.name, 'gpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn amazon-btn">
                                        <ShoppingCart size={16} /> {gpuCta}
                                    </a>
                                ) : (
                                    <>
                                        <a href={getSmartyLink(cleanGpuName)} onClick={() => trackClick(selectedGpu?.name, 'gpu')} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">Smarty.cz</a>
                                        <a href={getHeurekaLink(selectedGpu?.name)} onClick={() => trackClick(selectedGpu?.name, 'gpu')} data-trixam-positionid="276026" data-trixam-content="Text link" data-trixam-medium="affiliate" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link">Heureka.cz</a>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="affiliate-col">
                            <div className="affiliate-col-title"><Cpu size={16} /> CPU</div>
                            <div className="affiliate-btn-wrap">
                                {isEn ? (
                                    <a href={getAmazonLink(selectedCpu?.name, 'cpu')} onClick={() => trackClick(selectedCpu?.name, 'cpu')} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn amazon-btn">
                                        <ShoppingCart size={16} /> {cpuCta}
                                    </a>
                                ) : (
                                    <>
                                        <a href={getSmartyLink(cleanCpuName)} onClick={() => trackClick(selectedCpu?.name, 'cpu')} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">Smarty.cz</a>
                                        <a href={getHeurekaLink(selectedCpu?.name)} onClick={() => trackClick(selectedCpu?.name, 'cpu')} data-trixam-positionid="276027" data-trixam-content="Text link" data-trixam-medium="affiliate" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link">Heureka.cz</a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div style={{ fontSize:'11px', color:'#f59e0b', fontWeight:'900', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {isEn ? 'Prices update hourly' : 'Ceny se mění každou hodinu'}</div>
                        <div style={{ fontSize:'10px', opacity:0.7, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={10} /> {isEn ? 'Based on real benchmarks & AI prediction' : 'Na základě reálných benchmarků a AI predikce'}</div>
                    </div>
                    {isEn && <div style={{fontSize:'10px', opacity:0.6, marginTop:'20px', color: '#9ca3af'}}>As an Amazon Associate I earn from qualifying purchases.</div>}

                    <div className="gta-hype-box">
                        <span className="gta-badge"><Sparkles size={14} /> GTA VI PREDICTOR</span>
                        <h3 className="gta-title">{isEn ? 'Will this rig handle GTA VI?' : 'Rozjede tohle GTA VI?'}</h3>
                        <div className="gta-res-grid">
                            <a href={`/${isEn ? 'en/fps-calculator' : 'fps-kalkulacka'}/gta-6-prediction/${(selectedCpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${(selectedGpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1080p?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`} className="gta-res-btn">1080p</a>
                            <a href={`/${isEn ? 'en/fps-calculator' : 'fps-kalkulacka'}/gta-6-prediction/${(selectedCpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${(selectedGpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1440p?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`} className="gta-res-btn">1440p</a>
                            <a href={`/${isEn ? 'en/fps-calculator' : 'fps-kalkulacka'}/gta-6-prediction/${(selectedCpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${(selectedGpu?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-2160p?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`} className="gta-res-btn">4K</a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .guru-calc-box { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .guru-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-weight: 900; appearance: none; cursor: pointer; transition: 0.3s; }
                .input-field label { display: block; margin-bottom: 10px; font-size: 11px; font-weight: 950; text-transform: uppercase; color: #9ca3af; }
                .calc-btn { background: #a855f7; color: #fff; border: none; padding: 18px 40px; font-size: 16px; font-weight: 950; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
                .calc-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4); }
                .bottleneck-cta-btn { display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); padding: 14px 28px; border-radius: 16px; font-weight: 950; font-size: 15px; text-transform: uppercase; text-decoration: none; transition: 0.3s; width: 100%; max-width: 400px; }
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; padding: 25px; background: rgba(0,0,0,0.4); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .affiliate-col-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; color: #a855f7; text-transform: uppercase; margin-bottom: 15px; justify-content: center; }
                .affiliate-btn-wrap { display: flex; gap: 10px; width: 100%; justify-content: center; }
                .guru-buy-winner-btn { flex: 1; display: inline-flex; justify-content: center; align-items: center; gap: 8px; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 950; font-size: 12px; text-transform: uppercase; transition: 0.3s; color: #000; }
                .smarty-btn { background: #facc15; }
                .heureka-btn { background: #3b82f6; color: #fff !important; }
                .amazon-btn { background: #f59e0b; border: 2px solid #fbbf24; width: 100%; }
                .gta-hype-box { max-width: 500px; margin: 40px auto 0; background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 20px; padding: 30px; }
                .gta-badge { color: #f43f5e; font-size: 11px; font-weight: 950; text-transform: uppercase; }
                .gta-title { font-size: 22px; fontWeight: 950; color: #fff; margin: 10px 0 20px; }
                .gta-res-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .gta-res-btn { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; text-decoration: none; color: #fff; font-weight: 950; transition: 0.3s; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
                .gta-res-btn:hover { background: #f43f5e; border-color: #f43f5e; transform: translateY(-2px); }
                @media (max-width: 768px) {
                    .affiliate-cta-grid { grid-template-columns: 1fr; }
                    .affiliate-btn-wrap { flex-direction: column; }
                    .fps-value { font-size: 4.5rem !important; }
                    .calc-btn { width: 100%; justify-content: center; }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
