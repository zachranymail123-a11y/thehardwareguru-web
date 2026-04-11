'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
 Cpu, Monitor, Zap, AlertTriangle, Crosshair, Settings2, Sparkles, 
 TrendingUp, TrendingDown, Layers, Target, Video, Share2, Check, 
 Twitter, Award, Swords, Gamepad2, ChevronRight, Play, Newspaper, Lightbulb, ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../components/SeznamAd';
import HeurekaButtons from '../../components/HeurekaButtons'; 
import ShareResultButton from '../../components/ShareResultButton';

/**
 * GURU BOTTLENECK ENGINE CLIENT - V11.9 (AFFILIATE TRACKING & OVERFLOW FIX)
 * 🚀 CÍL: Fix trackování (UTM, Trixam IDs, HN class) + oprava CSS přetečení.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel |Ryzen |Core /gi, '').trim();

const RedditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.05-6.65c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm4.1 0c-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.73 0 1.33.6 1.33 1.33 0 .73-.6 1.33-1.33 1.33zm1.64-3.56c-.34 0-.64.16-.84.4-.58-.4-1.36-.67-2.24-.72l.47-2.18 1.5.32c.04.53.48.95 1.02.95.57 0 1.03-.46 1.03-1.03 0-.57-.46-1.03-1.03-1.03-.42 0-.78.26-.94.63l-1.64-.35c-.06-.01-.13 0-.17.05-.05.04-.07.1-.06.16l-.52 2.45c-.93.03-1.74.32-2.35.74-.2-.23-.5-.38-.83-.38-.6 0-1.08.48-1.08 1.08 0 .42.24.78.58.96-.02.12-.03.24-.03.37 0 1.88 2.05 3.4 4.58 3.4s4.58-1.52 4.58-3.4c0-.13-.01-.25-.03-.37.34-.18.58-.54.58-.96 0-.6-.48-1.08-1.08-1.08zm-4.14 3.12c-.93 0-1.66-.4-1.7-.44-.1-.1-.11-.27-.01-.38.1-.1.27-.11.38-.01.02.01.62.33 1.33.33.7 0 1.31-.32 1.33-.33.11-.1.28-.09.38.01.1.11.09.28-.01.38-.04.04-.77.44-1.7.44z" />
  </svg>
);

export default function BottleneckClient({ 
    gpus = [], cpus = [], games = [], isEn = false, initialCpuId = '', initialGpuId = '', initialGameSlug = '', initialResolution = '1440p' 
}) {
    const [selectedCpuId, setSelectedCpuId] = useState(initialCpuId);
    const [selectedGpuId, setSelectedGpuId] = useState(initialGpuId);
    const [selectedGameSlug, setSelectedGameSlug] = useState(initialGameSlug);
    const [resolution, setResolution] = useState(initialResolution);
    const [isCalculating, setIsCalculating] = useState(false);
    const [enableUpscaling, setEnableUpscaling] = useState(false); 
    const [isStreaming, setIsStreaming] = useState(false); 
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [sb, setSb] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (initialCpuId) setShowResult(true);
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) setSb(createClient(url, key));
    }, [initialCpuId]);

    const analysis = useMemo(() => {
        if (!showResult || !selectedCpuId || !selectedGpuId || !selectedGameSlug) return null;

        const cpu = Array.isArray(cpus) ? cpus.find(c => String(c.id) === String(selectedCpuId)) : null;
        const gpu = Array.isArray(gpus) ? gpus.find(g => String(g.id) === String(selectedGpuId)) : null;
        const baseGame = Array.isArray(games) ? games.find(g => String(g.slug) === String(selectedGameSlug)) : null;

        if (!cpu || !gpu) return null;

        const cpuName = String(cpu.name || '').toLowerCase();
        const gpuName = String(gpu.name || '').toLowerCase();

        const gameDataMap = {
            'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
            'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
            'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
            'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
            'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
            'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
        };
        const game = gameDataMap[baseGame?.slug] || gameDataMap['generic'];

        let ipcBase = 100; 
        let archEfficiency = 1.0;
        if (cpuName.includes('x3d')) archEfficiency *= 1.4;
        if (cpuName.includes('9800x3d')) ipcBase = 135;
        else if (cpuName.includes('7800x3d')) ipcBase = 115;

        let cpuEffective = (ipcBase * (1 - game.thread_scaling) + (Number(cpu.performance_index) || 100) * game.thread_scaling) * archEfficiency;
        if (isStreaming) cpuEffective *= 0.85;

        const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
        let gpuEffective = (Number(gpu.performance_index) || 100) / resMultiplier;
        if (enableUpscaling) gpuEffective *= 1.3;
        
        const rawCpuFps = (cpuEffective / (game.cpu_weight || 1)) * game.fps_scale;
        const rawGpuFps = (gpuEffective / (game.gpu_weight || 1)) * game.fps_scale;

        const safeCpuFps = isFinite(rawCpuFps) ? rawCpuFps : 0;
        const safeGpuFps = isFinite(rawGpuFps) ? rawGpuFps : 0;
        const estFps = Math.max(1, Math.round(Math.min(safeCpuFps, safeGpuFps)));
        const maxFps = Math.max(safeCpuFps, safeGpuFps, 1);
        const diff = Math.abs(safeCpuFps - safeGpuFps) / maxFps;
        const safeDiff = isFinite(diff) ? diff : 0;

        return {
            boundType: safeCpuFps < safeGpuFps ? 'CPU_BOUND' : (safeDiff < 0.08 ? 'BALANCED' : 'GPU_BOUND'),
            limitedBy: safeCpuFps < safeGpuFps ? 'CPU' : 'GPU',
            bottleneckPercent: Math.round(safeDiff * 100), 
            estFps, 
            low1Fps: Math.max(0, Math.round(estFps * (1 - safeDiff * 0.8))),
            frameTimeMs: (Number.isFinite(estFps) && estFps > 0) ? (1000 / estFps).toFixed(1) : '0.0',
            cpuName: String(cpu.name || 'CPU'), 
            gpuName: String(gpu.name || 'GPU'), 
            gameName: String(baseGame?.name || 'Hra')
        };
    }, [showResult, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, enableUpscaling, isStreaming, cpus, gpus, games]);

    useEffect(() => {
        if (typeof window === 'undefined' || !analysis) return;
        
        const cpuSafe = String(analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const gpuSafe = String(analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slugBase = `${cpuSafe}-vs-${gpuSafe}-${selectedGameSlug}-${resolution}`;
        const fullUrl = `https://thehardwareguru.cz/${isEn ? 'en/bottleneck-calculator' : 'bottleneck-kalkulacka'}/${slugBase}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}`;
        
        setShareUrl(fullUrl);

        if (sb && !initialCpuId) {
            try {
                sb.from('generated_predictions').upsert({
                    slug_base: slugBase, cpu_id: selectedCpuId, gpu_id: selectedGpuId, full_url: fullUrl, last_requested: new Date().toISOString()
                }, { onConflict: 'full_url' }).catch(() => {});
            } catch (e) {}
        }
    }, [analysis, selectedCpuId, selectedGpuId, selectedGameSlug, resolution, isEn, initialCpuId, sb]);

    const handleStart = () => {
        setIsCalculating(true);
        setTimeout(() => { setShowResult(true); setIsCalculating(false); }, 800);
    };

    const handleCopyShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
            const text = isEn 
                ? `🔥 My rig bottleneck result: ${shareUrl}` 
                : `🔥 Moje sestava má přesně ${analysis?.bottleneckPercent || 0}% Bottleneck! 👉 ${shareUrl}`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleXShare = () => {
        if (!analysis) return;
        const textEn = `🔥 My rig hits ${analysis.estFps} FPS in ${analysis.gameName} on ${resolution}!\n💻 Build: ${analysis.cpuName} + ${analysis.gpuName}\n\nCheck your PC at: ${shareUrl}`;
        const textCs = `🔥 Moje sestava dává v ${analysis.gameName} na ${resolution} brutálních ${analysis.estFps} FPS!\n💻 Železo: ${analysis.cpuName} + ${analysis.gpuName}\n\nZměř si to na: ${shareUrl}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(isEn ? textEn : textCs)}`, '_blank');
    };

    const handleRedditShare = () => {
        if (!analysis) return;
        const titleEn = `My rig hits ${analysis.estFps} FPS in ${analysis.gameName} (${resolution}). Build: ${analysis.cpuName} + ${analysis.gpuName}`;
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(titleEn)}`, '_blank');
    };

    const gta6DynamicLink = analysis 
        ? `/${isEn ? 'en/fps-calculator/gta-6-prediction' : 'fps-kalkulacka/gta-6-predikce'}/${String(analysis.cpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${String(analysis.gpuName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${resolution}?cpuId=${selectedCpuId}&gpuId=${selectedGpuId}` 
        : null;

    const a = analysis || {};
    const statusColor = (a.bottleneckPercent || 0) < 15 ? '#10b981' : ((a.bottleneckPercent || 0) < 30 ? '#f59e0b' : '#ef4444');

    const cleanCpuName = a.cpuName ? normalizeName(a.cpuName) : '';
    const cleanGpuName = a.gpuName ? normalizeName(a.gpuName) : '';

    // 🔥 AFFILIATE LINK GENERATORS 🔥
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

    return (
        <div className="bn-wrapper">
            <div className="bn-header">
                <div className="pred-badge"><Layers size={16} /> PROFESSIONAL SIMULATOR</div>
                <h1 className="bn-main-title" style={{ fontSize: '3.5rem', fontWeight: '950', textTransform: 'uppercase', margin: '10px 0', textShadow: '0 0 30px rgba(102, 252, 241, 0.4)' }}>
                    {isEn ? 'System Bottleneck' : 'Bottleneck Kalkulačka'}
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Najdi nejslabší článek své sestavy.</p>
            </div>

            <div className="bn-grid">
                <div className="bn-inputs-card">
                    <h3 className="section-title"><Settings2 size={18} /> Konfigurace</h3>
                    <div className="input-group">
                        <label>Herní Engine</label>
                        <select value={selectedGameSlug} onChange={(e) => { setSelectedGameSlug(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber hru --</option>
                            {(games || []).map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Rozlišení</label>
                        <div className="res-toggles">
                            {['1080p', '1440p', '2160p'].map(res => (
                                <button key={res} onClick={() => { setResolution(res); setShowResult(false); }} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res === '2160p' ? '4K' : res}</button>
                            ))}
                        </div>
                    </div>
                    <div className="toggle-grid">
                        <div className="toggle-row" onClick={() => { setEnableUpscaling(!enableUpscaling); setShowResult(false); }}>
                            <div className={`switch ${enableUpscaling ? 'on' : 'off'}`}></div>
                            <span>DLSS / FSR</span>
                        </div>
                        <div className="toggle-row" onClick={() => { setIsStreaming(!isStreaming); setShowResult(false); }}>
                            <div className={`switch ${isStreaming ? 'on' : 'off'}`}></div>
                            <span>OBS Stream</span>
                        </div>
                    </div>
                    <hr className="bn-divider" />
                    <div className="input-group">
                        <label><Cpu size={14} /> CPU</label>
                        <select value={selectedCpuId} onChange={(e) => { setSelectedCpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber procesor --</option>
                            {(cpus || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label><Zap size={14} /> GPU</label>
                        <select value={selectedGpuId} onChange={(e) => { setSelectedGpuId(e.target.value); setShowResult(false); }} className="bn-select">
                            <option value="">-- Vyber grafiku --</option>
                            {(gpus || []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleStart} disabled={!selectedCpuId || !selectedGpuId || !selectedGameSlug || isCalculating} className="start-btn">
                        {isCalculating ? <Sparkles className="spin" /> : <Play size={20} />} SPUSTIT SIMULACI
                    </button>
                    
                    {/* Zde jsou zobrazená tlačítka vedle sebe po analýze */}
                    {analysis && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
                            <ShareResultButton 
                                cpu={a.cpuName} 
                                gpu={a.gpuName} 
                                resolution={resolution} 
                                bottleneck={`${a.bottleneckPercent} %`} 
                                score={100 - (a.bottleneckPercent || 0)} 
                                isEn={isEn} 
                            />
                            <a 
                                href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} 
                                className="fps-cta-btn hover-scale"
                            >
                                <Gamepad2 size={20} /> {isEn ? 'TEST FPS IN GAMES' : 'ZJISTIT FPS VE HRÁCH'}
                            </a>
                        </div>
                    )}
                </div>

                <div className="bn-result-card">
                    {!analysis ? (
                        <div className="empty-state"><Crosshair size={64} color="rgba(255,255,255,0.05)" /><p>Nastav hardware a spusť simulaci.</p></div>
                    ) : (
                        <div className="analysis-board">
                            <div style={{ textAlign: 'center' }}>
                                <div className={`bound-badge ${(a.boundType || '').toLowerCase().replace('_', '-')}`}>{a.boundType ? a.boundType.replace('_', ' ') : ''}</div>
                            </div>
                            <div className="percentage-display">
                                <div className="pct-value" style={{ color: statusColor, textShadow: `0 0 60px ${statusColor}80` }}>{a.bottleneckPercent}%</div>
                                <div className="pct-label" style={{ color: statusColor }}>{a.limitedBy} tě brzdí o {a.bottleneckPercent}%</div>
                            </div>

                            <div className="ad-mobile-wrapper" style={{ margin: '30px -20px', display: 'flex', justifyContent: 'center' }}>
                                <SeznamAd zoneId={408651} width={300} height={250} />
                            </div>

                            <div className="pro-metrics-grid">
                                <div className="metric-box"><div className="m-label">AVG FPS</div><div className="m-val">{a.estFps}</div></div>
                                <div className="metric-box"><div className="m-label">1% LOWS</div><div className="m-val">{a.low1Fps}</div></div>
                                <div className="metric-box"><div className="m-label">LATENCY</div><div className="m-val">{a.frameTimeMs}ms</div></div>
                            </div>
                            <div className="recommendation">
                                <h4>💡 Guru Verdikt</h4>
                                <p>{a.boundType === 'CPU_BOUND' ? 'Grafika čeká na procesor. Potřebuješ silnější CPU pro vyrovnaný výkon.' : 'Sestava je limitována grafickou kartou. Snížení detailů pomůže FPS.'}</p>
                            </div>

                            {/* 🔥 GURU AFFILIATE BOMB (OPRAVENÉ TRACKOVÁNÍ) 🔥 */}
                            <div className="affiliate-cta-grid" style={{ marginTop: '30px' }}>
                                <div className="affiliate-col">
                                    <div className="affiliate-col-title">
                                        <Monitor size={16} /> {isEn ? 'BUY SELECTED GPU' : 'KOUPIT ZVOLENOU GRAFIKU'}
                                    </div>
                                    <div className="affiliate-btn-wrap">
                                        <a href={getSmartyLink(cleanGpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                            <ShoppingCart size={16} /> Smarty.cz
                                        </a>
                                        <a 
                                            href={getHeurekaLink(cleanGpuName)} 
                                            data-trixam-positionid="276026" 
                                            data-trixam-codetype="link" 
                                            target="_blank" 
                                            rel="nofollow sponsored" 
                                            className="guru-buy-winner-btn heureka-btn heureka-hn-link"
                                        >
                                            <ShoppingCart size={16} /> Heureka.cz
                                        </a>
                                    </div>
                                </div>
                                <div className="affiliate-col">
                                    <div className="affiliate-col-title">
                                        <Cpu size={16} /> {isEn ? 'BUY SELECTED CPU' : 'KOUPIT ZVOLENÝ PROCESOR'}
                                    </div>
                                    <div className="affiliate-btn-wrap">
                                        <a href={getSmartyLink(cleanCpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                            <ShoppingCart size={16} /> Smarty.cz
                                        </a>
                                        <a 
                                            href={getHeurekaLink(cleanCpuName)} 
                                            data-trixam-positionid="276027" 
                                            data-trixam-codetype="link" 
                                            target="_blank" 
                                            rel="nofollow sponsored" 
                                            className="guru-buy-winner-btn heureka-btn heureka-hn-link"
                                        >
                                            <ShoppingCart size={16} /> Heureka.cz
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {gta6DynamicLink ? (
                                <a href={gta6DynamicLink} className="gta-cta"><Sparkles size={20} /> ROZJEDE TO GTA VI?</a>
                            ) : null}

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', width: '100%', boxSizing: 'border-box' }}>
                                <HeurekaButtons isEn={isEn} />
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <div className="massive-seo-hub">
                <div className="viral-flex-card">
                    <div className="award-icon"><Award size={32} color="#a855f7" /></div>
                    <div className="viral-text-box">
                        <div style={{ fontWeight: '950', fontSize: '18px' }}>SDÍLET KALKULAČKU</div>
                        <div style={{ color: '#a855f7', fontWeight: 'bold' }}>Pomoz ostatním geekům najít pravdu</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleCopyShare} className="premium-share-btn btn-copy">{copied ? <Check size={20} /> : <Share2 size={20} />}</button>
                        <button onClick={handleXShare} className="premium-share-btn btn-x"><Twitter size={20} /></button>
                        <button onClick={handleRedditShare} className="premium-share-btn btn-reddit"><RedditIcon size={20} /></button>
                    </div>
                </div>

                <div className="hub-grid" style={{marginTop: '50px'}}>
                    <div className="hub-column">
                        <div className="hub-col-header"><Swords size={20} color="#ff0055" /> HW Souboje</div>
                        <ul className="hub-links-list">
                            <li><a href="/gpuvs"><ChevronRight size={16} /> Souboje Grafických Karet</a></li>
                            <li><a href="/cpuvs"><ChevronRight size={16} /> Souboje Procesorů</a></li>
                        </ul>
                    </div>
                    <div className="hub-column">
                        <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> Guru Ekosystém</div>
                        <ul className="hub-links-list">
                            <li><a href="/ocekavane-hry"><ChevronRight size={16} /> Archiv her</a></li>
                            <li><a href="/clanky"><ChevronRight size={16} /> Články a Novinky</a></li>
                            <li><a href="/tipy"><ChevronRight size={16} /> GURU Tipy</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .bn-wrapper { background: rgba(10, 11, 13, 0.9); color: #fff; border-radius: 40px; padding: 60px; border: 1px solid rgba(102, 252, 241, 0.1); backdrop-filter: blur(20px); box-sizing: border-box; }
                .bn-header { text-align: center; margin-bottom: 60px; }
                .pred-badge { display: inline-flex; align-items: center; gap: 10px; color: #a855f7; font-weight: 950; padding: 10px 30px; border-radius: 50px; background: rgba(168, 85, 247, 0.1); margin-bottom: 30px; text-transform: uppercase; font-size: 13px; border: 1px solid rgba(168, 85, 247, 0.2); }
                .bn-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 50px; }
                @media (max-width: 1000px) { .bn-grid { grid-template-columns: 1fr; } }
                .bn-inputs-card { background: rgba(255, 255, 255, 0.02); border-radius: 30px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .section-title { display: flex; align-items: center; gap: 15px; font-size: 20px; font-weight: 950; color: #fff; margin-bottom: 40px; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
                .bn-select { width: 100%; background: #000; border: 1px solid #222; color: #fff; padding: 18px; border-radius: 15px; font-weight: bold; cursor: pointer; outline: none; transition: 0.3s; font-size: 16px; margin-bottom: 20px; }
                .res-toggles { display: flex; gap: 15px; margin-bottom: 20px; }
                .res-btn { flex: 1; padding: 15px; background: #000; border: 1px solid #222; color: #9ca3af; border-radius: 12px; font-weight: 950; cursor: pointer; transition: 0.3s; }
                .res-btn.active { border-color: #a855f7; color: #fff; background: rgba(168, 85, 2
