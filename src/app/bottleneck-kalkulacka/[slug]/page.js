'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound, usePathname } from 'next/navigation';
import BottleneckClient from '../BottleneckClient';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons';
import { ShoppingCart, Monitor, Cpu, ShieldCheck, Zap, Award, Clock } from 'lucide-react';

/**
 * GURU BOTTLENECK CALCULATOR RESULT - V3.2 (AFFILIATE SNIPER EDITION)
 * 🚀 CÍL: Fix encodingu, odstranění diakritiky z query a neprůstřelné trackování.
 */

const AMAZON_TAG = "thehardware07-20";

// 🔥 FIX: Odstranění diakritiky pro 100% match v eshopech
const normalizeQuery = (str = '') => {
    try {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (e) {
        return str;
    }
};

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |Intel |GeForce |Radeon /gi, '').trim();

// 🔥 FIX: Čistý encoding pro Heureku (mezery na pluska)
const encodeHeureka = (name = '') => {
    return normalizeQuery(name)
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .join('+');
};

export default function BottleneckResultPage({ params, searchParams }) {
    const p = params;
    const s = searchParams;
    const pathname = usePathname() || '';
    
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
    }, [supabase]); 

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
    const fpsGain = Math.round(fpsLoss * 0.85);

    // 🔥 SMART UPGRADE LOGIC
    const getUpgrade = (list, currentPerf) => {
        return list.find(item => item.performance_index > currentPerf * 1.25) || list[0];
    };
    const upgradeGpu = getUpgrade(data.gpus, gpuPerf);
    const upgradeCpu = getUpgrade(data.cpus, cpuPerf);

    const gpuName = upgradeGpu?.name || 'RTX 5070';
    const cpuName = upgradeCpu?.name || 'Ryzen 7 9800X3D';

    const subTag = `v10-bn-res-${isGpuWinner ? 'gpu' : 'cpu'}`;
    
    // 🔥 V10 HARD-LOCK TRACKING LOGIC 🔥
    const handleHeurekaAction = (e, name, cat) => {
        e.preventDefault();
        const q = encodeHeureka(name);
        // Prioritní haff ID na začátku
        const targetUrl = `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${q}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=${subTag}`;
        
        const payload = { 
            platform: 'heureka', 
            category: `bn_res_${cat}`, 
            sub_id: subTag, 
            page: pathname 
        };

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(`${supabaseUrl}/rest/v1/affiliate_clicks_log?apikey=${supabaseKey}`, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
    };

    const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name + ' gaming benchmark fps test')}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&ascsubtag=${subTag}`;
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    
    // Fallback href pro boty, realita běží přes onClick
    const getHeurekaFallbackLink = (name) => `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeHeureka(name)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=res-fallback`;

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
                .price-anchor { font-size: 11px; opacity: 0.6; margin-bottom: 15px; font-weight: bold; }
                .conversion-detail { font-size: 10px; opacity: 0.5; margin-top: 4px; text-align: center; display: flex; align-items: center; gap: 3px; }
            `}} />

            <div className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                <BottleneckClient 
                    gpus={data.gpus} cpus={data.cpus} games={data.games} 
                    isEn={isEn} initialCpuId={s.cpuId} initialGpuId={s.gpuId}
                />

                <div className="affiliate-cta-grid" id="money-zone">
                    
                    {/* GPU COLUMN */}
                    <div className={`affiliate-col ${isGpuWinner ? 'featured-upgrade' : ''}`}>
                        {isGpuWinner && <div className="winner-badge"><Award size={12} style={{display:'inline', marginRight:'4px'}}/> Best Choice</div>}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'950', color:'#a855f7', textTransform:'uppercase', marginBottom:'20px' }}>
                            <Monitor size={18} /> {isEn ? 'GPU Upgrade' : 'Upgrade grafiky'}
                        </div>

                        <div className="affiliate-btn-wrap">
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize:'14px', color:'#ef4444', fontWeight:'950', textTransform: 'uppercase' }}>
                                    ⚠️ {isEn ? `-${fpsLoss}% FPS Bottleneck` : `-${fpsLoss}% propad FPS`}
                                </div>
                                <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', marginTop:'4px' }}>
                                    🚀 {isEn ? `+${fpsGain}% FPS gain after upgrade` : `+${fpsGain}% FPS po upgradu`}
                                </div>
                            </div>

                            <div style={{ textAlign:'center', fontSize:'14px', fontWeight:'900', color:'#fff', marginBottom: '2px' }}>
                                {normalizeName(gpuName)}
                            </div>
                            
                            <div className="price-anchor">
                                {isEn ? 'From $399 • Top Tier Value' : 'Špičkový výkon • Skladem'}
                            </div>

                            {isEn ? (
                                <a href={getAmazonLink(gpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={22} /> {`🔥 Unlock +${fpsGain}% FPS NOW`}
                                </a>
                            ) : (
                                <>
                                    <a 
                                        href={getHeurekaFallbackLink(gpuName)} 
                                        onClick={(e) => handleHeurekaAction(e, gpuName, 'gpu')}
                                        data-trixam-positionid="276026" 
                                        target="_blank" 
                                        rel="nofollow sponsored noopener noreferrer" 
                                        className="guru-buy-winner-btn heureka-btn"
                                    >
                                        {`🔥 Nejlepší cena ${normalizeName(gpuName)}`}
                                    </a>
                                    <div className="conversion-detail">
                                        <ShieldCheck size={10} /> {isEn ? '✔ Verified cheapest today' : '✔ Ověřeno dnes • Nejlevnější nabídky'}
                                    </div>
                                    <a href={getSmartyLink(gpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={22} /> {`Koupit na Smarty.cz`}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CPU COLUMN */}
                    <div className={`affiliate-col ${!isGpuWinner ? 'featured-upgrade' : ''}`}>
                        {!isGpuWinner && <div className="winner-badge"><Award size={12} style={{display:'inline', marginRight:'4px'}}/> Best Choice</div>}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'950', color:'#a855f7', textTransform:'uppercase', marginBottom:'20px' }}>
                            <Cpu size={18} /> {isEn ? 'CPU Upgrade' : 'Upgrade procesoru'}
                        </div>

                        <div className="affiliate-btn-wrap">
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize:'14px', color:'#ef4444', fontWeight:'950', textTransform: 'uppercase' }}>
                                    ⚠️ {isEn ? `-${fpsLoss}% FPS Bottleneck` : `-${fpsLoss}% propad FPS`}
                                </div>
                                <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:'900', marginTop:'4px' }}>
                                    🚀 {isEn ? `+${fpsGain}% FPS gain after upgrade` : `+${fpsGain}% FPS po upgradu`}
                                </div>
                            </div>

                            <div style={{ textAlign:'center', fontSize:'14px', fontWeight:'900', color:'#fff', marginBottom: '2px' }}>
                                {normalizeName(cpuName)}
                            </div>
                            
                            <div className="price-anchor">
                                {isEn ? 'From $249 • Extreme IPC speed' : 'Špičkové IPC • Skladem'}
                            </div>

                            {isEn ? (
                                <a href={getAmazonLink(cpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn amazon-btn">
                                    <ShoppingCart size={22} /> {`🔥 Unlock +${fpsGain}% FPS NOW`}
                                </a>
                            ) : (
                                <>
                                    <a 
                                        href={getHeurekaFallbackLink(cpuName)} 
                                        onClick={(e) => handleHeurekaAction(e, cpuName, 'cpu')}
                                        data-trixam-positionid="276027" 
                                        target="_blank" 
                                        rel="nofollow sponsored noopener noreferrer" 
                                        className="guru-buy-winner-btn heureka-btn"
                                    >
                                        {`🔥 Nejlepší cena ${normalizeName(cpuName)}`}
                                    </a>
                                    <div className="conversion-detail">
                                        <ShieldCheck size={10} /> {isEn ? '✔ Verified cheapest today' : '✔ Ověřeno dnes • Nejlevnější nabídky'}
                                    </div>
                                    <a href={getSmartyLink(cpuName)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={22} /> {`Koupit na Smarty.cz`}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} />
                </div>
            </div>

            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
                <div className="ad-mobile-wrapper" style={{ display: 'flex' }}><SeznamAd zoneId={408651} width={300} height={100} /></div>
            </div>
        </div>
    );
}
