'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { ShoppingCart, Monitor, Cpu, CheckCircle, Zap, Sparkles, TrendingUp, Award, Target, ArrowRight } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR RESULT - V2.6 (THE ULTIMATE REVENUE TERMINATOR)
 * 🚀 CÍL: Smart Upgrade Logic (Next-Tier), Performance Transformation Loop a Strategic Justification.
 */

const AMAZON_TAG = "thehardware07-20";
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();

export default function BottleneckResultPage({ params, searchParams }) {
    const p = params;
    const s = searchParams;
    
    if (!s.cpuId || !s.gpuId || !p.slug) return notFound();

    const isEn = p.slug.startsWith('en-');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey]);
    const [data, setData] = useState({ gpus: [], cpus: [], games: [] });

    useEffect(() => {
        const fetchAll = async () => {
            const [gRes, cRes, gmRes] = await Promise.all([
                supabase.from('gpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
                supabase.from('cpus').select('id, name, performance_index').order('performance_index', { ascending: false }),
                supabase.from('games').select('id, name, slug').order('name', { ascending: true })
            ]);
            setData({ gpus: gRes.data || [], cpus: cRes.data || [], games: gmRes.data || [] });
        };
        fetchAll();
    }, []); 

    const resolutionStr = p.slug.includes('2160p') ? '2160p' : p.slug.includes('1440p') ? '1440p' : '1080p';
    const selectedGpu = data.gpus.find(g => String(g.id) === String(s.gpuId));
    const selectedCpu = data.cpus.find(c => String(c.id) === String(s.cpuId));
    
    const gpuPerf = selectedGpu?.performance_index || 100;
    const cpuPerf = selectedCpu?.performance_index || 100;

    const resWeight = resolutionStr === '2160p' ? 1.4 : resolutionStr === '1440p' ? 1.2 : 1.0;
    const bottleneckRatio = (gpuPerf * resWeight) / (cpuPerf || 1);
    const isGpuWinner = bottleneckRatio < 0.85;

    const lossRaw = isGpuWinner ? (1 - bottleneckRatio) : (1 - (1 / bottleneckRatio));
    const fpsLoss = Math.min(50, Math.max(10, Math.round(Math.abs(lossRaw) * 100)));
    const fpsGain = Math.round(fpsLoss * 0.9);

    // 🔥 FIX #1: SMART UPGRADE TARGETING (Doporučujeme vyšší tier, ne current HW)
    const getUpgrade = (list, currentPerf) => {
        // Hledáme položku, která má aspoň o 25 % vyšší výkon
        return list.find(item => item.performance_index > currentPerf * 1.25) || list[0];
    };

    const upgradeGpu = getUpgrade(data.gpus, gpuPerf);
    const upgradeCpu = getUpgrade(data.cpus, cpuPerf);

    const gpuName = upgradeGpu?.name || 'RTX 4070 SUPER';
    const cpuName = upgradeCpu?.name || 'Ryzen 7 7800X3D';

    const subTag = `bn-${isGpuWinner ? 'gpu' : 'cpu'}-${fpsLoss}-${resolutionStr}`;
    const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=${subTag}`;
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;

    useEffect(() => {
        const el = document.getElementById('money-zone');
        if (!el || data.gpus.length === 0) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.intersectionRatio < 0.1) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [data.gpus.length]);

    return (
        <div className="guru-page-wrapper" style={{ backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', paddingTop: '100px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .affiliate-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 40px; background: rgba(0,0,0,0.6); border-radius: 32px; border: 1px solid rgba(168, 85, 247, 0.2); width: 100%; box-sizing: border-box; align-items: stretch; margin: 60px 0; position: relative; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; justify-content: space-between; padding: 35px; border-radius: 28px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); position: relative; }
                
                .featured-upgrade { background: rgba(168, 85, 247, 0.12) !important; border: 2px solid #a855f7 !important; transform: scale(1.06); z-index: 2; animation: pulseGlow 2.5s infinite; }
                @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 40px rgba(168,85,247,0.2); } 50% { box-shadow: 0 0 80px rgba(168,85,247,0.5); } }

                .winner-badge { position: absolute; top: -12px; right: -12px; background: #22c55e; color: #fff; padding: 8px 16px; border-radius: 999px; font-size: 10px; font-weight: 900; box-shadow: 0 10px 20px rgba(34, 197, 94, 0.4); text-transform: uppercase; letter-spacing: 1px; z-index: 10; }

                .guru-buy-winner-btn { width: 100%; max-width: 360px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 22px 30px; border-radius: 20px; text-decoration: none; font-weight: 950; font-size: 17px; text-transform: uppercase; transition: 0.3s; color: #000; cursor: pointer; }
                .smarty-btn { background: #facc15; border: 2px solid #fef08a; }
                .heureka-btn { background: #3b82f6; color: #fff !important; border: 2px solid #60a5fa; }
                .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
                .guru-buy-winner-btn:hover { transform: translateY(-5px); filter: brightness(1.15); box-shadow: 0 25px 50px rgba(0,0,0,0.6); }
                
                .micro-label { font-size: 11px; font-weight: 950; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; color: #10b981; }
                .risk-removal { font-size: 10px; opacity: 0.6; margin-top: 8px; font-weight: 700; text-align: center; }

                @media (max-width: 768px) {
                    .affiliate-cta-grid { grid-template-columns: 1fr; padding: 20px; gap: 40px; }
                    .featured-upgrade { transform: scale(1.02); }
                }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                <BottleneckClient 
                    gpus={data.gpus} cpus={data.cpus} games={data.games} 
                    isEn={isEn} initialCpuId={s.cpuId} initialGpuId={s.gpuId}
                />

                <div className="affiliate-cta-grid" id="money-zone">
                    
                    {/* GPU UPGRADE COLUMN */}
                    <div className={`affiliate-col ${isGpuWinner ? 'featured-upgrade' : ''}`}>
                        {isGpuWinner && <div className="winner-badge"><Award size={12} style={{display:'inline', marginRight:'4px'}}/> Best Choice</div>}
                        <div>
                            {isGpuWinner && <div className="micro-label">⭐ TOP PERFORMANCE BOOST</div>}
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'950', color:'#a855f7', textTransform:'uppercase', marginBottom:'20px' }}>
                                <Monitor size={18} /> {isEn ? 'GPU Upgrade' : 'Upgrade grafiky'}
                            </div>
                        </div>

                        <div className="affiliate-btn-wrap">
                            {isGpuWinner && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize:'14px', color:'#ef4444', fontWeight:'950', textAlign: 'center', textTransform: 'uppercase' }}>
                                        ⚠️ {isEn ? `-${fpsLoss}% FPS Bottleneck` : `-${fpsLoss}% propad FPS`}
                                    </div>
                                    <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', marginTop:'4px', textAlign: 'center' }}>
                                        {isEn ? `🚀 +${fpsGain}% FPS gain after upgrade` : `🚀 +${fpsGain}% FPS po upgradu`}
                                    </div>
                                    {/* 🔥 FIX #3: INSTANT GRATIFICATION LOOP */}
                                    <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', textAlign:'center', marginTop:'6px' }}>
                                        {isEn 
                                            ? `🎯 Performance: ${100 - fpsLoss}% → ${100 + fpsGain}%`
                                            : `🎯 Výkon: ${100 - fpsLoss}% → ${100 + fpsGain}%`}
                                    </div>
                                </div>
                            )}

                            <div style={{ textAlign:'center', fontSize:'14px', fontWeight:'900', color:'#fff', marginBottom: '2px' }}>
                                {normalizeName(gpuName)}
                            </div>
                            
                            {/* 🔥 FIX #2: WHY THIS UPGRADE */}
                            <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'10px', textAlign: 'center' }}>
                                {isEn 
                                    ? 'Perfect match for your CPU – no bottleneck' 
                                    : 'Perfektní kombinace k tvému CPU – bez bottlenecku'}
                            </div>
                            
                            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '15px', fontWeight: 'bold' }}>
                                {isEn ? 'From $399 • Top Tier Value' : 'Od 9 990 Kč • Špičkový poměr cena/výkon'}
                            </div>

                            <div style={{ fontSize:'12px', color:'#facc15', fontWeight:'900', textAlign:'center', marginBottom:'8px' }}>
                                🔥 {isEn ? 'Unlock full potential now' : 'Odemkni plný výkon hned'}
                            </div>

                            {isEn ? (
                                <a href={getAmazonLink(gpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={22} /> {`🔥 Unlock +${fpsGain}% FPS NOW`}
                                </a>
                            ) : (
                                <>
                                    <a href={getSmartyLink(normalizeName(gpuName))} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={22} /> {`Koupit na Smarty.cz`}
                                    </a>
                                    <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpuName)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} data-trixam-positionid="276026" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn">
                                        {`🔥 Nejlepší cena ${normalizeName(gpuName)}`}
                                    </a>
                                </>
                            )}
                            
                            <div className="risk-removal">
                                {isEn ? '⚡ Instant upgrade • No compatibility issues' : '⚡ Okamžitý upgrade • Bez problémů'}
                            </div>
                        </div>
                    </div>

                    {/* CPU UPGRADE COLUMN */}
                    <div className={`affiliate-col ${!isGpuWinner ? 'featured-upgrade' : ''}`}>
                        {!isGpuWinner && <div className="winner-badge"><Award size={12} style={{display:'inline', marginRight:'4px'}}/> Best Choice</div>}
                        <div>
                            {!isGpuWinner && <div className="micro-label">⭐ TOP PERFORMANCE BOOST</div>}
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'950', color:'#a855f7', textTransform:'uppercase', marginBottom:'20px' }}>
                                <Cpu size={18} /> {isEn ? 'CPU Upgrade' : 'Upgrade procesoru'}
                            </div>
                        </div>

                        <div className="affiliate-btn-wrap">
                            {!isGpuWinner && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize:'14px', color:'#ef4444', fontWeight:'950', textAlign: 'center', textTransform: 'uppercase' }}>
                                        ⚠️ {isEn ? `-${fpsLoss}% FPS Bottleneck` : `-${fpsLoss}% propad FPS`}
                                    </div>
                                    <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', marginTop:'4px', textAlign: 'center' }}>
                                        {isEn ? `🚀 +${fpsGain}% FPS gain after upgrade` : `🚀 +${fpsGain}% FPS po upgradu`}
                                    </div>
                                    <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', textAlign:'center', marginTop:'6px' }}>
                                        {isEn 
                                            ? `🎯 Performance: ${100 - fpsLoss}% → ${100 + fpsGain}%`
                                            : `🎯 Výkon: ${100 - fpsLoss}% → ${100 + fpsGain}%`}
                                    </div>
                                </div>
                            )}

                            <div style={{ textAlign:'center', fontSize:'14px', fontWeight:'900', color:'#fff', marginBottom: '2px' }}>
                                {normalizeName(cpuName)}
                            </div>

                            <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'10px', textAlign: 'center' }}>
                                {isEn 
                                    ? 'Perfect match for your GPU – zero lag' 
                                    : 'Perfektní kombinace k tvé grafice – nulové záseky'}
                            </div>
                            
                            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '15px', fontWeight: 'bold' }}>
                                {isEn ? 'From $249 • Extreme IPC speed' : 'Od 5 990 Kč • Extrémní výkon'}
                            </div>

                            <div style={{ fontSize:'12px', color:'#facc15', fontWeight:'900', textAlign:'center', marginBottom:'8px' }}>
                                🔥 {isEn ? 'Get extreme performance' : 'Získej extrémní výkon hned'}
                            </div>

                            {isEn ? (
                                <a href={getAmazonLink(cpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={22} /> {`🔥 Unlock +${fpsGain}% FPS NOW`}
                                </a>
                            ) : (
                                <>
                                    <a href={getSmartyLink(normalizeName(cpuName))} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={22} /> {`Koupit na Smarty.cz`}
                                    </a>
                                    <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpuName)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`} data-trixam-positionid="276027" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn">
                                        {`🔥 Nejlepší cena ${normalizeName(cpuName)}`}
                                    </a>
                                </>
                            )}

                            <div className="risk-removal">
                                {isEn ? '⚡ Instant upgrade • Verified choice' : '⚡ Okamžitý upgrade • Ověřená volba'}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={gpuName} positionId="276026" />
                </div>
            </div>

            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
                <div className="ad-mobile-wrapper" style={{ display: 'flex' }}><SeznamAd zoneId={408651} width={300} height={100} /></div>
            </div>
        </div>
    );
}
